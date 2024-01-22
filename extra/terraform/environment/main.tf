# -- General ------------------------------------

terraform {
  required_version = "~>1.1.0"

  # Configure gcs as the backend for the terraform state
  backend "gcs" {
    bucket = "<<BUCKET_NAME>>"
  }

  required_providers {
    gitlab = {
      source  = "gitlabhq/gitlab"
      version = "3.6.0"
    }
  }
}

provider "gitlab" {
  token = var.gitlab_auth_token
}

# Create a random string to make sure that project id's are unique
resource "random_string" "project_suffix" {
  length  = 6
  special = false
  upper   = false
}

locals {
  environment_name = trimspace(var.environment_name) != "" ? var.environment_name : terraform.workspace
}


# -- GCP Project setup --------------------------

# Create a project for the internal test environment
resource "google_project" "default" {
  name            = "${var.gcp_project_name}-${local.environment_name}-${formatdate("YYMM", timestamp())}"
  project_id      = "${var.gcp_project_name}-${local.environment_name}-${random_string.project_suffix.result}"
  folder_id       = var.gcp_folder_id
  billing_account = var.gcp_billing_account
}

resource "google_project_service" "default" {
  for_each = toset(var.gcp_services)

  project = google_project.default.project_id
  service = each.value

  disable_dependent_services = true
}


# -- Gitlab CI service account ------------------

resource "google_service_account" "gitlab_ci" {
  project      = google_project.default.project_id
  account_id   = "gitlab-ci"
  display_name = "Gitlab CI"
  description  = "Service account which is used by the Gitlab CI to deploy the application."

  depends_on = [google_project_service.default]
}

resource "google_project_iam_member" "gitlab_ci_roles_editor" {
  for_each = toset(var.gcp_ci_sa_iam_roles)

  project = google_project.default.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.gitlab_ci.email}"
}

resource "google_service_account_key" "gitlab_ci" {
  service_account_id = google_service_account.gitlab_ci.name
  public_key_type    = "TYPE_X509_PEM_FILE"
}

# Export the privte key of the gitlab ci service account
resource "local_sensitive_file" "gitlab_ci_sa_private_key" {
  content = base64decode(google_service_account_key.gitlab_ci.private_key)
  filename          = "${path.module}/output/${google_service_account.gitlab_ci.account_id}-service-account-key-${google_project.default.project_id}.json"
}

# -- Terraform state gcs bucket -----------------

resource "google_storage_bucket" "tf_state" {
  project       = google_project.default.project_id
  name          = "${var.gcp_project_name}-${local.environment_name}-tf-state-${random_string.project_suffix.result}"
  location      = "EU"
  force_destroy = false
}

resource "google_storage_bucket_iam_binding" "tf_state_gitlab_ci_sa" {
  bucket = google_storage_bucket.tf_state.name
  role   = "roles/storage.admin"
  members = [
    "serviceAccount:${google_service_account.gitlab_ci.email}"
  ]
}

# -- Gitlab CI variables ------------------------

resource "gitlab_project_variable" "gcp_service_account_key_json" {
  project           = var.gitlab_project
  key               = "GCP_SERVICE_ACCOUNT_KEY_JSON"
  value             = base64decode(google_service_account_key.gitlab_ci.private_key)
  environment_scope = terraform.workspace
  protected         = true
}

resource "gitlab_project_variable" "gcp_gcs_terraform_state_bucket" {
  project           = var.gitlab_project
  key               = "TERRAFORM_BACKEND_GCS_BUCKET"
  value             = google_storage_bucket.tf_state.name
  environment_scope = terraform.workspace
  protected         = true
}

resource "gitlab_project_variable" "gcp_project" {
  project           = var.gitlab_project
  key               = "GCP_PROJECT"
  value             = google_project.default.project_id
  environment_scope = terraform.workspace
  protected         = true
}

resource "gitlab_project_variable" "environment_name" {
  project           = var.gitlab_project
  key               = "TF_VAR_environment_name"
  value             = local.environment_name
  environment_scope = terraform.workspace
  protected         = true
}

terraform {
  required_version = "~>1.1.0"

  backend "gcs" {}

  required_providers {
    # https://registry.terraform.io/providers/hashicorp/google/latest
    google = {
      source  = "hashicorp/google"
      version = "3.71.0"
    }

    # https://registry.terraform.io/providers/hashicorp/google-beta/latest
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "3.71.0"
    }
  }
}

provider "google" {
  project = var.gcp_project
  region  = var.gcp_region
}

provider "google-beta" {
  project = var.gcp_project
  region  = var.gcp_region
}

# Random Generator
resource "random_string" "suffix" {
  length  = 4
  special = false
  upper   = false
}

locals {
  ui_domain = "${trimspace(var.ui_sub_domain)}${trimspace(var.ui_sub_domain) != "" ? "." : ""}${var.domain}"
}

# -- IAM ----------------------------------------

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers"
    ]
  }
}

# -- UI -----------------------------------------

resource "google_service_account" "cloud_run_ui" {
  project      = var.gcp_project
  account_id   = "cloud-run-ui"
  display_name = "Cloud Run UI"
}

resource "google_project_iam_member" "cloud_run_ui_logging_log_writer" {
  project = var.gcp_project
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.cloud_run_ui.email}"
}

resource "google_cloud_run_service" "ui" {
  name     = "ui-${random_string.suffix.result}"
  project  = var.gcp_project
  location = var.gcp_cloud_run_region

  template {
    spec {
      containers {
        image = var.ui_image

        # env {
        #   name  = "NEXT_PUBLIC_BASE_DOMAIN"
        #   value = "https://${local.ui_domain}"
        # }

        resources {
          limits = {
            cpu    = var.ui_cpu_limit
            memory = var.ui_memory_limit
          }
        }
      }

      container_concurrency = var.ui_container_concurrency
      timeout_seconds       = var.ui_timeout_seconds
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale"      = tostring(var.ui_min_instances)
      }
    }
  }
}

resource "google_cloud_run_service_iam_policy" "ui" {
  location = google_cloud_run_service.ui.location
  project  = google_cloud_run_service.ui.project
  service  = google_cloud_run_service.ui.name

  policy_data = data.google_iam_policy.noauth.policy_data
}

resource "google_cloud_run_domain_mapping" "ui" {
  location = google_cloud_run_service.ui.location
  name     = local.ui_domain

  metadata {
    namespace = var.gcp_project
  }

  spec {
    route_name = google_cloud_run_service.ui.name
  }
}

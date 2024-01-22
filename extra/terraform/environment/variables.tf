# -- General ------------------------------------

variable "environment_name" {
  type        = string
  description = "The name of the environment. If this variable is not defined, the name of the current Terraform workspace will be used. Please note that the environment name can not be changed later."
  default     = ""
}


# -- Gitlab -------------------------------------

variable "gitlab_project" {
  type        = string
  description = "The name or id of a gitlab project."
}

variable "gitlab_auth_token" {
  type        = string
  description = "Your personal access token for your Gitlab account. This account must have at least maintainer permissions for the Gitlab project."
}


# -- GCP ----------------------------------------

variable "gcp_project_name" {
  type        = string
  description = "The name of the project."
  default     = "<project-name>"
}

variable "gcp_billing_account" {
  type        = string
  description = "The alphanumeric ID of the billing account this project belongs to. The user or service account performing this operation with Terraform must have at mininum Billing Account User privileges (roles/billing.user) on the billing account."
  default     = "01EF72-DEA514-1F5785"
}

variable "gcp_folder_id" {
  type        = number
  description = "The ID of the folder in which the projects should be created."
  default     = "653818959932"
}

variable "gcp_services" {
  type = list(string)
  default = [
    "cloudapis.googleapis.com",
    "clouddebugger.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "cloudtrace.googleapis.com",
    "compute.googleapis.com",
    "containerregistry.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
    "oslogin.googleapis.com",
    "recaptchaenterprise.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "servicemanagement.googleapis.com",
    "serviceusage.googleapis.com",
    "sqladmin.googleapis.com",
    "stackdriver.googleapis.com",
    "storage-api.googleapis.com",
    "storage-component.googleapis.com",
    "vpcaccess.googleapis.com",
  ]
}

variable "gcp_ci_sa_iam_roles" {
  type = list(string)
  default = [
    "roles/editor",
    "roles/compute.admin",
    "roles/iam.securityAdmin",
    "roles/iam.serviceAccountAdmin",
    "roles/iam.serviceAccountUser",
    "roles/run.admin",
    "roles/run.invoker",
    "roles/servicemanagement.admin",
    "roles/servicemanagement.configEditor",
    "roles/storage.admin",
    "roles/storage.objectAdmin",
  ]
}

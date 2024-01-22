output "gcp_project_id" {
  value = google_project.default.project_id
}

output "gcp_project_name" {
  value = google_project.default.name
}

output "gcp_project_parent_gcp_folder_id" {
  value = google_project.default.folder_id
}

output "gcs_terraform_state_bucket_name" {
  value = google_storage_bucket.tf_state.name
}

output "gcp_gitlab_ci_service_account_email" {
  value = google_service_account.gitlab_ci.email
}

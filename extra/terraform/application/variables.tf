# -- General ------------------------------------

variable "gcp_project" {
  type        = string
  description = "The GCP project."
}

variable "gcp_region" {
  type        = string
  description = "The GCP region, which will be used primarily for hosting resources."
  default     = "europe-west6"
}

variable "gcp_cloud_run_region" {
  type        = string
  description = "The GCP region, which will be used to host cloud run resources."
  default     = "europe-west1"
}

variable "domain" {
  description = "The domain under which the services should be accessible."
  type        = string
}

# -- UI -----------------------------------------

variable "ui_image" {
  description = "The url of the ui docker image."
  type        = string
}

variable "ui_cpu_limit" {
  description = "The value of the property is converted to its millicore value and multiplied by 100. The resulting value is the total amount of CPU time that a container can use every 100ms. A container cannot use more than its share of CPU time during this interval."
  type        = string
  default     = "1000m"
}

variable "ui_memory_limit" {
  description = "The maximum amout of memory an instance can use. If a Container exceeds its memory limit, it might be terminated."
  type        = string
  default     = "256Mi"
}

variable "ui_container_concurrency" {
  description = "Container concurrency specifies the maximum allowed in-flight (concurrent) requests per container of the Revision."
  type        = number
  default     = 80
}

variable "ui_min_instances" {
  description = "The minimum number of container instances of the Service to run."
  type        = number
  default     = 0
}

variable "ui_timeout_seconds" {
  description = "Sets the max duration the instance is allowed for responding to a request."
  type        = number
  default     = 300
}

variable "ui_sub_domain" {
  description = "The subdomain below the domain under which the UI should be accessible."
  type        = string
  default     = ""
}

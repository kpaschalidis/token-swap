# Application terraform module

## Pass configurations to Cloud Run instances

Configurations are passed to the cloud run instances as environment variables via Terraform. We distinguish between Secrets and normal configurations, which are each passed differently to the Cloud Run instance via Terraform.

### Configurations with normal values

If the configuration is not already available in Terraform (this can be the case, for example, if it is information about a resource that was created by Terraform), first create a new variable in the `variables.tf` file to pass the configuration to Terraform.

```
variable "<name>" {
  description = "A configuration to be passed to a Cloud Run instance."
  type        = <type (e.g. string)>
}
```

Afterwards, we can make the variable available as an environment variable in the Cloud Run instances:

```
resource "google_cloud_run_service" "example" {
  ...

  template {
    ...

    spec {
      ...

      containers {
        ...

        env {
          name = "<ENVIRONMENT_VARIABLE_NAME>"
          value = var.<name>
        }

        ...
      }

      ...
    }

    ...
  }

  ...
}
```

For more information check out the documentation of the [Cloud Run Service resource](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloud_run_service#example-usage---cloud-run-service-secret-environment-variables) of the [Google Terraform provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs).

### Configurations with secret values

Secrets can be created in different places in GCP. Secrets that are to be used in several projects can be created in a general GCP project and then accessed from several other projects. If possible, this should be avoided for security reasons. It is always safer to create credentials per project and environment. In case of a data leak (e.g. through a security hole), access data can be changed more easily. It is also easier to find out in which service/project the security vulnerability is located (if not known).

#### Pass secrets to Cloud Run instances

In order to make secrets available in a Cloud Run instance, we first need to create three variables inside the `variables.tf` file to provide the necessary information depending on the environment in Terraform.

For example, this looks like this (note that `<name>` must be replaced accordingly):

```
variable "<name>_secret_project" {
  description = "The ID of the project in which the resource belongs."
  type        = string
}

variable "<name>_secret_id" {
  description = "The unique id of the secret."
  type        = string
}

variable "<name>_secret_version" {
  description = "The version of the secret which should be used."
  type        = string
}
```

After that we can access the secret in Terraform. The code for this belongs to the respective Cloud Run instance and should be placed before the declaration of the `google_cloud_run_service` resource.

```
data "google_secret_manager_secret" "<name>" {
  project = var.<name>_secret_project
  secret_id = var.<name>_secret_id
}
```

Finally, we need to make the secret available as an environment variable in the Cloud Run instance.

```
resource "google_cloud_run_service" "example" {
  ...

  template {
    ...

    spec {
      ...

      containers {
        ...

        env {
          name = "<ENVIRONMENT_VARIABLE_NAME>"
          value_from {
            secret_key_ref {
              name = data.google_secret_manager_secret.<name>.secret_id
              key = var.<name>_secret_version
            }
          }
        }

        ...
      }

      ...
    }

    ...
  }

  ...
}
```

For more information check out the documentation of the [Cloud Run Service resource](https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloud_run_service#example-usage---cloud-run-service-secret-environment-variables) of the [Google Terraform provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs).

#### Create a new secret

Create a new secret to the secret manager:

```bash
gcloud secrets create <secret-name> --project <project-id>
```

And add a new version:

```bash
echo -n "<value>" | gcloud secrets versions add <secret-name> --data-file=- --project <project-id>
```

Set the appropriate configurations for the secret in the `tfvars` file (e.g. `config/terraform/<env>.tfvars`) of the respective environment, so that Terraform knows how to access the secret.

For example, this looks like this (note that `<name>` must be replaced accordingly):

```
<name>_secret_project     = "<project-id>"
<name>_secret_id          = "<name>"
<name>_secret_version     = <version>
```

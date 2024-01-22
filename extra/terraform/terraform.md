# Terraform

There are two different Terraform modules, each responsible for different things.

## Environment module

The module in the folder `environment` is responsible for the basic setup of an environment.
It creates the GCP project, activates the necessary GCP services, creates a service account for the Gitlab CI,
assigns the necessary permissions to it and configures the Gitlab CI itself.
In order to run this module, extensive permissions are required.

More information can be found [here](./environment/README.md).

## Application module

The module in the folder `application` is responsible for providing the actual application including all needed services (like database etc.).
It is automatically executed by the Gitlab CI.

More information can be found [here](./application/README.md).

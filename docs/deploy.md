# Remote deployment

You can generate and/or deploy k8s configurations to fit your cloud environment.

## Requirements

* A domain name if you want to deploy on the cloud
* [Pulumi](https://www.pulumi.com/docs/get-started/install/)
* [cert-manager](https://cert-manager.io/docs/installation/kubectl/)

## Before you begin

Download the account configuration from your k8s provider.

> In this case named `config.yaml`.

On your cluster:

```bash
KUBECONFIG="config.yaml" kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.7.0/cert-manager.yaml
KUBECONFIG="config.yaml" kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.1.1/deploy/static/provider/cloud/deploy.yaml
```

Also make sure that the application (`app`) docker image has been built with the following variables:

The `app` docker image has the following variables available on build:

> Note that these are all empty by default as the values shown are the fallbacks used on runtime:

```
VITE_KEYCLOAK_URL https://auth.my.domain.name/
VITE_KEYCLOAK_REALM rnd
VITE_KEYCLOAK_CLIENT_ID rnd-client
```

## Create configurations

First set up Pulumi:

```bash
cd deploy/pulumi
npm install
pulumi login --local
```

Now set up a stack. Example:

```bash
pulumi stack init my-stack

# Set up base configuration
pulumi config set name my-stack
pulumi config set mode production
pulumi config set version latest
pulumi config set host my.domain.name
pulumi config set app_url https://my.domain.name
pulumi config set keycloak.password abc123

# Override default storage allocation (optional)
pulumi config set zookeeper_storage_size 10Gi
pulumi config set kafka_storage_size 10Gi
pulumi config set db_storage_size 10Gi
pulumi config set keycloak_storage_size 10Gi
pulumi config set keycloak_db_storage_size 10Gi

# Override default env variables (optional)
pulumi config set env.DB_HOSTNAME db
pulumi config set env.DB_USERNAME db
pulumi config set env.DB_PASSWORD db
pulumi config set env.DB_NAME db
pulumi config set env.KAFKA_BROKERS kafka:9092
pulumi config set env.MAILER_HOST mailhog
pulumi config set env.MAILER_PORT 1025
```

## Manual Deployment

Add your account configuration:

```bash
cat config.yaml | pulumi config set kubeconfig
```

### Using pulumi stack

```bash
pulumi update
```

### Using kubectl apply

Generate configurations instead of remote stack:

```bash
GENERATE_YAML=true pulumi update
```

Go back into the root directory and apply the generated configurations:

```bash
KUBECONFIG="config.yaml" kubectl apply -f deploy/my-stack/ -R
```

## CD via Github Actions

This project includes a workflow template (`.github/workflows/release.yaml`) that can be used for CD.

The following secrets are required:

* `PULUMI_ACCESS_TOKEN` - Access token for the Pulumi stack
* `PULUMI_CONFIG_PASSPHRASE` - The passphrase used for the stack (can be empty)
* `PULUMI_CONFIG` - A `Pulumi.yaml` file that includes the configuration entry `rnd:kubeconfig` that contains `config.yaml` from your k8s provider.
* `KEYCLOAK_URL` - The URL of the Keycloak service

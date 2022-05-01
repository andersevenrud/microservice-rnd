# Remote deployment

You can generate and/or deploy k8s configurations to fit your cloud environment:

## Before you begin

Download the account configuration from your k8s provider.

> In this case named `config.yaml`.

## Create configurations

First set up Pulumi:

```bash
cd deploy/pulumi
npm install
```

Now set up a stack. Example:

```bash
pulumi stack init my-stack
pulumi config set version latest
pulumi config set mode my-stack
pulumi config set host my.domain.name
pulumi config set env.APP_URL https://my.domain.name

# Override default storage allocation (optional)
pulumi config set zookeeper_storage_size 10Gi
pulumi config set kafka_storage_size 10Gi
pulumi config set db_storage_size 10Gi

# Override default env variables (optional)
pulumi config set env.DB_HOSTNAME db
pulumi config set env.DB_USERNAME db
pulumi config set env.DB_PASSWORD db
pulumi config set env.DB_NAME db
pulumi config set env.KAFKA_BROKERS kafka:9092
pulumi config set env.MAILER_HOST mailhog
pulumi config set env.MAILER_PORT 1025
```

## Automatically deploying via kubeconfig

Add your account configuration:

```bash
cat config.yaml | pulumi config set kubeconfig
```

Deploy:

```bash
pulumi update
```

## Manually deploying via configurations

Generate:

```bash
pulumi update
```

## Deploy

Go back into the root directory and apply the generated configurations:

```bash
KUBECONFIG="config.yaml" kubectl apply -f deploy/my-stack/ -R
```

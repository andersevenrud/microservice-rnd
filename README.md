# microservice-rnd

Microservice architecture demonstration with Node.js (TypeScript) and Kafka.

## About

This is a personal research project used for learning more about microservice architectures,
structuring and good practices related to development on Docker and deployment onto a
Kubernetes Cluster.

[Kafka](https://kafka.apache.org/) is used to connect all services using event streams.

Provides a basic dashboard interface and REST API that interacts with a runner service that
handles processes to demonstrate event streams, etc. [Keycloak](https://www.keycloak.org/)
handles for authentication and authorization.

Uses Github Actions for CI and CD, [Pulumi](https://www.pulumi.com/) for deployments and
[Tilt](https://tilt.dev/) & [minikube](https://minikube.sigs.k8s.io/docs/) for local development.
An alternative docker-compose setup is also provided.

**Please note that the out-of-the-box configurations are not safe for a production environment.**

![Vite-App](https://user-images.githubusercontent.com/161548/163657043-a2f3b766-77a6-44fc-8b62-078c6fa8390c.png)

## Requirements

One of the following configurations:

> Note that the docker compose environment does **not** scale and is mainly for development
> purposes, while the kubernetes cluster is configured for scaling.

1. Local [Kubernetes Cluster](#kubernetes)
    * `docker`
    * `minikube`
    * `tilt`
    * `pulumi` (optional)
2. Local [Docker Compose](#docker-compose)
    * `docker`
    * `docker-compose`

## Installation

### Kubernetes

> Runs on https://rnd.lvh.me (and `<admin-service>.rnd.lvh.me`)

See [`docs/k8s.md`](docs/k8s.md) for more information about setting up a local Kubernetes cluster.

```bash
tilt up
```

### Docker Compose

> Runs on http://localhost:8080 (and `/<admin-service>/`)

```bash
docker-compose run --rm cli sh scripts/migrations.sh
docker-compose up
```

## Dashboard

When you open the app you will be redirected to the authentication client.

The default username is `admin` and password `admin`.

## Admin Services

You can access the following administration interfaces with the URL patterns noted above:

* `kowl` - Kafka inspection
* `mailhog` - Mail preview
* `adminer` - Database administration
* `auth` - Keycloak administration

## Deployment

If you want to deploy this into the cloud, see [`docs/deploy.md`](docs/deploy.md).

It's also possible to do a deployment with git and docker-compose by simply cloning this repository,
then use `deploy/compose/docker-compose.yml` directly or as a template and run it from the root directory.

## License

[Unlicense](./UNLICENSE)

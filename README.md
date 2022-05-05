# microservice-rnd

Microservice architecture demonstration with nodejs (typescript) and [Kafka](https://kafka.apache.org/).

## About

This is a personal research project used for learning more about microservice architectures,
structuring and good practices related to development on Docker and deployment onto a
Kubernetes Cluster. Uses Github Actions for CI and CD and [Pulumi](https://www.pulumi.com/)
deploy onto the cloud.

Provides a basic frontend interface and API that interacts with a runner service that
spawns processes to demonstrate usage of event streams, etc, along with some administration
interfaces to inspect the underlying services. [Keycloak](https://www.keycloak.org/) is used
for authentication and authorization.

**Please note that the out-of-the-box configurations are not safe for a production environment.**

![Vite-App](https://user-images.githubusercontent.com/161548/163657043-a2f3b766-77a6-44fc-8b62-078c6fa8390c.png)

## Requirements

One of the following configurations:

> Note that the docker compose environment does **not** scale and is mainly for development
> purposes, while the kubernetes cluster is configured for scaling.

1. Local [Kubernetes Cluster](#kubernetes)
    * `docker`
    * [`minikube`](https://minikube.sigs.k8s.io/docs/)
    * [`tilt`](https://tilt.dev/)
    * [`pulumi`](https://www.pulumi.com/) (optional)
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

* `kowl` - Kafka events
* `mailhog` - Mail messages
* `adminer` - Database administration
* `auth` - Authentication administration

## Deployment

If you want to deploy this into the cloud, see [`docs/deploy.md`](docs/deploy.md).

## License

[Unlicense](./UNLICENSE)

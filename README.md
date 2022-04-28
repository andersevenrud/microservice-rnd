# microservice-rnd

Microservice architecture demonstration with nodejs (typescript) and Kafka

## About

This is a personal research project used for learning more about microservice architectures,
structuring and good practices related to deployment/development on a Kubernetes Cluster
as well as Docker Compose.

Provides a basic frontend interface and API that interacts with a runner service that
spawns processes to demonstrate usage of event streams, etc, along with some administration
interfaces to inspect the underlying services.

**Even though this project includes optimizations to run in a production environment
(and has been tested in the cloud), I do not consider the backend configurations to
be safe out of the box in this state.**

![Vite-App](https://user-images.githubusercontent.com/161548/163657043-a2f3b766-77a6-44fc-8b62-078c6fa8390c.png)

## Requirements

One of the following configurations:

> Note that the docker compose environment does **not** scale and is mainly for development
> purposes, while the kubernetes cluster is configured for scaling.

1. Local [Docker Compose](#docker-compose)
    * `docker`
    * `docker-compose`
2. Local [Kubernetes Cluster](#kubernetes)
    * `docker`
    * `minikube`
    * [`tilt`](https://tilt.dev/)

## Installation

### Docker Compose

> Runs on http://localhost:8080 (and `/<admin-service>/`)

```bash
docker-compose run --rm cli sh scripts/migrations.sh
docker-compose up
```

### Kubernetes

> Runs on http://rnd.lvh.me (and `<admin-service>.rnd.lvh.me`. https available via self-signed certificate)

See [`docs/k8s.md`](docs/k8s.yaml) for more information about setting up a local Kubernetes cluster.

```bash
tilt up
```

## Admin Services

You can access the following administration interfaces with the URL patterns noted above:

* `kowl` - Kafka events
* `mailhog` - Mail messages
* `adminer` - Database administration

## License

[Unlicense](./UNLICENSE)

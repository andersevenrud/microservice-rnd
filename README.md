# microservice-rnd

Microservice architecture demonstration with nodejs (typescript) and Kafka

## About

This is a personal research used for learning more about microservice architectures
and structuring.

**This is probably not safe for production usage.**

Provides a basic frontend interface and API that interacts with a runner service that
spawns processes to demonstrate usage of event streams, etc, along with some administration
interfaces to inspect the underlying services.

![Vite-App](https://user-images.githubusercontent.com/161548/163657043-a2f3b766-77a6-44fc-8b62-078c6fa8390c.png)

## Requirements

One of the following configurations:

1. Local [Docker Compose](#docker-compose)
    * `docker-compose`
2. Local [Kubernetes Cluster](#kubernetes)
    * `minikube`
        * [`ingress`](https://minikube.sigs.k8s.io/docs/handbook/addons/ingress/)
        * [`ingress-dns`](https://minikube.sigs.k8s.io/docs/handbook/addons/ingress-dns/)
    * [`tilt`](https://tilt.dev/)

## Installation

### Docker Compose

> Runs on http://localhost:8080 (and `/<admin-service>/`)

```bash
docker-compose run --rm cli sh scripts/migrations.sh
docker-compose up
```

### Kubernetes

> Runs on http://rnd.lvh.me (and `<admin-service>.rnd.lvh.me`)

> HTTPs is available via a self-signed certificate.

```bash
kubectl config set-context --current --namespace=rnd
tilt up
```

## Admin Services

You can access the following administration interfaces with the URL patterns noted above:

* `kowl` - Kafka events
* `mailhog` - Mail messages
* `adminer` - Database administration

## License

[Unlicense](./UNLICENSE)

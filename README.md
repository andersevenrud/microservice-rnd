# microservice-rnd

Microservices R&D project.

**Only for research purposes and not safe for production usage.**

## About

A basic microservice architecture nodejs project using Kafka to stream events.

Includes a process runner service over PM2 to demonstrate launching of sub-processes that hooks into the event stream.

![Vite-App](https://user-images.githubusercontent.com/161548/163657043-a2f3b766-77a6-44fc-8b62-078c6fa8390c.png)

## Installation

### Docker Compose

> Runs on http://localhost:8080 (and `/<admin-service>/`)

First run migrations:

```bash
docker-compose run --rm cli npm run migrate
docker-compose run --rm cli npm run topics
```

Then start up solution:

```bash
docker-compose up
```

### Kubernetes

> Runs on http://rnd.lvh.me (and `/<admin-service>.rnd.lvh.me`)

Requires the following minikube setup:

```bash
minikube start
minikube addons enable ingress
```

Then switch kubernetes context and start up solution:

```bash
kubectl config set-context --current --namespace=rnd
tilt up
```

Open the interface and click the migration buttons in the top navigation bar
in order to make apps being able to connect to certain services.

## License

MIT

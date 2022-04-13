# microservice-rnd

Microservices R&D project.

**Only for research purposes and not safe for production usage.**

## About

A basic microservice architecture nodejs project using Kafka to stream events.

Includes a process runner service over PM2 to demonstrate launching of sub-processes that hooks into the event stream.

## Installation

```bash
# Run migrations
docker-compose run --rm cli npm run migrate
docker-compose run --rm cli npm run topics

# Start solutions
docker-compose up
```

## Usage

Runs on port `8080`.

> Note the trailing slash must be used to avoid redirects.

* `/` - App
* `/api/` - API
* `/kowl/` - Kafka browser
* `/adminer/` - Database admin
* `/mailhog/` - Mail preview

## License

MIT
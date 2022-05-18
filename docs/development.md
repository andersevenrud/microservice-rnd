# Development Documentation

## Environments

Supported environments:

| Environment     | Development | Production | Live Reload | Scalable | SSL  |
| --------------- | ----------- | ---------- | ----------- | -------- | ---- |
| Docker Compose  | Yes         | Yes        | Yes         | No       | No   |
| Tilt (k8s)      | Yes         | Yes        | Yes         | Yes      | Yes  |

## Structuring

Standard monorepo, node and React practices.

## Code style

Uses standard/recommended rulesets for both ESLint and Prettier with the following customizations:

* No semicolons
* Prefer single quotes

## Testing

Testing framework of choice is Jest.

## Commit messages

Follow https://www.conventionalcommits.org/en/v1.0.0/ message spec.

## Git hooks

Git hooks are provided to do preliminary checks before it enters CI.

Simply run: `npm install` in the root directory and hooks will be run on any git action.

## Installing dependencies

It's highly recommended that you run package installation from within a docker context
to prevent any compatability issues.

Example:

```bash
docker run --rm -v $(pwd)/packages/<package>:/usr/src/node -w /usr/src/node node:16-alpine npm install <name>
```

Or if you're on docker-compose:

```bash
docker-compose exec <package> npm install <name>
```

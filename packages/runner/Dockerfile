# Create initial layer from entire source
FROM node:16-alpine AS build
WORKDIR /usr/src/runner
COPY . .

# Install dependencies and build
RUN npm config set update-notifier false
RUN npm ci --silent --no-audit --no-fund
RUN npm run build

# Removes any non-essential files
RUN npm prune --production --silent --no-audit --no-fund
RUN npm install --silent --no-audit --no-fund -g clean-modules@2.0.4 && \
      clean-modules -y

# Start a fresh layer to explicitly add the required files. This avoids any caches etc.
FROM node:16-alpine
RUN apk add --no-cache dumb-init
USER node
ENV NODE_ENV production
WORKDIR /usr/src/runner

# Copy the build output to the root of the container with explicit permissions
COPY --chown=node:node --from=build /usr/src/runner/node_modules /usr/src/runner/node_modules
COPY --chown=node:node --from=build /usr/src/runner/dist /usr/src/runner/dist
COPY --chown=node:node --from=build /usr/src/runner/package.json /usr/src/runner/package.json
COPY --chown=node:node --from=build /usr/src/runner/UNLICENSE /usr/src/runner/UNLICENSE
COPY --chown=node:node --from=build /usr/src/runner/README.md /usr/src/runner/README.md

# Make sure we don't run node on PID 1
CMD ["dumb-init", "node", "dist/src/index.js"]

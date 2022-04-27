FROM node:16-alpine AS build
WORKDIR /usr/src/runner
COPY . .
RUN npm ci --silent --no-audit --no-fund
RUN npm run build
RUN npm prune --production
RUN npm install -g clean-modules@2.0.4 && \
      clean-modules -y

FROM node:16-alpine
RUN apk add --no-cache dumb-init
USER node
ENV NODE_ENV production
WORKDIR /usr/src/runner
COPY --chown=node:node --from=build /usr/src/runner/node_modules /usr/src/runner/node_modules
COPY --chown=node:node --from=build /usr/src/runner/dist /usr/src/runner/dist
COPY --chown=node:node --from=build /usr/src/runner/package.json /usr/src/runner/package.json
CMD ["dumb-init", "node", "dist/src/index.js"]

FROM node:16-alpine AS build
WORKDIR /usr/src/mailer
COPY . .
RUN npm config set update-notifier false
RUN npm ci --silent --no-audit --no-fund
RUN npm run build
RUN npm prune --production --silent --no-audit --no-fund
RUN npm install --silent --no-audit --no-fund -g clean-modules@2.0.4 && \
      clean-modules -y

FROM node:16-alpine
RUN apk add --no-cache dumb-init
USER node
ENV NODE_ENV production
WORKDIR /usr/src/mailer
COPY --chown=node:node --from=build /usr/src/mailer/node_modules /usr/src/mailer/node_modules
COPY --chown=node:node --from=build /usr/src/mailer/dist /usr/src/mailer/dist
COPY --chown=node:node --from=build /usr/src/mailer/package.json /usr/src/mailer/package.json
CMD ["dumb-init", "node", "dist/index.js"]

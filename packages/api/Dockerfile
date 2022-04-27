FROM node:16-alpine

RUN apk add --no-cache dumb-init

WORKDIR /usr/src/api
COPY . .

RUN npm ci --silent --no-audit --no-fund
RUN npm run build
RUN npm prune --production
RUN npm install -g clean-modules@2.0.4 && \
      clean-modules -y && \
      npm remove -g clean-modules
RUN npm cache clean --force
RUN rm -rf src \
      entrypoint.sh \
      mikro-orm.config.ts \
      tsconfig.json
USER node
ENV NODE_ENV production
CMD ["dumb-init", "node", "dist/src/index.js"]

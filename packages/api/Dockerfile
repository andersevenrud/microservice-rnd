FROM node:16-alpine

WORKDIR /usr/src/api
COPY . .

RUN npm ci --silent --no-audit --no-fund
RUN npm run build
RUN npm prune --production
RUN npm install -g clean-modules && \
      clean-modules -y && \
      npm remove -g clean-modules
RUN rm -rf src \
      entrypoint.sh \
      mikro-orm.config.ts \
      tsconfig.json
CMD ["npm", "run", "start"]

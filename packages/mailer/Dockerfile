FROM node:16-alpine

WORKDIR /usr/src/mailer
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
      tsconfig.json
USER node
CMD ["node", "dist/index.js"]

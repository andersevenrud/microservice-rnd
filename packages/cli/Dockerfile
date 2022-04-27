FROM node:16-alpine

WORKDIR /usr/src/cli
COPY . .
RUN npm config set update-notifier false
RUN npm ci --silent --no-audit --no-fund --production
RUN npm install --silent --no-audit --no-fund -g clean-modules@2.0.4 && \
      clean-modules -y && \
      npm remove -g clean-modules
RUN npm cache clean --force
USER node
ENV NODE_ENV production
CMD tail -f /dev/null

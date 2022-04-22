FROM node:16-alpine

WORKDIR /usr/src/cli
COPY . .

RUN npm ci --silent --no-audit --no-fund
RUN npm install -g clean-modules && \
      clean-modules -y && \
      npm remove -g clean-modules
CMD tail -f /dev/null

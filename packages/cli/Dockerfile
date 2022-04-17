FROM node:16-alpine

WORKDIR /usr/src/cli
COPY . .

RUN npm ci --silent --no-audit --no-fund
CMD tail -f /dev/null

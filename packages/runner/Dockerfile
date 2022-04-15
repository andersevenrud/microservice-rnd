FROM node:16-alpine

WORKDIR /usr/src/runner
COPY . .

RUN npm ci --silent --no-audit --no-fund
CMD ["npm", "run", "start"]

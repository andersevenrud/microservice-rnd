FROM node:16-alpine

WORKDIR /usr/src/api
COPY . .

RUN npm ci --silent --no-audit --no-fund
CMD ["npm", "run", "start"]

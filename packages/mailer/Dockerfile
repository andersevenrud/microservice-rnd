FROM node:16-alpine

WORKDIR /usr/src/mailer
COPY . .

RUN npm ci --silent --no-audit --no-fund
RUN npm install -g clean-modules && \
      clean-modules -y && \
      npm remove -g clean-modules
CMD ["npm", "run", "start"]

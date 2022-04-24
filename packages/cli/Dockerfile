FROM node:16-alpine

WORKDIR /usr/src/cli
COPY . .

RUN npm ci --silent --no-audit --no-fund --production
RUN npm install -g clean-modules@2.0.4 && \
      clean-modules -y && \
      npm remove -g clean-modules
RUN npm cache clean --force
CMD tail -f /dev/null

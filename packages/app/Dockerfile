FROM node:16-alpine

ARG VITE_KEYCLOAK_URL
ARG VITE_KEYCLOAK_REALM
ARG VITE_KEYCLOAK_CLIENT_ID
ENV VITE_KEYCLOAK_URL https://auth.rnd.lvh.me/
ENV VITE_KEYCLOAK_REALM rnd
ENV VITE_KEYCLOAK_CLIENT_ID rnd-client

WORKDIR /usr/src/app
COPY . .

RUN npm ci --silent --no-audit --no-fund
RUN npm run build

# Start a fresh layer to explicitly add the required files. This avoids any caches etc.
# Also, we want to have a web server in production in front, and not any
# node runtime
FROM nginx:1-alpine
RUN rm -rf /var/www/html
RUN sed -i 's/\/usr\/share\/nginx\/html/\/var\/www\/html/g' /etc/nginx/conf.d/default.conf
RUN sed -i 's/80;/8080;/g' /etc/nginx/conf.d/default.conf
COPY --from=0 /usr/src/app/dist /var/www/html

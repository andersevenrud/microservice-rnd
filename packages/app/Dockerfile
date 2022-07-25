#
# Production Dockerfile
#

FROM node:16-alpine

ARG VITE_KEYCLOAK_URL
ARG VITE_KEYCLOAK_REALM
ARG VITE_KEYCLOAK_CLIENT_ID
ENV VITE_KEYCLOAK_URL=${VITE_KEYCLOAK_URL}
ENV VITE_KEYCLOAK_REALM=${VITE_KEYCLOAK_REALM}
ENV VITE_KEYCLOAK_CLIENT_ID=${VITE_KEYCLOAK_CLIENT_ID}

WORKDIR /usr/src/app
COPY . .

RUN npm ci --quiet --no-audit --no-fund
RUN npm run build

# Start a fresh layer to explicitly add the required files. This avoids any caches etc.
# Also, we want to have a web server in production in front, and not any
# node runtime
FROM nginx:1-alpine
RUN rm -rf /var/www/html
RUN sed -i 's/\/usr\/share\/nginx\/html/\/var\/www\/html/g' /etc/nginx/conf.d/default.conf
RUN sed -i 's/index  index.html index.htm;/index  index.html index.htm;\ntry_files $uri $uri\/ \/index.html;/' /etc/nginx/conf.d/default.conf

RUN sed -i 's/80;/8080;/g' /etc/nginx/conf.d/default.conf
COPY --from=0 /usr/src/app/dist /var/www/html

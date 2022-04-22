FROM node:16-alpine

WORKDIR /usr/src/app
COPY . .

RUN npm ci --silent --no-audit --no-fund
RUN npm install -g clean-modules && \
      clean-modules -y && \
      npm remove -g clean-modules
RUN npm run build

FROM nginx:1-alpine
RUN rm -rf /var/www/html
RUN sed -i 's/\/usr\/share\/nginx\/html/\/var\/www\/html/g' /etc/nginx/conf.d/default.conf
RUN sed -i 's/80;/8080;/g' /etc/nginx/conf.d/default.conf
COPY --from=0 /usr/src/app/dist /var/www/html

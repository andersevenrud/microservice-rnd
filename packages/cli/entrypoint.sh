#!/bin/sh
#
# This is only used for development enviroments
# Like the docker-compose.yml setup
#

if [ -z "$1" ]; then
  npm ci --silent --no-audit --no-fund
  exec npm run dev
else
  exec npm run start
fi

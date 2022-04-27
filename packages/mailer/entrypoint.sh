#!/bin/sh
#
# This is only used for development enviroments
# Like the docker-compose.yml setup
#

npm ci --silent --no-audit --no-fund
exec npm run dev

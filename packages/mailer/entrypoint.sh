#!/bin/sh
#
# This is only used for docker compose development enviroments
#

npm ci --quiet --no-audit --no-fund
exec npm run dev

#/!bin/sh

if [ -z "$1" ]; then
  npm ci --silent --no-audit --no-fund
  exec npm run dev
else
  exec npm run cron
fi

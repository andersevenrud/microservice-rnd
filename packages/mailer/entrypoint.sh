#/!bin/sh

npm ci --silent --no-audit --no-fund
exec npm run dev

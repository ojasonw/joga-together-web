#!/bin/sh
set -e
API_BASE_URL=${API_BASE_URL:-/api} envsubst '${API_BASE_URL}' \
  < /usr/share/nginx/html/js/config.template.js \
  > /usr/share/nginx/html/js/config.js
exec "$@"

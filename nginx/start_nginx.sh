#!/bin/bash

envsubst '$NGINX_HOSTNAME' < /nginx.conf.template > /etc/nginx/nginx.conf

echo "${NGINX_AUTH_USER}:${NGINX_AUTH_PASS_HASH}" > /htpasswd

exec nginx -g 'daemon off;'

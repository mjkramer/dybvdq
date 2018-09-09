#!/bin/bash

envsubst '$DYBVDQ_HOSTNAME' < /nginx.conf.template > /etc/nginx/nginx.conf

echo "${DYBVDQ_AUTH_USER}:${DYBVDQ_AUTH_PASS_HASH}" > /htpasswd

exec nginx -g 'daemon off;'

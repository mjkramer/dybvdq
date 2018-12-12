#!/bin/bash

envsubst '$DYBVDQ_HOSTNAME:$DYBVDQ_SUSPEND_CODE' < /nginx.conf.template > /etc/nginx/nginx.conf

echo "${DYBVDQ_AUTH_USER}:${DYBVDQ_AUTH_PASS_HASH}" > /htpasswd

# sleep 20                         # wait for backend (our upstream)
/wait_backend.sh

exec nginx -g 'daemon off;'

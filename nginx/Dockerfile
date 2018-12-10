# Note: context should be dybvdq/ root, as specified in
# ../deploy/docker-compose.yml

FROM node:alpine as builder
# RUN apk update && apk add --no-cache make git

COPY front /front

WORKDIR /front

RUN npm install && npm run build

# ----------------------------------------------------------------------

FROM alpine:3.8

# Need gettext for envsubst
RUN apk add --no-cache bash gettext nginx-mod-http-lua

# Forward request and error logs to Docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log

COPY --from=builder /front/build /webroot
COPY nginx/nginx.conf /nginx.conf.template
COPY nginx/start_nginx.sh /start_nginx.sh

CMD /bin/bash /start_nginx.sh

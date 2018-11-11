FROM node:alpine as builder
# RUN apk update && apk add --no-cache make git

COPY ../front /front

WORKDIR /front

RUN npm install && npm run build


FROM nginx

COPY --from=builder /front/build /webroot
COPY nginx.conf /nginx.conf.template
COPY start_nginx.sh /start_nginx.sh

CMD /bin/bash /start_nginx.sh

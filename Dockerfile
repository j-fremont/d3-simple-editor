FROM balenalib/rpi-alpine-node:latest

WORKDIR /usr/src/app

COPY ./ ./

RUN npm install

EXPOSE 3000

ENTRYPOINT ["/bin/sh", "start.sh"]


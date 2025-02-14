FROM node:18-slim

USER root

RUN apt-get update && \
    apt-get install curl -y --no-install-recommends
RUN npm rm yarn -g
RUN npm i pnpm -g

RUN mkdir /home/node/app
WORKDIR /home/node/app

COPY package.json pnpm-lock.yaml .npmrc /home/node/app/
RUN pnpm i --frozen-lockfile

COPY . /home/node/app
RUN pnpm build

RUN pnpm prune --prod || true \
    pnpm store prune

EXPOSE 3000
CMD ["npm", "start"]
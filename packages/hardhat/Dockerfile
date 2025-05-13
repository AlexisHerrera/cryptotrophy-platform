FROM node:20-alpine AS builder
WORKDIR /usr/src/app
# Install curl
RUN apk add --no-cache curl

COPY packages/hardhat/package.json    ./package.json

RUN npm install

COPY packages/hardhat ./

EXPOSE 8545

CMD ["npm","run","chain"]
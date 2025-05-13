FROM node:20-bullseye AS builder

WORKDIR /usr/src/app

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    python3 python3-dev build-essential curl \
 && rm -rf /var/lib/apt/lists/*

COPY packages/hardhat/package.json ./

RUN npm install

COPY packages/hardhat ./

EXPOSE 8545

CMD ["npm","run","chain"]

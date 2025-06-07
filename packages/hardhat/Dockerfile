FROM node:20-bullseye

WORKDIR /usr/src/app

COPY packages/hardhat/package.json ./package.json

RUN npm install

COPY packages/hardhat/ ./

EXPOSE 8545

CMD ["npm","run","chain"]
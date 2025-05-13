FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY packages/ponder/package.json    ./package.json
COPY packages/config ../config

RUN npm install

COPY packages/ponder ./
RUN npm run codegen
RUN npm prune --production

FROM node:20-alpine AS runtime
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app ./

COPY --from=builder /usr/src/config /usr/src/config

EXPOSE 42069

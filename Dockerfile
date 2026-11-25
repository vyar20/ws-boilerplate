FROM oven/bun:1 AS base

WORKDIR /app

COPY . .

RUN bun install --lock-frozenfile

CMD [ "bun", "run", "start" ]
# syntax=docker/dockerfile:1

FROM node:24-alpine AS deps
WORKDIR /app
RUN corepack enable

COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile || yarn install

FROM deps AS ci
WORKDIR /app
COPY . .
RUN yarn run lint
RUN yarn run build

FROM deps AS builder
WORKDIR /app
COPY . .
RUN yarn run build

FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=builder /app/dist .

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
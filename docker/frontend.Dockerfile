FROM node:20-bookworm-slim AS build

ARG VITE_ENABLE_CHECKOUT_FAILURE_SIM=
ENV VITE_ENABLE_CHECKOUT_FAILURE_SIM=$VITE_ENABLE_CHECKOUT_FAILURE_SIM

WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM nginx:1.27-alpine
RUN apk add --no-cache wget
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY backend/package.json backend/package-lock.json ./
COPY backend/prisma ./prisma
COPY backend/src ./src

RUN npm ci \
  && npx prisma generate

ENV NODE_ENV=production
ENV DATABASE_URL=file:/app/data/app.db

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "src/server.js"]

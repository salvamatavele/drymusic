# syntax=docker/dockerfile:1

# ---------- deps: instala dependências ----------
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- builder: gera Prisma Client + build standalone ----------
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV BUILD_STANDALONE=1
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npm run build

# ---------- runner: imagem final mínima ----------
FROM node:24-alpine AS runner
WORKDIR /app

# ffmpeg: conversão automática de vídeos (MKV/MOV/AVI -> MP4) no upload
RUN apk add --no-cache ffmpeg

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# storage de media (montado como volume no compose)
RUN mkdir -p media/files media/covers && chown -R node:node /app

USER node
EXPOSE 3000

CMD ["node", "server.js"]

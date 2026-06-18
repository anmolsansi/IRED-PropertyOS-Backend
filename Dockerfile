# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

RUN addgroup -g 1001 -S propertyos && \
    adduser -S propertyos -u 1001

COPY --from=builder --chown=propertyos:propertyos /app/dist ./dist
COPY --from=builder --chown=propertyos:propertyos /app/node_modules ./node_modules
COPY --from=builder --chown=propertyos:propertyos /app/package.json ./package.json
COPY --from=builder --chown=propertyos:propertyos /app/prisma ./prisma

USER propertyos

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]

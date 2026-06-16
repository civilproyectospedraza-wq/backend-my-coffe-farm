# ============================================================
#  Stage 1: build (compila TypeScript + genera cliente Prisma)
# ============================================================
FROM node:22-alpine AS builder

# Prisma necesita openssl
RUN apk add --no-cache openssl

WORKDIR /app

# Instalar dependencias (incluidas devDependencies para compilar)
COPY package*.json ./
RUN npm ci

# Copiar el resto del código y el schema de Prisma
COPY . .

# Generar cliente Prisma y compilar
RUN npx prisma generate
RUN npm run build

# ============================================================
#  Stage 2: runtime (solo lo necesario para ejecutar)
# ============================================================
FROM node:22-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production

# Solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev

# Generar cliente Prisma en la imagen final
COPY prisma ./prisma
RUN npx prisma generate

# Copiar el build ya compilado
COPY --from=builder /app/dist ./dist

# El puerto real lo define la variable PORT del .env
EXPOSE 8091

CMD ["node", "dist/index.js"]

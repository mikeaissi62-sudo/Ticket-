# Étape 1 : Image de base
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Étape 2 : Dépendances
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Étape 3 : Construction de l'application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de build requises par Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Supabase dummy vars pour la phase de build statique Next.js si nécessaire
ARG NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

# Étape 4 : Image d'exécution finale (légère et sécurisée)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copie des fichiers statiques et du serveur autonome généré par output: 'standalone'
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

# Stage 1 - Dépendances
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# Stage 2 - Image finale
FROM node:20-alpine AS runner
WORKDIR /app

# Utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=deps /app/node_modules ./node_modules
COPY . .

USER nodejs
EXPOSE 3001

ENV NODE_ENV=production
CMD ["node", "src/index.js"]

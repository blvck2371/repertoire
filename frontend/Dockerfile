# Stage 1 - Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2 - Image finale optimisée
FROM nginx:alpine AS runner

# Suppression de la config par défaut
RUN rm -rf /usr/share/nginx/html/*

# Copie des assets buildés
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

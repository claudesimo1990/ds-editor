# Stage 1: Build de l'application Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Installer les dépendances système nécessaires
RUN apk add --no-cache libc6-compat

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Supprimer les exemples si présents
RUN rm -rf examples app/examples || true

# Variables d'environnement pour le build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build de l'application Vite
RUN npm run build

# Stage 2: Serveur nginx pour servir les fichiers statiques
FROM nginx:alpine AS runner

# Copier les fichiers buildés depuis le stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]

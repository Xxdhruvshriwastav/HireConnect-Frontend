# ─── Stage 1: Build Angular App ───────────────────────────────────────────────
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source and build for production
COPY . .
RUN npm run build -- --configuration=production

# ─── Stage 2: Serve with Nginx ─────────────────────────────────────────────────
FROM nginx:alpine

# Copy custom nginx config (handles Angular SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app
COPY --from=build /app/dist/hireconnect-frontend/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

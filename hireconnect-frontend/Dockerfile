# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Run stage
FROM nginx:alpine
COPY --from=build /app/dist/hireconnect-frontend/browser /usr/share/nginx/html
COPY --from=build /app/dist/hireconnect-frontend/browser/index.html /usr/share/nginx/html/404.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

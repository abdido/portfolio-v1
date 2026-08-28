# Stage 1: Build production static files
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first for optimal layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci || npm install

# Copy source code
COPY . .

# Build Vite React production bundle
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:alpine AS production

# Copy custom Nginx SPA configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from Stage 1 to Nginx HTML directory
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

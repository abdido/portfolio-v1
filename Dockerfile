FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY src ./src
COPY public ./public
RUN npm run build

FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080 DATA_DIR=/app/.data UPLOADS_DIR=/app/uploads
COPY package*.json ./
RUN npm ci --omit=dev && mkdir -p .data uploads && chown -R node:node /app
COPY --from=build /app/dist ./dist
COPY server ./server
COPY src/data/seedData.js ./src/data/seedData.js
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://127.0.0.1:8080/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server/index.js"]

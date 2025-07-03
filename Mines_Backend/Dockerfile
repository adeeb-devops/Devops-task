# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache make gcc g++ python3
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/views ./views
RUN npm install --only=production --ignore-scripts --silent
RUN npm rebuild bcrypt --build-from-source
EXPOSE 3000
COPY .env .env
CMD ["node", "dist/server.js"]

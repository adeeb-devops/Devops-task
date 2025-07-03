# Stage 1: Build the React app
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine 

# Copy built React app to Nginx's public directory
COPY --from=build /app/build /usr/share/nginx/html

# Remove default Nginx config and add custom one if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

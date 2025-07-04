# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the application code
COPY . .

# Expose port (change if your app listens on a different port)
EXPOSE 5000
COPY .env .env
# Start the app
CMD ["npm", "start"]

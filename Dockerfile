# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy remaining source code
COPY . .

# Expose port
EXPOSE 5000

# Default command
CMD ["node", "server.js"]

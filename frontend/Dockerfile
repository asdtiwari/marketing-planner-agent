# ==========================================
# STAGE 1: Build the React/Vite application
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the frontend code and build it
COPY . .
RUN npm run build

# ==========================================
# STAGE 2: Serve the application using Nginx
# ==========================================
FROM nginx:alpine

# Copy the built assets from the builder stage to Nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (Standard HTTP port)
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
# Dockerfile for SigmaChain Frontend
# Multi-stage build for Vite + React

# Stage 1: Dependencies
FROM node:20-slim AS frontend_deps

WORKDIR /app

# Copy the manifest file
COPY package.json .

# Install dependencies
RUN npm install

# Stage 2: Builder
FROM node:20-slim AS builder
WORKDIR /app

# Accept build arguments
ARG VITE_API_URL=http://localhost:8000
ARG VITE_RUST_SERVICE_URL=http://localhost:8001

# Copy dependencies from the deps stage
COPY --from=frontend_deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_RUST_SERVICE_URL=${VITE_RUST_SERVICE_URL}

# Build Vite application
RUN npm run build

# Stage 3: Runner (using nginx for static files)
FROM nginx:alpine AS runner

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
RUN echo 'server { \
    listen 3000; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

CMD ["nginx", "-g", "daemon off;"]

# Multi-stage build for React Vite Admin App
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx configuration
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    
    # Serve static files
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }
    
    # Handle API proxy (optional - if you want to proxy API calls)
    location /api/ {
        proxy_pass http://siglat-api:5000/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
EOF

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create a startup script to handle environment variables at runtime
COPY <<'EOF' /docker-entrypoint.d/30-envsubst-on-templates.sh
#!/bin/sh
set -e

# Replace environment variables in JavaScript files
if [ -n "${PUBLIC_API_URL}" ]; then
    echo "Setting PUBLIC_API_URL to: ${PUBLIC_API_URL}"
    find /usr/share/nginx/html -name "*.js" -exec sed -i "s|http://localhost:5000|${PUBLIC_API_URL}|g" {} +
fi

exec "$@"
EOF

# Make the script executable
RUN chmod +x /docker-entrypoint.d/30-envsubst-on-templates.sh

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Add labels for better Docker management
LABEL maintainer="SIGLAT Team"
LABEL description="SIGLAT Admin App - Emergency Response System Administration"
LABEL version="1.0.0"

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
# Docker Deployment Guide

This document explains how to build and deploy the SIGLAT Admin App using Docker.

## Quick Start

### Using Docker Compose (Recommended)

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start the application:**
   ```bash
   pnpm run docker:dev
   ```

3. **Access the application:**
   - Admin App: http://localhost:2424

### Using Docker directly

1. **Build the image:**
   ```bash
   pnpm run docker:build
   ```

2. **Run the container:**
   ```bash
   pnpm run docker:run
   ```

## Available Docker Scripts

| Script | Description |
|--------|-------------|
| `pnpm run docker:build` | Build Docker image |
| `pnpm run docker:run` | Run container with .env file |
| `pnpm run docker:dev` | Start with docker-compose (development) |
| `pnpm run docker:prod` | Start in production mode |
| `pnpm run docker:stop` | Stop all containers |
| `pnpm run docker:logs` | View application logs |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PUBLIC_API_URL` | SIGLAT API backend URL | `http://localhost:5000` |

## Docker Configuration

### Multi-stage Build
- **Stage 1**: Node.js environment for building the React app
- **Stage 2**: Nginx for serving static files

### Features
- ✅ Optimized build with pnpm
- ✅ Nginx with custom configuration
- ✅ API proxy support
- ✅ Security headers
- ✅ Gzip compression
- ✅ Health checks
- ✅ Runtime environment variable substitution

### Ports
- **Container**: 80 (nginx)
- **Host**: 2424 (configurable)

## Production Deployment

1. **Build for production:**
   ```bash
   docker build -t siglat-admin-app:latest .
   ```

2. **Run with environment variables:**
   ```bash
   docker run -d \
     --name siglat-admin-app \
     -p 80:80 \
     -e PUBLIC_API_URL=https://api.siglat.your-domain.com \
     siglat-admin-app:latest
   ```

## Health Checks

The container includes health checks that verify:
- HTTP response from nginx
- Application availability

Monitor health with:
```bash
docker ps  # Check STATUS column
docker inspect siglat-admin-app | grep Health -A 10
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Change host port in docker-compose.yml or use different port
   docker run -p 3001:80 siglat-admin-app
   ```

2. **API connection issues:**
   ```bash
   # Check environment variables
   docker exec siglat-admin-app env | grep PUBLIC_API_URL
   ```

3. **Build failures:**
   ```bash
   # Clear Docker cache
   docker system prune -a
   docker build --no-cache -t siglat-admin-app .
   ```

### Logs

View container logs:
```bash
# Real-time logs
docker logs -f siglat-admin-app

# Using docker-compose
pnpm run docker:logs
```
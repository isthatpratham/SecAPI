# Deployment Guide

This guide covers various deployment options for the Security Intelligence API.

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Vercel Deployment](#vercel-deployment)
4. [Railway Deployment](#railway-deployment)
5. [Render Deployment](#render-deployment)
6. [AWS Deployment](#aws-deployment)
7. [Production Checklist](#production-checklist)

## Local Development

### Prerequisites
- Node.js 18.0.0+
- npm 9.0.0+

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env

# 3. Configure environment (optional)
# Edit .env with your settings

# 4. Start development server
npm run dev

# 5. Server runs on http://localhost:3000
```

### Development Environment Variables
```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
RATE_LIMIT_MAX_REQUESTS=1000  # Higher for development
```

## Docker Deployment

### Prerequisites
- Docker 20.0+
- Docker Compose 1.29+ (optional)

### Using Docker

```bash
# 1. Build Docker image
npm run build
docker build -t security-intel-api:latest .

# 2. Run container
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e HIBP_API_KEY=your-api-key \
  --name security-api \
  security-intel-api:latest

# 3. View logs
docker logs security-api

# 4. Stop container
docker stop security-api
```

### Using Docker Compose

```bash
# 1. Start services
docker-compose up -d

# 2. View logs
docker-compose logs -f

# 3. Stop services
docker-compose down

# 4. Rebuild services
docker-compose up -d --build
```

### Production Docker Environment Variables
```yaml
environment:
  NODE_ENV: production
  PORT: 3000
  RATE_LIMIT_MAX_REQUESTS: 100
  LOG_LEVEL: info
  HIBP_API_KEY: ${HIBP_API_KEY}
```

## Vercel Deployment

Vercel is ideal for serverless deployment with automatic scaling.

### Prerequisites
- Vercel account (vercel.com)
- GitHub repository

### Steps

```bash
# 1. Install Vercel CLI (optional)
npm i -g vercel

# 2. Deploy via CLI
vercel --prod

# 3. Or connect GitHub directly at https://vercel.com/new
```

### Vercel Configuration (vercel.json)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.js" }],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Environment Variables in Vercel
1. Go to Project Settings
2. Navigate to Environment Variables
3. Add:
   - `NODE_ENV`: `production`
   - `HIBP_API_KEY`: Your API key
   - `RATE_LIMIT_MAX_REQUESTS`: `100`
   - `LOG_LEVEL`: `info`

## Railway Deployment

Railway provides simple deployment with PostgreSQL integration.

### Prerequisites
- Railway account (railway.app)
- GitHub repository

### Steps

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login to Railway
railway login

# 3. Create new project
railway init

# 4. Deploy
railway up
```

### Railway Configuration (railway.json)

```json
{
  "buildCommand": "npm run build",
  "startCommand": "npm start",
  "rootDirectory": ".",
  "variables": {
    "NODE_ENV": "production"
  }
}
```

### Environment Variables in Railway
1. Connect GitHub repository
2. Add environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `${PORT}` (auto-assigned)
   - `HIBP_API_KEY`: Your API key

## Render Deployment

Render offers simple deploy-from-git experience.

### Prerequisites
- Render account (render.com)
- GitHub repository

### Steps

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name**: `security-intel-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables
6. Deploy

### Environment Variables in Render
```
NODE_ENV=production
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
HIBP_API_KEY=your-api-key
```

## AWS Deployment

### Using AWS App Runner

```bash
# 1. Create ECR repository
aws ecr create-repository --repository-name security-intel-api

# 2. Build and push Docker image
docker build -t security-intel-api .
docker tag security-intel-api:latest <account-id>.dkr.ecr.<region>.amazonaws.com/security-intel-api:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/security-intel-api:latest

# 3. Create App Runner service (via AWS Console)
# - Select ECR image
# - Configure settings
# - Set environment variables
# - Deploy
```

### Using AWS Elastic Beanstalk

```bash
# 1. Install EB CLI
pip install awsebcli

# 2. Initialize EB application
eb init -p node.js-18 security-intel-api

# 3. Create environment
eb create security-api-env

# 4. Deploy
eb deploy

# 5. View logs
eb logs
```

## Production Checklist

### Security
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `RATE_LIMIT_MAX_REQUESTS` (50-100)
- [ ] Enable HTTPS/TLS
- [ ] Add authentication (API keys)
- [ ] Set secure environment variables
- [ ] Enable CORS with specific origins
- [ ] Run security audit: `npm audit`
- [ ] Enable helmet security headers

### Performance
- [ ] Enable gzip compression
- [ ] Use CDN for static content
- [ ] Implement caching headers
- [ ] Set appropriate timeouts
- [ ] Monitor response times
- [ ] Use load balancer if needed

### Monitoring & Logging
- [ ] Set up error tracking (Sentry/Rollbar)
- [ ] Enable structured logging
- [ ] Set up performance monitoring
- [ ] Enable health check monitoring
- [ ] Configure log retention
- [ ] Set up alerts for errors

### Database & State
- [ ] Back up environment variables
- [ ] Configure log persistence
- [ ] Set up monitoring dashboards
- [ ] Enable container restarts
- [ ] Configure auto-scaling

### Deployment
- [ ] Test in staging first
- [ ] Use blue-green deployment if possible
- [ ] Plan rollback strategy
- [ ] Test graceful shutdown
- [ ] Verify health checks pass
- [ ] Monitor for issues post-deploy

## Environment Variable Recommendations

### Development
```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=900000
```

### Production
```env
NODE_ENV=production
PORT=3000  # or auto-assigned
LOG_LEVEL=info
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
HIBP_API_KEY=<your-api-key>
CORS_ORIGIN=https://yourdomain.com
```

## Scaling Strategies

### Horizontal Scaling
- Use Docker containers with load balancer
- Deploy multiple instances
- Use managed container services (ECS, App Runner)

### Vertical Scaling
- Increase server resources (RAM, CPU)
- Deploy to larger instance type

### Caching
- Implement Redis for domain lookups
- Cache SSL certificate data
- Use CDN for static responses

## Monitoring & Maintenance

### Health Checks
```bash
curl https://your-api.com/api/v1/health
```

### Logging
- Output to stdout in production
- Use log aggregation service
- Monitor error rates

### Updates
```bash
# Check for security updates
npm audit

# Install updates
npm update

# Deploy updated version
```

## Troubleshooting

### Port Already in Use
```bash
lsof -i :3000
kill -9 <PID>
```

### Out of Memory
```bash
# Increase node memory
NODE_OPTIONS="--max-old-space-size=2048" npm start
```

### Slow Responses
- Monitor external API calls
- Check rate limiting
- Verify network connectivity

### SSL Certificate Issues
- Verify certificate validity
- Check certificate path
- Use Let's Encrypt

---

For specific deployment help, consult the documentation of your chosen platform.

# Quick Start Guide

## One-Minute Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints Available

### 1. Health Check
```bash
curl http://localhost:3000/api/v1/health
```

### 2. Scan URL
```bash
curl -X POST http://localhost:3000/api/v1/scan/url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.google.com"}'
```

### 3. Check Domain
```bash
curl -X POST http://localhost:3000/api/v1/scan/domain \
  -H "Content-Type: application/json" \
  -d '{"domain": "google.com"}'
```

### 4. Analyze Password
```bash
curl -X POST http://localhost:3000/api/v1/check/password \
  -H "Content-Type: application/json" \
  -d '{"password": "MySecureP@ss123!"}'
```

### 5. Check Email Breach
```bash
curl -X POST http://localhost:3000/api/v1/check/email-breach \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

## Common Commands

```bash
# Development
npm run dev              # Start with hot reload

# Building
npm run build            # Compile TypeScript

# Running
npm start               # Run compiled JavaScript

# Testing
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode

# Code Quality
npm run lint            # Check for linting errors
npm run lint:fix        # Fix linting errors
npm run format          # Format code with Prettier
```

## File Structure Overview

```
src/
├── index.ts            # Server entry point
├── app.ts              # Express app setup
├── config/             # Configuration
├── middleware/         # Express middleware
├── routes/             # API endpoints
├── services/           # Business logic
├── types/              # TypeScript types
└── utils/              # Helper functions

tests/
├── setup.ts            # Test configuration
├── urlScanner.test.ts  # URL tests
└── password.test.ts    # Password tests
```

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start server: `npm run dev`
3. ✅ Test endpoints with curl or Postman
4. ✅ Read [README.md](./README.md) for detailed documentation
5. ✅ Check [Environment Variables](#environment-variables)

## Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
PORT=3000                          # Server port
NODE_ENV=development               # Environment
RATE_LIMIT_WINDOW_MS=900000       # Rate limit window in ms
RATE_LIMIT_MAX_REQUESTS=100       # Max requests per window
HIBP_API_KEY=                     # Optional: HaveIBeenPwned API key
LOG_LEVEL=info                    # Logging level
```

## Production Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### Deploy to Railway
```bash
npm i -g @railway/cli
railway up
```

### Docker Deployment
```bash
npm run build
docker build -t security-intel-api .
docker run -p 3000:3000 security-intel-api
```

## Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env to another port (e.g., 3001)
PORT=3001
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Compilation Errors
```bash
# Clear build cache and rebuild
npm run build
```

## Testing the API

Use this interactive Postman collection URL:
- Import this collection into Postman for easy testing

Or use curl:
```bash
# URL Scanner
curl -X POST http://localhost:3000/api/v1/scan/url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Password Check
curl -X POST http://localhost:3000/api/v1/check/password \
  -H "Content-Type: application/json" \
  -d '{"password": "Test@1234"}'
```

## Support & Documentation

- 📖 Full API docs: See [README.md](./README.md)
- 🐛 Issues: Check logs in `logs/` directory
- 📝 Code comments: All functions have JSDoc comments

## What's Included

✅ Full TypeScript implementation
✅ Express.js with middleware
✅ Zod validation
✅ Winston logging
✅ Rate limiting
✅ Error handling
✅ Security headers
✅ CORS support
✅ Jest tests
✅ ESLint & Prettier
✅ Production-ready code
✅ Comprehensive documentation

---

Happy secure coding! 🚀

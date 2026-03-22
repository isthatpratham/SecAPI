# Security Intelligence API

A production-ready Security Intelligence API for URL scanning, domain analysis, password strength checking, and breach detection. Built with Node.js, Express, and TypeScript.

## Features

- **URL Security Scanning**: Analyze URLs for security headers, SSL/TLS certificate validation, and overall security posture
- **Domain Analysis**: Detect phishing attempts, typosquatting, and reputation scoring of domains
- **Password Strength Analysis**: Comprehensive password security assessment including entropy calculation and crack-time estimation
- **Breach Detection**: Check if emails have appeared in known data breaches using HaveIBeenPwned API integration
- **Risk Scoring**: Standardized risk assessment (0-100 scale) across all endpoints
- **Rate Limiting**: Built-in rate limiting (100 requests per 15 minutes per IP)
- **Security Headers**: Helmet middleware for comprehensive HTTP security headers
- **Comprehensive Logging**: Winston-based logging with file and console transports
- **TypeScript**: Full type safety and excellent developer experience
- **Error Handling**: Standardized error responses across all endpoints

## Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.x
- **Validation**: Zod
- **Logging**: Winston
- **Rate Limiting**: express-rate-limit
- **Security**: Helmet, CORS
- **HTTP Client**: Axios
- **Caching**: node-cache
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier

## Project Structure

```
security-intel-api/
├── src/
│   ├── index.ts                # Server entry point
│   ├── app.ts                  # Express app configuration
│   ├── config/
│   │   ├── index.ts            # Environment configuration
│   │   └── constants.ts        # API constants & thresholds
│   ├── middleware/
│   │   ├── errorHandler.ts     # Global error handling
│   │   ├── rateLimiter.ts      # Rate limiting
│   │   └── validator.ts        # Request validation
│   ├── routes/
│   │   ├── index.ts            # Route aggregation
│   │   ├── urlScanner.ts       # URL scanning endpoint
│   │   ├── domainChecker.ts    # Domain analysis endpoint
│   │   ├── password.ts         # Password analysis endpoint
│   │   ├── breach.ts           # Breach checking endpoint
│   │   └── health.ts           # Health check endpoint
│   ├── services/
│   │   ├── securityHeaders.ts  # Security header analysis
│   │   ├── sslChecker.ts       # SSL/TLS validation
│   │   ├── domainAnalysis.ts   # Domain/phishing detection
│   │   ├── passwordAnalyzer.ts # Password strength analysis
│   │   └── breachChecker.ts    # Breach checking
│   ├── utils/
│   │   ├── scoring.ts          # Risk scoring algorithms
│   │   ├── validators.ts       # Input validation helpers
│   │   └── logger.ts           # Winston logger setup
│   └── types/
│       ├── index.ts            # Shared types
│       ├── requests.ts         # Request body types
│       └── responses.ts        # Response types
├── tests/
│   ├── setup.ts                # Test configuration
│   ├── urlScanner.test.ts      # URL scanner tests
│   └── password.test.ts        # Password analyzer tests
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── jest.config.js              # Jest configuration
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── .prettierrc                 # Prettier configuration
├── .eslintrc.json              # ESLint configuration
└── README.md                   # This file
```

## Setup Instructions

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Installation

1. **Clone or download the project**

```bash
cd security-intel-api
```

2. **Install dependencies**

```bash
npm install
```

3. **Create environment file**

```bash
cp .env.example .env
```

4. **Configure environment variables** (edit `.env` as needed)

```env
PORT=3000
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
HIBP_API_KEY=your-api-key-here  # Optional: Get from haveibeenpwned.com
LOG_LEVEL=info
```

5. **Start the server**

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build

# Run production build
npm start
```

The API will be available at `http://localhost:3000/api/v1`

## API Endpoints

### Health Check

**GET** `/api/v1/health`

Check API availability and version.

```bash
curl http://localhost:3000/api/v1/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "uptime": 123.456,
    "version": "1.0.0"
  },
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### URL Security Scan

**POST** `/api/v1/scan/url`

Analyze website security headers, SSL certificates, and overall security posture.

```bash
curl -X POST http://localhost:3000/api/v1/scan/url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "headers": {
      "strict-transport-security": "max-age=31536000; includeSubDomains",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY"
    },
    "ssl": {
      "version": "3",
      "subject": "CN=example.com",
      "issuer": "CN=Let's Encrypt Authority X3",
      "valid_from": "2024-01-01T00:00:00.000Z",
      "valid_to": "2025-01-01T00:00:00.000Z",
      "fingerprint": "...",
      "is_valid": true,
      "days_remaining": 345
    },
    "riskScore": {
      "score": 25,
      "level": "low",
      "factors": ["Missing headers: 2", "SSL valid: true", "Days remaining: 345"]
    },
    "recommendations": [
      {
        "priority": "medium",
        "message": "Consider adding Content-Security-Policy header",
        "action": "Implement CSP policy"
      }
    ],
    "responseTime": 1234
  },
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### Domain Analysis

**POST** `/api/v1/scan/domain`

Check domain for phishing attempts, typosquatting, and reputation.

```bash
curl -X POST http://localhost:3000/api/v1/scan/domain \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com"}'
```

**Request:**
```json
{
  "domain": "example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "domain": "example.com",
    "is_registered": true,
    "phishing_score": 15,
    "typosquatting_risk": false,
    "age_days": 5000,
    "riskScore": {
      "score": 15,
      "level": "low",
      "factors": ["Typosquatting: No", "Suspicion score: 15", "Registered: true"]
    },
    "recommendations": [
      {
        "priority": "low",
        "message": "Domain appears legitimate",
        "action": "Proceed with caution"
      }
    ]
  },
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### Password Strength Analysis

**POST** `/api/v1/check/password`

Analyze password security, strength, and get recommendations.

```bash
curl -X POST http://localhost:3000/api/v1/check/password \
  -H "Content-Type: application/json" \
  -d '{"password": "MySecureP@ss123!"}'
```

**Request:**
```json
{
  "password": "MySecureP@ss123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "password_length": 16,
    "entropy": 89.45,
    "strength": "very_strong",
    "has_uppercase": true,
    "has_lowercase": true,
    "has_numbers": true,
    "has_special_chars": true,
    "common_word": false,
    "crack_time_seconds": 1234567890,
    "riskScore": {
      "score": 8,
      "level": "low",
      "factors": []
    },
    "recommendations": [
      {
        "priority": "low",
        "message": "Password meets security standards",
        "action": null
      }
    ]
  },
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### Email Breach Check

**POST** `/api/v1/check/email-breach`

Check if an email address has appeared in known data breaches.

```bash
curl -X POST http://localhost:3000/api/v1/check/email-breach \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "email": "use***@example.com",
    "breached": true,
    "breach_count": 2,
    "breaches": [
      {
        "name": "Equifax",
        "date": "2017-09-07",
        "data_classes": ["Email addresses", "Names", "SSNs", "Passwords"]
      }
    ],
    "riskScore": {
      "score": 90,
      "level": "critical",
      "factors": ["Breaches: 1", "Equifax"]
    },
    "recommendations": [
      {
        "priority": "high",
        "message": "Email found in 1 data breach(es)",
        "action": "Change passwords immediately for all accounts using this email"
      }
    ]
  },
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

## Response Format

All API responses follow a standardized format:

```json
{
  "success": true,
  "data": {
    // Endpoint-specific data
  },
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  },
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

## Error Handling

The API returns appropriate HTTP status codes and error details:

- **200 OK**: Successful request
- **400 Bad Request**: Invalid input or validation error
- **404 Not Found**: Endpoint not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error
- **503 Service Unavailable**: External service unavailable

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Excluded**: Health check endpoint
- **Headers**: Includes `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`

## Risk Scoring

Risk scores range from 0-100:
- **0-25**: Low risk (green)
- **26-50**: Medium risk (yellow)
- **51-75**: High risk (orange)
- **76-100**: Critical risk (red)

## Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

### Testing

Tests are written with Jest and located in the `tests/` directory.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the Node.js project
3. Add environment variables in Vercel dashboard
4. Deploy with `npm run build` and `npm start`

### Railway

1. Connect your GitHub repository
2. Add environment variables
3. Deploy using Railway's Node.js template

### Render

1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure build command: `npm install && npm run build`
4. Configure start command: `npm start`
5. Add environment variables

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
npm run build
docker build -t security-intel-api .
docker run -p 3000:3000 -e NODE_ENV=production security-intel-api
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Use TypeScript for all new code
- Follow the existing code style
- Write tests for new features
- Update this README with significant changes
- Use meaningful commit messages

## Security Considerations

- Always use HTTPS in production
- Keep dependencies updated: `npm audit fix`
- Store sensitive data in environment variables
- Implement authentication for production use
- Use rate limiting as configured
- Monitor and log all API access
- Validate all inputs server-side
- Keep security headers updated

## Limitations

- **HaveIBeenPwned API**: Rate limited (1 request per 1500ms with API key)
- **SSL Checking**: Only works for URLs using HTTPS
- **Domain Analysis**: Uses heuristics; may have false positives
- **Caching**: Not yet implemented for domain lookups

## Future Enhancements

- [ ] User authentication and API keys
- [ ] API key-based rate limiting
- [ ] Domain caching with node-cache
- [ ] Advanced ML-based phishing detection
- [ ] Integration with more threat intelligence APIs
- [ ] WebSocket support for real-time scanning
- [ ] Admin dashboard
- [ ] Usage analytics and reporting

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review error messages and logs

## Changelog

### v1.0.0 (Current)
- Initial release
- URL security scanning
- Domain analysis and phishing detection
- Password strength analysis
- Email breach checking
- Rate limiting
- Comprehensive error handling
- Full TypeScript support
- Jest test suite

---

**API Base URL**: `http://localhost:3000/api/v1`

**API Version**: 1.0.0

**Last Updated**: 2024-01-20

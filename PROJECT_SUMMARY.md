# Project Files Overview

## Configuration Files

### Root Configuration
- **package.json** - Dependencies, scripts, project metadata
- **tsconfig.json** - TypeScript compiler configuration
- **jest.config.js** - Jest testing framework configuration
- **.prettierrc** - Code formatting rules
- **.eslintrc.json** - Linting rules and code quality
- **.npmrc** - NPM configuration
- **.nodemonrc.json** - Nodemon configuration for development
- **Dockerfile** - Docker container configuration (multi-stage build)
- **docker-compose.yml** - Docker Compose for containerized deployment
- **.dockerignore** - Files to exclude from Docker image

### Environment & Git
- **.env** - Local environment variables (not committed)
- **.env.example** - Template for environment variables
- **.gitignore** - Git ignore patterns

## Documentation Files

- **README.md** - Complete API documentation and setup guide
- **QUICKSTART.md** - Quick start guide for getting the API running
- **DEPLOYMENT.md** - Comprehensive deployment guide for multiple platforms
- **PROJECT_SUMMARY.md** - This file

## Source Code Structure (src/)

### Entry Points
- **index.ts** - Server entry point, graceful shutdown handling
- **app.ts** - Express app configuration, middleware setup, route mounting

### Configuration (src/config/)
- **index.ts** - Environment variables and app configuration loading
- **constants.ts** - API constants, risk thresholds, rate limits, security settings

### Middleware (src/middleware/)
- **errorHandler.ts** - Global error handling, custom error class, 404 handler
- **rateLimiter.ts** - Rate limiting middleware (100 req/15min per IP)
- **validator.ts** - Request validation middleware using Zod schemas

### Routes (src/routes/)
- **index.ts** - Route aggregation, mounts all endpoints under /api/v1
- **health.ts** - GET /api/v1/health - Health check endpoint
- **urlScanner.ts** - POST /api/v1/scan/url - URL security scanning
- **domainChecker.ts** - POST /api/v1/scan/domain - Domain analysis/phishing detection
- **password.ts** - POST /api/v1/check/password - Password strength analysis
- **breach.ts** - POST /api/v1/check/email-breach - Email breach checking

### Services (src/services/)
- **securityHeaders.ts** - HTTP security headers analysis and validation
- **sslChecker.ts** - SSL/TLS certificate validation and HTTPS checking
- **domainAnalysis.ts** - Phishing detection, typosquatting analysis
- **passwordAnalyzer.ts** - Password strength, entropy, crack-time estimation
- **breachChecker.ts** - HaveIBeenPwned API integration

### Utilities (src/utils/)
- **scoring.ts** - Risk scoring algorithms, risk level determination, password entropy
- **validators.ts** - Input validation with Zod, URL/domain/email/password validators
- **logger.ts** - Winston logger setup with console and file transports

### Types (src/types/)
- **index.ts** - Shared TypeScript interfaces (HealthCheck, SSLInfo, RiskAssessment)
- **requests.ts** - Request body type definitions
- **responses.ts** - Response type definitions (all API responses are typed)

## Test Files (tests/)

- **setup.ts** - Jest configuration and global test setup
- **urlScanner.test.ts** - URL scanner route tests
- **password.test.ts** - Password analyzer tests and analysis function tests

## Key File Relationships

```
Entry Point
    ↓
index.ts (Server startup)
    ↓
app.ts (Express configuration)
    ├→ middleware/ (Error handling, rate limiting, validation)
    ├→ routes/ (All endpoints)
    │   └→ services/ (Business logic)
    │       └→ utils/ (Scoring, validation)
    │           └→ types/ (Type definitions)
    └→ config/ (Configuration)
        └→ constants.ts (Settings)
```

## File Purposes Summary

| File | Purpose | Key Exports |
|------|---------|------------|
| index.ts | Server startup & graceful shutdown | N/A |
| app.ts | Express app setup | `createApp()` |
| config/index.ts | Load environment variables | `config` object |
| config/constants.ts | API constants and thresholds | `CONSTANTS` object |
| middleware/errorHandler.ts | Global error handling | `errorHandler`, `notFoundHandler`, `AppError` |
| middleware/rateLimiter.ts | Rate limiting | `apiLimiter` |
| middleware/validator.ts | Request validation | `validateRequest()` |
| routes/index.ts | Route aggregation | Express router |
| routes/health.ts | Health check | Express router |
| routes/urlScanner.ts | URL scanning | Express router |
| routes/domainChecker.ts | Domain analysis | Express router |
| routes/password.ts | Password analysis | Express router |
| routes/breach.ts | Breach checking | Express router |
| services/securityHeaders.ts | Header analysis | `fetchSecurityHeaders()`, `analyzeSecurityHeaders()` |
| services/sslChecker.ts | SSL validation | `getSSLCertificateInfo()`, `validateSSLCertificate()` |
| services/domainAnalysis.ts | Phishing/domain analysis | `checkTyposquatting()`, `analyzeDomainReputation()` |
| services/passwordAnalyzer.ts | Password analysis | `analyzePassword()`, `getPasswordRecommendations()` |
| services/breachChecker.ts | Breach checking | `checkEmailBreach()`, `checkPasswordBreach()` |
| utils/scoring.ts | Risk scoring | `calculateRiskScore()`, `scorePasswordStrength()` |
| utils/validators.ts | Input validation | Zod schemas, validation functions |
| utils/logger.ts | Logging setup | `logger` instance |
| types/index.ts | Shared types | Interfaces and types |
| types/requests.ts | Request types | Request body interfaces |
| types/responses.ts | Response types | Typed API responses |

## File Statistics

- **Total Files**: 37 (config + src + tests + root)
- **TypeScript Files**: 27
- **Configuration Files**: 10
- **Test Files**: 3
- **Documentation Files**: 3

## Development Workflow

1. **Edit Source Files**: Modify files in `src/`
2. **Nodemon Watches**: Changes trigger automatic rebuild
3. **TypeScript Compiles**: `src/` → `dist/`
4. **Server Restarts**: Automatically with nodemon
5. **Test Changes**: Run tests with `npm test`
6. **Lint & Format**: `npm run lint:fix` and `npm run format`

## Production Build Process

1. **TypeScript Compilation**: `npm run build`
   - Compiles `src/**/*.ts` → `dist/**/*.js`
2. **Dependency Installation**: Production only
3. **Environment Setup**: Set production environment variables
4. **Server Start**: `npm start` runs `dist/index.js`

## API Response Structure

All API responses follow this standardized format:

```typescript
{
  success: boolean;
  data?: {
    // Endpoint-specific data
  };
  error?: {
    code: string;
    message: string;
  };
  timestamp: string; // ISO 8601 format
}
```

## Testing Structure

- **Test Files**: Located in `tests/` directory
- **Pattern**: `*.test.ts` files
- **Framework**: Jest with ts-jest preset
- **Coverage**: Can be generated with `npm test -- --coverage`

---

For detailed documentation, see [README.md](./README.md) and [DEPLOYMENT.md](./DEPLOYMENT.md).

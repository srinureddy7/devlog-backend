# DevLog Backend API

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

A production-ready, scalable backend API for DevLog application built with Node.js, Express, TypeScript, and MongoDB. This project implements industry best practices including SOLID principles, professional code organization, caching, security, and performance optimization.

## 🌟 Features

### 🛡️ **Security**

- 🔐 JWT Authentication with Access & Refresh Tokens
- 👥 Role-Based Access Control (RBAC)
- 🛡️ Helmet.js Security Headers
- 🚫 CORS Protection
- ⚡ Rate Limiting
- ✨ XSS Protection
- 🍪 Secure Cookies (HttpOnly, Secure, SameSite)
- 🔐 Input Validation & Sanitization

### ⚡ **Performance**

- 🚀 NodeCache In-Memory Caching
- 🔄 Database Connection Pooling
- 📦 Response Compression
- 🗃️ Optimized Database Queries
- 📊 Request Logging & Monitoring
- ⚡ Efficient Error Handling

### 📁 **Architecture**

- 🏗️ SOLID Principles Implementation
- 🎯 Service Layer Pattern
- 📦 Dependency Injection Ready
- 🧩 Modular Architecture
- 🔗 Clear Separation of Concerns
- 📝 Full TypeScript Support

### 🛠️ **Developer Experience**

- 🔧 Hot Reload Development
- 📏 ESLint & Prettier Configuration
- 🧪 Comprehensive Logging
- 🩺 Health Check Endpoint
- 📚 API Documentation
- 🐳 Docker Support

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Docker](#-docker)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** v6.0 or higher
- **npm** or **yarn**

### Installation

1. **Clone and setup the project:**

```bash
# Create project directory
mkdir devlog-backend
cd devlog-backend

# Initialize project
npm init -y
```

2. **Install dependencies:**

```bash
# Install production dependencies
npm install express mongoose bcryptjs jsonwebtoken node-cache cors helmet express-rate-limit express-validator dotenv winston compression cookie-parser

# Install development dependencies
npm install -D typescript ts-node @types/node @types/express @types/bcryptjs @types/jsonwebtoken @types/cors @types/compression nodemon @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint prettier jest @types/jest ts-jest
```

3. **Configure environment:**

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Use nano, vim, or any text editor
```

4. **Set up MongoDB:**

```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 --name devlog-mongodb mongo:latest

# Or install locally (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

5. **Start the development server:**

```bash
npm run dev
```

6. **Verify the installation:**

```bash
curl http://localhost:5000/health
```

## 📁 Project Structure

```
devlog-backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts   # MongoDB connection
│   │   └── cache.ts      # NodeCache configuration
│   ├── controllers/      # Request handlers
│   │   └── authController.ts
│   ├── middlewares/      # Custom middleware
│   │   ├── authMiddleware.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── models/          # MongoDB schemas
│   │   └── User.ts
│   ├── routes/          # API routes
│   │   └── authRoutes.ts
│   ├── services/        # Business logic
│   │   └── authService.ts
│   ├── utils/           # Utilities
│   │   ├── logger.ts
│   │   ├── apiResponse.ts
│   │   └── appError.ts
│   ├── interfaces/      # TypeScript interfaces
│   │   └── IUser.ts
│   ├── validations/     # Request validation
│   │   └── authValidation.ts
│   └── app.ts          # Main application
├── logs/               # Application logs
├── dist/              # Compiled JavaScript
├── .env               # Environment variables
├── .env.example       # Environment template
├── .gitignore        # Git ignore rules
├── package.json      # Dependencies
├── tsconfig.json     # TypeScript config
├── nodemon.json      # Development config
├── .eslintrc.json    # ESLint config
└── README.md         # Documentation
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/devlog

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Cache Configuration
CACHE_TTL=600                  # 10 minutes
```

**⚠️ Security Notice:** Always change the `JWT_SECRET` in production and never commit the `.env` file to version control.

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "65f4a2b3c8e9f7a1b2c3d4e5",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isVerified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Login User

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Get Current User

```http
GET /auth/me
Authorization: Bearer {accessToken}
```

#### Refresh Token

```http
POST /auth/refresh-token
```

#### Logout

```http
POST /auth/logout
Authorization: Bearer {accessToken}
```

### Health Check

```http
GET /health
```

**Response:**

```json
{
  "status": "success",
  "message": "DevLog API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "database": "connected"
}
```

## 🚀 Development

### Available Scripts

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Lint code
npm run lint

# Format code
npm run format

# Fix linting issues
npm run lint:fix

# Clean build directory
npm run clean
```

### Code Quality Tools

This project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type checking

Configuration files:

- `.eslintrc.json` - ESLint rules
- `tsconfig.json` - TypeScript configuration
- `.prettierrc` - Prettier configuration (optional)

## 🧪 Testing

### Test Structure

```
src/
├── __tests__/
│   ├── controllers/
│   │   └── authController.test.ts
│   ├── services/
│   │   └── authService.test.ts
│   ├── middlewares/
│   │   └── authMiddleware.test.ts
│   └── utils/
│       └── apiResponse.test.ts
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- authController.test.ts

# Run tests with coverage report
npm test -- --coverage
```

## 🐳 Docker

### Using Docker Compose (Recommended)

1. Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  mongodb:
    image: mongo:latest
    container_name: devlog-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: devlog
    volumes:
      - mongodb_data:/data/db

  backend:
    build: .
    container_name: devlog-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://mongodb:27017/devlog
      JWT_SECRET: your_production_jwt_secret
    depends_on:
      - mongodb
    volumes:
      - ./logs:/app/logs

volumes:
  mongodb_data:
```

2. Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production
RUN npm cache clean --force

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY .env.production ./.env

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S expressjs -u 1001
RUN chown -R expressjs:nodejs /app

USER expressjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if(r.statusCode!==200)throw new Error()})"

EXPOSE 5000

CMD ["node", "dist/app.js"]
```

3. Run with Docker Compose:

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Manual Docker Commands

```bash
# Build image
docker build -t devlog-backend .

# Run container
docker run -d \
  -p 5000:5000 \
  --name devlog-backend \
  --env-file .env \
  devlog-backend

# View logs
docker logs -f devlog-backend

# Exec into container
docker exec -it devlog-backend sh

# Stop container
docker stop devlog-backend

# Remove container
docker rm devlog-backend
```

## 🚀 Deployment

### Production Setup

1. **Prepare the server:**

```bash
# Clone repository
git clone <repository-url>
cd devlog-backend

# Install dependencies
npm ci --only=production

# Build the application
npm run build

# Set environment variables
export NODE_ENV=production
export JWT_SECRET=$(openssl rand -hex 32)
export MONGODB_URI=your_production_mongodb_uri
```

2. **Using PM2 (Recommended):**

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start dist/app.js --name "devlog-backend"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Monitor application
pm2 monit

# View logs
pm2 logs devlog-backend

# Application management
pm2 status              # View status
pm2 restart devlog-backend # Restart
pm2 stop devlog-backend    # Stop
pm2 delete devlog-backend  # Remove
```

3. **Nginx Configuration:**

Create `/etc/nginx/sites-available/devlog`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:5000;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/devlog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL/HTTPS (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal setup
sudo certbot renew --dry-run
```

## 📊 Monitoring & Logging

### Log Files

Logs are stored in the `logs/` directory:

- `error.log` - Error level logs
- `combined.log` - All application logs
- Console output in development format

### Logging Example

```typescript
import logger from "./utils/logger";

// Different log levels
logger.error("Database connection failed");
logger.warn("Rate limit exceeded");
logger.info("User registered successfully");
logger.debug("Cache hit for user:123");

// Structured logging
logger.info("API Request", {
  method: req.method,
  path: req.path,
  duration: 150, // ms
  status: res.statusCode,
});
```

### Performance Monitoring

```bash
# Check memory usage
pm2 monit

# Check CPU usage
top -pid $(pgrep node)

# Database monitoring
mongostat
mongotop

# Network monitoring
netstat -an | grep :5000
```

## 🚨 Troubleshooting

### Common Issues

| Issue                             | Solution                                                                         |
| --------------------------------- | -------------------------------------------------------------------------------- |
| **MongoDB Connection Failed**     | Check if MongoDB is running: `sudo systemctl status mongodb`                     |
| **Port 5000 Already in Use**      | Find process: `lsof -i :5000` and kill: `kill -9 <PID>`                          |
| **JWT Token Invalid**             | Verify `JWT_SECRET` is set correctly in `.env`                                   |
| **TypeScript Compilation Errors** | Clear cache: `npm run clean` and reinstall: `rm -rf node_modules && npm install` |
| **CORS Errors**                   | Check `CORS_ORIGIN` in `.env` matches frontend URL                               |
| **Rate Limiting Issues**          | Adjust `RATE_LIMIT_MAX_REQUESTS` in `.env`                                       |

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Specific debug namespaces
DEBUG=express:*,mongoose:* npm run dev
DEBUG=devlog:* npm run dev

# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

### Database Issues

```bash
# Check MongoDB connection
mongo --eval "db.runCommand({ping:1})"

# View MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Reset database (development only)
mongo devlog --eval "db.dropDatabase()"
```

## 🔄 Extending the Project

### Adding New Modules

1. **Create Model:**

```typescript
// src/models/Post.ts
import { Schema, model } from "mongoose";

const PostSchema = new Schema({
  title: String,
  content: String,
  author: { type: Schema.Types.ObjectId, ref: "User" },
});

export default model("Post", PostSchema);
```

2. **Create Service:**

```typescript
// src/services/postService.ts
class PostService {
  async createPost(data: any) {
    // Business logic
  }
}

export default new PostService();
```

3. **Create Controller:**

```typescript
// src/controllers/postController.ts
class PostController {
  async create(req: Request, res: Response) {
    // Handle request
  }
}

export default new PostController();
```

4. **Create Routes:**

```typescript
// src/routes/postRoutes.ts
import { Router } from "express";
import PostController from "../controllers/postController";

const router = Router();
router.post("/", PostController.create);
export default router;
```

5. **Register Routes in app.ts:**

```typescript
import postRoutes from "./routes/postRoutes";
this.app.use("/api/v1/posts", postRoutes);
```

## 📝 API Best Practices

### Request/Response Format

**Request:**

```json
{
  "field": "value",
  "nested": {
    "field": "value"
  }
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    /* response data */
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Pagination

```typescript
// Example paginated response
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/srinureddy7/devlog-backend.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Commit** changes: `git commit -m 'Add amazing feature'`
5. **Push** to branch: `git push origin feature/amazing-feature`
6. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Follow existing code style

### Code Review Process

1. Ensure all tests pass
2. Update documentation if needed
3. Request review from maintainers
4. Address review comments
5. Merge after approval

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Fast, unopinionated web framework
- [Mongoose](https://mongoosejs.com/) - MongoDB object modeling
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [JWT](https://jwt.io/) - JSON Web Tokens
- All open-source contributors

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/srinureddy7/devlog-backend/wiki)
- **Issues**: [GitHub Issues](https://github.com/srinureddy7/devlog-backend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/srinureddy7/devlog-backend/discussions)
- **Email**: gumudikhirasindhu1@gmail.com

## 🚀 Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Testing
npm test                # Run all tests
npm test -- --watch     # Watch mode
npm test -- --coverage  # With coverage

# Code Quality
npm run lint            # Check code style
npm run lint:fix        # Fix issues
npm run format          # Format code

# Database
docker-compose up -d    # Start MongoDB
mongo                   # MongoDB shell

# Docker
docker-compose up -d    # Full stack
docker-compose logs -f  # View logs
docker-compose down     # Stop services
```

---

**Made with ❤️ by Srinu Reddy**

[![GitHub Stars](https://img.shields.io/github/stars/srinureddy7/devlog-backend?style=social)](https://github.com/srinureddy7/devlog-backend)
[![GitHub Forks](https://img.shields.io/github/forks/srinureddy7/devlog-backend?style=social)](https://github.com/srinureddy7/devlog-backend)
[![GitHub Issues](https://img.shields.io/github/issues/srinureddy7/devlog-backend)](https://github.com/srinureddy7/devlog-backend/issues)

---

_Last Updated: December 2025_

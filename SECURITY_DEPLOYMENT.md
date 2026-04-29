# VMS Super Mart - Security & Deployment Guide

## Security Best Practices Implemented

### 1. Authentication & Authorization
- ✅ JWT tokens with 24-hour expiration
- ✅ Separate auth flows for Admin (email/password) and Users (registration/login)
- ✅ Password hashing with bcryptjs (salt rounds: 10)
- ✅ Protected routes with JWT guards
- ✅ Role-based access control

### 2. HTTP Security Headers
Implemented via `SecurityHeadersMiddleware`:

```
X-Frame-Options: DENY                    # Prevent clickjacking
X-Content-Type-Options: nosniff          # Prevent MIME type sniffing
X-XSS-Protection: 1; mode=block          # Enable XSS protection
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: [configured]    # Restrict resource loading
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000  # Force HTTPS (1 year)
```

### 3. Rate Limiting
- ✅ Throttler guard configured for API endpoints
- ✅ Custom guard to track IP addresses correctly
- ✅ Prevents brute force and DDoS attacks

**Configuration:**
```typescript
@Throttle(5, 60)  // 5 requests per 60 seconds per IP
```

### 4. Input Validation
- ✅ Class validators for DTOs (CreateUserDto, LoginUserDto, etc.)
- ✅ Email format validation
- ✅ Password strength requirements (minimum 6 characters)
- ✅ TypeORM query builders prevent SQL injection

### 5. CORS Configuration
```typescript
app.enableCors({
  origin: ['http://localhost:5173', 'http://localhost:3001'],
  credentials: true,
});
```

### 6. Database Security
- ✅ TypeORM with parameterized queries (prevents SQL injection)
- ✅ Password hashing before storage
- ✅ No sensitive data in logs
- ✅ Database connection with credentials in .env

### 7. File Upload Security
- ✅ File size limits (configured in multer)
- ✅ File type validation (PNG, JPG, JPEG, GIF, WEBP only)
- ✅ Unique filename generation with timestamp + random ID
- ✅ Files served from restricted directory (/public/uploads)
- ✅ JWT authentication required for upload endpoint

### 8. Email Security
- ✅ SMTP with TLS/SSL encryption
- ✅ App-specific passwords (for Gmail)
- ✅ Email sending doesn't block order creation (graceful failure)
- ✅ No credentials in code (environment variables)

### 9. Environment Variables
Secure configuration via `.env`:

```
# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=vms_db

# JWT
JWT_SECRET=your-secret-key-change-this-in-production

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@vmssupermart.com

# Frontend
VITE_API_URL=http://localhost:3001
VITE_CURRENCY=$
```

### 10. API Security
- ✅ API prefix (`/api/`) for namespace isolation
- ✅ Versioning ready (can add `/api/v1/` for future versions)
- ✅ Error responses don't leak system information
- ✅ Request/response logging for audit trails

## Deployment Checklist

### Pre-Deployment
- [ ] Update `JWT_SECRET` with a strong random string (min 32 characters)
- [ ] Change database credentials
- [ ] Update `EMAIL_USER` and `EMAIL_PASSWORD` with production email account
- [ ] Set `NODE_ENV=production`
- [ ] Configure database backups
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up monitoring and logging
- [ ] Configure firewall rules
- [ ] Run security audit: `npm audit`

### Backend Deployment

#### Option 1: Docker (Recommended)

1. **Create Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/dist ./dist
COPY backend/public ./public

EXPOSE 3001
CMD ["node", "dist/main.js"]
```

2. **Build and run:**
```bash
docker build -t vms-backend:latest .
docker run -p 3001:3001 --env-file .env vms-backend:latest
```

#### Option 2: Manual Deployment

1. **Install dependencies:**
```bash
cd backend
npm install --production
```

2. **Build TypeScript:**
```bash
npm run build
```

3. **Run production server:**
```bash
NODE_ENV=production node dist/main.js
```

### Frontend Deployment

#### Option 1: Static Hosting (Vercel, Netlify, GitHub Pages)

1. **Build optimized bundle:**
```bash
npm run build
```

2. **Deploy `dist/` folder** to your hosting provider

3. **Set environment variables** in hosting dashboard:
   - `VITE_API_URL=https://your-backend-domain.com`
   - `VITE_CURRENCY=$`

#### Option 2: Docker Container

```dockerfile
FROM node:20-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Cloud Deployment Options

#### AWS
1. **Backend:** Deploy to EC2 or ECS (Docker containers)
2. **Frontend:** Deploy to S3 + CloudFront CDN
3. **Database:** Use RDS for managed MySQL
4. **Email:** Use AWS SES for transactional emails

#### Azure
1. **Backend:** Deploy to App Service
2. **Frontend:** Deploy to Static Web Apps
3. **Database:** Use Azure Database for MySQL
4. **Email:** Use SendGrid or custom SMTP

#### GCP
1. **Backend:** Deploy to Cloud Run
2. **Frontend:** Deploy to Cloud Storage + Cloud CDN
3. **Database:** Use Cloud SQL for MySQL
4. **Email:** Use SendGrid or Mailgun

### Environment-Specific Configuration

#### Development
```
NODE_ENV=development
DB_HOST=127.0.0.1
VITE_API_URL=http://localhost:3001
```

#### Staging
```
NODE_ENV=production
DB_HOST=staging-db.yourcompany.com
VITE_API_URL=https://api-staging.yourcompany.com
```

#### Production
```
NODE_ENV=production
DB_HOST=prod-db.yourcompany.com
VITE_API_URL=https://api.vmssupermart.com
```

## Monitoring & Maintenance

### Health Checks
```bash
# Backend health
curl http://localhost:3001/api/health

# Frontend connectivity
curl http://localhost:5173/
```

### Logging
Enable structured logging:
```typescript
import * as winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### Database Backups
```bash
# MySQL backup
mysqldump -u root vms_db > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -u root vms_db < backup_20260429.sql
```

### Performance Optimization
- ✅ Enable gzip compression
- ✅ Use CDN for static assets
- ✅ Implement caching headers
- ✅ Database query optimization with indexes
- ✅ Image optimization (WebP format)

### Security Updates
- [ ] Keep dependencies updated: `npm audit fix`
- [ ] Regular security scanning
- [ ] SSL certificate renewal (before expiration)
- [ ] Database password rotation
- [ ] JWT secret rotation

## Incident Response

### If Compromised
1. Immediately rotate `JWT_SECRET`
2. Force logout all active sessions
3. Audit database for suspicious activity
4. Rotate database credentials
5. Review access logs
6. Deploy patched version

### Rollback Procedure
```bash
# Keep previous version tagged
git tag v1.0.0-production
git checkout v0.9.0-production

npm run build
npm run start:prod
```

## Performance Metrics

Monitor these KPIs:
- API response time (target: <200ms)
- Error rate (target: <0.1%)
- Uptime (target: 99.9%)
- Database query time (target: <50ms)
- Concurrent users

## Support & Documentation

- API Documentation: `/api/docs` (Swagger when enabled)
- Bug Reports: GitHub Issues
- Security Issues: security@vmssupermart.com
- Support: support@vmssupermart.com

---

**Last Updated:** April 2026
**Version:** 1.0.0

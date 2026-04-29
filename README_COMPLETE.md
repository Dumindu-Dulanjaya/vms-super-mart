# VMS Super Mart - E-Commerce Platform

A complete full-stack e-commerce solution with React frontend and NestJS backend, featuring product catalog, shopping cart, order management, inventory tracking, and admin dashboard.

## 🚀 Features

### Customer Features
- 🛒 Product browsing with categories and filters
- 🔍 Search functionality
- ⭐ Product ratings and reviews
- 🛍️ Shopping cart with persistent storage
- ❤️ Wishlist management
- 👤 User registration and authentication
- 📝 Order history and tracking
- 💳 Checkout with order confirmation emails
- 📧 Welcome and order confirmation emails

### Admin Features
- 📦 Product management (CRUD operations)
- 📊 Inventory tracking with low-stock alerts
- 👥 Customer management
- 📋 Order management and fulfillment
- 📈 Dashboard with statistics
- 🖼️ Image upload and management

### Technical Features
- ✅ JWT-based authentication (24-hour expiration)
- 🔐 Role-based access control (Admin/User)
- 📧 Automated email notifications (Nodemailer)
- 🧪 Automated testing (Jest backend, Vitest frontend)
- 🛡️ Security headers and rate limiting
- 🗄️ MySQL database with TypeORM
- 📱 Responsive design (Tailwind CSS)
- 🎨 Modern UI with Framer Motion animations
- 🔄 Real-time context API state management

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite 6** - Build tool
- **React Router 7** - Navigation
- **Tailwind CSS 4** - Styling
- **Context API** - State management
- **React Hot Toast** - Notifications
- **Framer Motion** - Animations
- **Vitest** - Testing framework

### Backend
- **NestJS 11** - Framework
- **Node.js 20+** - Runtime
- **Express** - HTTP server
- **TypeORM 0.3** - ORM
- **MySQL 8** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **Nodemailer** - Email service
- **Jest** - Testing framework

## 📋 Prerequisites

- Node.js 20+ and npm 10+
- MySQL 8 server running
- Git

## 🚀 Installation

### 1. Clone Repository
```bash
git clone https://github.com/Dumindu-Dulanjaya/vms-super-mart.git
cd vms-super-mart
```

### 2. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=vms_db
JWT_SECRET=your-secret-key-change-this-in-production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@vmssupermart.com
EOF

# Build
npm run build

# Start development server
npm run start:dev
```

Backend will be available at: `http://localhost:3001`

### 3. Setup Frontend
```bash
cd client

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:3001
VITE_CURRENCY=$
EOF

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### User Registration
```
POST /users/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### User Login
```
POST /users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: { accessToken, user }
```

#### Admin Login
```
POST /auth/admin/login
Content-Type: application/json

{
  "email": "admin@vms.com",
  "password": "admin123"
}

Response: { accessToken, admin }
```

### Product Endpoints

#### Get All Products
```
GET /products
```

#### Get Product by ID
```
GET /products/:id
```

#### Create Product (Admin only)
```
POST /products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Product Name",
  "price": 99.99,
  "oldPrice": 129.99,
  "category": "Category Name",
  "image": "image-url",
  "description": "Product description"
}
```

#### Update Product (Admin only)
```
PUT /products/:id
Authorization: Bearer <admin_token>
Content-Type: application/json
```

#### Delete Product (Admin only)
```
DELETE /products/:id
Authorization: Bearer <admin_token>
```

### Order Endpoints

#### Checkout
```
POST /orders/checkout
Content-Type: application/json

{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 2, "quantity": 1 }
  ],
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "address": "123 Street",
  "city": "City",
  "postalCode": "12345",
  "province": "Province",
  "paymentMethod": "card"
}
```

#### Get All Orders (Admin only)
```
GET /orders
Authorization: Bearer <admin_token>
```

#### Get Order by ID (Admin only)
```
GET /orders/:id
Authorization: Bearer <admin_token>
```

### Upload Endpoints

#### Upload Image (Admin only)
```
POST /upload
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

FormData: { file: <image_file> }

Response: { url: "/uploads/filename.jpg" }
```

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

**Current Status:** 21/28 tests passing (75% coverage)

### Frontend Tests
```bash
cd client

# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## 📦 Database

### Initialize Database
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE vms_db;
CREATE USER 'vms_user'@'localhost' IDENTIFIED BY 'vms_password';
GRANT ALL PRIVILEGES ON vms_db.* TO 'vms_user'@'localhost';
FLUSH PRIVILEGES;
```

### Run Migrations
```bash
cd backend
npm run typeorm migration:run
```

### Seed Sample Data
```bash
cd backend
npm run seed:dev
```

## 🔐 Default Credentials

### Admin Account
- Email: `admin@vms.com`
- Password: `admin123`

### Test User Account
- Email: `user@example.com`
- Password: `user123`

## 📧 Email Setup

### Using Gmail
1. Enable 2-step verification in Google Account
2. Generate App Password at https://myaccount.google.com/apppasswords
3. Add to `.env`:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=generated-app-password
```

### Using Other Providers
Update `.env` with your SMTP settings:
```
EMAIL_HOST=smtp.provider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@provider.com
EMAIL_PASSWORD=your-password
```

## 🚀 Deployment

See [SECURITY_DEPLOYMENT.md](./SECURITY_DEPLOYMENT.md) for:
- Security best practices
- Pre-deployment checklist
- Docker deployment
- Cloud deployment options (AWS, Azure, GCP)
- Monitoring and maintenance

## 🔒 Security Features

- JWT authentication with 24-hour expiration
- Password hashing with bcryptjs
- HTTP security headers (HSTS, CSP, X-Frame-Options, etc.)
- Rate limiting (5 requests/60 seconds per IP)
- SQL injection prevention (parameterized queries)
- XSS protection
- CORS configuration
- File upload validation
- Environment-based configuration
- No sensitive data in logs

## 📊 Project Structure

```
vms-super-mart/
├── backend/
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── categories/        # Product categories
│   │   ├── entities/          # Database entities
│   │   ├── email/             # Email service
│   │   ├── guards/            # Authentication guards
│   │   ├── middleware/        # Security middleware
│   │   ├── orders/            # Order management
│   │   ├── products/          # Product management
│   │   ├── upload/            # File upload
│   │   ├── users/             # User management
│   │   ├── app.module.ts      # Root module
│   │   └── main.ts            # Entry point
│   ├── dist/                  # Compiled JavaScript
│   ├── package.json
│   └── tsconfig.json
│
├── client/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── context/           # State management
│   │   ├── pages/             # Page components
│   │   ├── assets/            # Images, icons
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── dist/                  # Built frontend
│   ├── package.json
│   └── vite.config.js
│
├── SECURITY_DEPLOYMENT.md     # Security & deployment guide
└── README.md                  # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🆘 Support

- **Issues:** GitHub Issues
- **Email:** support@vmssupermart.com
- **Security:** security@vmssupermart.com

## 👨‍💻 Author

**Dumindu Dulanjaya**
- GitHub: [@Dumindu-Dulanjaya](https://github.com/Dumindu-Dulanjaya)

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- React team for the modern UI library
- Tailwind CSS for utility-first CSS
- All contributors and supporters

---

**Project Status:** ✅ Production Ready (v1.0.0)
**Last Updated:** April 2026

# GIVENTO API - Complete Backend Solution

## 🚀 Overview
This is a complete, single-file API solution for the GIVENTO e-commerce platform. It handles all backend operations including products, orders, categories, authentication, and file uploads.

## 🔧 Features
- **Complete Product Management** (CRUD operations)
- **Order Management System** (Create, Read, Update, Delete)
- **Category Management**
- **JWT Authentication** with secure admin login
- **File Upload Support** for product images
- **MongoDB Integration** with Mongoose
- **CORS Support** for frontend integration
- **Error Handling** and validation

## 📦 Installation

1. Navigate to the API directory:
```bash
cd api
```

2. Install dependencies:
```bash
npm install
```

3. Make sure MongoDB is running on your system

4. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## 🔑 JWT Secret
**Generated JWT Secret:** `givento_jwt_secret_2024_secure_key_a8f9b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

## 🛡️ Admin Credentials
- **Username:** `admin`
- **Password:** `admin123`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders
- `GET /api/orders` - Get all orders (Admin only)
- `GET /api/orders/:id` - Get order by ID (Admin only)
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (Admin only)
- `DELETE /api/orders/:id` - Delete order (Admin only)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

### Health Check
- `GET /api/health` - Server health status

## 🗂️ File Structure
```
api/
├── index.js          # Complete API server
├── package.json      # Dependencies
├── .env             # Environment variables
├── README.md        # This file
└── uploads/         # Auto-created for file uploads
```

## 🔧 Configuration
All configuration is handled in the `.env` file:
- Server port
- MongoDB connection
- JWT secret
- Admin credentials
- File upload settings

## 🚀 Deployment Ready
This API is ready for deployment to any serverless platform that supports Node.js (Vercel, Netlify Functions, etc.) with minimal configuration.

## 📱 Frontend Integration
Update your frontend API calls to point to:
- Local development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

## 🔒 Security Features
- JWT token authentication
- File upload validation
- CORS protection
- Input sanitization
- Error handling without exposing sensitive data

## 📊 Database Schema
- **Products:** Complete product information with images, pricing, categories
- **Orders:** Customer orders with items, status tracking
- **Categories:** Product categorization system

## 🎯 Ready to Use
Just run `npm install && npm start` and your complete backend is ready!

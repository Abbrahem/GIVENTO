# GIVENTO API - Vercel Deployment Guide

## Problem Fixed ✅

The original error `EROFS: read-only file system, mkdir 'uploads'` has been resolved by:

1. **Removed file system operations** - No more `mkdir` or file saving to disk
2. **Implemented base64 image storage** - Images are now compressed and stored as base64 strings in MongoDB
3. **Added image compression** - Images are automatically resized to 800x800px and compressed to JPEG format
4. **Made compression optional** - Falls back gracefully if Sharp library is not available

## Changes Made

### 1. Updated API Code (`api/index.js`)
- Removed `fs.mkdirSync('uploads')` and static file serving
- Changed from `multer.diskStorage()` to `multer.memoryStorage()`
- Added `compressAndConvertToBase64()` function for image processing
- Updated product creation and update endpoints to use base64 images
- Made Sharp library optional with fallback

### 2. Updated Dependencies (`api/package.json`)
- Removed Sharp dependency (optional, will be added in production if needed)
- All other dependencies remain the same

### 3. Environment Configuration
- Added support for `MONGODB_URI` environment variable
- Added support for `JWT_SECRET` environment variable

## Deployment Steps

### Step 1: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free account and cluster

2. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/givento`)

3. **Configure Database Access:**
   - Add your IP address to whitelist (or use 0.0.0.0/0 for all IPs)
   - Create database user with read/write permissions

### Step 2: Vercel Deployment

1. **Set Environment Variables in Vercel Dashboard:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/givento
   JWT_SECRET=your_secure_jwt_secret_here
   NODE_ENV=production
   ```

2. **Deploy to Vercel:**
   ```bash
   # From the root directory (not api directory)
   vercel --prod
   ```

3. **Verify Deployment:**
   - Check: `https://your-app.vercel.app/api/health`
   - Should return: `{"status": "OK", "message": "GIVENTO API is running"}`

### For Local Testing:

1. **Install Dependencies:**
   ```bash
   cd api
   npm install
   ```

2. **Set Environment Variables in `.env`:**
   ```
   MONGODB_URI=mongodb://localhost:27017/givento
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

3. **Start the Server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## How Image Storage Works Now

1. **Upload Process:**
   - Images are received as multipart/form-data
   - Stored in memory using `multer.memoryStorage()`
   - Compressed to 800x800px JPEG (if Sharp is available)
   - Converted to base64 string with data URI format
   - Stored directly in MongoDB

2. **Image Format:**
   ```
   data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...
   ```

3. **Frontend Usage:**
   - Images can be used directly in `<img src="base64_string" />`
   - No need for separate file serving

## Benefits

- ✅ **Vercel Compatible** - No file system operations
- ✅ **Compressed Images** - Smaller storage and faster loading
- ✅ **Simplified Architecture** - No separate file storage needed
- ✅ **Database Consistency** - Images stored with product data
- ✅ **CDN Ready** - Base64 images work with any CDN

## API Endpoints

All existing endpoints remain the same:

- `POST /api/products` - Create product with images
- `PUT /api/products/:id` - Update product with images
- `GET /api/products` - Get all products (includes base64 images)
- `GET /api/products/:id` - Get single product

## Testing

Test the API health endpoint:
```
GET https://your-vercel-url.vercel.app/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "GIVENTO API is running",
  "timestamp": "2025-09-15T09:55:18.000Z",
  "jwt_secret_configured": true
}
```

## Notes

- Images are automatically compressed to optimize storage
- Maximum file size: 5MB per image
- Supported formats: JPEG, JPG, PNG, GIF, WEBP
- Sharp library is optional - if not available, images are stored without compression

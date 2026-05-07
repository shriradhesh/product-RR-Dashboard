# Quick Start Guide

## Overview

This guide will help you get the Product Analytics Dashboard up and running quickly.

## Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v14 or higher) - Download from https://nodejs.org/
- **PostgreSQL** (v12 or higher) - Download from https://www.postgresql.org/
- **Git** (optional) - For cloning the repository

Verify installations:
```bash
node --version
npm --version
psql --version
```

## Step 1: Database Setup

### Create PostgreSQL Database

1. Open PostgreSQL command line (pgAdmin or psql)

2. Create database:
```bash
createdb product_analytics
```

3. Verify database created:
```bash
psql -l
```

## Step 2: Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

This installs:
- Express (web framework)
- PostgreSQL driver
- Sequelize (ORM)
- XLSX (Excel processing)
- Multer (file upload)
- And other dependencies

### 3. Setup Environment Variables

```bash
# Copy example file
cp .env.example .env
```

Edit `.env` file with your PostgreSQL credentials:
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=product_analytics
DB_USER=postgres
DB_PASSWORD=your_postgres_password
```

### 4. Start Backend Server

```bash
npm run dev
```

You should see:
```
Server started successfully { port: 5000, environment: 'development' }
PostgreSQL database connected successfully
Database models synchronized
```

### Verify Backend
Open browser and go to: http://localhost:5000/health

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-05-06T10:30:00.000Z",
  "message": "Product Analytics API is running"
}
```

## Step 3: Frontend Setup

### 1. Open New Terminal/Command Prompt

Navigate to frontend directory:
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables

```bash
cp .env.example .env
```

The default `.env` should work:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start Frontend Development Server

```bash
npm start
```

The application will automatically open in your default browser at: http://localhost:3000

## Step 4: Import Sample Data

### Upload Excel File

1. Go to the "Import Data" tab in the dashboard
2. Click "Drag & drop your file here" or select file
3. Upload your Excel file with product data
4. Wait for import to complete

Expected columns in Excel:
- product_id
- product_name
- category
- discounted_price
- actual_price
- discount_percentage
- rating
- rating_count
- about_product
- user_name
- review_title
- review_content

### Verify Data Import

After successful import:
- Dashboard tab shows analytics data
- Data Table tab shows uploaded products
- Charts display category-wise data
- Search and filters work

## Step 5: Explore Dashboard Features

### Dashboard Tab
- View overall statistics
- See products per category (chart)
- View top reviewed products
- Check discount distribution
- See category-wise average ratings

### Data Table Tab
- Browse all products with pagination
- Search by product name, category, or reviewer
- Filter by category
- Filter by minimum rating
- Sort by different fields

### Import Data Tab
- Upload new Excel/CSV files
- View import status and errors
- See statistics of imported data

## Troubleshooting

### Backend Won't Start

**Error: "Unable to connect to database"**
1. Check PostgreSQL is running
2. Verify database name in `.env`
3. Verify DB_USER and DB_PASSWORD in `.env`
4. Create database if not exists: `createdb product_analytics`

**Error: "Port 5000 already in use"**
1. Change PORT in `.env` to unused port (e.g., 5001)
2. Or kill process using port:
   - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
   - macOS/Linux: `lsof -ti:5000 | xargs kill -9`

**Error: "Cannot find module"**
1. Delete node_modules: `rm -rf node_modules`
2. Clear npm cache: `npm cache clean --force`
3. Reinstall: `npm install`

### Frontend Won't Start

**Error: "API connection failed"**
1. Ensure backend server is running on port 5000
2. Check REACT_APP_API_URL in `.env`
3. Check browser console for error messages

**Error: "Port 3000 already in use"**
1. Kill process using port:
   - Windows: `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`
   - macOS/Linux: `lsof -ti:3000 | xargs kill -9`

### Dashboard Shows "Error loading analytics"

1. Check backend logs in `backend/logs/YYYY-MM-DD.log`
2. Ensure database has data (import Excel file first)
3. Check browser console for detailed error
4. Restart backend server

### File Upload Fails

1. Check file format is .xlsx, .xls, or .csv
2. Ensure file size is under 10MB
3. Verify file has required columns
4. Check backend logs for specific error

## Development Tools

### Backend Development
- Logs: Check `backend/logs/` folder for detailed logs
- API Testing: Use Postman or similar tool
- Database: Use pgAdmin for database management

### Frontend Development
- React DevTools: Browser extension for React debugging
- Redux DevTools: Browser extension for Redux state inspection
- Browser DevTools: F12 for network and console inspection

## Next Steps

1. **Import sample data**: Upload your Excel/CSV file
2. **Explore analytics**: Navigate through dashboard tabs
3. **Customize**: Modify colors, add more charts, etc.
4. **Deploy**: Follow deployment guide for production setup

## Common Tasks

### Change Database
Edit `.env` file:
```
DB_NAME=your_new_database_name
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=your_host
DB_PORT=your_port
```

### Change API URL
Edit `frontend/.env`:
```
REACT_APP_API_URL=http://your-server:5000/api
```

### Add More Analytics
1. Backend: Add new endpoint in `productController.js`
2. Frontend: Create new Redux async thunk in slice
3. Frontend: Add new component for visualization

## Support

For issues:
1. Check logs: `backend/logs/YYYY-MM-DD.log`
2. Check browser console: F12 → Console tab
3. Check network requests: F12 → Network tab
4. Review error messages carefully

## Security Notes

- Change default PostgreSQL password
- Use environment variables for sensitive data
- Enable HTTPS for production
- Validate all user inputs
- Keep dependencies updated: `npm update`

---

**You're all set! Enjoy using the Product Analytics Dashboard!**

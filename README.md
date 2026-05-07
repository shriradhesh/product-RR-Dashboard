# Product Analytics Dashboard

A professional Product Ratings and Review Analytics Dashboard that provides insights into product performance, customer feedback trends, category-wise rating distribution, and review engagement.

## Features

### Backend
- RESTful API built with Node.js and Express
- PostgreSQL database with Sequelize ORM
- Excel/CSV file import functionality
- Comprehensive analytics endpoints
- Input validation and error handling
- Structured logging system
- CORS support
- Security headers (Helmet)
- Request compression

### Frontend
- React-based responsive UI
- Material-UI (MUI) components
- Redux Toolkit for state management
- Interactive charts and graphs (Recharts)
- Product data table with pagination and filtering
- Excel/CSV file upload with drag-and-drop
- Search and filter capabilities
- Real-time analytics dashboard

### Analytics Features
- **Bar Chart**: Products per Category
- **Bar Chart**: Top Reviewed Products
- **Histogram**: Discount Distribution
- **Bar Chart**: Category-wise Average Rating
- **Filters**: Category, Minimum Rating
- **Search**: Product Name, Category, User Name
- **Metrics**: Total Products, Average Rating, Total Reviews, Average Discount

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)
- Excel/CSV file with product data

## Project Structure

```
product-analytics-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and constants configuration
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Custom middleware (validation, error handling)
│   │   ├── models/          # Sequelize models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business services (Excel import, etc.)
│   │   ├── utils/           # Utilities (logger, validator)
│   │   └── app.js           # Express app setup
│   ├── logs/                # Application logs
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
└── frontend/
    ├── public/              # Static files
    ├── src/
    │   ├── components/      # React components
    │   │   ├── Dashboard/
    │   │   ├── DataTable/
    │   │   └── FileUpload/
    │   ├── services/        # API service
    │   ├── store/           # Redux store and slices
    │   ├── App.js
    │   └── index.js
    ├── package.json
    ├── .env.example
    └── README.md
```

## Backend Setup

### 1. Database Setup

Ensure PostgreSQL is running and create a database:

```bash
createdb product_analytics
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=product_analytics
DB_USER=postgres
DB_PASSWORD=your_password
```

### 4. Start Backend Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default configuration:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Frontend Development Server

```bash
npm start
```

Application will open at `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /health` - Check API status

### Analytics
- `GET /api/analytics` - Get all analytics data (products per category, top reviewed, discount distribution, category ratings, overall stats)
- `GET /api/categories` - Get available product categories

### Products
- `GET /api/products` - Get products with pagination, filtering, and search
  - Query Parameters:
    - `page` (default: 1) - Page number
    - `limit` (default: 20) - Items per page
    - `search` - Search by product name, category, user name, or review title
    - `category` - Filter by category
    - `minRating` - Filter by minimum rating
    - `sortBy` (default: rating) - Sort field
    - `sortOrder` (default: DESC) - Sort order (ASC/DESC)

- `GET /api/products/:id` - Get single product details

### File Import
- `POST /api/import` - Import products from Excel/CSV file
  - Form Data: `file` (multipart/form-data)
  - Supported formats: .xlsx, .xls, .csv
  - Maximum file size: 10MB

## Data Format

### Required Excel Columns
- `product_id` - Unique product identifier
- `product_name` - Product name
- `category` - Product category (pipe-separated for nested categories)
- `discounted_price` - Discounted price
- `actual_price` - Actual price
- `discount_percentage` - Discount percentage
- `rating` - Product rating (0-5)
- `rating_count` - Number of ratings
- `about_product` - Product description
- `user_name` - Reviewer's name
- `review_title` - Review title
- `review_content` - Review content

## Error Handling

### Backend Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

### Frontend Error Handling
- All errors are caught by Redux and displayed to the user
- Network errors display connection issues
- Timeout errors after 30 seconds
- Validation errors for form inputs

## Logging

### Backend Logs
- Logs are stored in `backend/logs/YYYY-MM-DD.log`
- Log format: JSON for easy parsing
- Includes: timestamp, level (INFO/ERROR/WARN/DEBUG), module, message
- Development mode includes debug logs

### Log Levels
- `INFO` - General information
- `WARN` - Warning messages
- `ERROR` - Error messages with stack trace
- `DEBUG` - Debug information (development only)

## Validation

### Input Validation
- Pagination: 1-100 items per page
- Search: Max 255 characters
- Rating: 0-5
- Sort fields: rating, rating_count, discount_percentage, actual_price, createdAt
- Sort order: ASC or DESC

### File Validation
- Allowed formats: .xlsx, .xls, .csv
- Maximum size: 10MB
- Required fields: product_id, product_name

## Performance Optimization

- Database connection pooling
- Request compression
- Pagination for large datasets
- Query optimization with indexes
- Frontend code splitting (React)
- CSS optimization (MUI)

## Security Features

- CORS protection
- Security headers (Helmet)
- Input sanitization
- SQL injection prevention (Sequelize ORM)
- File upload validation
- Request timeout (30s)

## Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm start
```

### Running Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## Database Migrations

The application uses `sequelize.sync({ alter: true })` for development. For production, use proper migrations:

```bash
cd backend
npx sequelize-cli migration:generate --name migration-name
npx sequelize-cli db:migrate
```

## Troubleshooting

### "Unable to connect to database" error
1. Ensure PostgreSQL is running
2. Check database credentials in `.env`
3. Verify database exists: `psql -l`

### "Cannot find module" error
1. Reinstall dependencies: `npm install`
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Clear npm cache: `npm cache clean --force`

### "Port already in use" error
- Change PORT in `.env` or:
- Kill process using port: `lsof -ti:5000 | xargs kill -9` (macOS/Linux)

### "No response from server" error
1. Ensure backend server is running
2. Check `REACT_APP_API_URL` in frontend `.env`
3. Check CORS configuration
4. Check firewall/network settings

## Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -m 'Add feature'`
3. Push to branch: `git push origin feature/feature-name`
4. Create Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues or questions, please create an issue in the repository or contact the development team.

---

**Built with:** Node.js • Express • PostgreSQL • React • Material-UI • Redux Toolkit • Recharts

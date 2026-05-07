const express = require('express');
const ProductController = require('../controllers/productController');
const { validateProductQuery, validateRatingFilter } = require('../middleware/validation');

const router = express.Router();

// Import data from Excel/CSV
router.post('/import', ProductController.importData);

// Get analytics data
router.get('/analytics', ProductController.getAnalytics);

// Get available categories
router.get('/categories', ProductController.getCategories);

// Get all products with filters
router.get('/products', validateProductQuery, validateRatingFilter, ProductController.getProducts);

// Get single product
router.get('/products/:id', ProductController.getProductById);

// Delete all products (for testing)
router.delete('/products', ProductController.deleteAllProducts);

module.exports = router;
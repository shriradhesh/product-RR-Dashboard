const Product = require('../models/Product');
const ExcelService = require('../services/excelService');
const multer = require('multer');
const { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../config/constants');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const Validator = require('../utils/validator');

let logger;
try {
  const Logger = require('../utils/logger');
  logger = new Logger('ProductController');
} catch (err) {
  // Fallback if logger fails to load
  logger = {
    info: console.log,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };
}

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(ERROR_MESSAGES.INVALID_FILE_FORMAT));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).single('file');

class ProductController {
  // Upload and import Excel/CSV file
  static async importData(req, res) {
    upload(req, res, async (err) => {
      if (err) {
        logger.warn('File upload error', { error: err.message });
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: err.message,
        });
      }
      
      if (!req.file) {
        logger.warn('No file provided for import');
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.INVALID_FILE_FORMAT,
        });
      }
      
      try {
        logger.info('Starting data import', { fileName: req.file.originalname, fileSize: req.file.size });
        
        const { processedData, errors: parseErrors } = await ExcelService.processExcelFile(req.file.buffer);
        
        if (processedData.length === 0) {
          logger.warn('No valid data found in file', { parseErrors });
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'No valid data found in file',
            errors: parseErrors,
          });
        }
        
        const importResults = await ExcelService.importData(processedData);
        
        logger.info('Data import completed', {
          processed: processedData.length,
          inserted: importResults.inserted,
          updated: importResults.updated,
          errors: importResults.errors.length,
        });
        
        res.status(HTTP_STATUS.OK).json({
          success: true,
          message: SUCCESS_MESSAGES.DATA_IMPORTED,
          data: {
            total_processed: processedData.length,
            inserted: importResults.inserted,
            updated: importResults.updated,
            parse_errors: parseErrors,
            import_errors: importResults.errors,
          },
        });
      } catch (error) {
        logger.error('Import error', error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: ERROR_MESSAGES.DATA_IMPORT_ERROR,
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    });
  }
  
  // Get all products with pagination, filtering, and search
  static async getProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        category = '',
        minRating = 0,
        sortBy = 'rating',
        sortOrder = 'DESC',
      } = req.query;
      
      logger.debug('Fetching products', { page, limit, search, category, minRating });
      
      const offset = (page - 1) * limit;
      const where = {};
      
      // Search filter
      if (search && search.trim()) {
        const sanitizedSearch = Validator.sanitizeSearch(search);
        where[Op.or] = [
          { product_name: { [Op.iLike]: `%${sanitizedSearch}%` } },
          { category: { [Op.iLike]: `%${sanitizedSearch}%` } },
          { user_name: { [Op.iLike]: `%${sanitizedSearch}%` } },
          { review_title: { [Op.iLike]: `%${sanitizedSearch}%` } },
        ];
      }
      
      // Category filter
      if (category && category.trim()) {
        where.main_category = category;
      }
      
      // Rating filter
      if (minRating > 0) {
        where.rating = { [Op.gte]: minRating };
      }
      
      const { count, rows } = await Product.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder]],
      });
      
      logger.info('Products fetched successfully', { 
        count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      });
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: {
          products: rows,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit),
          },
        },
      });
    } catch (error) {
      logger.error('Get products error', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.DATA_RETRIEVAL_ERROR,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
  
  // Get single product by ID
  static async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);
      
      if (!product) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: ERROR_MESSAGES.PRODUCT_NOT_FOUND,
        });
      }
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: product,
      });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.DATA_RETRIEVAL_ERROR,
        error: error.message,
      });
    }
  }
  
  // Get analytics data for dashboard
  static async getAnalytics(req, res) {
    try {
      logger.info('Fetching analytics data');

      // Check if there's any data in database
      const totalProducts = await Product.count();
      
      if (totalProducts === 0) {
        logger.warn('No products found in database');
        return res.status(HTTP_STATUS.OK).json({
          success: true,
          message: 'No data available yet',
          data: {
            overall_stats: {
              total_products: 0,
              avg_rating: null,
              total_reviews: 0,
              avg_discount: 0,
            },
            products_per_category: [],
            top_reviewed_products: [],
            discount_distribution: [],
            category_avg_rating: [],
            rating_distribution: [],
          },
        });
      }

      // Products per category
      const categoryStats = await Product.findAll({
        attributes: [
          'main_category',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        where: {
          main_category: { [Op.and]: [{ [Op.ne]: '' }, { [Op.not]: null }] },
        },
        group: ['main_category'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
        limit: 10,
        raw: true,
      });
      
      // Top reviewed products
      const topReviewed = await Product.findAll({
        attributes: ['product_name', 'rating_count', 'rating', 'product_id'],
        where: {
          rating_count: { [Op.gt]: 0 },
        },
        order: [['rating_count', 'DESC']],
        limit: 10,
        raw: true,
      });
      
      // Discount distribution
      const discountBuckets = await Product.findAll({
        attributes: [
          [
            sequelize.literal(`
              CASE 
                WHEN discount_percentage = 0 THEN '0%'
                WHEN discount_percentage <= 10 THEN '1-10%'
                WHEN discount_percentage <= 20 THEN '11-20%'
                WHEN discount_percentage <= 30 THEN '21-30%'
                WHEN discount_percentage <= 40 THEN '31-40%'
                WHEN discount_percentage <= 50 THEN '41-50%'
                WHEN discount_percentage > 50 THEN '50%+'
                ELSE 'Unknown'
              END
            `),
            'discount_range',
          ],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: [sequelize.literal(`
          CASE 
            WHEN discount_percentage = 0 THEN '0%'
            WHEN discount_percentage <= 10 THEN '1-10%'
            WHEN discount_percentage <= 20 THEN '11-20%'
            WHEN discount_percentage <= 30 THEN '21-30%'
            WHEN discount_percentage <= 40 THEN '31-40%'
            WHEN discount_percentage <= 50 THEN '41-50%'
            WHEN discount_percentage > 50 THEN '50%+'
            ELSE 'Unknown'
          END
        `)],
        order: [[sequelize.literal('MIN(discount_percentage)'), 'ASC']],
        raw: true,
      });
      
      // Category-wise average rating
      const categoryRating = await Product.findAll({
        attributes: [
          'main_category',
          [sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'product_count'],
        ],
        where: {
          main_category: { [Op.and]: [{ [Op.ne]: '' }, { [Op.not]: null }] },
          rating: { [Op.gt]: 0 },
        },
        group: ['main_category'],
        order: [[sequelize.fn('AVG', sequelize.col('rating')), 'DESC']],
        limit: 10,
        raw: true,
      });
      
      // Overall statistics
      const overallStats = await Product.findOne({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'total_products'],
          [sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating'],
          [sequelize.fn('SUM', sequelize.col('rating_count')), 'total_reviews'],
          [sequelize.fn('AVG', sequelize.col('discount_percentage')), 'avg_discount'],
        ],
        raw: true,
      });
      
      // Rating distribution
      const ratingDistribution = await Product.findAll({
        attributes: [
          [sequelize.fn('FLOOR', sequelize.col('rating')), 'rating_bucket'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        where: {
          rating: { [Op.gt]: 0 },
        },
        group: [sequelize.fn('FLOOR', sequelize.col('rating'))],
        order: [[sequelize.fn('FLOOR', sequelize.col('rating')), 'ASC']],
        raw: true,
      });

      // Process overall stats to ensure numeric values
      const processedStats = {
        total_products: overallStats?.total_products || 0,
        avg_rating: overallStats?.avg_rating ? parseFloat(overallStats.avg_rating).toFixed(2) : 0,
        total_reviews: overallStats?.total_reviews || 0,
        avg_discount: overallStats?.avg_discount ? parseFloat(overallStats.avg_discount).toFixed(2) : 0,
      };
      
      logger.info('Analytics data fetched successfully', { 
        totalProducts: processedStats.total_products,
        categories: categoryStats.length,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: {
          overall_stats: processedStats,
          products_per_category: categoryStats || [],
          top_reviewed_products: topReviewed || [],
          discount_distribution: discountBuckets || [],
          category_avg_rating: categoryRating || [],
          rating_distribution: ratingDistribution || [],
        },
      });
    } catch (error) {
      logger.error('Get analytics error', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.DATA_RETRIEVAL_ERROR,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
  
  // Get available categories
  static async getCategories(req, res) {
    try {
      const categories = await Product.findAll({
        attributes: ['main_category'],
        where: {
          main_category: { [Op.ne]: '' },
        },
        group: ['main_category'],
        order: [['main_category', 'ASC']],
      });
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED,
        data: categories.map(c => c.main_category),
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.DATA_RETRIEVAL_ERROR,
        error: error.message,
      });
    }
  }
  
  // Delete all products
  static async deleteAllProducts(req, res) {
    try {
      await Product.destroy({ where: {}, truncate: true });
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'All products deleted successfully',
      });
    } catch (error) {
      console.error('Delete products error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.DATA_RETRIEVAL_ERROR,
        error: error.message,
      });
    }
  }
}

module.exports = ProductController;
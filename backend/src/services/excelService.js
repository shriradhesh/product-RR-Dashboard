const XLSX = require('xlsx');
const Product = require('../models/Product');

let logger;
try {
  const Logger = require('../utils/logger');
  logger = new Logger('ExcelService');
} catch (err) {
  logger = {
    info: console.log,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };
}

class ExcelService {
  static async processExcelFile(fileBuffer) {
    try {
      logger.info('Processing Excel file');
      
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      logger.debug(`Parsed ${data.length} rows from Excel`);
      
      const processedData = [];
      const errors = [];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        
        // Extract main category from the nested category string
        let category = row.category || '';
        let mainCategory = '';
        let subCategory = '';
        
        if (category && typeof category === 'string') {
          const categories = category.split('|');
          mainCategory = categories[0]?.trim() || '';
          subCategory = categories[categories.length - 1]?.trim() || '';
        }
        
        const productData = {
          product_id: row.product_id || row['product_id'],
          product_name: row.product_name || row['product_name'],
          category: category?.trim() || '',
          discounted_price: parseFloat(row.discounted_price) || 0,
          actual_price: parseFloat(row.actual_price) || 0,
          discount_percentage: parseFloat(row.discount_percentage) || 0,
          rating: parseFloat(row.rating) || 0,
          rating_count: parseInt(row.rating_count) || 0,
          about_product: row.about_product || row['about_product'] || '',
          user_name: row.user_name || row['user_name'] || '',
          review_title: row.review_title || row['review_title'] || '',
          review_content: row.review_content || row['review_content'] || '',
          main_category: mainCategory,
          sub_category: subCategory,
        };
        
        // Validate required fields
        if (!productData.product_id || productData.product_id.toString().trim() === '') {
          errors.push({ row: i + 2, error: 'Missing or empty product_id' });
          continue;
        }
        
        if (!productData.product_name || productData.product_name.toString().trim() === '') {
          errors.push({ row: i + 2, error: 'Missing or empty product_name' });
          continue;
        }
        
        processedData.push(productData);
      }
      
      logger.info('Excel processing completed', {
        totalRows: data.length,
        validRows: processedData.length,
        errors: errors.length,
      });
      
      return { processedData, errors };
    } catch (error) {
      logger.error('Excel processing error', error);
      throw new Error(`Excel processing error: ${error.message}`);
    }
  }
  
  static async importData(data) {
    const results = {
      inserted: 0,
      updated: 0,
      errors: [],
    };
    
    logger.info('Starting batch import', { totalRecords: data.length });
    
    for (const item of data) {
      try {
        const [product, created] = await Product.upsert(item, {
          returning: true,
        });
        
        if (created) {
          results.inserted++;
        } else {
          results.updated++;
        }
      } catch (error) {
        logger.warn('Error upserting product', { 
          product_id: item.product_id,
          error: error.message,
        });
        
        results.errors.push({
          product_id: item.product_id,
          error: error.message,
        });
      }
    }
    
    logger.info('Batch import completed', {
      inserted: results.inserted,
      updated: results.updated,
      errors: results.errors.length,
    });
    
    return results;
  }
}

module.exports = ExcelService;
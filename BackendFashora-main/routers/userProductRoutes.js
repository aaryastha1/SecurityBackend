const express = require('express');
const router = express.Router();
const { getProductsByCategory } = require('../controllers/UserProductController');
const { searchProducts } = require('../controllers/usersearchController');


// GET /api/products?categoryName=tops
router.get('/products', getProductsByCategory);
router.get('/products/search', searchProducts);


module.exports = router;




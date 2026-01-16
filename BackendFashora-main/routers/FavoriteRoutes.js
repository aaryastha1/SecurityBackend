const express = require('express');
const router = express.Router();
const { toggleFavorite, getFavorites } = require('../controllers/FavoriteController');
const { authenticateUser } = require('../middlewares/authorizedUser');

// POST /api/favorites/toggle
router.post('/toggle', authenticateUser, toggleFavorite);

// GET /api/favorites
router.get('/', authenticateUser, getFavorites);

module.exports = router;

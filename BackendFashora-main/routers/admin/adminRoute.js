const express = require('express');
const { adminLogin } = require('../../controllers/admin/AdminController');

const router = express.Router();

router.post('/login', adminLogin);

module.exports = router;
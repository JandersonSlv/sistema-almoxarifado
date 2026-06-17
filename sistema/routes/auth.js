// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define a rota POST para /api/auth/login
router.post('/login', authController.login);

module.exports = router;
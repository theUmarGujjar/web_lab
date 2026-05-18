const express = require('express');
const router = express.Router();
const { 
  login, 
  getProducts, 
  getProductDetails, 
  getUserProfile, 
  createOrder 
} = require('../controllers/apiController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/auth/login', login);
router.get('/products', getProducts);
router.get('/products/:id', getProductDetails);

// Protected routes (JWT required)
router.get('/user/profile', verifyToken, getUserProfile);
router.post('/orders', verifyToken, createOrder);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getShop, getProductDetails, buyProduct } = require('../controllers/shopController');

router.get('/', getShop);
router.get('/:id', getProductDetails);
router.post('/:id/buy', buyProduct);

module.exports = router;

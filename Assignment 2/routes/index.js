const express = require('express');
const router = express.Router();
const { 
  getHome, getAbout, getContact, getPrivacy, 
  getTerms, getReturns, getShipping, getCareers 
} = require('../controllers/shopController');

router.get('/', getHome);
router.get('/shop', (req, res) => res.redirect('/products'));
router.get('/about', getAbout);
router.get('/contact', getContact);
router.get('/privacy', getPrivacy);
router.get('/terms', getTerms);
router.get('/returns', getReturns);
router.get('/shipping', getShipping);
router.get('/careers', getCareers);

module.exports = router;

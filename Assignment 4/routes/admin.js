const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');

// Custom Basic HTTP Auth Middleware
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
    return res.status(401).send('Authentication required.');
  }

  const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  const user = auth[0];
  const pass = auth[1];

  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'admin123';

  if (user === adminUser && pass === adminPass) {
    next();
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
    return res.status(401).send('Invalid credentials.');
  }
};

// Apply secure admin authentication to all routes inside this router
router.use(adminAuth);

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed!'));
  }
});

// Admin Dashboard - View All Products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      page: 'dashboard',
      products: products
    });
  } catch (err) {
    res.status(500).send('Error loading dashboard: ' + err.message);
  }
});

// GET Add Product Page
router.get('/products/new', (req, res) => {
  res.render('admin/new', {
    title: 'Add New Product',
    page: 'new',
    error: null
  });
});

// POST Add Product
router.post('/products', upload.single('image'), async (req, res) => {
  try {
    const { name, price, originalPrice, category, stock, badge, rating, description } = req.body;
    
    // Server-side validation
    if (!name || !price || !originalPrice || !category || !stock) {
      return res.render('admin/new', {
        title: 'Add New Product',
        page: 'new',
        error: 'Please fill in all required fields marked with *'
      });
    }

    if (parseFloat(price) < 0 || parseFloat(originalPrice) < 0 || parseInt(stock) < 0) {
      return res.render('admin/new', {
        title: 'Add New Product',
        page: 'new',
        error: 'Numeric fields (price, stock) must be positive values!'
      });
    }

    let imagePath = '';
    if (req.file) {
      imagePath = '/uploads/' + req.file.filename;
    } else {
      return res.render('admin/new', {
        title: 'Add New Product',
        page: 'new',
        error: 'Product image upload is required!'
      });
    }

    await Product.create({
      name,
      price: parseFloat(price),
      originalPrice: parseFloat(originalPrice),
      category: category.toLowerCase(),
      stock: parseInt(stock),
      badge: badge || null,
      rating: parseFloat(rating) || 5,
      description: description || '',
      image: imagePath
    });

    res.redirect('/admin');
  } catch (err) {
    res.render('admin/new', {
      title: 'Add New Product',
      page: 'new',
      error: 'Error saving product: ' + err.message
    });
  }
});

// GET Edit Product Page
router.get('/products/:id/edit', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found.');
    }
    res.render('admin/edit', {
      title: 'Edit Product',
      page: 'edit',
      product: product,
      error: null
    });
  } catch (err) {
    res.status(500).send('Error fetching product: ' + err.message);
  }
});

// POST Edit Product
router.post('/products/:id', upload.single('image'), async (req, res) => {
  let product = null;
  try {
    const { name, price, originalPrice, category, stock, badge, rating, description } = req.body;
    product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).send('Product not found.');
    }

    // Server-side validation
    if (!name || !price || !originalPrice || !category || !stock) {
      return res.render('admin/edit', {
        title: 'Edit Product',
        page: 'edit',
        product: product,
        error: 'Please fill in all required fields marked with *'
      });
    }

    if (parseFloat(price) < 0 || parseFloat(originalPrice) < 0 || parseInt(stock) < 0) {
      return res.render('admin/edit', {
        title: 'Edit Product',
        page: 'edit',
        product: product,
        error: 'Numeric fields (price, stock) must be positive values!'
      });
    }

    const updateData = {
      name,
      price: parseFloat(price),
      originalPrice: parseFloat(originalPrice),
      category: category.toLowerCase(),
      stock: parseInt(stock),
      badge: badge || null,
      rating: parseFloat(rating) || 5,
      description: description || ''
    };

    if (req.file) {
      updateData.image = '/uploads/' + req.file.filename;
    }

    await Product.findByIdAndUpdate(req.params.id, updateData);
    res.redirect('/admin');
  } catch (err) {
    res.render('admin/edit', {
      title: 'Edit Product',
      page: 'edit',
      product: product || {},
      error: 'Error updating product: ' + err.message
    });
  }
});

// POST Delete Product
router.post('/products/:id/delete', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).send('Product not found.');
    }
    res.redirect('/admin');
  } catch (err) {
    res.status(500).send('Error deleting product: ' + err.message);
  }
});

module.exports = router;

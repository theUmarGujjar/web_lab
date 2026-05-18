const jwt = require('jsonwebtoken');
const Product = require('../models/Product');

const JWT_SECRET = process.env.JWT_SECRET || 'shopzone_super_secure_jwt_token_secret_key_987654';

// Mock user store
const MOCK_USER = {
  user_id: 'usr-987654',
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe',
  role: 'customer'
};

// POST /api/v1/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (email !== MOCK_USER.email || password !== MOCK_USER.password) {
      return res.status(401).json({ error: 'Unauthorized: Invalid email or password' });
    }

    // Sign the token with user_id and role
    const token = jwt.sign(
      { 
        user_id: MOCK_USER.user_id, 
        role: MOCK_USER.role,
        email: MOCK_USER.email,
        name: MOCK_USER.name 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server Error' });
  }
};

// GET /api/v1/products
exports.getProducts = async (req, res) => {
  try {
    const { category, sort, minPrice, maxPrice, search, page } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    let sortOptions = {};
    switch (sort) {
      case 'price-low':   sortOptions = { price: 1 }; break;
      case 'price-high':  sortOptions = { price: -1 }; break;
      case 'rating':      sortOptions = { rating: -1 }; break;
      case 'reviews':     sortOptions = { reviewCount: -1 }; break;
      default:            sortOptions = { createdAt: -1 }; break;
    }

    const limit = 8;
    const currentPage = parseInt(page) || 1;
    const skip = (currentPage - 1) * limit;

    const totalCount = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      products,
      totalCount,
      currentPage,
      totalPages
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server Error' });
  }
};

// GET /api/v1/products/:id
exports.getProductDetails = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.status(200).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server Error' });
  }
};

// GET /api/v1/user/profile (Protected)
exports.getUserProfile = (req, res) => {
  try {
    // req.user was appended by the verifyToken middleware
    return res.status(200).json({
      user_id: req.user.user_id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      status: 'active',
      verified: true
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server Error' });
  }
};

// POST /api/v1/orders (Protected)
exports.createOrder = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ error: 'productId and quantity are required' });
    }

    const parsedQty = parseInt(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive integer' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock === 0) {
      return res.status(400).json({ error: 'Product is out of stock' });
    }

    if (parsedQty > product.stock) {
      return res.status(400).json({ 
        error: `Insufficient stock level. Only ${product.stock} units available.` 
      });
    }

    // Decrement inventory stock
    const newStock = product.stock - parsedQty;
    await Product.findByIdAndUpdate(productId, { stock: newStock });

    // Generate random invoice detail block
    const orderNumber = 'SZ-API-' + Math.floor(100000 + Math.random() * 900000);
    const subtotal = parsedQty * product.price;
    const shipping = subtotal >= 50 ? 0.00 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    return res.status(201).json({
      message: 'Order created successfully!',
      orderNumber,
      productId,
      productName: product.name,
      quantity: parsedQty,
      pricePerUnit: product.price,
      pricing: {
        subtotal,
        shipping,
        tax,
        total
      },
      remainingStock: newStock
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server Error' });
  }
};

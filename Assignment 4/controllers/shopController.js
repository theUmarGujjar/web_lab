const Product = require('../models/Product');

const CATEGORIES = [
  { id: 'all',         label: 'All Products',    icon: 'fa-border-all' },
  { id: 'electronics', label: 'Electronics',      icon: 'fa-microchip' },
  { id: 'clothing',    label: 'Clothing',         icon: 'fa-shirt' },
  { id: 'books',       label: 'Books',            icon: 'fa-book' },
  { id: 'home',        label: 'Home & Kitchen',   icon: 'fa-house' }
];

function starsHtml(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (rating >= i)           html += '<i class="fa-solid fa-star"></i>';
    else if (rating >= i - 0.5) html += '<i class="fa-solid fa-star-half-stroke"></i>';
    else                       html += '<i class="fa-regular fa-star"></i>';
  }
  return html;
}

function discount(price, originalPrice) {
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function processProducts(list) {
  return list.map(p => {
    const doc = p.toObject ? p.toObject() : p;
    return {
      ...doc,
      id: doc._id.toString(), // ensure views work with id
      starsHtml: starsHtml(doc.rating),
      discountPct: discount(doc.price, doc.originalPrice)
    };
  });
}

exports.getHome = async (req, res) => {
  try {
    const featuredDocs = await Product.find({ badge: 'Best Seller' }).limit(8).lean();
    const featured = processProducts(featuredDocs);
    res.render('index', {
      title: 'ShopZone — Find Everything You Need',
      categories: CATEGORIES.filter(c => c.id !== 'all'),
      featured
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.getShop = async (req, res) => {
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
      default:            sortOptions = { createdAt: -1 }; break; // featured/newest
    }

    const limit = 8;
    const currentPage = parseInt(page) || 1;
    const skip = (currentPage - 1) * limit;

    const totalCount = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const productDocs = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    const filters = {
      category: category || 'all',
      sort:      sort      || 'featured',
      minPrice:  minPrice  || '',
      maxPrice:  maxPrice  || '',
      search:    search    || ''
    };

    const queryObj = { ...req.query };
    delete queryObj.page;
    const queryString = new URLSearchParams(queryObj).toString();

    res.render('shop', {
      title: 'Products — ShopZone',
      products: processProducts(productDocs),
      filters,
      categories: CATEGORIES,
      totalCount,
      currentPage,
      totalPages,
      queryString
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.getAbout = (req, res) => res.render('about', { title: 'About Us — ShopZone' });
exports.getContact = (req, res) => res.render('contact', { title: 'Contact Us — ShopZone' });
exports.getPrivacy = (req, res) => res.render('privacy', { title: 'Privacy Policy — ShopZone' });
exports.getTerms = (req, res) => res.render('terms', { title: 'Terms of Service — ShopZone' });
exports.getReturns = (req, res) => res.render('returns', { title: 'Returns & Refunds — ShopZone' });
exports.getShipping = (req, res) => res.render('shipping', { title: 'Shipping Information — ShopZone' });
exports.getCareers = (req, res) => res.render('careers', { title: 'Careers — ShopZone' });

const mongoose = require('mongoose');

// Define schema for real MongoDB usage
const saleSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name:      { type: String, required: true },
    category:  { type: String, required: true, lowercase: true },
    quantity:  { type: Number, required: true, min: 1 },
    price:     { type: Number, required: true, min: 0 },
    total:     { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

const RealSale = mongoose.model('Sale', saleSchema);

// Create a small in-memory mock sales dataset when MongoDB is offline
const electronics = require('../data/electronics');
const clothing = require('../data/clothing');
const books = require('../data/books');
const home = require('../data/home');

const allProducts = [...electronics, ...clothing, ...books, ...home];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate some mock sales across products (recent timestamps)
const mockSales = [];
for (let i = 0; i < 40; i++) {
  const p = allProducts[randomBetween(0, allProducts.length - 1)];
  const qty = randomBetween(1, 5);
  const price = p.price || (Math.random() * 200 + 5);
  const createdAt = new Date(Date.now() - randomBetween(0, 1000 * 60 * 60 * 24));
  mockSales.push({
    _id: `mock_${i}_${Date.now() + i}`,
    productId: p.id || `prod_${i}`,
    name: p.name,
    category: p.category || (p.type || 'misc'),
    quantity: qty,
    price: price,
    total: +(price * qty).toFixed(2),
    createdAt,
    updatedAt: createdAt
  });
}

class MockSale {
  static async create(doc) {
    const newDoc = {
      _id: `mock_${Date.now()}`,
      ...doc,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockSales.push(newDoc);
    return Promise.resolve(newDoc);
  }

  static async find(query = {}, sort = { createdAt: -1 }, limit = 50) {
    let res = [...mockSales];
    if (query.category) res = res.filter(s => s.category === query.category);
    if (query.productId) res = res.filter(s => s.productId === query.productId);
    res.sort((a, b) => sort.createdAt === -1 ? b.createdAt - a.createdAt : a.createdAt - b.createdAt);
    return Promise.resolve(res.slice(0, limit));
  }

  static async aggregate(pipeline = []) {
    // A minimal subset of aggregations used by the dashboard
    // We'll only support simple $group by category and by product
    // For other pipelines, fall back to returning an empty array
    const firstStage = pipeline[0] || {};
    // Total revenue / orders
    if (pipeline.some(stage => stage.$group && stage.$group._id === null)) {
      const totalRevenue = mockSales.reduce((s, r) => s + (r.total || 0), 0);
      const totalOrders = mockSales.length;
      return Promise.resolve([{ totalRevenue, totalOrders }]);
    }

    // Revenue by category
    if (pipeline.some(stage => stage.$group && stage.$group._id && stage.$group._id.category)) {
      const map = {};
      mockSales.forEach(s => {
        map[s.category] = (map[s.category] || 0) + (s.total || 0);
      });
      const out = Object.keys(map).map(k => ({ _id: { category: k }, revenue: map[k] }));
      return Promise.resolve(out);
    }

    // Top products by revenue
    if (pipeline.some(stage => stage.$group && stage.$group._id && stage.$group._id.productId)) {
      const map = {};
      mockSales.forEach(s => {
        const key = s.productId;
        if (!map[key]) map[key] = { productId: key, name: s.name, revenue: 0, qty: 0 };
        map[key].revenue += s.total || 0;
        map[key].qty += s.quantity || 0;
      });
      const arr = Object.values(map).sort((a, b) => b.revenue - a.revenue);
      return Promise.resolve(arr);
    }

    return Promise.resolve([]);
  }

  static async countDocuments() {
    return Promise.resolve(mockSales.length);
  }

  static async findRecent(limit = 10) {
    const sorted = [...mockSales].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
    return Promise.resolve(sorted);
  }
}

const SaleWrapper = {
  create(doc) {
    if (mongoose.connection.readyState === 1) return RealSale.create(doc);
    return MockSale.create(doc);
  },

  find(query, sort, limit) {
    if (mongoose.connection.readyState === 1) return RealSale.find(query).sort(sort).limit(limit).lean();
    return MockSale.find(query, sort, limit);
  },

  aggregate(pipeline) {
    if (mongoose.connection.readyState === 1) return RealSale.aggregate(pipeline);
    return MockSale.aggregate(pipeline);
  },

  countDocuments() {
    if (mongoose.connection.readyState === 1) return RealSale.countDocuments();
    return MockSale.countDocuments();
  },

  async findRecent(limit = 10) {
    if (mongoose.connection.readyState === 1) return RealSale.find().sort({ createdAt: -1 }).limit(limit).lean();
    return MockSale.findRecent(limit);
  }
};

module.exports = SaleWrapper;

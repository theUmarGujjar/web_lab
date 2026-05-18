const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name:          { type: String,  required: true, trim: true },
    price:         { type: Number,  required: true, min: 0 },
    originalPrice: { type: Number,  required: true, min: 0 },
    rating:        { type: Number,  required: true, min: 0, max: 5 },
    reviewCount:   { type: Number,  default: 0 },
    category:      {
      type:    String,
      required: true,
      enum:    ['electronics', 'clothing', 'books', 'home'],
      lowercase: true
    },
    stock:         { type: Number,  required: true, min: 0, default: 0 },
    badge:         { type: String,  default: null },
    description:   { type: String,  default: '' },
    image:         { type: String,  default: '' }
  },
  { timestamps: true }
);

// Text index for full-text search on name + description
productSchema.index({ name: 'text', description: 'text' });

const RealProduct = mongoose.model('Product', productSchema);

// Fallback in-memory implementation
const electronics = require('../data/electronics');
const clothing = require('../data/clothing');
const books = require('../data/books');
const home = require('../data/home');

const allProductsData = [...electronics, ...clothing, ...books, ...home].map((p, idx) => {
  const { id, ...productData } = p;
  return {
    _id: id || `mock_${idx}`,
    id: id || `mock_${idx}`,
    ...productData,
    stock: p.stock || Math.floor(Math.random() * 50) + 10,
    createdAt: new Date(),
    updatedAt: new Date()
  };
});

class MockQuery {
  constructor(data) {
    this.data = data;
    this._limit = null;
    this._skip = null;
    this._sort = null;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  skip(n) {
    this._skip = n;
    return this;
  }

  sort(sortOptions) {
    this._sort = sortOptions;
    return this;
  }

  lean() {
    return this;
  }

  async then(resolve, reject) {
    try {
      let result = [...this.data];

      if (this._sort) {
        const key = Object.keys(this._sort)[0];
        const order = this._sort[key];
        result.sort((a, b) => {
          let valA = a[key];
          let valB = b[key];
          if (typeof valA === 'string') {
            return order === 1 ? valA.localeCompare(valB) : valB.localeCompare(valA);
          }
          return order === 1 ? valA - valB : valB - valA;
        });
      }

      if (this._skip) {
        result = result.slice(this._skip);
      }

      if (this._limit) {
        result = result.slice(0, this._limit);
      }

      resolve(result);
    } catch (err) {
      reject(err);
    }
  }
}

function matchQuery(product, query) {
  for (const key of Object.keys(query)) {
    if (key === '$or') {
      const conditions = query['$or'];
      const matched = conditions.some(cond => matchQuery(product, cond));
      if (!matched) return false;
      continue;
    }

    const queryVal = query[key];
    const prodVal = product[key];

    if (queryVal && typeof queryVal === 'object' && !Array.isArray(queryVal)) {
      for (const op of Object.keys(queryVal)) {
        if (op === '$gte') {
          if (!(prodVal >= queryVal[op])) return false;
        } else if (op === '$lte') {
          if (!(prodVal <= queryVal[op])) return false;
        } else if (op === '$regex') {
          const regexStr = queryVal[op];
          const flags = queryVal['$options'] || '';
          const regex = new RegExp(regexStr, flags);
          if (!regex.test(prodVal)) return false;
        }
      }
    } else {
      if (prodVal !== queryVal) return false;
    }
  }
  return true;
}

class MockProduct {
  static find(query = {}) {
    const filtered = allProductsData.filter(p => matchQuery(p, query));
    return new MockQuery(filtered);
  }

  static async countDocuments(query = {}) {
    const filtered = allProductsData.filter(p => matchQuery(p, query));
    return filtered.length;
  }
}

// Export a proxy/wrapper that checks if mongoose is connected
const ProductWrapper = {
  find(query) {
    if (mongoose.connection.readyState === 1) {
      return RealProduct.find(query);
    }
    return MockProduct.find(query);
  },

  async countDocuments(query) {
    if (mongoose.connection.readyState === 1) {
      return await RealProduct.countDocuments(query);
    }
    return await MockProduct.countDocuments(query);
  },

  findById(id) {
    if (mongoose.connection.readyState === 1) {
      return RealProduct.findById(id);
    }
    const product = allProductsData.find(p => p._id === id || p.id === id);
    return Promise.resolve(product);
  },

  findByIdAndUpdate(id, updateData) {
    if (mongoose.connection.readyState === 1) {
      return RealProduct.findByIdAndUpdate(id, updateData, { new: true });
    }
    const idx = allProductsData.findIndex(p => p._id === id || p.id === id);
    if (idx !== -1) {
      allProductsData[idx] = { ...allProductsData[idx], ...updateData, updatedAt: new Date() };
      return Promise.resolve(allProductsData[idx]);
    }
    return Promise.resolve(null);
  },

  findByIdAndDelete(id) {
    if (mongoose.connection.readyState === 1) {
      return RealProduct.findByIdAndDelete(id);
    }
    const idx = allProductsData.findIndex(p => p._id === id || p.id === id);
    if (idx !== -1) {
      const deleted = allProductsData[idx];
      allProductsData.splice(idx, 1);
      return Promise.resolve(deleted);
    }
    return Promise.resolve(null);
  },

  create(data) {
    if (mongoose.connection.readyState === 1) {
      return RealProduct.create(data);
    }
    const newId = `mock_${Date.now()}`;
    const newProduct = {
      _id: newId,
      id: newId,
      badge: null,
      description: '',
      image: '',
      rating: 5,
      reviewCount: 0,
      originalPrice: data.price,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    allProductsData.push(newProduct);
    return Promise.resolve(newProduct);
  },

  deleteMany(query) {
    if (mongoose.connection.readyState === 1) {
      return RealProduct.deleteMany(query);
    }
    return Promise.resolve({ deletedCount: 0 });
  },

  insertMany(docs) {
    if (mongoose.connection.readyState === 1) {
      return RealProduct.insertMany(docs);
    }
    return Promise.resolve(docs);
  },

  get schema() {
    return RealProduct.schema;
  }
};

module.exports = ProductWrapper;

const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');

// Helper to compute stats from sales array
function computeStatsFromDocs(docs) {
  const totalRevenue = docs.reduce((s, r) => s + (r.total || 0), 0);
  const totalOrders = docs.length;
  const revenueByCategory = {};
  const productMap = {};

  docs.forEach(s => {
    revenueByCategory[s.category] = (revenueByCategory[s.category] || 0) + (s.total || 0);
    const key = s.productId;
    if (!productMap[key]) productMap[key] = { productId: key, name: s.name, revenue: 0, qty: 0 };
    productMap[key].revenue += s.total || 0;
    productMap[key].qty += s.quantity || 0;
  });

  const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const byCategory = Object.keys(revenueByCategory).map(k => ({ category: k, revenue: revenueByCategory[k] }));

  return { totalRevenue: +totalRevenue.toFixed(2), totalOrders, revenueByCategory: byCategory, topProducts };
}

// Render dashboard page
router.get('/', async (req, res) => {
  try {
    // Provide initial snapshot (last 100 sales)
    const sales = await Sale.find({}, { createdAt: -1 }, 100);
    const stats = computeStatsFromDocs(sales);
    const recent = await Sale.findRecent(10);
    res.render('sales', { title: 'Sales Dashboard', stats, recent });
  } catch (err) {
    console.error('Sales render error:', err);
    res.status(500).send('Server error');
  }
});

// API endpoint polled by client for live updates
router.get('/api', async (req, res) => {
  try {
    const sales = await Sale.find({}, { createdAt: -1 }, 1000);
    const stats = computeStatsFromDocs(sales);
    const recent = await Sale.findRecent(10);
    res.json({ ok: true, stats, recent });
  } catch (err) {
    console.error('Sales API error:', err);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});

module.exports = router;

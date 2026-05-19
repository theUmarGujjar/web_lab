const ejs = require('ejs');
const path = require('path');
const Sale = require('../models/Sale');

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

async function run() {
  try {
    const recent = await Sale.findRecent(10);
    const stats = computeStatsFromDocs(recent.concat([]));
    const viewPath = path.join(__dirname, '..', 'views', 'sales.ejs');
    const html = await ejs.renderFile(viewPath, { stats, recent, title: 'Sales Dashboard' });
    console.log('Rendered sales.ejs length:', html.length);
    process.exit(0);
  } catch (err) {
    console.error('Render failed:', err);
    process.exit(2);
  }
}

run();

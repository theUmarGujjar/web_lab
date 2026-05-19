const Sale = require('../models/Sale');

async function run() {
  try {
    console.log('Testing Sale model methods...');

    const recent = await Sale.findRecent(5);
    console.log('findRecent(5) => count:', recent.length);

    const agg1 = await Sale.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$total' } } }]);
    console.log('aggregate totalRevenue sample:', agg1[0] || agg1);

    const aggCat = await Sale.aggregate([{ $group: { _id: { category: '$category' }, revenue: { $sum: '$total' } } }]);
    console.log('aggregate by category sample count:', aggCat.length);

    const created = await Sale.create({ productId: 'test_1', name: 'Test Product', category: 'testing', quantity: 2, price: 9.99, total: 19.98 });
    console.log('create =>', created && created._id ? 'ok' : 'failed');

    const count = await Sale.countDocuments();
    console.log('countDocuments =>', count);

    console.log('Recent after create:', (await Sale.findRecent(3)).map(s => ({ name: s.name, total: s.total })));

    console.log('All Sale model tests completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(2);
  }
}

run();

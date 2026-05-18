const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', { serverSelectionTimeoutMS: 3000 })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error (Offline fallback activated):', err.message));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const indexRoutes = require('./routes/index');
const shopRoutes  = require('./routes/shop');
const adminRoutes = require('./routes/admin');

app.use('/products', shopRoutes);
app.use('/admin',    adminRoutes);
app.use('/',      indexRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

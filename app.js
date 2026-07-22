const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api', (req, res) => {
  res.json({ message: 'Girlys API is running!', status: 'ok' });
});

app.use('/api/auth', require('./routes/auth'));
app.use("/api/products", require("./routes/products"));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/promotions', require('./routes/promotions'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));

app.get('/api/dashboard', async (req, res) => {
  try {
    const db = require('./config/db');
    const [prodCount] = await db.query('SELECT COUNT(*) as total FROM products');
    const [catCount] = await db.query('SELECT COUNT(*) as total FROM categories');
    res.json({
      totalProducts: prodCount[0].total,
      totalCategories: catCount[0].total,
      totalVisitors: 15890
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Veloura Beauty API is running!', status: 'ok' });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[ERROR] Port ${PORT} sudah dipakai proses lain.`);
    console.error(`Hentikan server lama dulu, lalu jalankan ulang.`);
    console.error(`Cara cepat (PowerShell): taskkill /F /IM node.exe\n`);
  } else {
    console.error('[ERROR] Gagal menjalankan server:', err.message);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]', reason);
});

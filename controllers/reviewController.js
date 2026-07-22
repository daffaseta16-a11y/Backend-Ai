const db = require('../config/db');

const getAll = async (req, res) => {
  try {
    const { product_id, status } = req.query;
    let sql = 'SELECT * FROM reviews';
    const params = [];
    const conditions = [];
    if (product_id) {
      conditions.push('product_id = ?');
      params.push(product_id);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    } else {
      conditions.push("status = 'visible'");
    }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data review.', error: err.message });
  }
};

const getByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM reviews WHERE product_id = ? AND status = 'visible' ORDER BY created_at DESC",
      [productId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil review produk.', error: err.message });
  }
};

const getSummary = async (req, res) => {
  try {
    const { productId } = req.params;
    const [rows] = await db.query(
      `SELECT
        COUNT(*) as total,
        COALESCE(AVG(rating), 0) as average,
        SUM(CASE WHEN rating >= 5 THEN 1 ELSE 0 END) as star5,
        SUM(CASE WHEN rating >= 4 AND rating < 5 THEN 1 ELSE 0 END) as star4,
        SUM(CASE WHEN rating >= 3 AND rating < 4 THEN 1 ELSE 0 END) as star3,
        SUM(CASE WHEN rating >= 2 AND rating < 3 THEN 1 ELSE 0 END) as star2,
        SUM(CASE WHEN rating < 2 THEN 1 ELSE 0 END) as star1
      FROM reviews WHERE product_id = ? AND status = 'visible'`,
      [productId]
    );
    const r = rows[0];
    const total = r.total || 0;
    const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);
    res.json({
      total,
      average: parseFloat(r.average).toFixed(1),
      distribution: {
        5: pct(r.star5),
        4: pct(r.star4),
        3: pct(r.star3),
        2: pct(r.star2),
        1: pct(r.star1)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghitung ringkasan review.', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { product_id, customer_name, city, rating, comment, image, product_name } = req.body;
    if (!product_id || !customer_name || !rating) {
      return res.status(400).json({ message: 'Produk, nama, dan rating wajib diisi.' });
    }
    let finalImage = image || null;
    if (req.file) finalImage = req.file.filename;
    const [prod] = await db.query('SELECT nama FROM products WHERE id = ?', [product_id]);
    const name = product_name || (prod.length ? prod[0].nama : null);
    const [result] = await db.query(
      'INSERT INTO reviews (product_id, customer_name, city, product_name, rating, comment, image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [product_id, customer_name, city, name, rating, comment, finalImage, 'visible']
    );
    res.status(201).json({ message: 'Review berhasil ditambahkan.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambah review.', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { customer_name, city, rating, comment, status } = req.body;
    const [existing] = await db.query('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Review tidak ditemukan.' });
    await db.query(
      'UPDATE reviews SET customer_name=?, city=?, rating=?, comment=?, status=? WHERE id=?',
      [customer_name || existing[0].customer_name, city || existing[0].city, rating || existing[0].rating, comment || existing[0].comment, status || existing[0].status, req.params.id]
    );
    res.json({ message: 'Review berhasil diperbarui.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui review.', error: err.message });
  }
};

const toggleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const [existing] = await db.query('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Review tidak ditemukan.' });
    await db.query('UPDATE reviews SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Status review diperbarui.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengubah status review.', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Review tidak ditemukan.' });
    await db.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ message: 'Review berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus review.', error: err.message });
  }
};

module.exports = { getAll, getByProduct, getSummary, create, update, toggleStatus, remove };

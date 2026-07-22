const db = require('../config/db');

const getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data kategori.', error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data kategori.', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { nama } = req.body;
    if (!nama) return res.status(400).json({ message: 'Nama kategori wajib diisi.' });
    const [result] = await db.query('INSERT INTO categories (nama) VALUES (?)', [nama]);
    res.status(201).json({ message: 'Kategori berhasil ditambahkan.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambah kategori.', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { nama } = req.body;
    if (!nama) return res.status(400).json({ message: 'Nama kategori wajib diisi.' });
    await db.query('UPDATE categories SET nama = ? WHERE id = ?', [nama, req.params.id]);
    res.json({ message: 'Kategori berhasil diperbarui.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui kategori.', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Kategori berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus kategori.', error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };

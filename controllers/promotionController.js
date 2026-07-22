const db = require('../config/db');
const path = require('path');
const fs = require('fs');

const getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM promotions ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data promo.', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { judul, deskripsi } = req.body;
    const gambar = req.file ? req.file.filename : null;
    if (!judul) return res.status(400).json({ message: 'Judul promo wajib diisi.' });
    const [result] = await db.query(
      'INSERT INTO promotions (judul, deskripsi, gambar) VALUES (?, ?, ?)',
      [judul, deskripsi, gambar]
    );
    res.status(201).json({ message: 'Promo berhasil ditambahkan.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambah promo.', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { judul, deskripsi } = req.body;
    const [existing] = await db.query('SELECT * FROM promotions WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Promo tidak ditemukan.' });

    let gambar = existing[0].gambar;
    if (req.file) {
      if (gambar) {
        const oldPath = path.join(__dirname, '../uploads', gambar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      gambar = req.file.filename;
    }

    await db.query(
      'UPDATE promotions SET judul=?, deskripsi=?, gambar=? WHERE id=?',
      [judul, deskripsi, gambar, req.params.id]
    );
    res.json({ message: 'Promo berhasil diperbarui.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui promo.', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT * FROM promotions WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Promo tidak ditemukan.' });
    if (existing[0].gambar) {
      const oldPath = path.join(__dirname, '../uploads', existing[0].gambar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    await db.query('DELETE FROM promotions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Promo berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus promo.', error: err.message });
  }
};

module.exports = { getAll, create, update, remove };

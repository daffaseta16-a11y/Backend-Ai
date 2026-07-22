const db = require('../config/db');

const getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM testimonials ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data testimoni.', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { nama, pekerjaan, pesan } = req.body;
    const foto = req.file ? req.file.filename : null;
    if (!nama || !pesan) return res.status(400).json({ message: 'Nama dan pesan wajib diisi.' });
    const [result] = await db.query(
      'INSERT INTO testimonials (nama, pekerjaan, pesan, foto) VALUES (?, ?, ?, ?)',
      [nama, pekerjaan, pesan, foto]
    );
    res.status(201).json({ message: 'Testimoni berhasil ditambahkan.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambah testimoni.', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { nama, pekerjaan, pesan } = req.body;
    const [existing] = await db.query('SELECT * FROM testimonials WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Testimoni tidak ditemukan.' });

    let foto = existing[0].foto;
    if (req.file) {
      const path = require('path');
      const fs = require('fs');
      if (foto) {
        const oldPath = path.join(__dirname, '../uploads', foto);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      foto = req.file.filename;
    }

    await db.query(
      'UPDATE testimonials SET nama=?, pekerjaan=?, pesan=?, foto=? WHERE id=?',
      [nama, pekerjaan, pesan, foto, req.params.id]
    );
    res.json({ message: 'Testimoni berhasil diperbarui.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui testimoni.', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT * FROM testimonials WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Testimoni tidak ditemukan.' });
    const path = require('path');
    const fs = require('fs');
    if (existing[0].foto) {
      const oldPath = path.join(__dirname, '../uploads', existing[0].foto);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    await db.query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
    res.json({ message: 'Testimoni berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus testimoni.', error: err.message });
  }
};

module.exports = { getAll, create, update, remove };

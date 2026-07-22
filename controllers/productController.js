const db = require('../config/db');
const path = require('path');
const fs = require('fs');

const parseImages = (product) => {
  if (product.images && typeof product.images === 'string') {
    try { product.images = JSON.parse(product.images); } catch(e) { product.images = []; }
  }
  return product;
};

const getAll = async (req, res) => {
  try {
    const { category, search, sort, brand, skin_type, min_price, max_price, rating, page = 1, limit = 8 } = req.query;
    let sql = `
      SELECT p.*, c.nama AS category_name,
        (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id AND r.status = 'visible') AS review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      sql += ' AND p.category_id = ?';
      params.push(category);
    }
    if (search) {
      sql += ' AND p.nama LIKE ?';
      params.push(`%${search}%`);
    }
    if (brand) {
      sql += ' AND p.brand = ?';
      params.push(brand);
    }
    if (skin_type) {
      sql += ' AND p.skin_type LIKE ?';
      params.push(`%${skin_type}%`);
    }
    if (min_price) {
      sql += ' AND p.harga >= ?';
      params.push(parseFloat(min_price));
    }
    if (max_price) {
      sql += ' AND p.harga <= ?';
      params.push(parseFloat(max_price));
    }
    if (rating) {
      sql += ' AND p.rating >= ?';
      params.push(parseFloat(rating));
    }
    if (req.query.best_seller === 'true' || req.query.best_seller === '1') {
      sql += ' AND p.best_seller = 1';
    }

    if (sort === 'asc') sql += ' ORDER BY p.harga ASC';
    else if (sort === 'desc') sql += ' ORDER BY p.harga DESC';
    else if (sort === 'terbaru') sql += ' ORDER BY p.created_at DESC';
    else if (sort === 'rating') sql += ' ORDER BY p.rating DESC';
    else if (sort === 'bestseller') sql += ' ORDER BY p.best_seller DESC, p.rating DESC';
    else sql += ' ORDER BY p.id DESC';

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let countSql = 'SELECT COUNT(*) AS total FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
    const countParams = [];
    if (category) { countSql += ' AND p.category_id = ?'; countParams.push(category); }
    if (search) { countSql += ' AND p.nama LIKE ?'; countParams.push(`%${search}%`); }
    if (brand) { countSql += ' AND p.brand = ?'; countParams.push(brand); }
    if (skin_type) { countSql += ' AND p.skin_type LIKE ?'; countParams.push(`%${skin_type}%`); }
    if (min_price) { countSql += ' AND p.harga >= ?'; countParams.push(parseFloat(min_price)); }
    if (max_price) { countSql += ' AND p.harga <= ?'; countParams.push(parseFloat(max_price)); }
    if (rating) { countSql += ' AND p.rating >= ?'; countParams.push(parseFloat(rating)); }
    if (req.query.best_seller === 'true' || req.query.best_seller === '1') { countSql += ' AND p.best_seller = 1'; }

    const [countResult] = await db.query(countSql, countParams);
    const total = countResult[0].total;

    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await db.query(sql, params);
    const products = rows.map(parseImages);
    res.json({ products, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data produk.', error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, c.nama AS category_name,
        (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id AND r.status = 'visible') AS review_count
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    const product = parseImages(rows[0]);
    
    // Fetch additional images from product_images table
    const [extraImages] = await db.query(
      'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC',
      [req.params.id]
    );
    product.allImages = [product.gambar, ...extraImages.map(img => img.image_url)].filter(Boolean);
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data produk.', error: err.message });
  }
};

const create = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    
    const { nama, brand, harga, stok, deskripsi, kandungan, cara_pakai, manfaat, rating, category_id, skin_type, berat, ukuran, label } = req.body;
    
    // Main image from single upload
    const gambar = req.file ? req.file.filename : null;
    
    const [result] = await conn.query(
      `INSERT INTO products (nama, brand, harga, stok, deskripsi, kandungan, cara_pakai, manfaat, rating, gambar, category_id, skin_type, berat, ukuran, label)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nama, brand || "Pretty's", harga, stok || 0, deskripsi, kandungan, cara_pakai, manfaat, rating || 0, gambar, category_id || null, skin_type, berat, ukuran, label || null]
    );
    const productId = result.insertId;

    // Handle additional images from multiple upload
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        await conn.query(
          'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)',
          [productId, req.files[i].filename, i + 1]
        );
      }
    }

    await conn.commit();
    res.status(201).json({ message: 'Produk berhasil ditambahkan.', id: productId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Gagal menambah produk.', error: err.message });
  } finally {
    conn.release();
  }
};

const update = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    
    const { nama, brand, harga, stok, deskripsi, kandungan, cara_pakai, manfaat, rating, category_id, skin_type, berat, ukuran, label } = req.body;
    const [existing] = await conn.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Produk tidak ditemukan.' });

    let gambar = existing[0].gambar;
    if (req.file) {
      if (gambar) {
        const oldPath = path.join(__dirname, '../uploads', gambar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      gambar = req.file.filename;
    }

    await conn.query(
      `UPDATE products SET nama=?, brand=?, harga=?, stok=?, deskripsi=?, kandungan=?, cara_pakai=?, manfaat=?, rating=?, gambar=?, category_id=?, skin_type=?, berat=?, ukuran=?, label=?
       WHERE id=?`,
      [nama, brand, harga, stok || 0, deskripsi, kandungan, cara_pakai, manfaat, rating || 0, gambar, category_id || null, skin_type, berat, ukuran, label, req.params.id]
    );

    // Handle additional images
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        await conn.query(
          'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)',
          [req.params.id, req.files[i].filename, i + 1]
        );
      }
    }

    await conn.commit();
    res.json({ message: 'Produk berhasil diperbarui.' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Gagal memperbarui produk.', error: err.message });
  } finally {
    conn.release();
  }
};

const remove = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    
    const [existing] = await conn.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    
    if (existing[0].gambar) {
      const oldPath = path.join(__dirname, '../uploads', existing[0].gambar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Delete additional images
    const [extraImages] = await conn.query('SELECT image_url FROM product_images WHERE product_id = ?', [req.params.id]);
    for (const img of extraImages) {
      const imgPath = path.join(__dirname, '../uploads', img.image_url);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    await conn.query('DELETE FROM product_images WHERE product_id = ?', [req.params.id]);
    
    await conn.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    await conn.commit();
    res.json({ message: 'Produk berhasil dihapus.' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Gagal menghapus produk.', error: err.message });
  } finally {
    conn.release();
  }
};

const getLatest = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const [rows] = await db.query(
      `SELECT p.*, c.nama AS category_name,
        (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id AND r.status = 'visible') AS review_count
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.created_at DESC LIMIT ?`,
      [limit]
    );
    const products = rows.map(parseImages).map((p, i) => ({ ...p, is_new: i < 6 }));
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil produk terbaru.', error: err.message });
  }
};

const getRelated = async (req, res) => {
  try {
    const { id } = req.params;
    const [product] = await db.query('SELECT category_id FROM products WHERE id = ?', [id]);
    if (product.length === 0) return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    const [rows] = await db.query(
      `SELECT p.*, c.nama AS category_name,
        (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id AND r.status = 'visible') AS review_count
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.category_id = ? AND p.id != ?
       ORDER BY RAND() LIMIT 4`,
      [product[0].category_id, id]
    );
    const products = rows.map(parseImages);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil produk terkait.', error: err.message });
  }
};

// Image management endpoints
const addProductImages = async (req, res) => {
  try {
    const productId = req.params.id;
    const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (existing.length === 0) return res.status(404).json({ message: 'Produk tidak ditemukan.' });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Tidak ada gambar yang diunggah.' });
    }

    const [currentImages] = await db.query('SELECT MAX(sort_order) as maxOrder FROM product_images WHERE product_id = ?', [productId]);
    let nextOrder = (currentImages[0].maxOrder || 0) + 1;

    for (const file of req.files) {
      await db.query(
        'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)',
        [productId, file.filename, nextOrder++]
      );
    }

    res.json({ message: 'Gambar berhasil ditambahkan.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambahkan gambar.', error: err.message });
  }
};

const deleteProductImage = async (req, res) => {
  try {
    const [image] = await db.query('SELECT * FROM product_images WHERE id = ?', [req.params.id]);
    if (image.length === 0) return res.status(404).json({ message: 'Gambar tidak ditemukan.' });

    const imgPath = path.join(__dirname, '../uploads', image[0].image_url);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

    await db.query('DELETE FROM product_images WHERE id = ?', [req.params.id]);
    res.json({ message: 'Gambar berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus gambar.', error: err.message });
  }
};

const reorderProductImages = async (req, res) => {
  try {
    const { images } = req.body; // [{id, sort_order}, ...]
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ message: 'Data urutan tidak valid.' });
    }
    for (const img of images) {
      await db.query('UPDATE product_images SET sort_order = ? WHERE id = ?', [img.sort_order, img.id]);
    }
    res.json({ message: 'Urutan gambar berhasil diperbarui.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui urutan.', error: err.message });
  }
};

const getProductImages = async (req, res) => {
  try {
    const [images] = await db.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', [req.params.id]);
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil gambar.', error: err.message });
  }
};

module.exports = { 
  getAll, getById, create, update, remove, getLatest, getRelated,
  addProductImages, deleteProductImage, reorderProductImages, getProductImages
};
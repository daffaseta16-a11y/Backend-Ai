const db = require('../config/db');

const getCart = async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    if (!sessionId) return res.json({ items: [], total: 0 });
    const [cart] = await db.query('SELECT id FROM carts WHERE session_id = ?', [sessionId]);
    if (cart.length === 0) return res.json({ items: [], total: 0 });
    const [items] = await db.query(
      `SELECT ci.*, p.nama, p.harga, p.gambar, p.stok, p.brand
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ?
       ORDER BY ci.created_at DESC`,
      [cart[0].id]
    );
    const total = items.reduce((sum, item) => sum + Number(item.harga) * item.quantity, 0);
    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cart', error: err.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { session_id, product_id, quantity = 1 } = req.body;
    let [cart] = await db.query('SELECT id FROM carts WHERE session_id = ?', [session_id]);
    if (cart.length === 0) {
      const [result] = await db.query('INSERT INTO carts (session_id) VALUES (?)', [session_id]);
      cart = [{ id: result.insertId }];
    }
    const [existing] = await db.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cart[0].id, product_id]
    );
    if (existing.length > 0) {
      await db.query('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [quantity, existing[0].id]);
    } else {
      await db.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
        [cart[0].id, product_id, quantity]
      );
    }
    res.json({ message: 'Product added to cart' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding to cart', error: err.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, req.params.id]);
    res.json({ message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating cart', error: err.message });
  }
};

const removeCartItem = async (req, res) => {
  try {
    await db.query('DELETE FROM cart_items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing item', error: err.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };

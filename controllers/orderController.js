const db = require('../config/db');

const checkout = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { customer, items, metode_pembayaran, ongkir = 10000 } = req.body;

    const [custResult] = await conn.query(
      `INSERT INTO customers (nama, no_hp, email, alamat, provinsi, kota, kode_pos, catatan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer.nama, customer.no_hp, customer.email, customer.alamat, customer.provinsi, customer.kota, customer.kode_pos, customer.catatan || '']
    );
    const customerId = custResult.insertId;

    let totalHarga = 0;
    const orderItems = [];
    for (const item of items) {
      const [product] = await conn.query('SELECT nama, harga, stok FROM products WHERE id = ?', [item.product_id]);
      if (product.length === 0) throw new Error(`Product ${item.product_id} not found`);
      if (product[0].stok < item.quantity) throw new Error(`Insufficient stock for ${product[0].nama}`);
      const subtotal = Number(product[0].harga) * item.quantity;
      totalHarga += subtotal;
      orderItems.push({ product_id: item.product_id, nama_produk: product[0].nama, harga: product[0].harga, quantity: item.quantity, subtotal });
      await conn.query('UPDATE products SET stok = stok - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    const grandTotal = totalHarga + ongkir;
    const date = new Date();
    const dateStr = date.toISOString().slice(0,10).replace(/-/g,'');
    const [countResult] = await conn.query('SELECT COUNT(*) as cnt FROM orders WHERE DATE(created_at) = CURDATE()');
    const orderNum = String(countResult[0].cnt + 1).padStart(4, '0');
    const kodePesanan = `INV-${dateStr}-${orderNum}`;

    const [orderResult] = await conn.query(
      `INSERT INTO orders (kode_pesanan, customer_id, total_harga, ongkir, grand_total, metode_pembayaran, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Menunggu Pembayaran')`,
      [kodePesanan, customerId, totalHarga, ongkir, grandTotal, metode_pembayaran]
    );
    const orderId = orderResult.insertId;

    for (const item of orderItems) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, nama_produk, harga, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.nama_produk, item.harga, item.quantity, item.subtotal]
      );
    }

    await conn.commit();
    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: orderId,
        kode_pesanan: kodePesanan,
        total_harga: totalHarga,
        ongkir,
        grand_total: grandTotal,
        status: 'Menunggu Pembayaran',
        metode_pembayaran,
        items: orderItems,
        created_at: new Date().toISOString()
      }
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Checkout failed', error: err.message });
  } finally {
    conn.release();
  }
};

const getOrders = async (req, res) => {
  try {
    const { email } = req.query;
    let sql = `SELECT o.*, c.nama as customer_nama, c.email as customer_email
               FROM orders o
               JOIN customers c ON o.customer_id = c.id`;
    const params = [];
    if (email) {
      sql += ' WHERE c.email = ?';
      params.push(email);
    }
    sql += ' ORDER BY o.created_at DESC LIMIT 20';
    const [orders] = await db.query(sql, params);
    for (const order of orders) {
      const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.items = items;
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, c.nama as customer_nama, c.email as customer_email, c.no_hp, c.alamat, c.provinsi, c.kota, c.kode_pos, c.catatan
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.id = ?`,
      [req.params.id]
    );
    if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });
    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orders[0].id]);
    orders[0].items = items;
    res.json(orders[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order', error: err.message });
  }
};

const getOrderByKode = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, c.nama as customer_nama, c.email as customer_email, c.no_hp, c.alamat, c.provinsi, c.kota, c.kode_pos, c.catatan
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.kode_pesanan = ?`,
      [req.params.kode]
    );
    if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });
    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orders[0].id]);
    orders[0].items = items;
    res.json(orders[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order', error: err.message });
  }
};

module.exports = { checkout, getOrders, getOrderById, getOrderByKode };

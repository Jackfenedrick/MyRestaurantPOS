const express = require('express');
const router  = express.Router();
const { getDB } = require('../database');

router.get('/', (req, res) => {
  res.json(getDB().all2(
    `SELECT o.*,t.number as table_number FROM orders o
     JOIN tables_list t ON t.id=o.table_id
     WHERE date(o.created_at)=date('now','localtime') ORDER BY o.id DESC`
  ));
});

router.post('/', (req, res) => {
  const db = getDB();
  const { table_id, items, gst_rate } = req.body;
  if (!table_id || !items || !items.length) return res.status(400).json({ error: 'Missing fields' });

  let order = db.get2(`SELECT * FROM orders WHERE table_id=? AND status='open' LIMIT 1`, [table_id]);

  if (!order) {
    db.run('INSERT INTO orders(table_id,gst_rate) VALUES(?,?)', [table_id, gst_rate || 5]);
    db.save();
    order = db.get2('SELECT * FROM orders WHERE id=(SELECT MAX(id) FROM orders)');
    db.run2(`UPDATE tables_list SET status='occupied' WHERE id=?`, [table_id]);
  } else {
    db.run2('UPDATE orders SET gst_rate=? WHERE id=?', [gst_rate || 5, order.id]);
    db.run2('DELETE FROM order_items WHERE order_id=?', [order.id]);
  }

  items.forEach(i => db.run(
    'INSERT INTO order_items(order_id,menu_item_id,name,price,quantity) VALUES(?,?,?,?,?)',
    [order.id, i.menu_item_id, i.name, i.price, i.quantity]
  ));
  db.save();

  res.json({ ...order, items: db.all2('SELECT * FROM order_items WHERE order_id=?', [order.id]) });
});

router.patch('/:id/pay', (req, res) => {
  const db    = getDB();
  const order = db.get2('SELECT * FROM orders WHERE id=?', [req.params.id]);
  if (!order) return res.status(404).json({ error: 'Not found' });
  db.run2(`UPDATE orders SET status='paid' WHERE id=?`, [req.params.id]);
  db.run2(`UPDATE tables_list SET status='free' WHERE id=?`, [order.table_id]);
  res.json({ message: 'Paid' });
});

router.get('/:id/bill', (req, res) => {
  const db    = getDB();
  const order = db.get2(
    `SELECT o.*,t.number as table_number FROM orders o
     JOIN tables_list t ON t.id=o.table_id WHERE o.id=?`,
    [req.params.id]
  );
  if (!order) return res.status(404).json({ error: 'Not found' });
  const items    = db.all2('SELECT * FROM order_items WHERE order_id=?', [req.params.id]);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const gst      = subtotal * (order.gst_rate / 100);
  res.json({ ...order, items, subtotal, gst, total: subtotal + gst });
});

module.exports = router;

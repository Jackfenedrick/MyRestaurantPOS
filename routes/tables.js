const express = require('express');
const router  = express.Router();
const { getDB } = require('../database');

router.get('/', (req, res) => {
  res.json(getDB().all2('SELECT * FROM tables_list ORDER BY number'));
});

router.get('/:id/order', (req, res) => {
  const db    = getDB();
  const order = db.get2(
    `SELECT o.*,t.number as table_number FROM orders o
     JOIN tables_list t ON t.id=o.table_id
     WHERE o.table_id=? AND o.status='open' ORDER BY o.id DESC LIMIT 1`,
    [req.params.id]
  );
  if (!order) return res.json(null);
  const items = db.all2('SELECT * FROM order_items WHERE order_id=?', [order.id]);
  res.json({ ...order, items });
});

module.exports = router;

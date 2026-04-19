const express = require('express');
const router  = express.Router();
const { getDB } = require('../database');

router.get('/', (req, res) => {
  res.json(getDB().all2('SELECT * FROM menu_items WHERE available=1 ORDER BY category,name'));
});

router.post('/', (req, res) => {
  const db = getDB();
  const { name, category, price, is_veg } = req.body;
  if (!name || !category || !price) return res.status(400).json({ error: 'Missing fields' });
  db.run2('INSERT INTO menu_items(name,category,price,is_veg) VALUES(?,?,?,?)',
    [name, category, parseFloat(price), is_veg ? 1 : 0]);
  res.status(201).json(db.get2('SELECT * FROM menu_items WHERE id=(SELECT MAX(id) FROM menu_items)'));
});

router.put('/:id', (req, res) => {
  const db = getDB();
  const { name, category, price, is_veg, available } = req.body;
  db.run2('UPDATE menu_items SET name=?,category=?,price=?,is_veg=?,available=? WHERE id=?',
    [name, category, parseFloat(price), is_veg ? 1 : 0, available ? 1 : 0, req.params.id]);
  res.json(db.get2('SELECT * FROM menu_items WHERE id=?', [req.params.id]));
});

router.delete('/:id', (req, res) => {
  getDB().run2('UPDATE menu_items SET available=0 WHERE id=?', [req.params.id]);
  res.json({ message: 'Removed' });
});

module.exports = router;

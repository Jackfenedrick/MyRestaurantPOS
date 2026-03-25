// ─────────────────────────────────────────────
//  Database Setup (database.js)
//  Uses sql.js — pure JavaScript, no build tools needed!
// ─────────────────────────────────────────────
const fs        = require('fs');
const path      = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = path.join(__dirname, 'pos.db');
let db;

async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.save = () => {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  };

  db.get2 = (sql, params = []) => {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    if (stmt.step()) { const row = stmt.getAsObject(); stmt.free(); return row; }
    stmt.free(); return null;
  };

  db.all2 = (sql, params = []) => {
    const result = db.exec(sql, params);
    if (!result.length) return [];
    const { columns, values } = result[0];
    return values.map(row => { const obj = {}; columns.forEach((col,i) => { obj[col]=row[i]; }); return obj; });
  };

  db.run2 = (sql, params = []) => { db.run(sql, params); db.save(); };

  db.run(`CREATE TABLE IF NOT EXISTS menu_items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category TEXT NOT NULL, price REAL NOT NULL, is_veg INTEGER DEFAULT 1, available INTEGER DEFAULT 1)`);
  db.run(`CREATE TABLE IF NOT EXISTS tables_list (id INTEGER PRIMARY KEY AUTOINCREMENT, number INTEGER NOT NULL UNIQUE, status TEXT DEFAULT 'free')`);
  db.run(`CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, table_id INTEGER NOT NULL, status TEXT DEFAULT 'open', gst_rate REAL DEFAULT 5, created_at TEXT DEFAULT (datetime('now','localtime')))`);
  db.run(`CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, menu_item_id INTEGER NOT NULL, name TEXT NOT NULL, price REAL NOT NULL, quantity INTEGER NOT NULL DEFAULT 1)`);
  db.save();

  const tableCount = db.get2('SELECT COUNT(*) as c FROM tables_list').c;
  if (tableCount === 0) {
    for (let i = 1; i <= 10; i++) db.run('INSERT INTO tables_list (number) VALUES (?)', [i]);
    db.save(); console.log('✅  10 tables created');
  }

  const menuCount = db.get2('SELECT COUNT(*) as c FROM menu_items').c;
  if (menuCount === 0) {
    const items = [
      ['Veg Soup','Starters',80,1],['Paneer Tikka','Starters',160,1],['Chicken 65','Starters',180,0],
      ['Fish Fry','Starters',200,0],['Gobi Manchurian','Starters',130,1],['Egg Fry','Starters',90,0],
      ['Dal Tadka','Mains',120,1],['Paneer Butter Masala','Mains',180,1],['Chicken Curry','Mains',200,0],
      ['Mutton Gravy','Mains',260,0],['Egg Curry','Mains',130,0],['Mix Veg','Mains',140,1],
      ['Steamed Rice','Rice & Breads',60,1],['Jeera Rice','Rice & Breads',90,1],
      ['Chicken Biryani','Rice & Breads',220,0],['Veg Biryani','Rice & Breads',160,1],
      ['Chapati','Rice & Breads',20,1],['Parotta','Rice & Breads',25,1],
      ['Coffee','Beverages',40,1],['Tea','Beverages',25,1],['Lassi','Beverages',70,1],
      ['Fresh Lime Soda','Beverages',50,1],['Gulab Jamun','Desserts',60,1],['Ice Cream','Desserts',80,1],
    ];
    items.forEach(([name,category,price,is_veg]) => db.run('INSERT INTO menu_items (name,category,price,is_veg) VALUES (?,?,?,?)',[name,category,price,is_veg]));
    db.save(); console.log('✅  Menu items seeded');
  }

  console.log('✅  Database ready');
  return db;
}

module.exports = { initDB, getDB: () => db };

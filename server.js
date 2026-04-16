// ─────────────────────────────────────────────
//  Restaurant POS — Main Server (server.js)
// ─────────────────────────────────────────────
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');

app.use(session({
  secret: 'myrestaurantpos_secret',
  resave: false,
  saveUninitialized: false
}));

// Default login: admin / admin123
const USERS = [
  { username: 'admin', password: bcrypt.hashSync('admin123', 10), role: 'owner' },
  { username: 'staff', password: bcrypt.hashSync('staff123', 10), role: 'staff' }
];

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username);
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user = user;
    res.redirect('/');
  } else {
    res.redirect('/login.html?error=1');
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login.html');
});

// Protect all pages
app.use((req, res, next) => {
  if (req.session.user || req.path === '/login.html' || req.path === '/login') {
    next();
  } else {
    res.redirect('/login.html');
  }
});
const cors    = require('cors');
const path    = require('path');
const { initDB } = require('./database');

const app  = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Start DB first, then routes, then listen
initDB().then(() => {
  const menuRoutes  = require('./routes/menu');
  const orderRoutes = require('./routes/orders');
  const tableRoutes = require('./routes/tables');

  app.use('/api/menu',   menuRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/tables', tableRoutes);

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`✅  Server running at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start:', err);
});

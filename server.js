// ─────────────────────────────────────────────
//  Restaurant POS — Main Server (server.js)
// ─────────────────────────────────────────────
const express = require('express');
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

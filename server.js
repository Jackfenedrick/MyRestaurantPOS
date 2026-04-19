const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const { initDB } = require('./database');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

initDB().then(() => {
  app.use('/api/menu',   require('./routes/menu'));
  app.use('/api/orders', require('./routes/orders'));
  app.use('/api/tables', require('./routes/tables'));

  // Root → login page
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  });

  // pos page
  app.get('/pos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pos.html'));
  });

  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Failed to start:', err);
});

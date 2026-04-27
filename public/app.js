// ─────────────────────────────────────────────
//  Restaurant POS — Frontend (public/app.js)
// ─────────────────────────────────────────────

const API = '';   // empty = same origin (localhost:3000)

// ── State ─────────────────────────────────────
let menuItems    = [];
let tables       = [];
let currentTableId = null;
let currentOrderId = null;
let cart         = [];       // { menu_item_id, name, price, quantity }
let currentCat   = 'All';

// ── Init ──────────────────────────────────────
window.onload = () => {
  loadMenu();
  loadTables();
};

// ── Page Navigation ───────────────────────────
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  if (page === 'menu-admin') loadMenuAdmin();
  if (page === 'orders')     loadOrders();
}

// ══════════════════════════════════════════════
// MENU
// ══════════════════════════════════════════════
async function loadMenu() {
  const res  = await fetch(`${API}/api/menu`);
  menuItems  = await res.json();
  buildCatBar();
  renderMenu();
}

function buildCatBar() {
  const cats = ['All', ...new Set(menuItems.map(m => m.category))];
  const bar  = document.getElementById('cat-bar');
  bar.innerHTML = cats.map(c =>
    `<button class="cat-btn ${c === currentCat ? 'active' : ''}"
      onclick="selectCat('${c}')">${c}</button>`
  ).join('');
}

function selectCat(cat) {
  currentCat = cat;
  buildCatBar();
  renderMenu();
}

function filterMenu() {
  renderMenu();
}

function renderMenu() {
  const q    = document.getElementById('search').value.toLowerCase();
  const grid = document.getElementById('menu-grid');
  const filtered = menuItems.filter(m =>
    (currentCat === 'All' || m.category === currentCat) &&
    m.name.toLowerCase().includes(q)
  );

  if (!filtered.length) {
    grid.innerHTML = '<p class="empty-msg">No items found</p>';
    return;
  }

  grid.innerHTML = filtered.map(m => {
    const imgUrl = getFoodImage(m.name, m.category);
    return `
      <div class="menu-card" onclick="addToCart(${m.id})">
        <img class="mc-img" src="${imgUrl}" alt="${m.name}"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="mc-img-placeholder" style="display:none">${m.is_veg ? '🥗' : '🍗'}</div>
        <div class="mc-body">
          <div class="mc-veg">${m.is_veg ? '🟢 Veg' : '🔴 Non-veg'}</div>
          <div class="mc-name">${m.name}</div>
          <div class="mc-price">₹${m.price}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ══════════════════════════════════════════════
// TABLES
// ══════════════════════════════════════════════
async function loadTables() {
  const res = await fetch(`${API}/api/tables`);
  tables    = await res.json();
  renderTableGrid();
}

function renderTableGrid() {
  const grid = document.getElementById('table-grid');
  grid.innerHTML = tables.map(t => `
    <button class="table-btn ${t.status === 'occupied' ? 'occupied' : ''} ${t.id === currentTableId ? 'active' : ''}"
      onclick="selectTable(${t.id}, ${t.number})">
      T${t.number}
    </button>
  `).join('');
}

async function selectTable(id, number) {
  currentTableId = id;
  document.getElementById('active-table-label').textContent = 'Table ' + number;

  // Try to load existing open order
  const res   = await fetch(`${API}/api/tables/${id}/order`);
  const order = await res.json();

  if (order) {
    currentOrderId = order.id;
    cart = order.items.map(i => ({
      menu_item_id: i.menu_item_id,
      name:         i.name,
      price:        i.price,
      quantity:     i.quantity
    }));
  } else {
    currentOrderId = null;
    cart = [];
  }

  renderTableGrid();
  renderBill();
}

// ══════════════════════════════════════════════
// CART
// ══════════════════════════════════════════════
function addToCart(menuItemId) {
  if (!currentTableId) {
    alert('Please select a table first!');
    return;
  }
  const item = menuItems.find(m => m.id === menuItemId);
  const existing = cart.find(c => c.menu_item_id === menuItemId);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ menu_item_id: menuItemId, name: item.name, price: item.price, quantity: 1 });
  }
  renderBill();
}

function changeQty(menuItemId, delta) {
  const idx = cart.findIndex(c => c.menu_item_id === menuItemId);
  if (idx < 0) return;
  cart[idx].quantity += delta;
  if (cart[idx].quantity <= 0) cart.splice(idx, 1);
  renderBill();
}

function clearOrder() {
  if (!confirm('Clear all items from this order?')) return;
  cart = [];
  renderBill();
}

function renderBill() {
  const el = document.getElementById('order-items');

  if (!cart.length) {
    el.innerHTML = '<p class="empty-msg">No items yet. Pick a table and add items.</p>';
    setTotals(0, 0);
    return;
  }

  el.innerHTML = cart.map(item => `
    <div class="order-row">
      <span class="or-name">${item.name}</span>
      <div class="qty-ctrl">
        <button class="qty-btn" onclick="changeQty(${item.menu_item_id}, -1)">−</button>
        <span class="qty-num">${item.quantity}</span>
        <button class="qty-btn" onclick="changeQty(${item.menu_item_id}, 1)">+</button>
      </div>
      <span class="or-price">₹${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join('');

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const rate     = parseFloat(document.getElementById('gst-select').value) / 100;
  setTotals(subtotal, subtotal * rate);
}

function setTotals(sub, gst) {
  const rate = document.getElementById('gst-select').value;
  document.getElementById('subtotal').textContent  = '₹' + sub.toFixed(2);
  document.getElementById('gst-label').textContent = 'GST (' + rate + '%)';
  document.getElementById('gst-amt').textContent   = '₹' + gst.toFixed(2);
  document.getElementById('total').textContent     = '₹' + (sub + gst).toFixed(2);
}

// ══════════════════════════════════════════════
// SAVE ORDER
// ══════════════════════════════════════════════
async function saveOrder() {
  if (!currentTableId) { alert('Select a table first!'); return; }
  if (!cart.length)     { alert('Add items first!'); return; }

  const gst_rate = parseFloat(document.getElementById('gst-select').value);
  const res = await fetch(`${API}/api/orders`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ table_id: currentTableId, items: cart, gst_rate })
  });
  const order = await res.json();
  currentOrderId = order.id;

  await loadTables();        // refresh table statuses
  renderTableGrid();
  alert('✅ Order saved!');
}

// ══════════════════════════════════════════════
// PRINT BILL
// ══════════════════════════════════════════════
function printBill() {
  if (!cart.length) { alert('No items in order!'); return; }

  const table = tables.find(t => t.id === currentTableId);
  const tNum  = table ? table.number : '?';
  const rate  = parseFloat(document.getElementById('gst-select').value);
  const sub   = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const gst   = sub * rate / 100;
  const total = sub + gst;
  const now   = new Date();
  const dateStr = now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const rows = cart.map(i =>
    `<tr>
      <td>${i.name}</td>
      <td style="text-align:center">${i.quantity}</td>
      <td style="text-align:right">₹${i.price.toFixed(2)}</td>
      <td style="text-align:right">₹${(i.price * i.quantity).toFixed(2)}</td>
    </tr>`
  ).join('');

  const win = window.open('', '_blank', 'width=400,height=620');
  win.document.write(`
    <!DOCTYPE html><html><head><title>Bill - Table ${tNum}</title>
    <style>
      body { font-family: 'Courier New', monospace; padding: 24px; max-width: 340px; margin: auto; }
      h1 { text-align: center; font-size: 18px; margin-bottom: 4px; }
      .sub { text-align: center; font-size: 12px; color: #666; margin-bottom: 12px; }
      table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 12px 0; }
      th { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 2px; text-align: left; }
      td { padding: 5px 2px; }
      .divider { border-top: 1px dashed #000; margin: 8px 0; }
      .row { display: flex; justify-content: space-between; font-size: 13px; padding: 2px 0; }
      .grand { font-size: 16px; font-weight: bold; margin-top: 6px; }
      .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #888; }
      .print-btn { width: 100%; padding: 10px; margin-top: 12px; cursor: pointer; font-size: 14px; }
      @media print { .print-btn { display: none; } }
    </style></head><body>
    <h1>🍽 My Restaurant</h1>
    <div class="sub">
      Table: ${tNum} &nbsp;|&nbsp; ${dateStr}
      ${currentOrderId ? '<br>Order #' + currentOrderId : ''}
    </div>
    <table>
      <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amt</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="divider"></div>
    <div class="row"><span>Subtotal</span><span>₹${sub.toFixed(2)}</span></div>
    <div class="row"><span>GST (${rate}%)</span><span>₹${gst.toFixed(2)}</span></div>
    <div class="divider"></div>
    <div class="row grand"><span>TOTAL</span><span>₹${total.toFixed(2)}</span></div>
    <div class="footer">Thank you for dining with us! Please visit again 🙏</div>
    <button class="print-btn" onclick="window.print()">🖨 Print</button>
    </body></html>
  `);
  win.document.close();
}

// ══════════════════════════════════════════════
// MARK AS PAID
// ══════════════════════════════════════════════
async function markPaid() {
  if (!currentOrderId) {
    alert('Save the order first before marking as paid.');
    return;
  }
  if (!confirm('Mark this order as paid and free the table?')) return;

  await fetch(`${API}/api/orders/${currentOrderId}/pay`, { method: 'PATCH' });
  cart = [];
  currentOrderId = null;
  await loadTables();
  renderTableGrid();
  renderBill();
  alert('✅ Table is now free!');
}

// ══════════════════════════════════════════════
// MENU ADMIN PAGE
// ══════════════════════════════════════════════
async function loadMenuAdmin() {
  const res   = await fetch(`${API}/api/menu`);
  const items = await res.json();
  const body  = document.getElementById('admin-table-body');

  if (!items.length) {
    body.innerHTML = '<tr><td colspan="6" class="loading">No menu items found</td></tr>';
    return;
  }

  body.innerHTML = items.map((item, i) => {
    const imgUrl = getFoodImage(item.name, item.category);
    return `
      <tr>
        <td>${i + 1}</td>
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <img src="${imgUrl}" alt="${item.name}"
              style="width:44px;height:44px;object-fit:cover;border-radius:8px;flex-shrink:0;background:#f0f0ee;"
              onerror="this.src='';this.style.display='none'">
            <span>${item.name}</span>
          </div>
        </td>
        <td>${item.category}</td>
        <td>₹${item.price}</td>
        <td><span class="badge ${item.is_veg ? 'badge-veg' : 'badge-nonveg'}">${item.is_veg ? 'Veg' : 'Non-veg'}</span></td>
        <td>
          <button class="link-btn" onclick="openEditModal(${item.id})">Edit</button>
          <button class="link-btn danger" onclick="deleteMenuItem(${item.id})">Remove</button>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddModal() {
  document.getElementById('modal-title').textContent = 'Add Menu Item';
  document.getElementById('edit-id').value    = '';
  document.getElementById('edit-name').value  = '';
  document.getElementById('edit-price').value = '';
  document.getElementById('edit-veg').checked = true;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

async function openEditModal(id) {
  const res  = await fetch(`${API}/api/menu`);
  const all  = await res.json();
  const item = all.find(m => m.id === id);
  if (!item) return;

  document.getElementById('modal-title').textContent      = 'Edit Menu Item';
  document.getElementById('edit-id').value                = item.id;
  document.getElementById('edit-name').value              = item.name;
  document.getElementById('edit-category').value          = item.category;
  document.getElementById('edit-price').value             = item.price;
  document.getElementById('edit-veg').checked             = item.is_veg === 1;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

async function saveMenuItem() {
  const id       = document.getElementById('edit-id').value;
  const name     = document.getElementById('edit-name').value.trim();
  const category = document.getElementById('edit-category').value;
  const price    = document.getElementById('edit-price').value;
  const is_veg   = document.getElementById('edit-veg').checked;

  if (!name || !price) { alert('Name and price are required!'); return; }

  const body = { name, category, price, is_veg, available: 1 };

  if (id) {
    await fetch(`${API}/api/menu/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body)
    });
  } else {
    await fetch(`${API}/api/menu`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body)
    });
  }

  closeModal();
  loadMenu();
  loadMenuAdmin();
}

async function deleteMenuItem(id) {
  if (!confirm('Remove this item from the menu?')) return;
  await fetch(`${API}/api/menu/${id}`, { method: 'DELETE' });
  loadMenu();
  loadMenuAdmin();
}

// ══════════════════════════════════════════════
// ORDERS PAGE
// ══════════════════════════════════════════════
async function loadOrders() {
  const res    = await fetch(`${API}/api/orders`);
  const orders = await res.json();
  const body   = document.getElementById('orders-table-body');

  if (!orders.length) {
    body.innerHTML = '<tr><td colspan="6" class="loading">No orders today</td></tr>';
    return;
  }

  body.innerHTML = orders.map(o => `
    <tr>
      <td>#${o.id}</td>
      <td>Table ${o.table_number}</td>
      <td><span class="badge ${o.status === 'paid' ? 'badge-paid' : 'badge-open'}">${o.status}</span></td>
      <td>${o.gst_rate}%</td>
      <td>${o.created_at}</td>
      <td><button class="link-btn" onclick="viewOrderBill(${o.id})">View Bill</button></td>
    </tr>
  `).join('');
}

async function viewOrderBill(orderId) {
  const res   = await fetch(`${API}/api/orders/${orderId}/bill`);
  const order = await res.json();

  const rows = order.items.map(i =>
    `<tr>
      <td>${i.name}</td>
      <td style="text-align:center">${i.quantity}</td>
      <td style="text-align:right">₹${i.price.toFixed(2)}</td>
      <td style="text-align:right">₹${(i.price * i.quantity).toFixed(2)}</td>
    </tr>`
  ).join('');

  const win = window.open('', '_blank', 'width=400,height=600');
  win.document.write(`
    <!DOCTYPE html><html><head><title>Order #${order.id}</title>
    <style>
      body { font-family: 'Courier New', monospace; padding: 24px; max-width: 340px; margin: auto; }
      h1 { text-align:center; font-size:18px; }
      .sub { text-align:center; font-size:12px; color:#666; margin-bottom:12px; }
      table { width:100%; border-collapse:collapse; font-size:13px; margin:12px 0; }
      th { border-top:1px dashed #000; border-bottom:1px dashed #000; padding:5px 2px; text-align:left; }
      td { padding:5px 2px; }
      .row { display:flex; justify-content:space-between; font-size:13px; padding:2px 0; }
      .grand { font-size:16px; font-weight:bold; margin-top:6px; border-top:1px dashed #000; padding-top:6px; }
      .footer { text-align:center; margin-top:20px; font-size:11px; color:#888; }
      .print-btn { width:100%; padding:10px; margin-top:12px; cursor:pointer; }
      @media print { .print-btn { display:none; } }
    </style></head><body>
    <h1>🍽 My Restaurant</h1>
    <div class="sub">Table ${order.table_number} &nbsp;|&nbsp; Order #${order.id}<br>${order.created_at} &nbsp;|&nbsp; Status: ${order.status}</div>
    <table>
      <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amt</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="row"><span>Subtotal</span><span>₹${order.subtotal.toFixed(2)}</span></div>
    <div class="row"><span>GST (${order.gst_rate}%)</span><span>₹${order.gst.toFixed(2)}</span></div>
    <div class="row grand"><span>TOTAL</span><span>₹${order.total.toFixed(2)}</span></div>
    <div class="footer">Thank you for dining with us! 🙏</div>
    <button class="print-btn" onclick="window.print()">🖨 Print</button>
    </body></html>
  `);
  win.document.close();
}

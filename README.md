# 🍽 Restaurant POS System
## Step-by-Step Setup Guide for Beginners

---

## WHAT YOU NEED FIRST (Install these once)

### 1. Install Node.js
- Go to: https://nodejs.org
- Download the **LTS version** (green button)
- Install it — keep clicking Next/Continue

**Check it worked:** Open Terminal (Mac) or Command Prompt (Windows)
Type: `node --version`
You should see something like: `v20.11.0`

### 2. Install VS Code (if you haven't)
- Go to: https://code.visualstudio.com
- Download and install

---

## YOUR PROJECT FILES

This folder contains:
```
restaurant-pos/
├── server.js          ← Main backend server
├── database.js        ← Database setup (auto-creates pos.db)
├── package.json       ← Project info & dependencies list
├── routes/
│   ├── menu.js        ← Menu API
│   ├── orders.js      ← Orders API
│   └── tables.js      ← Tables API
└── public/
    ├── index.html     ← Frontend page
    ├── style.css      ← Styling
    └── app.js         ← Frontend logic
```

---

## HOW TO RUN (Step by Step)

### Step 1: Open the project in VS Code
- Open VS Code
- Click **File → Open Folder**
- Select the `restaurant-pos` folder

### Step 2: Open the Terminal in VS Code
- Click **Terminal → New Terminal** (top menu)
- A black/dark panel appears at the bottom

### Step 3: Install dependencies
Type this and press Enter:
```
npm install
```
Wait for it to finish. You'll see a `node_modules` folder appear.

### Step 4: Start the server
Type this and press Enter:
```
npm start
```
You should see:
```
✅  Server running at http://localhost:3000
✅  10 tables created
✅  Menu items seeded
```

### Step 5: Open in browser
- Open Chrome or any browser
- Go to: **http://localhost:3000**
- Your POS system is running! 🎉

---

## HOW TO USE THE POS

### Taking an Order:
1. Click a **table button** (T1, T2, etc.) in the bill panel
2. Browse the menu on the left — click any item to add it
3. Use **+** / **−** buttons to change quantities
4. Select the **GST rate** (5% default)
5. Click **💾 Save** to save the order to the database
6. Click **🖨 Print Bill** to open a printable bill

### After Payment:
- Click **✅ Mark as Paid & Free Table** — this frees up the table

### Managing Menu Items:
- Click **Menu** in the top navigation
- Click **+ Add Item** to add new dishes
- Click **Edit** to change price/name
- Click **Remove** to hide an item

### Viewing Today's Orders:
- Click **Orders** in the top navigation
- See all orders with status (open/paid)
- Click **View Bill** to see full bill

---

## HOW TO STOP THE SERVER
In the VS Code terminal, press: **Ctrl + C**

## HOW TO RESTART
In terminal, type: `npm start`

---

## TIPS FOR BEGINNERS

**Want live reload during development?**
Use this instead of `npm start`:
```
npm run dev
```
This uses `nodemon` — it auto-restarts when you change code.

**Where is data saved?**
A file called `pos.db` will appear in your folder.
This is your database — don't delete it or you'll lose your data!

**Want to change the restaurant name?**
- Open `public/index.html`
- Find "My Restaurant" and change it to your restaurant name
- Also change it in `public/app.js` (search for "My Restaurant")

**Want to change number of tables?**
- Open `database.js`
- Find `for (let i = 1; i <= 10; i++)` and change 10 to any number
- Delete `pos.db` and restart — it will create fresh tables

**Want to add more menu categories?**
- Open `public/index.html`
- Find the `<select id="edit-category">` section
- Add a new `<option>` line with your category name

---

## TROUBLESHOOTING

**"npm is not recognized"**
→ Node.js is not installed. Go to nodejs.org and install it.

**"Port 3000 is already in use"**
→ Something else is using port 3000. In server.js, change `3000` to `3001` and visit http://localhost:3001

**Blank page or errors in browser**
→ Make sure the terminal shows "Server running" before opening the browser
→ Check the terminal for error messages

**Data not saving**
→ Make sure you clicked 💾 Save before printing the bill

---

## CUSTOMIZATION CHECKLIST
- [ ] Change restaurant name in index.html and app.js
- [ ] Update menu items via the Menu admin page
- [ ] Set your default GST rate
- [ ] Change number of tables in database.js if needed

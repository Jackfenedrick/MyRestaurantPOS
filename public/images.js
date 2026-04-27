// ─────────────────────────────────────────────
//  Food Images Map (public/images.js)
//  Free images from Unsplash — no API key needed
//  Format: ?w=300&q=70 keeps them small & fast
// ─────────────────────────────────────────────
const FOOD_IMAGES = {
  // Starters
  'Veg Soup':             'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&q=70',
  'Paneer Tikka':         'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&q=70',
  'Chicken 65':           'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=300&q=70',
  'Fish Fry':             'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=300&q=70',
  'Gobi Manchurian':      'https://images.unsplash.com/photo-1645177628172-a94c1f96didb?w=300&q=70',
  'Egg Fry':              'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=300&q=70',
  // Mains
  'Dal Tadka':            'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=70',
  'Paneer Butter Masala': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&q=70',
  'Chicken Curry':        'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&q=70',
  'Mutton Gravy':         'https://images.unsplash.com/photo-1545247181-516773cae754?w=300&q=70',
  'Egg Curry':            'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300&q=70',
  'Mix Veg':              'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=70',
  // Rice & Breads
  'Steamed Rice':         'https://images.unsplash.com/photo-1536304993881-ff86e0c9b9b8?w=300&q=70',
  'Jeera Rice':           'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&q=70',
  'Chicken Biryani':      'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=300&q=70',
  'Veg Biryani':          'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&q=70',
  'Chapati':              'https://images.unsplash.com/photo-1574484284002-952d92456975?w=300&q=70',
  'Parotta':              'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=300&q=70',
  // Beverages
  'Coffee':               'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=70',
  'Tea':                  'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&q=70',
  'Lassi':                'https://images.unsplash.com/photo-1571006682260-be8e4ba3c4ef?w=300&q=70',
  'Fresh Lime Soda':      'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=300&q=70',
  // Desserts
  'Gulab Jamun':          'https://images.unsplash.com/photo-1601303516534-bf4c4b72f15c?w=300&q=70',
  'Ice Cream':            'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=300&q=70',
};

// Fallback image per category
const CATEGORY_FALLBACK = {
  'Starters':     'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=300&q=70',
  'Mains':        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=70',
  'Rice & Breads':'https://images.unsplash.com/photo-1536304993881-ff86e0c9b9b8?w=300&q=70',
  'Beverages':    'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&q=70',
  'Desserts':     'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&q=70',
};

function getFoodImage(name, category) {
  return FOOD_IMAGES[name] || CATEGORY_FALLBACK[category] ||
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=70';
}

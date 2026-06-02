import { Product, Order, Review } from './types';

export const PRODUCTS: Product[] = [
  { id: 1,  name: "Smart Air Purifier Pro",        category: "appliances", price: 89.99,  original: 119.99, rating: 4.8, reviews: 234,  emoji: "🌬️", desc: "HEPA H13 filter removes 99.97% of allergens. Ultra-quiet sleep mode, smart app control. Covers up to 500 sq ft." },
  { id: 2,  name: "High-Speed Blender X5",         category: "appliances", price: 64.99,  original: 84.99,  rating: 4.6, reviews: 189,  emoji: "🥤", desc: "2000W professional-grade motor. 8 preset programs including smoothie, soup, and ice crush. BPA-free 2L jug." },
  { id: 3,  name: "Robotic Vacuum Cleaner",        category: "appliances", price: 149.99, original: 199.99, rating: 4.9, reviews: 512,  emoji: "🤖", desc: "LiDAR navigation, auto-empty base, 180-min battery life. Works with Alexa & Google Assistant." },
  { id: 4,  name: "Electric Kettle 1.7L",          category: "appliances", price: 34.99,  original: null,   rating: 4.5, reviews: 98,   emoji: "☕", desc: "Precise temperature control (40–100°C). Keep-warm function for 2 hours. Fast 2200W boil. BPA-free." },
  { id: 5,  name: "Smart Rice Cooker",             category: "appliances", price: 54.99,  original: 69.99,  rating: 4.7, reviews: 303,  emoji: "🍚", desc: "Fuzzy logic AI adjusts cooking time. 10-cup capacity. Multiple modes: white rice, porridge, steam, slow cook." },
  { id: 6,  name: "Air Fryer 5.5L",               category: "appliances", price: 79.99,  original: 99.99,  rating: 4.8, reviews: 445,  emoji: "🍗", desc: "360° rapid air technology. 8 preset cooking modes. Dishwasher-safe basket. Up to 80% less fat." },
  { id: 7,  name: "Organic Green Tea (50 bags)",   category: "food",       price: 12.99,  original: null,   rating: 4.7, reviews: 867,  emoji: "🍵", desc: "Premium Japanese Sencha. Certified organic, no artificial flavors. Rich in antioxidants and L-theanine." },
  { id: 8,  name: "Cold Brew Coffee Pack",         category: "food",       price: 18.99,  original: 22.99,  rating: 4.6, reviews: 321,  emoji: "🧋", desc: "Single-origin Colombian beans. 200ml concentrate = 4 servings. Smooth, low-acid flavor profile." },
  { id: 9,  name: "Mixed Nut & Fruit Box",         category: "food",       price: 24.99,  original: 29.99,  rating: 4.5, reviews: 156,  emoji: "🥜", desc: "Premium assortment: almonds, cashews, walnuts, cranberries, mango. No added sugar. 500g resealable box." },
  { id: 10, name: "Sparkling Mineral Water (12pk)",category: "food",       price: 15.99,  original: null,   rating: 4.4, reviews: 78,   emoji: "💧", desc: "Natural mineral water from Vietnamese highlands. Lightly carbonated. No added sugar or artificial flavors." },
  { id: 11, name: "Artisan Dark Chocolate",        category: "food",       price: 9.99,   original: 12.99,  rating: 4.9, reviews: 634,  emoji: "🍫", desc: "72% cacao single-origin Ecuador. Vegan, gluten-free. Notes of berry and caramel. 100g bar." },
  { id: 12, name: "Kombucha Variety Pack",         category: "food",       price: 29.99,  original: 35.99,  rating: 4.6, reviews: 189,  emoji: "🫙", desc: "Live cultures, gut-friendly probiotics. 6 flavors: ginger-lemon, blueberry, mango, original, raspberry, peach." },
  { id: 13, name: "Vitamin C Brightening Serum",  category: "beauty",     price: 38.99,  original: 49.99,  rating: 4.8, reviews: 923,  emoji: "✨", desc: "20% Vitamin C + Ferulic Acid. Reduces dark spots, boosts collagen. Suitable for all skin types. 30ml." },
  { id: 14, name: "Hyaluronic Acid Moisturizer",  category: "beauty",     price: 29.99,  original: null,   rating: 4.7, reviews: 445,  emoji: "💧", desc: "Multi-weight hyaluronic acid for deep and surface hydration. Fragrance-free, dermatologist tested. 50ml." },
  { id: 15, name: "Retinol Night Cream",          category: "beauty",     price: 44.99,  original: 54.99,  rating: 4.6, reviews: 287,  emoji: "🌙", desc: "0.3% encapsulated retinol with peptides. Reduces fine lines overnight. Gentle enough for daily use. 50ml." },
  { id: 16, name: "SPF 50 Sunscreen Fluid",       category: "beauty",     price: 22.99,  original: 28.99,  rating: 4.9, reviews: 1205, emoji: "☀️", desc: "Lightweight fluid, invisible finish. UVA/UVB broad spectrum. Water-resistant 80 min. Reef-safe formula. 50ml." },
  { id: 17, name: "Niacinamide Toner",            category: "beauty",     price: 18.99,  original: null,   rating: 4.5, reviews: 312,  emoji: "🧴", desc: "10% Niacinamide + Zinc. Minimizes pores, controls oil, evens skin tone. Alcohol-free. 200ml." },
  { id: 18, name: "Lash & Brow Growth Serum",     category: "beauty",     price: 34.99,  original: 42.99,  rating: 4.7, reviews: 198,  emoji: "👁️", desc: "Peptide-enriched formula. Clinically shown to increase lash density by 25% in 4 weeks. 3ml precision applicator." },
];

export const INITIAL_ORDERS: Order[] = [
  { id: "#AM72841", date: "May 20, 2025", status: "delivered",  payment: "Credit Card",   items: [{ pid: 13, qty: 1 }, { pid: 16, qty: 2 }] },
  { id: "#AM61023", date: "May 14, 2025", status: "shipping",   payment: "MoMo",          items: [{ pid: 3, qty: 1 }] },
  { id: "#AM55890", date: "May 5, 2025",  status: "processing", payment: "Bank Transfer", items: [{ pid: 7, qty: 3 }, { pid: 11, qty: 2 }, { pid: 9, qty: 1 }] },
  { id: "#AM48234", date: "Apr 28, 2025", status: "delivered",  payment: "COD",           items: [{ pid: 6, qty: 1 }, { pid: 8, qty: 2 }] },
  { id: "#AM43100", date: "Apr 15, 2025", status: "cancelled",  payment: "Credit Card",   items: [{ pid: 15, qty: 1 }] },
  { id: "#AM39876", date: "Apr 2, 2025",  status: "delivered",  payment: "MoMo",          items: [{ pid: 1, qty: 1 }, { pid: 17, qty: 1 }] },
  { id: "#AM31456", date: "Mar 20, 2025", status: "delivered",  payment: "Credit Card",   items: [{ pid: 2, qty: 1 }, { pid: 10, qty: 4 }] },
];

export const MY_REVIEWS: Review[] = [
  { pid: 13, rating: 5, title: "Absolute game-changer for my skin!", body: "I have been using this serum for 2 months now and the difference is incredible. Dark spots have visibly faded and my skin looks so much brighter.", pros: "Visible results, lightweight, absorbs fast", cons: "A bit pricey but worth it", date: "May 18, 2025", helpful: 24 },
  { pid: 16, rating: 5, title: "Best sunscreen I've ever tried",      body: "No white cast, comfortable to wear all day. Reapplying is easy and it doesn't feel greasy at all. Would 100% recommend.",                        pros: "No white cast, reef-safe, water resistant", cons: "Wish it came in larger size", date: "May 10, 2025", helpful: 18 },
  { pid: 3,  rating: 4, title: "Great robot vacuum, almost perfect",  body: "Navigation is impressively smart and the auto-empty base is super convenient. Docks reliably every time. App can be slightly buggy.",             pros: "Great navigation, quiet, long battery",    cons: "App has minor bugs",              date: "Apr 30, 2025", helpful: 31 },
  { pid: 7,  rating: 5, title: "My daily morning ritual",             body: "Beautiful fragrance, calming, and you can really taste the quality of the leaves. Switched from coffee and feeling much better.",                   pros: "Great taste, calming, organic",           cons: "None honestly",                   date: "Apr 12, 2025", helpful: 15 },
  { pid: 11, rating: 5, title: "Best dark chocolate, period.",        body: "Rich, complex flavor with hints of berry. Not too sweet. Perfect for a treat without guilt. Vegan and gluten-free is a bonus.",                    pros: "Incredible flavor, ethically sourced",    cons: "Disappears too fast!",            date: "Mar 28, 2025", helpful: 9  },
];

export const PENDING_PIDS = [6, 8, 17];
export const STAR_LABELS = ["", "Terrible", "Bad", "Okay", "Good", "Excellent"];

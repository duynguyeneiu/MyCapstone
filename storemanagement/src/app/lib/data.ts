import { Product, Order, Review } from './types';

export const PRODUCTS: Product[] = [
  // ── Beverages › Water & Soft Drinks ────────────────────────────────────────
  { id: 1,  name: "Sparkling Mineral Water 12pk",        category: "beverages",     subcategory: "water-soft-drinks", price: 15.99, original: null,  rating: 4.4, reviews: 78,   emoji: "💧", desc: "Natural mineral water from Vietnamese highlands. Lightly carbonated. No added sugar or artificial flavors. 12 × 500 ml." },
  { id: 2,  name: "Kombucha Variety Pack (6 bottles)",   category: "beverages",     subcategory: "water-soft-drinks", price: 29.99, original: 35.99, rating: 4.6, reviews: 189,  emoji: "🫙", desc: "Live cultures, gut-friendly probiotics. 6 flavors: ginger-lemon, blueberry, mango, original, raspberry, peach." },
  { id: 3,  name: "Citrus & Berry Soda Mix 24pk",        category: "beverages",     subcategory: "water-soft-drinks", price: 22.99, original: null,  rating: 4.3, reviews: 134,  emoji: "🧃", desc: "Assorted citrus and berry sparkling sodas. Low-sugar recipe, no artificial colors. 24 × 330 ml cans." },

  // ── Beverages › Tea & Coffee ───────────────────────────────────────────────
  { id: 4,  name: "Organic Green Tea (50 bags)",         category: "beverages",     subcategory: "tea-coffee",        price: 12.99, original: null,  rating: 4.7, reviews: 867,  emoji: "🍵", desc: "Premium Japanese Sencha. Certified organic, no artificial flavors. Rich in antioxidants and L-theanine." },
  { id: 5,  name: "Cold Brew Coffee Concentrate Pack",   category: "beverages",     subcategory: "tea-coffee",        price: 18.99, original: 22.99, rating: 4.6, reviews: 321,  emoji: "🧋", desc: "Single-origin Colombian beans. 200 ml concentrate = 4 servings. Smooth, low-acid flavor profile." },
  { id: 6,  name: "Instant Coffee Sachets 30pk",         category: "beverages",     subcategory: "tea-coffee",        price: 14.99, original: 18.99, rating: 4.4, reviews: 205,  emoji: "☕", desc: "Rich, full-bodied instant coffee. Each sachet makes one perfect cup. 100% Arabica blend. No bitterness." },

  // ── Snacks & Confectionery › Chips & Snacks ────────────────────────────────
  { id: 7,  name: "Mixed Nut & Dried Fruit Box 500g",    category: "snacks",        subcategory: "chips-snacks",      price: 24.99, original: 29.99, rating: 4.5, reviews: 156,  emoji: "🥜", desc: "Premium assortment: almonds, cashews, walnuts, cranberries, mango. No added sugar. 500 g resealable box." },
  { id: 8,  name: "BBQ Kettle Cooked Potato Chips",      category: "snacks",        subcategory: "chips-snacks",      price: 8.99,  original: null,  rating: 4.4, reviews: 312,  emoji: "🥔", desc: "Thick-cut kettle-cooked chips with bold smoky BBQ seasoning. Resealable bag. No artificial colors." },
  { id: 9,  name: "Roasted Seaweed Snack Pack 10ct",     category: "snacks",        subcategory: "chips-snacks",      price: 11.99, original: null,  rating: 4.5, reviews: 224,  emoji: "🌿", desc: "Crispy oven-roasted seaweed with a light sea-salt finish. High in iodine. Individually wrapped, 5 g each." },

  // ── Snacks & Confectionery › Sweets ────────────────────────────────────────
  { id: 10, name: "Artisan Dark Chocolate 72% Cacao",    category: "snacks",        subcategory: "sweets",            price: 9.99,  original: 12.99, rating: 4.9, reviews: 634,  emoji: "🍫", desc: "72% cacao single-origin Ecuador. Vegan, gluten-free. Notes of berry and caramel. 100 g bar." },
  { id: 11, name: "Tropical Fruity Gummy Bears 500g",    category: "snacks",        subcategory: "sweets",            price: 7.99,  original: null,  rating: 4.3, reviews: 445,  emoji: "🍬", desc: "Bursting with mango, lychee, passion fruit and pineapple flavors. Gelatin-free, made with real juice." },
  { id: 12, name: "Salted Caramel Popcorn Premium",      category: "snacks",        subcategory: "sweets",            price: 6.99,  original: 8.99,  rating: 4.6, reviews: 267,  emoji: "🍿", desc: "Hand-crafted caramel popcorn with a Himalayan sea-salt finish. Non-GMO corn, no artificial flavors. 200 g." },

  // ── Food › Instant Foods ────────────────────────────────────────────────────
  { id: 13, name: "Instant Ramen Variety Pack 12ct",     category: "food",          subcategory: "instant-foods",     price: 14.99, original: null,  rating: 4.5, reviews: 523,  emoji: "🍜", desc: "12 assorted flavors: tonkotsu, miso, spicy kimchi, shoyu, and more. Ready in 3 minutes. No trans fat." },
  { id: 14, name: "Premium Quick Oats 1kg",              category: "food",          subcategory: "instant-foods",     price: 9.99,  original: null,  rating: 4.7, reviews: 189,  emoji: "🥣", desc: "Whole-grain rolled oats. Ready in 90 seconds in the microwave. High fiber, no added sugar. 1 kg resealable bag." },
  { id: 15, name: "Mac & Cheese Family Pack 6ct",        category: "food",          subcategory: "instant-foods",     price: 12.99, original: 15.99, rating: 4.4, reviews: 341,  emoji: "🧀", desc: "Creamy cheddar macaroni & cheese. Each box serves 3. No artificial dyes. Ready in under 10 minutes." },

  // ── Food › Ready & Canned Foods ────────────────────────────────────────────
  { id: 16, name: "Wild-Caught Tuna in Olive Oil 6pk",   category: "food",          subcategory: "ready-canned",      price: 19.99, original: null,  rating: 4.7, reviews: 178,  emoji: "🐟", desc: "MSC-certified wild-caught skipjack tuna. Packed in extra-virgin olive oil. High protein, omega-3 rich. 6 × 180 g." },
  { id: 17, name: "Premium Mixed Vegetable Cans 8ct",    category: "food",          subcategory: "ready-canned",      price: 13.99, original: null,  rating: 4.3, reviews: 92,   emoji: "🥫", desc: "Corn, peas, carrots and green beans. BPA-free cans. No added salt. Ready to use straight from the can." },
  { id: 18, name: "Organic Tomato Pasta Sauce 3-Jar",    category: "food",          subcategory: "ready-canned",      price: 11.99, original: 14.99, rating: 4.6, reviews: 214,  emoji: "🍅", desc: "Slow-cooked organic tomatoes, basil, and garlic. No preservatives, no added sugar. 3 × 400 g jars." },

  // ── Personal Care › Oral & Hair Care ───────────────────────────────────────
  { id: 19, name: "Whitening Charcoal Toothpaste 2pk",  category: "personal-care", subcategory: "oral-hair-care",    price: 8.99,  original: null,  rating: 4.5, reviews: 678,  emoji: "🦷", desc: "Activated charcoal formula gently removes stains and whitens enamel. Fluoride-free, mint-flavored. 2 × 100 g." },
  { id: 20, name: "Argan Oil Repair Shampoo 400ml",      category: "personal-care", subcategory: "oral-hair-care",    price: 16.99, original: 21.99, rating: 4.7, reviews: 345,  emoji: "🧴", desc: "Sulfate-free formula with Moroccan argan oil. Repairs damage, reduces frizz, adds shine. Color-safe." },
  { id: 21, name: "Silk Protein Deep Conditioner 300ml", category: "personal-care", subcategory: "oral-hair-care",    price: 13.99, original: null,  rating: 4.6, reviews: 223,  emoji: "💆", desc: "Intensive repair conditioner with hydrolyzed silk proteins. Restores moisture and elasticity. All hair types." },

  // ── Personal Care › Body & Skin Care ───────────────────────────────────────
  { id: 22, name: "Vitamin C Brightening Serum 30ml",   category: "personal-care", subcategory: "body-skin-care",    price: 38.99, original: 49.99, rating: 4.8, reviews: 923,  emoji: "✨", desc: "20% Vitamin C + Ferulic Acid. Reduces dark spots, boosts collagen. Suitable for all skin types. 30 ml." },
  { id: 23, name: "Hyaluronic Acid Moisturizer 50ml",   category: "personal-care", subcategory: "body-skin-care",    price: 29.99, original: null,  rating: 4.7, reviews: 445,  emoji: "💎", desc: "Multi-weight hyaluronic acid for deep and surface hydration. Fragrance-free, dermatologist tested. 50 ml." },
  { id: 24, name: "SPF 50 Sunscreen Fluid 50ml",        category: "personal-care", subcategory: "body-skin-care",    price: 22.99, original: 28.99, rating: 4.9, reviews: 1205, emoji: "☀️", desc: "Lightweight fluid, invisible finish. UVA/UVB broad spectrum. Water-resistant 80 min. Reef-safe formula." },
  { id: 25, name: "Niacinamide 10% Toner 200ml",        category: "personal-care", subcategory: "body-skin-care",    price: 18.99, original: null,  rating: 4.5, reviews: 312,  emoji: "🫧", desc: "10% Niacinamide + Zinc. Minimizes pores, controls oil, evens skin tone. Alcohol-free. 200 ml." },

  // ── Household Essentials › Laundry & Cleaning ──────────────────────────────
  { id: 26, name: "Ultra-Clean Laundry Pods 40ct",       category: "household",     subcategory: "laundry-cleaning",  price: 24.99, original: 29.99, rating: 4.7, reviews: 567,  emoji: "🧺", desc: "3-in-1 pods: detergent, stain remover, brightener. Works in cold and hot water. HE compatible. 40 loads." },
  { id: 27, name: "Multi-Surface Disinfectant Spray",    category: "household",     subcategory: "laundry-cleaning",  price: 9.99,  original: null,  rating: 4.5, reviews: 234,  emoji: "🧹", desc: "Kills 99.9% of bacteria and viruses. Safe on counters, appliances, and bathroom surfaces. Fresh-citrus scent. 750 ml." },
  { id: 28, name: "Lavender Fabric Softener 1.5L",       category: "household",     subcategory: "laundry-cleaning",  price: 12.99, original: 15.99, rating: 4.6, reviews: 189,  emoji: "🌸", desc: "Long-lasting lavender fragrance. Reduces static, softens fibers. Concentrated formula: 1.5 L = 60 washes." },

  // ── Household Essentials › Paper & Storage ─────────────────────────────────
  { id: 29, name: "Ultra-Soft Paper Towels 8 Rolls",     category: "household",     subcategory: "paper-storage",     price: 13.99, original: null,  rating: 4.5, reviews: 312,  emoji: "🧻", desc: "2-ply ultra-absorbent paper towels. FSC-certified sustainable wood pulp. Quick-dry quilted pattern. 8 rolls." },
  { id: 30, name: "Ziplock Storage Bags Variety Pack",   category: "household",     subcategory: "paper-storage",     price: 11.99, original: 14.99, rating: 4.4, reviews: 178,  emoji: "📦", desc: "Assorted sizes: sandwich, quart, and gallon. BPA-free, double-seal zipper. Freezer & microwave safe. 90 bags total." },
  { id: 31, name: "Triple Ply Toilet Paper 12 Rolls",    category: "household",     subcategory: "paper-storage",     price: 15.99, original: null,  rating: 4.6, reviews: 445,  emoji: "🪣", desc: "Extra-thick triple-ply tissue. Unscented, hypoallergenic. Eco-friendly packaging. 200 sheets per roll × 12 rolls." },
];

export const INITIAL_ORDERS: Order[] = [
  { id: "#AM72841", date: "May 20, 2025", status: "delivered",  payment: "Credit Card",   items: [{ pid: 22, qty: 1 }, { pid: 24, qty: 2 }] },
  { id: "#AM61023", date: "May 14, 2025", status: "shipping",   payment: "MoMo",          items: [{ pid: 26, qty: 1 }] },
  { id: "#AM55890", date: "May 5, 2025",  status: "processing", payment: "Bank Transfer", items: [{ pid: 4, qty: 3 }, { pid: 10, qty: 2 }, { pid: 7, qty: 1 }] },
  { id: "#AM48234", date: "Apr 28, 2025", status: "delivered",  payment: "COD",           items: [{ pid: 6, qty: 1 }, { pid: 5, qty: 2 }] },
  { id: "#AM43100", date: "Apr 15, 2025", status: "cancelled",  payment: "Credit Card",   items: [{ pid: 23, qty: 1 }] },
  { id: "#AM39876", date: "Apr 2, 2025",  status: "delivered",  payment: "MoMo",          items: [{ pid: 1, qty: 1 }, { pid: 25, qty: 1 }] },
  { id: "#AM31456", date: "Mar 20, 2025", status: "delivered",  payment: "Credit Card",   items: [{ pid: 8, qty: 2 }, { pid: 2, qty: 4 }] },
];

export const MY_REVIEWS: Review[] = [
  { pid: 22, rating: 5, title: "Absolute game-changer for my skin!",   body: "I've been using this serum for 2 months and the difference is incredible. Dark spots have visibly faded and my skin looks so much brighter.",   pros: "Visible results, lightweight, absorbs fast",      cons: "A bit pricey but worth it",          date: "May 18, 2025", helpful: 24 },
  { pid: 24, rating: 5, title: "Best sunscreen I've ever tried",        body: "No white cast, comfortable to wear all day. Reapplying is easy and it doesn't feel greasy at all. Would 100% recommend.",                           pros: "No white cast, reef-safe, water resistant",       cons: "Wish it came in a larger size",      date: "May 10, 2025", helpful: 18 },
  { pid: 5,  rating: 5, title: "My morning coffee ritual changed",      body: "Smooth, rich, and never bitter. The cold brew concentrate is super versatile — I use it hot or cold depending on my mood. Amazing product.",        pros: "Smooth flavor, convenient, great value",          cons: "Wish it had a decaf option",         date: "Apr 30, 2025", helpful: 12 },
  { pid: 1,  rating: 4, title: "Best sparkling water I've had",         body: "Crisp and refreshing with just the right amount of carbonation. Not overly gassy and has a clean mineral taste. Great for daily hydration.",        pros: "Great taste, no artificial flavors, well priced", cons: "Wish the case was bigger",           date: "Apr 12, 2025", helpful: 7  },
  { pid: 8,  rating: 5, title: "Absolutely addictive BBQ chips!",       body: "The perfect balance of sweet and smoky BBQ flavor. The kettle-cooked texture gives a satisfying crunch regular chips can't match. Will buy again!", pros: "Incredible crunch, bold flavor, resealable bag",  cons: "Hard to stop at just one serving",   date: "Mar 28, 2025", helpful: 9  },
];

export const PENDING_PIDS = [6, 25, 2];
export const STAR_LABELS = ["", "Terrible", "Bad", "Okay", "Good", "Excellent"];

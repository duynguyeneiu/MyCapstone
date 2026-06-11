'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '../../../lib/data';

interface Props { activePage: string; onNav: (p: string) => void; }

const pageCSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Hanken+Grotesk:wght@600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
body { font-family: 'Inter', sans-serif; }
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
aside { border-right: 2px solid #ffe08a; background: linear-gradient(180deg, #f4fbf7 0%, #fffdf5 100%); }
header { background: linear-gradient(90deg, #f7fbf9 0%, #fffdf5 100%); border-bottom: 1.5px solid #ffe08a; }
.nav-active { background: linear-gradient(90deg, #fff3d6 0%, #fde68a44 100%) !important; border-left: 3px solid #f59e0b; color: #00694c !important; font-weight: 700; }
.search-bar { background: #fff8e6; border: 1.5px solid #fcd97a; border-radius: 999px; display: flex; align-items: center; padding: 8px 16px; gap: 8px; }
.search-bar:focus-within { border-color: #f59e0b; box-shadow: 0 0 0 3px #f59e0b22; }
.search-bar input { background: transparent; border: none; outline: none; width: 100%; font-size: 14px; }
.stat-card { transition: transform 0.18s ease; }
.stat-card:hover { transform: translateY(-2px); }
.btn-primary { background: linear-gradient(135deg, #00694c 0%, #00a86b 100%); color: #fff; transition: all .15s; box-shadow: 0 2px 8px #00694c33; }
.btn-primary:hover { box-shadow: 0 4px 14px #00694c55; }
tbody tr:hover { background: #f4fbf7 !important; }
.brand-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #00694c); margin-right: 6px; vertical-align: middle; }
.filter-select { background: #fff8e6; border: 1.5px solid #fcd97a; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #3d4943; outline: none; }
.filter-select:focus { border-color: #f59e0b; }
.modal-input { border: 1.5px solid #c8e4d8; background: #f4fbf7; border-radius: 8px; padding: 8px 12px; font-size: 14px; width: 100%; outline: none; }
.modal-input:focus { border-color: #00694c; }
.tab-btn { padding: 8px 20px; font-size: 14px; font-weight: 500; border-bottom: 2px solid transparent; color: #3d4943; cursor: pointer; transition: color .15s; background: none; }
.tab-btn.tab-active { color: #00694c; border-bottom-color: #f59e0b; }
`;

const navItems = [
  { id: 'dashboard',  label: 'Dashboard',  icon: 'dashboard' },
  { id: 'products',   label: 'Products',   icon: 'shopping_bag' },
  { id: 'categories', label: 'Categories', icon: 'category' },
  { id: 'orders',     label: 'Orders',     icon: 'receipt_long' },
  { id: 'inventory',  label: 'Inventory',  icon: 'inventory_2' },
  { id: 'promotions', label: 'Promotions', icon: 'campaign' },
  { id: 'users',      label: 'Users',      icon: 'group' },
  { id: 'pos',        label: 'POS',        icon: 'point_of_sale' },
  { id: 'settings',   label: 'Settings',   icon: 'settings' },
];

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + '₫';

const catColors: Record<string, { bg: string; color: string }> = {
  'beverages':     { bg: '#e0f5ed', color: '#004d38' },
  'snacks':        { bg: '#fff3d6', color: '#7a5c00' },
  'food':          { bg: '#fef3c7', color: '#92400e' },
  'personal-care': { bg: '#ede9fe', color: '#4c1d95' },
  'household':     { bg: '#e0f2fe', color: '#075985' },
};

const CAT_LABELS: Record<string, string> = {
  beverages: 'Beverages', snacks: 'Snacks', food: 'Food',
  'personal-care': 'Personal Care', household: 'Household',
};

const STOCK = (id: number) => (id * 17 + 3) % 120;

const typeConfig: Record<string, { bg: string; color: string }> = {
  'Sale':   { bg: '#fee2e2', color: '#7f1d1d' },
  'Import': { bg: '#e0f5ed', color: '#004d38' },
  'Adjust': { bg: '#fff3d6', color: '#7a5c00' },
};

interface StockProduct { id: number; name: string; code: string; barcode: string; cat: string; stock: number; importPrice: number; image: string; }
interface ImportReceipt { id: string; date: string; staff: string; items: number; total: number; status: string; }
interface Transaction { date: string; product: string; type: string; qty: number; after: number; ref: string; }
interface ImportRow { id: number; productName: string; productPrice: number; qty: number; price: number; }

const initialProducts: StockProduct[] = PRODUCTS.map(p => ({
  id: p.id,
  name: p.name,
  code: `P${String(p.id).padStart(3, '0')}`,
  barcode: `893521748${String(p.id).padStart(4, '0')}`,
  cat: p.category,
  stock: STOCK(p.id),
  importPrice: Math.round(p.price * 0.7),
  image: p.image,
}));

const initialImports: ImportReceipt[] = [
  { id:'IMP-001', date:'24 May 2024', staff:'Alex Nguyen', items:5, total:2450000, status:'Completed' },
  { id:'IMP-002', date:'22 May 2024', staff:'Minh Tran',   items:3, total:890000,  status:'Completed' },
  { id:'IMP-003', date:'20 May 2024', staff:'Alex Nguyen', items:8, total:5200000, status:'Completed' },
  { id:'IMP-004', date:'18 May 2024', staff:'Lan Pham',    items:2, total:640000,  status:'Completed' },
];

const initialTransactions: Transaction[] = [
  { date:'24 May 09:32', product:'Lay\'s Classic Potato Chips 52g',  type:'Sale',   qty:-1,  after:56, ref:'#ORD-2584' },
  { date:'24 May 08:00', product:'C2 Green Tea 455ml',               type:'Import', qty:+20, after:125,ref:'IMP-001' },
  { date:'23 May 17:20', product:'OMO Matic Detergent 3kg',          type:'Sale',   qty:-3,  after:49, ref:'#ORD-2581' },
  { date:'23 May 15:10', product:'Nivea Body Lotion 400ml',          type:'Sale',   qty:-3,  after:118,ref:'#ORD-2580' },
  { date:'23 May 12:30', product:'Vifon Chicken Porridge',           type:'Sale',   qty:-5,  after:0,  ref:'#ORD-2579' },
  { date:'22 May 10:00', product:'Alpenliebe Original Caramel 119g', type:'Adjust', qty:-2,  after:1,  ref:'Damaged' },
  { date:'22 May 09:00', product:'Aquafina Purified Water 500ml',    type:'Import', qty:+10, after:20, ref:'IMP-002' },
  { date:'20 May 14:00', product:'Spam Classic Luncheon Meat 340g',  type:'Import', qty:+50, after:51, ref:'IMP-003' },
];

function stockStatus(stock: number) {
  if (stock === 0) return { label: 'Out of Stock', bg: '#fee2e2', color: '#7f1d1d' };
  if (stock <= 10) return { label: 'Low Stock',    bg: '#fff3d6', color: '#7a5c00' };
  return                  { label: 'In Stock',     bg: '#e0f5ed', color: '#004d38' };
}

function StockBar({ stock, max = 150 }: { stock: number; max?: number }) {
  const pct = Math.min(100, Math.round(stock / max * 100));
  const color = stock === 0 ? '#dc2626' : stock <= 10 ? '#f59e0b' : '#00694c';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 rounded-full h-1.5" style={{ minWidth: '60px', background: '#c8e4d8' }}>
        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: color }}></div>
      </div>
      <span style={{ fontSize: '11px', color: '#3d4943', minWidth: '28px' }}>{pct}%</span>
    </div>
  );
}

let rowIdCounter = 1;

export default function InventoryPage({ activePage, onNav }: Props) {
  const router = useRouter();
  const [products, setProducts] = useState<StockProduct[]>(initialProducts);
  const [imports, setImports] = useState<ImportReceipt[]>(initialImports);
  const [transactions] = useState<Transaction[]>(initialTransactions);
  const [activeTab, setActiveTab] = useState<'stock' | 'import' | 'transactions'>('stock');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  // Import modal
  const [importOpen, setImportOpen] = useState(false);
  const [iDate, setIDate] = useState('');
  const [iStaff, setIStaff] = useState('Alex Nguyen');
  const [iNote, setINote] = useState('');
  const [importRows, setImportRows] = useState<ImportRow[]>([]);

  // Adjust modal
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjProductId, setAdjProductId] = useState('');
  const [adjType, setAdjType] = useState<'add' | 'subtract' | 'set'>('add');
  const [adjQty, setAdjQty] = useState('');
  const [adjReason, setAdjReason] = useState('Stock count correction');
  const [adjNote, setAdjNote] = useState('');

  const filteredProducts = () => products.filter(p => {
    const ss = stockStatus(p.stock).label;
    return (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search)) &&
           (!catFilter || p.cat === catFilter) &&
           (!stockFilter || ss === stockFilter);
  });

  const openImportModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setIDate(today);
    setIStaff('Alex Nguyen');
    setINote('');
    setImportRows([{ id: rowIdCounter++, productName: '', productPrice: 0, qty: 1, price: 0 }]);
    setImportOpen(true);
  };

  const addImportRow = () => {
    setImportRows(prev => [...prev, { id: rowIdCounter++, productName: '', productPrice: 0, qty: 1, price: 0 }]);
  };

  const updateRow = (id: number, field: keyof ImportRow, value: string | number) => {
    setImportRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeRow = (id: number) => {
    setImportRows(prev => prev.filter(r => r.id !== id));
  };

  const importTotal = importRows.reduce((s, r) => s + r.qty * r.price, 0);

  const saveImport = () => {
    const newReceipt: ImportReceipt = {
      id: `IMP-00${imports.length + 1}`,
      date: '24 May 2024',
      staff: iStaff,
      items: importRows.length,
      total: importTotal,
      status: 'Completed',
    };
    setImports(prev => [newReceipt, ...prev]);
    setImportOpen(false);
  };

  const openAdjustModal = (productId?: number) => {
    setAdjProductId(productId ? String(productId) : '');
    setAdjType('add');
    setAdjQty('');
    setAdjReason('Stock count correction');
    setAdjNote('');
    setAdjustOpen(true);
  };

  const saveAdjust = () => {
    const pid = parseInt(adjProductId);
    const qty = parseInt(adjQty) || 0;
    if (!pid || !qty) { alert('Please select a product and enter quantity'); return; }
    setProducts(prev => prev.map(p => {
      if (p.id !== pid) return p;
      let newStock = p.stock;
      if (adjType === 'add') newStock = p.stock + qty;
      else if (adjType === 'subtract') newStock = Math.max(0, p.stock - qty);
      else newStock = qty;
      return { ...p, stock: newStock };
    }));
    setAdjustOpen(false);
  };

  const data = filteredProducts();

  return (
    <div className="bg-background text-on-surface" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{pageCSS}</style>

      <aside className="h-screen w-64 fixed left-0 top-0 z-40 flex flex-col py-5 px-3 overflow-y-auto">
        <div className="mb-8 px-4">
          <h1 className="font-headline-sm text-headline-sm font-bold flex items-center" style={{ color: '#00694c' }}>
            <span className="brand-dot"></span>RetailPro
          </h1>
          <p className="font-label-md text-label-md text-on-surface-variant">Management System</p>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => onNav(item.id)} className={`flex items-center gap-3 px-4 py-3 transition-colors rounded-lg w-full text-left ${activePage === item.id ? 'nav-active' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </button>
          ))}
          <button onClick={() => router.push('/')} className="text-on-surface-variant flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high transition-colors rounded-lg w-full text-left">
            <span className="material-symbols-outlined">home</span>
            <span className="font-label-md text-label-md">Home</span>
          </button>
        </nav>
        <div className="mt-auto p-4 border-t" style={{ borderColor: '#ffe08a' }}>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant">help_outline</span>
            <div>
              <p className="font-bold text-on-surface" style={{ fontSize: '13px' }}>Need Help?</p>
              <p className="text-on-surface-variant" style={{ fontSize: '11px' }}>Check our documentation</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="ml-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 flex justify-between items-center px-8 py-4">
          <div className="flex items-center gap-4">
            <h2 className="font-bold" style={{ fontSize: '24px', color: '#00694c' }}>Inventory</h2>
            <div className="search-bar hidden lg:flex w-80">
              <span className="material-symbols-outlined" style={{ color: '#b47b10', fontSize: '20px' }}>search</span>
              <input placeholder="Search product name, barcode..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container rounded-full p-2">notifications</button>
            <button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container rounded-full p-2">help_outline</button>
            <div className="h-8 w-px mx-2" style={{ background: '#ffe08a' }}></div>
            <div className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#00694c,#f59e0b)' }}>
                <span className="material-symbols-outlined text-white" style={{ fontSize: '16px' }}>person</span>
              </div>
              <div>
                <p className="font-bold text-on-surface leading-none" style={{ fontSize: '13px' }}>ADMIN USER</p>
                <p className="text-on-surface-variant" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.05em' }}>Store Manager</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* Stats */}
          {(() => {
            const totalValue = products.reduce((s, p) => s + p.stock * p.importPrice, 0);
            const lowCnt = products.filter(p => p.stock > 0 && p.stock <= 10).length;
            const outCnt = products.filter(p => p.stock === 0).length;
            return (
          <div className="grid grid-cols-4 gap-5">
            <div className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between" style={{ borderColor: '#b8e0cc', boxShadow: '0 0 0 1px #00694c1a,0 4px 20px #00694c14' }}>
              <div className="flex justify-between items-start">
                <div><p className="text-on-surface-variant font-label-md text-label-md mb-1">Total Stock Value</p><h3 className="font-bold" style={{ fontSize: '22px' }}>{fmt(totalValue)}</h3></div>
                <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#00694c', background: '#e0f5ed' }}>payments</span>
              </div>
              <div className="mt-4 flex items-center gap-1"><span className="material-symbols-outlined" style={{ color: '#00694c', fontSize: '18px' }}>trending_up</span><span className="font-label-sm text-label-sm" style={{ color: '#00694c' }}>+8% from last month</span></div>
            </div>
            <div className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between" style={{ borderColor: '#fcd97a', boxShadow: '0 0 0 1px #f59e0b1a,0 4px 20px #f59e0b14' }}>
              <div className="flex justify-between items-start">
                <div><p className="text-on-surface-variant font-label-md text-label-md mb-1">Total SKUs</p><h3 className="font-bold" style={{ fontSize: '24px' }}>{products.length}</h3></div>
                <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#b47b10', background: '#fff3d6' }}>inventory_2</span>
              </div>
              <div className="mt-4 flex items-center gap-1"><span className="font-label-sm text-label-sm" style={{ color: '#b47b10' }}>Active products</span></div>
            </div>
            <div className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between" style={{ borderColor: '#fac057', boxShadow: '0 0 0 1px #D9770622,0 4px 20px #D9770614' }}>
              <div className="flex justify-between items-start">
                <div><p className="text-on-surface-variant font-label-md text-label-md mb-1">Low Stock</p><h3 className="font-bold" style={{ fontSize: '24px', color: '#854f0b' }}>{lowCnt}</h3></div>
                <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#854f0b', background: '#fff3d6' }}>warning</span>
              </div>
              <div className="mt-4 flex items-center gap-1"><span className="font-label-sm text-label-sm" style={{ color: '#854f0b' }}>Stock ≤ 10 units</span></div>
            </div>
            <div className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between" style={{ borderColor: '#fca5a5', boxShadow: '0 0 0 1px #dc262622,0 4px 20px #dc262614' }}>
              <div className="flex justify-between items-start">
                <div><p className="text-on-surface-variant font-label-md text-label-md mb-1">Out of Stock</p><h3 className="font-bold" style={{ fontSize: '24px', color: '#dc2626' }}>{outCnt}</h3></div>
                <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#dc2626', background: '#fee2e2' }}>remove_shopping_cart</span>
              </div>
              <div className="mt-4 flex items-center gap-1"><span className="font-label-sm text-label-sm" style={{ color: '#dc2626' }}>Needs immediate restock</span></div>
            </div>
          </div>
            );
          })()}

          {/* Tabs + Table */}
          <div className="bg-surface-container-lowest border rounded-xl overflow-hidden" style={{ borderColor: '#c8e4d8' }}>
            <div className="flex border-b px-6" style={{ borderColor: '#c8e4d8' }}>
              {(['stock', 'import', 'transactions'] as const).map(tab => (
                <button key={tab} className={`tab-btn${activeTab === tab ? ' tab-active' : ''}`} onClick={() => setActiveTab(tab)}>
                  {tab === 'stock' ? 'Stock Overview' : tab === 'import' ? 'Import Receipts' : 'Transactions'}
                </button>
              ))}
            </div>

            {/* Stock Overview Tab */}
            {activeTab === 'stock' && (
              <>
                <div className="p-6 border-b flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: '#c8e4d8' }}>
                  <div className="flex items-center gap-3">
                    <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="filter-select">
                      <option value="">All Categories</option>
                      <option value="beverages">Beverages</option>
                      <option value="snacks">Snacks</option>
                      <option value="food">Food</option>
                      <option value="personal-care">Personal Care</option>
                      <option value="household">Household</option>
                    </select>
                    <select value={stockFilter} onChange={e => setStockFilter(e.target.value)} className="filter-select">
                      <option value="">All Stock Status</option>
                      <option>In Stock</option>
                      <option>Low Stock</option>
                      <option>Out of Stock</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => openAdjustModal()} className="flex items-center gap-2 px-4 py-2 rounded-lg border text-on-surface-variant hover:bg-surface-container" style={{ borderColor: '#c8e4d8', fontSize: '14px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                      Adjust Stock
                    </button>
                    <button onClick={openImportModal} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg font-bold" style={{ fontSize: '14px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                      Import Stock
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead style={{ background: '#f4fbf7' }}>
                      <tr>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Product</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Category</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Barcode</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase text-center">Current Stock</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Stock Level</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Import Price</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Stock Value</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: '#c8e4d8' }}>
                      {data.map(p => {
                        const cc = catColors[p.cat] || { bg: '#e0f5ed', color: '#004d38' };
                        const ss = stockStatus(p.stock);
                        const stockColor = p.stock === 0 ? '#dc2626' : p.stock <= 10 ? '#854f0b' : '#191c1e';
                        return (
                          <tr key={p.id} className="transition-colors" style={{ borderColor: '#c8e4d8' }}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg flex-shrink-0 overflow-hidden" style={{ background: '#e0f5ed' }}>
                                  <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 3 }} />
                                </div>
                                <div>
                                  <p className="font-bold text-on-surface" style={{ fontSize: '13px' }}>{p.name}</p>
                                  <p className="text-on-surface-variant" style={{ fontSize: '11px' }}>{p.code}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3"><span style={{ background: cc.bg, color: cc.color, padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600 }}>{CAT_LABELS[p.cat] ?? p.cat}</span></td>
                            <td className="px-4 py-3 text-on-surface-variant" style={{ fontSize: '12px', fontFamily: 'monospace' }}>{p.barcode}</td>
                            <td className="px-4 py-3 text-center font-bold" style={{ fontSize: '13px', color: stockColor }}>{p.stock}</td>
                            <td className="px-4 py-3" style={{ minWidth: '140px' }}>
                              <div className="space-y-1">
                                <span style={{ background: ss.bg, color: ss.color, padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>{ss.label}</span>
                                <StockBar stock={p.stock} />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-on-surface" style={{ fontSize: '13px' }}>{fmt(p.importPrice)}</td>
                            <td className="px-4 py-3 font-bold text-on-surface" style={{ fontSize: '13px' }}>{fmt(p.stock * p.importPrice)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center">
                                <button onClick={() => openAdjustModal(p.id)} className="flex items-center gap-1 px-3 py-1 rounded-lg border transition-colors" style={{ fontSize: '12px', borderColor: '#c8e4d8' }}
                                  onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = '#e0f5ed'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#00694c'; }}
                                  onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; (e.currentTarget as HTMLButtonElement).style.borderColor = '#c8e4d8'; }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span> Adjust
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: '#c8e4d8' }}>
                  <p className="text-on-surface-variant" style={{ fontSize: '13px' }}>Showing {data.length} of {products.length} products</p>
                  <div className="flex items-center gap-1">
                    <button className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-surface-container" style={{ borderColor: '#c8e4d8' }}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_left</span></button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold btn-primary" style={{ fontSize: '13px' }}>1</button>
                    <button className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-surface-container" style={{ borderColor: '#c8e4d8', fontSize: '13px' }}>2</button>
                    <button className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-surface-container" style={{ borderColor: '#c8e4d8' }}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span></button>
                  </div>
                </div>
              </>
            )}

            {/* Import Receipts Tab */}
            {activeTab === 'import' && (
              <>
                <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: '#c8e4d8' }}>
                  <p className="text-on-surface-variant" style={{ fontSize: '13px' }}>All import receipts</p>
                  <button onClick={openImportModal} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg font-bold" style={{ fontSize: '14px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                    New Import
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead style={{ background: '#f4fbf7' }}>
                      <tr>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Receipt ID</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Date</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Staff</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Items</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Total Amount</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Status</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: '#c8e4d8' }}>
                      {imports.map(r => (
                        <tr key={r.id} className="transition-colors" style={{ borderColor: '#c8e4d8' }}>
                          <td className="px-4 py-3 font-bold text-on-surface" style={{ fontSize: '13px' }}>{r.id}</td>
                          <td className="px-4 py-3 text-on-surface-variant" style={{ fontSize: '13px' }}>{r.date}</td>
                          <td className="px-4 py-3 text-on-surface" style={{ fontSize: '13px' }}>{r.staff}</td>
                          <td className="px-4 py-3 text-on-surface" style={{ fontSize: '13px' }}>{r.items} items</td>
                          <td className="px-4 py-3 font-bold text-on-surface" style={{ fontSize: '13px' }}>{fmt(r.total)}</td>
                          <td className="px-4 py-3"><span style={{ background: '#e0f5ed', color: '#004d38', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>{r.status}</span></td>
                          <td className="px-4 py-3 text-center">
                            <button className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-surface-container-high mx-auto" style={{ borderColor: '#c8e4d8' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#3d4943' }}>visibility</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <>
                <div className="p-6 border-b" style={{ borderColor: '#c8e4d8' }}>
                  <p className="text-on-surface-variant" style={{ fontSize: '13px' }}>Stock movement history</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead style={{ background: '#f4fbf7' }}>
                      <tr>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Date</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Product</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Type</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase text-center">Qty Change</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase text-center">Stock After</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: '#c8e4d8' }}>
                      {transactions.map((t, idx) => {
                        const tc = typeConfig[t.type] || typeConfig['Adjust'];
                        const isIn = t.qty > 0;
                        return (
                          <tr key={idx} className="transition-colors" style={{ borderColor: '#c8e4d8' }}>
                            <td className="px-4 py-3 text-on-surface-variant" style={{ fontSize: '12px' }}>{t.date}</td>
                            <td className="px-4 py-3 font-bold text-on-surface" style={{ fontSize: '13px' }}>{t.product}</td>
                            <td className="px-4 py-3"><span style={{ background: tc.bg, color: tc.color, padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600 }}>{t.type}</span></td>
                            <td className="px-4 py-3 text-center font-bold" style={{ fontSize: '14px', color: isIn ? '#00694c' : '#dc2626' }}>{isIn ? '+' : ''}{t.qty}</td>
                            <td className="px-4 py-3 text-center text-on-surface font-bold" style={{ fontSize: '13px' }}>{t.after}</td>
                            <td className="px-4 py-3 text-on-surface-variant" style={{ fontSize: '12px' }}>{t.ref}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        <footer className="mt-auto p-8 text-center border-t" style={{ borderColor: '#c8e4d8' }}>
          <p className="text-on-surface-variant" style={{ fontSize: '14px' }}>© 2024 RetailPro Management System. All rights reserved.</p>
        </footer>
      </main>

      {/* Import Stock Modal */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) setImportOpen(false); }}>
          <div className="bg-surface-container-lowest rounded-xl border w-[580px] max-w-[95vw] max-h-[90vh] overflow-y-auto" style={{ borderColor: '#c8e4d8' }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#c8e4d8' }}>
              <h3 className="font-bold text-on-surface" style={{ fontSize: '18px' }}>New Import Receipt</h3>
              <button onClick={() => setImportOpen(false)} className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container rounded-full p-1">close</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Import Date</label>
                  <input type="date" value={iDate} onChange={e => setIDate(e.target.value)} className="modal-input" />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Staff</label>
                  <select value={iStaff} onChange={e => setIStaff(e.target.value)} className="modal-input">
                    <option>Alex Nguyen</option>
                    <option>Minh Tran</option>
                    <option>Lan Pham</option>
                  </select>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Import Items</label>
                  <button onClick={addImportRow} className="flex items-center gap-1" style={{ fontSize: '12px', fontWeight: 600, color: '#00694c' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span> Add Item
                  </button>
                </div>
                <table className="w-full" style={{ fontSize: '13px' }}>
                  <thead>
                    <tr className="border-b" style={{ borderColor: '#c8e4d8' }}>
                      <th className="text-left py-2 text-on-surface-variant font-label-sm text-label-sm uppercase">Product</th>
                      <th className="text-center py-2 text-on-surface-variant font-label-sm text-label-sm uppercase w-20">Qty</th>
                      <th className="text-right py-2 text-on-surface-variant font-label-sm text-label-sm uppercase w-28">Import Price</th>
                      <th className="text-right py-2 text-on-surface-variant font-label-sm text-label-sm uppercase w-28">Subtotal</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {importRows.map(row => (
                      <tr key={row.id} style={{ borderBottom: '1px solid #c8e4d8' }}>
                        <td className="py-2 pr-2">
                          <select className="w-full rounded-lg px-2 py-1 focus:outline-none" style={{ border: '1.5px solid #c8e4d8', background: '#f4fbf7', fontSize: '13px' }}
                            onChange={e => {
                              const opt = e.target.options[e.target.selectedIndex];
                              updateRow(row.id, 'productName', opt.text);
                              updateRow(row.id, 'productPrice', Number(opt.value));
                            }}>
                            <option value="0">Select product</option>
                            {products.map(p => <option key={p.id} value={p.importPrice}>{p.name}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <input type="number" min="1" value={row.qty} onChange={e => updateRow(row.id, 'qty', parseInt(e.target.value) || 1)} className="w-full rounded-lg px-2 py-1 text-center focus:outline-none" style={{ border: '1.5px solid #c8e4d8', background: '#f4fbf7', fontSize: '13px' }} />
                        </td>
                        <td className="py-2 px-2">
                          <input type="number" min="0" value={row.price || ''} placeholder="0" onChange={e => updateRow(row.id, 'price', parseInt(e.target.value) || 0)} className="w-full rounded-lg px-2 py-1 text-right focus:outline-none" style={{ border: '1.5px solid #c8e4d8', background: '#f4fbf7', fontSize: '13px' }} />
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-on-surface" style={{ fontSize: '13px' }}>{fmt(row.qty * row.price)}</td>
                        <td className="py-2">
                          <button onClick={() => removeRow(row.id)} className="text-on-surface-variant hover:text-error">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t" style={{ borderColor: '#c8e4d8' }}>
                      <td colSpan={3} className="py-3 text-right font-bold text-on-surface" style={{ fontSize: '13px' }}>Total Amount:</td>
                      <td className="py-3 text-right font-bold" style={{ fontSize: '14px', color: '#00694c' }}>{fmt(importTotal)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Note</label>
                <textarea rows={2} placeholder="Import note..." value={iNote} onChange={e => setINote(e.target.value)} className="modal-input resize-none"></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: '#c8e4d8' }}>
              <button onClick={() => setImportOpen(false)} className="px-4 py-2 rounded-lg border text-on-surface-variant hover:bg-surface-container" style={{ borderColor: '#c8e4d8', fontSize: '14px' }}>Cancel</button>
              <button onClick={saveImport} className="btn-primary px-4 py-2 rounded-lg text-white font-bold" style={{ fontSize: '14px' }}>Save Import</button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) setAdjustOpen(false); }}>
          <div className="bg-surface-container-lowest rounded-xl border w-[420px] max-w-[95vw]" style={{ borderColor: '#c8e4d8' }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#c8e4d8' }}>
              <h3 className="font-bold text-on-surface" style={{ fontSize: '18px' }}>Adjust Stock</h3>
              <button onClick={() => setAdjustOpen(false)} className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container rounded-full p-1">close</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Product</label>
                <select value={adjProductId} onChange={e => setAdjProductId(e.target.value)} className="modal-input">
                  <option value="">Select product...</option>
                  {products.map(p => <option key={p.id} value={String(p.id)}>{p.name} ({p.stock} units)</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Adjustment Type</label>
                  <select value={adjType} onChange={e => setAdjType(e.target.value as 'add' | 'subtract' | 'set')} className="modal-input">
                    <option value="add">Add Stock (+)</option>
                    <option value="subtract">Remove Stock (-)</option>
                    <option value="set">Set Exact Qty</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Quantity</label>
                  <input type="number" min="0" placeholder="0" value={adjQty} onChange={e => setAdjQty(e.target.value)} className="modal-input" />
                </div>
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Reason</label>
                <select value={adjReason} onChange={e => setAdjReason(e.target.value)} className="modal-input">
                  <option>Stock count correction</option>
                  <option>Damaged goods</option>
                  <option>Theft/Loss</option>
                  <option>Return from customer</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Note</label>
                <textarea rows={2} placeholder="Additional note..." value={adjNote} onChange={e => setAdjNote(e.target.value)} className="modal-input resize-none"></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: '#c8e4d8' }}>
              <button onClick={() => setAdjustOpen(false)} className="px-4 py-2 rounded-lg border text-on-surface-variant hover:bg-surface-container" style={{ borderColor: '#c8e4d8', fontSize: '14px' }}>Cancel</button>
              <button onClick={saveAdjust} className="btn-primary px-4 py-2 rounded-lg text-white font-bold" style={{ fontSize: '14px' }}>Save Adjustment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

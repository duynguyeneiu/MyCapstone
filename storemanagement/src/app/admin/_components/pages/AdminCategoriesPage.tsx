'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

const iconMap: Record<string, { icon: string; bg: string; color: string }> = {
  'Electronics':     { icon: 'devices',            bg: '#e0f5ed', color: '#00694c' },
  'Food & Beverage': { icon: 'restaurant',          bg: '#fff3d6', color: '#b47b10' },
  'Household':       { icon: 'home',                bg: '#e0f5ed', color: '#00694c' },
  'Personal Care':   { icon: 'spa',                 bg: '#fff3d6', color: '#b47b10' },
  'Beverages':       { icon: 'local_cafe',           bg: '#fff3d6', color: '#b47b10' },
  'Bakery':          { icon: 'bakery_dining',        bg: '#fff3d6', color: '#b47b10' },
  'Supplies':        { icon: 'inventory',            bg: '#e0f5ed', color: '#00694c' },
  'Groceries':       { icon: 'local_grocery_store',  bg: '#e0f5ed', color: '#00694c' },
  'Mobile Phones':   { icon: 'smartphone',           bg: '#e0f5ed', color: '#00694c' },
  'Laptops':         { icon: 'laptop',               bg: '#e0f5ed', color: '#00694c' },
  'Skincare':        { icon: 'face',                 bg: '#fff3d6', color: '#b47b10' },
  'Hair Care':       { icon: 'content_cut',          bg: '#fff3d6', color: '#b47b10' },
};
const defaultIcon = { icon: 'category', bg: '#e0f5ed', color: '#00694c' };

interface Category {
  id: number; name: string; parent: string; products: number; desc: string; status: string;
}

const initialCategories: Category[] = [
  { id:1,  name:'Electronics',     parent:'',               products:52, desc:'Consumer electronics and gadgets',        status:'Active'   },
  { id:2,  name:'Food & Beverage', parent:'',               products:84, desc:'Food, drinks and grocery items',          status:'Active'   },
  { id:3,  name:'Household',       parent:'',               products:36, desc:'Home cleaning and maintenance products',  status:'Active'   },
  { id:4,  name:'Personal Care',   parent:'',               products:28, desc:'Beauty and personal hygiene products',    status:'Active'   },
  { id:5,  name:'Beverages',       parent:'Food & Beverage',products:22, desc:'Drinks, juices, teas and coffees',        status:'Active'   },
  { id:6,  name:'Bakery',          parent:'Food & Beverage',products:18, desc:'Breads, pastries and baked goods',        status:'Active'   },
  { id:7,  name:'Groceries',       parent:'Food & Beverage',products:44, desc:'Everyday grocery essentials',             status:'Active'   },
  { id:8,  name:'Supplies',        parent:'Household',      products:14, desc:'General supplies and stationery',         status:'Inactive' },
  { id:9,  name:'Mobile Phones',   parent:'Electronics',    products:16, desc:'Smartphones and accessories',             status:'Active'   },
  { id:10, name:'Laptops',         parent:'Electronics',    products:12, desc:'Laptop computers and peripherals',        status:'Inactive' },
  { id:11, name:'Skincare',        parent:'Personal Care',  products:19, desc:'Skincare and facial products',            status:'Active'   },
  { id:12, name:'Hair Care',       parent:'Personal Care',  products:9,  desc:'Shampoo, conditioner and styling',        status:'Inactive' },
];

const emptyForm = { name: '', parent: '', desc: '', status: 'Active' };

export default function AdminCategoriesPage({ activePage, onNav }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [parentFilter, setParentFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [checkAll, setCheckAll] = useState(false);

  const filtered = () => categories.filter(c =>
    (!search || c.name.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || c.status === statusFilter) &&
    (!parentFilter || (parentFilter === 'Parent' ? !c.parent : !!c.parent))
  );

  const openAdd = () => { setEditId(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (c: Category) => {
    setEditId(c.id);
    setForm({ name: c.name, parent: c.parent, desc: c.desc, status: c.status });
    setFormOpen(true);
  };

  const saveCategory = () => {
    if (!form.name.trim()) { alert('Category name is required'); return; }
    if (editId !== null) {
      setCategories(prev => prev.map(c => c.id === editId ? { ...c, name: form.name, parent: form.parent, desc: form.desc, status: form.status } : c));
    } else {
      setCategories(prev => [...prev, { id: Date.now(), name: form.name, parent: form.parent, products: 0, desc: form.desc, status: form.status }]);
    }
    setFormOpen(false);
  };

  const openDelete = (id: number) => { setDeleteId(id); setDelOpen(true); };
  const confirmDelete = () => { setCategories(prev => prev.filter(c => c.id !== deleteId)); setDelOpen(false); };

  const data = filtered();

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
            <h2 className="font-bold" style={{ fontSize: '24px', color: '#00694c' }}>Categories</h2>
            <div className="search-bar hidden lg:flex w-80">
              <span className="material-symbols-outlined" style={{ color: '#b47b10', fontSize: '20px' }}>search</span>
              <input placeholder="Search category name..." value={search} onChange={e => setSearch(e.target.value)} />
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
          <div className="grid grid-cols-4 gap-5">
            <div className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between" style={{ borderColor: '#b8e0cc', boxShadow: '0 0 0 1px #00694c1a,0 4px 20px #00694c14' }}>
              <div className="flex justify-between items-start">
                <div><p className="text-on-surface-variant font-label-md text-label-md mb-1">Total Categories</p><h3 className="font-bold" style={{ fontSize: '24px' }}>18</h3></div>
                <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#00694c', background: '#e0f5ed' }}>category</span>
              </div>
              <div className="mt-4 flex items-center gap-1"><span className="material-symbols-outlined" style={{ color: '#00694c', fontSize: '18px' }}>trending_up</span><span className="font-label-sm text-label-sm" style={{ color: '#00694c' }}>+2 this month</span></div>
            </div>
            <div className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between" style={{ borderColor: '#fcd97a', boxShadow: '0 0 0 1px #f59e0b1a,0 4px 20px #f59e0b14' }}>
              <div className="flex justify-between items-start">
                <div><p className="text-on-surface-variant font-label-md text-label-md mb-1">Active Categories</p><h3 className="font-bold" style={{ fontSize: '24px' }}>15</h3></div>
                <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#b47b10', background: '#fff3d6' }}>check_circle</span>
              </div>
              <div className="mt-4 flex items-center gap-1"><span className="font-label-sm text-label-sm" style={{ color: '#b47b10' }}>83% of total</span></div>
            </div>
            <div className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between" style={{ borderColor: '#b8e0cc', boxShadow: '0 0 0 1px #00694c1a,0 4px 20px #00694c14' }}>
              <div className="flex justify-between items-start">
                <div><p className="text-on-surface-variant font-label-md text-label-md mb-1">Total Products</p><h3 className="font-bold" style={{ fontSize: '24px' }}>248</h3></div>
                <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#00694c', background: '#e0f5ed' }}>shopping_bag</span>
              </div>
              <div className="mt-4 flex items-center gap-1"><span className="font-label-sm text-label-sm" style={{ color: '#00694c' }}>Across all categories</span></div>
            </div>
            <div className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between" style={{ borderColor: '#fac057', boxShadow: '0 0 0 1px #D9770622,0 4px 20px #D9770614' }}>
              <div className="flex justify-between items-start">
                <div><p className="text-on-surface-variant font-label-md text-label-md mb-1">Inactive</p><h3 className="font-bold" style={{ fontSize: '24px', color: '#854f0b' }}>3</h3></div>
                <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#854f0b', background: '#fff3d6' }}>block</span>
              </div>
              <div className="mt-4 flex items-center gap-1"><span className="font-label-sm text-label-sm" style={{ color: '#854f0b' }}>Need review</span></div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-surface-container-lowest border rounded-xl overflow-hidden" style={{ borderColor: '#c8e4d8' }}>
            <div className="p-6 border-b flex items-center justify-between gap-3" style={{ borderColor: '#c8e4d8' }}>
              <div className="flex items-center gap-3">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg px-3 py-2 text-label-md font-label-md text-on-surface-variant focus:outline-none" style={{ background: '#fff8e6', border: '1.5px solid #fcd97a', fontSize: '13px' }}>
                  <option value="">All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
                <select value={parentFilter} onChange={e => setParentFilter(e.target.value)} className="rounded-lg px-3 py-2 text-label-md font-label-md text-on-surface-variant focus:outline-none" style={{ background: '#fff8e6', border: '1.5px solid #fcd97a', fontSize: '13px' }}>
                  <option value="">All Types</option>
                  <option>Parent</option>
                  <option>Sub-category</option>
                </select>
              </div>
              <button onClick={openAdd} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg font-bold" style={{ fontSize: '14px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                Add Category
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead style={{ background: '#f4fbf7' }}>
                  <tr>
                    <th className="px-4 py-3 w-10"><input type="checkbox" className="rounded" checked={checkAll} onChange={e => setCheckAll(e.target.checked)} /></th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Category</th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Parent</th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Products</th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Description</th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Status</th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#c8e4d8' }}>
                  {data.map(c => {
                    const ic = iconMap[c.name] || defaultIcon;
                    return (
                      <tr key={c.id} className="transition-colors" style={{ borderColor: '#c8e4d8' }}>
                        <td className="px-4 py-3"><input type="checkbox" className="rounded" checked={checkAll} readOnly /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: ic.bg }}>
                              <span className="material-symbols-outlined" style={{ color: ic.color, fontSize: '18px' }}>{ic.icon}</span>
                            </div>
                            <p className="font-bold text-on-surface" style={{ fontSize: '13px' }}>{c.name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {c.parent
                            ? <span style={{ background: '#fff3d6', color: '#7a5c00', padding: '2px 8px', borderRadius: '99px', fontSize: '11px' }}>{c.parent}</span>
                            : <span style={{ background: '#e0f5ed', color: '#004d38', padding: '2px 8px', borderRadius: '99px', fontSize: '11px' }}>Top-level</span>
                          }
                        </td>
                        <td className="px-4 py-3 font-bold text-on-surface" style={{ fontSize: '13px' }}>{c.products}</td>
                        <td className="px-4 py-3 text-on-surface-variant" style={{ fontSize: '12px', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.desc}</td>
                        <td className="px-4 py-3">
                          {c.status === 'Active'
                            ? <span style={{ background: '#e0f5ed', color: '#004d38', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>Active</span>
                            : <span style={{ background: '#e5e7eb', color: '#374151', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>Inactive</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors" style={{ borderColor: '#c8e4d8' }}
                              onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = '#e0f5ed'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#00694c'; }}
                              onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; (e.currentTarget as HTMLButtonElement).style.borderColor = '#c8e4d8'; }} title="Edit">
                              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#3d4943' }}>edit</span>
                            </button>
                            <button onClick={() => openDelete(c.id)} className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors" style={{ borderColor: '#c8e4d8' }}
                              onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fee2e2'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#dc2626'; }}
                              onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; (e.currentTarget as HTMLButtonElement).style.borderColor = '#c8e4d8'; }} title="Delete">
                              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#3d4943' }}>delete</span>
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
              <p className="text-on-surface-variant" style={{ fontSize: '13px' }}>Showing {data.length} of {categories.length} categories</p>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-surface-container" style={{ borderColor: '#c8e4d8' }}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_left</span></button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold btn-primary" style={{ fontSize: '13px' }}>1</button>
                <button className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-surface-container" style={{ borderColor: '#c8e4d8', fontSize: '13px' }}>2</button>
                <button className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-surface-container" style={{ borderColor: '#c8e4d8' }}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span></button>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-auto p-8 text-center border-t" style={{ borderColor: '#c8e4d8' }}>
          <p className="text-on-surface-variant" style={{ fontSize: '14px' }}>© 2024 RetailPro Management System. All rights reserved.</p>
        </footer>
      </main>

      {/* Add/Edit Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) setFormOpen(false); }}>
          <div className="bg-surface-container-lowest rounded-xl border w-[480px] max-w-[95vw] max-h-[90vh] overflow-y-auto" style={{ borderColor: '#c8e4d8' }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#c8e4d8' }}>
              <h3 className="font-bold text-on-surface" style={{ fontSize: '18px' }}>{editId ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setFormOpen(false)} className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container rounded-full p-1">close</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Category Name *</label>
                <input type="text" placeholder="Enter category name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="w-full rounded-lg px-3 py-2 focus:outline-none" style={{ border: '1.5px solid #c8e4d8', background: '#f4fbf7', fontSize: '14px' }} />
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Parent Category</label>
                <select value={form.parent} onChange={e => setForm(f => ({...f, parent: e.target.value}))} className="w-full rounded-lg px-3 py-2 focus:outline-none" style={{ border: '1.5px solid #c8e4d8', background: '#f4fbf7', fontSize: '14px' }}>
                  <option value="">None (Top-level category)</option>
                  <option>Electronics</option>
                  <option>Food &amp; Beverage</option>
                  <option>Household</option>
                  <option>Personal Care</option>
                </select>
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Description</label>
                <textarea rows={3} placeholder="Describe this category..." value={form.desc} onChange={e => setForm(f => ({...f, desc: e.target.value}))} className="w-full rounded-lg px-3 py-2 focus:outline-none resize-none" style={{ border: '1.5px solid #c8e4d8', background: '#f4fbf7', fontSize: '14px' }} />
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} className="w-full rounded-lg px-3 py-2 focus:outline-none" style={{ border: '1.5px solid #c8e4d8', background: '#f4fbf7', fontSize: '14px' }}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: '#c8e4d8' }}>
              <button onClick={() => setFormOpen(false)} className="px-4 py-2 rounded-lg border text-on-surface-variant hover:bg-surface-container" style={{ borderColor: '#c8e4d8', fontSize: '14px' }}>Cancel</button>
              <button onClick={saveCategory} className="btn-primary px-4 py-2 rounded-lg text-white font-bold" style={{ fontSize: '14px' }}>Save Category</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {delOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) setDelOpen(false); }}>
          <div className="bg-surface-container-lowest rounded-xl border w-[360px] p-8 text-center" style={{ borderColor: '#c8e4d8' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#fee2e2' }}>
              <span className="material-symbols-outlined" style={{ color: '#991b1b', fontSize: '28px' }}>delete</span>
            </div>
            <h3 className="font-bold text-on-surface mb-2" style={{ fontSize: '18px' }}>Delete category?</h3>
            <p className="text-on-surface-variant mb-2" style={{ fontSize: '14px' }}>&quot;{categories.find(c => c.id === deleteId)?.name}&quot; will be permanently removed.</p>
            <p className="mb-6" style={{ fontSize: '12px', color: '#854f0b' }}>⚠ Products in this category will be uncategorized.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDelOpen(false)} className="px-5 py-2 rounded-lg border text-on-surface-variant hover:bg-surface-container" style={{ borderColor: '#c8e4d8', fontSize: '14px' }}>Cancel</button>
              <button onClick={confirmDelete} className="px-5 py-2 rounded-lg text-white font-bold" style={{ background: '#dc2626', fontSize: '14px' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

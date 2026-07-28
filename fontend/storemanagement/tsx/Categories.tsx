import React, { useState } from 'react';
import Layout from '../components/Layout';

interface Category {
  id: number;
  name: string;
  parent: string;
  products: number;
  desc: string;
  status: 'Active' | 'Inactive';
}

const iconMap: Record<string, { icon: string; bg: string; color: string }> = {
  'Electronics':     { icon: 'devices',           bg: '#e0f5ed', color: '#00694c' },
  'Food & Beverage': { icon: 'restaurant',         bg: '#fff3d6', color: '#b47b10' },
  'Household':       { icon: 'home',               bg: '#e0f5ed', color: '#00694c' },
  'Personal Care':   { icon: 'spa',                bg: '#fff3d6', color: '#b47b10' },
  'Beverages':       { icon: 'local_cafe',          bg: '#fff3d6', color: '#b47b10' },
  'Bakery':          { icon: 'bakery_dining',       bg: '#fff3d6', color: '#b47b10' },
  'Supplies':        { icon: 'inventory',           bg: '#e0f5ed', color: '#00694c' },
  'Groceries':       { icon: 'local_grocery_store', bg: '#e0f5ed', color: '#00694c' },
  'Mobile Phones':   { icon: 'smartphone',          bg: '#e0f5ed', color: '#00694c' },
  'Laptops':         { icon: 'laptop',              bg: '#e0f5ed', color: '#00694c' },
  'Skincare':        { icon: 'face',                bg: '#fff3d6', color: '#b47b10' },
  'Hair Care':       { icon: 'content_cut',         bg: '#fff3d6', color: '#b47b10' },
};
const defaultIcon = { icon: 'category', bg: '#e0f5ed', color: '#00694c' };

const initialCategories: Category[] = [
  { id: 1,  name: 'Electronics',     parent: '',               products: 52, desc: 'Consumer electronics and gadgets',       status: 'Active'   },
  { id: 2,  name: 'Food & Beverage', parent: '',               products: 84, desc: 'Food, drinks and grocery items',         status: 'Active'   },
  { id: 3,  name: 'Household',       parent: '',               products: 36, desc: 'Home cleaning and maintenance products', status: 'Active'   },
  { id: 4,  name: 'Personal Care',   parent: '',               products: 28, desc: 'Beauty and personal hygiene products',   status: 'Active'   },
  { id: 5,  name: 'Beverages',       parent: 'Food & Beverage',products: 22, desc: 'Drinks, juices, teas and coffees',       status: 'Active'   },
  { id: 6,  name: 'Bakery',          parent: 'Food & Beverage',products: 18, desc: 'Breads, pastries and baked goods',       status: 'Active'   },
  { id: 7,  name: 'Groceries',       parent: 'Food & Beverage',products: 44, desc: 'Everyday grocery essentials',            status: 'Active'   },
  { id: 8,  name: 'Supplies',        parent: 'Household',      products: 14, desc: 'General supplies and stationery',        status: 'Inactive' },
  { id: 9,  name: 'Mobile Phones',   parent: 'Electronics',    products: 16, desc: 'Smartphones and accessories',            status: 'Active'   },
  { id: 10, name: 'Laptops',         parent: 'Electronics',    products: 12, desc: 'Laptop computers and peripherals',       status: 'Inactive' },
  { id: 11, name: 'Skincare',        parent: 'Personal Care',  products: 19, desc: 'Skincare and facial products',           status: 'Active'   },
  { id: 12, name: 'Hair Care',       parent: 'Personal Care',  products: 9,  desc: 'Shampoo, conditioner and styling',       status: 'Inactive' },
];

const statusBadge = (s: string) =>
  s === 'Active'
    ? <span style={{ background: '#e0f5ed', color: '#004d38', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>Active</span>
    : <span style={{ background: '#e5e7eb', color: '#374151', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>Inactive</span>;

const emptyForm = { name: '', parent: '', desc: '', status: 'Active' as 'Active' | 'Inactive' };

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [checkAll, setCheckAll] = useState(false);

  const filtered = categories.filter(c =>
    (!search || c.name.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || c.status === statusFilter) &&
    (!typeFilter || (typeFilter === 'Parent' ? !c.parent : !!c.parent))
  );

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (c: Category) => { setEditId(c.id); setForm({ name: c.name, parent: c.parent, desc: c.desc, status: c.status }); setShowForm(true); };
  const save = () => {
    if (!form.name.trim()) return alert('Category name is required');
    if (editId !== null) {
      setCategories(prev => prev.map(c => c.id === editId ? { ...c, ...form } : c));
    } else {
      setCategories(prev => [...prev, { id: Date.now(), ...form, products: 0 }]);
    }
    setShowForm(false);
  };
  const confirmDel = () => {
    setCategories(prev => prev.filter(c => c.id !== deleteId));
    setShowDel(false);
  };

  const statCards = [
    { label: 'Total Categories', value: 18, icon: 'category', trend: '+2 this month', borderColor: '#b8e0cc', iconBg: '#e0f5ed', iconColor: '#00694c', trendColor: '#00694c', trendIcon: 'trending_up', shadow: '0 0 0 1px #00694c1a, 0 4px 20px #00694c14' },
    { label: 'Active Categories', value: 15, icon: 'check_circle', trend: '83% of total', borderColor: '#fcd97a', iconBg: '#fff3d6', iconColor: '#b47b10', trendColor: '#b47b10', shadow: '0 0 0 1px #f59e0b1a, 0 4px 20px #f59e0b14' },
    { label: 'Total Products', value: 248, icon: 'shopping_bag', trend: 'Across all categories', borderColor: '#b8e0cc', iconBg: '#e0f5ed', iconColor: '#00694c', trendColor: '#00694c', shadow: '0 0 0 1px #00694c1a, 0 4px 20px #00694c14' },
    { label: 'Inactive', value: 3, icon: 'block', trend: 'Need review', borderColor: '#fac057', iconBg: '#fff3d6', iconColor: '#854f0b', trendColor: '#854f0b', shadow: '0 0 0 1px #D9770622, 0 4px 20px #D9770614', valueColor: '#854f0b' },
  ];

  const btnStyle = (base?: React.CSSProperties): React.CSSProperties => ({
    background: 'linear-gradient(135deg, #00694c 0%, #00a86b 100%)', color: '#fff',
    boxShadow: '0 2px 8px #00694c33', border: 'none', borderRadius: 8, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 14, fontWeight: 700,
    transition: 'all .15s', ...base,
  });

  return (
    <Layout activePage="categories" title="Categories" searchPlaceholder="Search category name..." onSearch={setSearch}>
      <div style={{ padding: 32 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, marginBottom: 24 }}>
          {statCards.map((c, i) => (
            <div key={i} style={{ background: '#fff', border: `1px solid ${c.borderColor}`, borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: c.shadow, transition: 'transform 0.18s ease', cursor: 'default' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = '')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#3d4943', marginBottom: 4 }}>{c.label}</p>
                  <h3 style={{ fontSize: 24, fontWeight: 700, color: c.valueColor || '#191c1e' }}>{c.value}</h3>
                </div>
                <span className="material-symbols-outlined" style={{ padding: 8, borderRadius: 8, color: c.iconColor, background: c.iconBg }}>{c.icon}</span>
              </div>
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
                {c.trendIcon && <span className="material-symbols-outlined" style={{ color: c.trendColor, fontSize: 18 }}>{c.trendIcon}</span>}
                <span style={{ fontSize: 10, fontWeight: 600, color: c.trendColor }}>{c.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div style={{ background: '#fff', border: '1px solid #c8e4d8', borderRadius: 12, overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding: '24px', borderBottom: '1px solid #c8e4d8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              {[{ id: 'status', value: statusFilter, onChange: setStatusFilter, opts: ['All Status', 'Active', 'Inactive'] },
                { id: 'parent', value: typeFilter, onChange: setTypeFilter, opts: ['All Types', 'Parent', 'Sub-category'] }].map(f => (
                <select key={f.id} value={f.value} onChange={e => f.onChange(e.target.value === f.opts[0] ? '' : e.target.value)}
                  style={{ background: '#fff8e6', border: '1.5px solid #fcd97a', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#3d4943', outline: 'none' }}>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              ))}
            </div>
            <button onClick={openAdd} style={btnStyle()}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
              Add Category
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#f4fbf7' }}>
                <tr>
                  <th style={{ padding: '12px 16px', width: 40 }}><input type="checkbox" checked={checkAll} onChange={e => setCheckAll(e.target.checked)} /></th>
                  {['Category', 'Parent', 'Products', 'Description', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', fontSize: 10, fontWeight: 600, color: '#3d4943', textTransform: 'uppercase', textAlign: h === 'Actions' ? 'center' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const ic = iconMap[c.name] || defaultIcon;
                  return (
                    <tr key={c.id} style={{ borderTop: '1px solid #c8e4d8', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f4fbf7')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      <td style={{ padding: '12px 16px' }}><input type="checkbox" checked={checkAll} onChange={() => {}} /></td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: ic.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span className="material-symbols-outlined" style={{ color: ic.color, fontSize: 18 }}>{ic.icon}</span>
                          </div>
                          <p style={{ fontWeight: 700, color: '#191c1e', fontSize: 13 }}>{c.name}</p>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {c.parent
                          ? <span style={{ background: '#fff3d6', color: '#7a5c00', padding: '2px 8px', borderRadius: 999, fontSize: 11 }}>{c.parent}</span>
                          : <span style={{ background: '#e0f5ed', color: '#004d38', padding: '2px 8px', borderRadius: 999, fontSize: 11 }}>Top-level</span>}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: 13 }}>{c.products}</td>
                      <td style={{ padding: '12px 16px', color: '#3d4943', fontSize: 12, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.desc}</td>
                      <td style={{ padding: '12px 16px' }}>{statusBadge(c.status)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                          {[{ icon: 'edit', hoverBg: '#e0f5ed', hoverBorder: '#00694c', action: () => openEdit(c) },
                            { icon: 'delete', hoverBg: '#fee2e2', hoverBorder: '#dc2626', action: () => { setDeleteId(c.id); setShowDel(true); } }].map(btn => (
                            <button key={btn.icon} onClick={btn.action}
                              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #c8e4d8', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = btn.hoverBg; e.currentTarget.style.borderColor = btn.hoverBorder; }}
                              onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = '#c8e4d8'; }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#3d4943' }}>{btn.icon}</span>
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid #c8e4d8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ color: '#3d4943', fontSize: 13 }}>Showing {filtered.length} of {categories.length} categories</p>
            <div style={{ display: 'flex', gap: 4 }}>
              {[{ icon: 'chevron_left' }, { page: 1, active: true }, { page: 2 }, { icon: 'chevron_right' }].map((btn, i) => (
                <button key={i} style={{ width: 32, height: 32, borderRadius: 8, border: btn.active ? 'none' : '1px solid #c8e4d8', background: btn.active ? 'linear-gradient(135deg, #00694c 0%, #00a86b 100%)' : 'none', color: btn.active ? '#fff' : '#191c1e', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, fontWeight: btn.active ? 700 : 400 }}>
                  {btn.icon ? <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{btn.icon}</span> : btn.page}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #c8e4d8', width: 480, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: 24, borderBottom: '1px solid #c8e4d8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 700, fontSize: 18 }}>{editId ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setShowForm(false)} className="material-symbols-outlined" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3d4943' }}>close</button>
            </div>
            <div style={{ padding: 24 }}>
              {[
                { label: 'Category Name *', type: 'input', key: 'name', placeholder: 'Enter category name' },
              ].map(() => null)}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#3d4943', marginBottom: 4 }}>Category Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Enter category name"
                  style={{ width: '100%', border: '1.5px solid #c8e4d8', borderRadius: 8, padding: '8px 12px', fontSize: 14, background: '#f4fbf7', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#3d4943', marginBottom: 4 }}>Parent Category</label>
                <select value={form.parent} onChange={e => setForm(f => ({ ...f, parent: e.target.value }))}
                  style={{ width: '100%', border: '1.5px solid #c8e4d8', borderRadius: 8, padding: '8px 12px', fontSize: 14, background: '#f4fbf7', outline: 'none' }}>
                  <option value="">None (Top-level category)</option>
                  {['Electronics', 'Food & Beverage', 'Household', 'Personal Care'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#3d4943', marginBottom: 4 }}>Description</label>
                <textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} rows={3} placeholder="Describe this category..."
                  style={{ width: '100%', border: '1.5px solid #c8e4d8', borderRadius: 8, padding: '8px 12px', fontSize: 14, background: '#f4fbf7', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#3d4943', marginBottom: 4 }}>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
                  style={{ width: '100%', border: '1.5px solid #c8e4d8', borderRadius: 8, padding: '8px 12px', fontSize: 14, background: '#f4fbf7', outline: 'none' }}>
                  <option>Active</option><option>Inactive</option>
                </select>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #c8e4d8', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #c8e4d8', background: 'none', color: '#3d4943', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={save} style={btnStyle()}>Save Category</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setShowDel(false)}>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #c8e4d8', width: 360, padding: 32, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span className="material-symbols-outlined" style={{ color: '#991b1b', fontSize: 28 }}>delete</span>
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Delete category?</h3>
            <p style={{ color: '#3d4943', fontSize: 14, marginBottom: 8 }}>"{categories.find(c => c.id === deleteId)?.name}" will be permanently removed.</p>
            <p style={{ fontSize: 12, color: '#854f0b', marginBottom: 24 }}>⚠ Products in this category will be uncategorized.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setShowDel(false)} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #c8e4d8', background: 'none', color: '#3d4943', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDel} style={{ padding: '8px 20px', borderRadius: 8, background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Categories;

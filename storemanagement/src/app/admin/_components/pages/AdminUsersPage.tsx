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

const avatarColors = ['#00694c','#b47b10','#00694c','#b47b10','#004d38','#854f0b','#00a86b','#f59e0b'];

function initials(name: string) { return name.split(' ').map((w: string) => w[0]).slice(-2).join('').toUpperCase(); }

interface Customer { id: number; name: string; gender: string; phone: string; email: string; address: string; username: string; points: number; registered: string; status: string; }
interface Staff { id: number; name: string; phone: string; email: string; username: string; role: string; address: string; status: string; }

const initialCustomers: Customer[] = [
  { id:1,  name:'Minh Hoang',  gender:'Male',   phone:'0901234567', email:'minh@gmail.com',     address:'123 Le Loi, Q1',       username:'minhhoang',  points:1250, registered:'12 Jan 2024', status:'Active' },
  { id:2,  name:'Phuong Linh', gender:'Female', phone:'0912345678', email:'phuong@gmail.com',   address:'45 Nguyen Hue, Q1',    username:'phuonglinh', points:890,  registered:'20 Jan 2024', status:'Active' },
  { id:3,  name:'Tran Anh',    gender:'Male',   phone:'0923456789', email:'trananh@gmail.com',  address:'78 Hai Ba Trung, Q3',  username:'trananh',    points:2100, registered:'05 Feb 2024', status:'Active' },
  { id:4,  name:'Duc Huy',     gender:'Male',   phone:'0934567890', email:'duchuy@gmail.com',   address:'12 Vo Van Tan, Q3',    username:'duchuy',     points:450,  registered:'14 Feb 2024', status:'Locked' },
  { id:5,  name:'Lan Anh',     gender:'Female', phone:'0945678901', email:'lananh@gmail.com',   address:'22 Vo Thi Sau, Q3',    username:'lananh',     points:980,  registered:'01 Mar 2024', status:'Active' },
  { id:6,  name:'Bao Long',    gender:'Male',   phone:'0956789012', email:'baolong@gmail.com',  address:'55 CMT8, Q10',         username:'baolong',    points:320,  registered:'10 Mar 2024', status:'Active' },
  { id:7,  name:'Thu Hang',    gender:'Female', phone:'0967890123', email:'thuhang@gmail.com',  address:'33 Le Van Sy, Q3',     username:'thuhang',    points:1560, registered:'22 Mar 2024', status:'Active' },
  { id:8,  name:'Quoc Viet',   gender:'Male',   phone:'0978901234', email:'quocviet@gmail.com', address:'88 Nguyen Dinh Chieu', username:'quocviet',   points:760,  registered:'05 Apr 2024', status:'Locked' },
  { id:9,  name:'My Linh',     gender:'Female', phone:'0989012345', email:'mylinh@gmail.com',   address:'17 Tran Hung Dao, Q1', username:'mylinh',     points:430,  registered:'18 Apr 2024', status:'Active' },
  { id:10, name:'Thanh Tung',  gender:'Male',   phone:'0990123456', email:'thanhtung@gmail.com',address:'9 Dinh Tien Hoang, Q1',username:'thanhtung',  points:95,   registered:'02 May 2024', status:'Locked' },
];

const initialStaff: Staff[] = [
  { id:1, name:'Alex Nguyen', phone:'0901111111', email:'alex@retailpro.vn',  username:'alex.nguyen', role:'Admin', address:'HCM City', status:'Active' },
  { id:2, name:'Minh Tran',   phone:'0902222222', email:'minh@retailpro.vn',  username:'minh.tran',   role:'Staff', address:'HCM City', status:'Active' },
  { id:3, name:'Lan Pham',    phone:'0903333333', email:'lan@retailpro.vn',   username:'lan.pham',    role:'Staff', address:'HCM City', status:'Active' },
  { id:4, name:'Hung Le',     phone:'0904444444', email:'hung@retailpro.vn',  username:'hung.le',     role:'Staff', address:'HCM City', status:'Active' },
  { id:5, name:'Thao Nguyen', phone:'0905555555', email:'thao@retailpro.vn',  username:'thao.nguyen', role:'Staff', address:'HCM City', status:'Locked' },
];

const emptyCust = { name: '', gender: 'Male', phone: '', email: '', address: '', username: '', status: 'Active' };
const emptyStaff = { name: '', phone: '', email: '', username: '', password: '', address: '', role: 'Staff', status: 'Active' };

export default function AdminUsersPage({ activePage, onNav }: Props) {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [activeTab, setActiveTab] = useState<'customers' | 'staff'>('customers');
  const [search, setSearch] = useState('');
  const [custStatusFilter, setCustStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Customer modal
  const [custOpen, setCustOpen] = useState(false);
  const [editCustId, setEditCustId] = useState<number | null>(null);
  const [custForm, setCustForm] = useState(emptyCust);

  // Staff modal
  const [staffOpen, setStaffOpen] = useState(false);
  const [editStaffId, setEditStaffId] = useState<number | null>(null);
  const [staffForm, setStaffForm] = useState(emptyStaff);

  // Lock modal
  const [lockOpen, setLockOpen] = useState(false);
  const [lockTarget, setLockTarget] = useState<number | null>(null);
  const [lockType, setLockType] = useState<'customer' | 'staff'>('customer');

  const filteredCustomers = () => customers.filter(c =>
    (!search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.email.toLowerCase().includes(search.toLowerCase())) &&
    (!custStatusFilter || c.status === custStatusFilter) &&
    (!genderFilter || c.gender === genderFilter)
  );

  const filteredStaff = () => staff.filter(s =>
    (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search) || s.email.toLowerCase().includes(search.toLowerCase())) &&
    (!roleFilter || s.role === roleFilter)
  );

  const openAddCust = () => { setEditCustId(null); setCustForm(emptyCust); setCustOpen(true); };
  const openEditCust = (id: number) => {
    const c = customers.find(x => x.id === id);
    if (!c) return;
    setEditCustId(id);
    setCustForm({ name: c.name, gender: c.gender, phone: c.phone, email: c.email, address: c.address, username: c.username, status: c.status });
    setCustOpen(true);
  };
  const saveCust = () => {
    if (!custForm.name.trim()) { alert('Name is required'); return; }
    if (editCustId) {
      setCustomers(prev => prev.map(c => c.id === editCustId ? { ...c, ...custForm } : c));
    } else {
      setCustomers(prev => [...prev, { id: Date.now(), ...custForm, points: 0, registered: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }]);
    }
    setCustOpen(false);
  };

  const openAddStaff = () => { setEditStaffId(null); setStaffForm(emptyStaff); setStaffOpen(true); };
  const openEditStaff = (id: number) => {
    const s = staff.find(x => x.id === id);
    if (!s) return;
    setEditStaffId(id);
    setStaffForm({ name: s.name, phone: s.phone, email: s.email, username: s.username, password: '', address: s.address, role: s.role, status: s.status });
    setStaffOpen(true);
  };
  const saveStaff = () => {
    if (!staffForm.name.trim()) { alert('Name is required'); return; }
    if (editStaffId) {
      setStaff(prev => prev.map(s => s.id === editStaffId ? { ...s, ...staffForm } : s));
    } else {
      setStaff(prev => [...prev, { id: Date.now(), name: staffForm.name, phone: staffForm.phone, email: staffForm.email, username: staffForm.username, address: staffForm.address, role: staffForm.role, status: staffForm.status }]);
    }
    setStaffOpen(false);
  };

  const openLock = (id: number, type: 'customer' | 'staff') => { setLockTarget(id); setLockType(type); setLockOpen(true); };
  const confirmLock = () => {
    if (lockType === 'customer') {
      setCustomers(prev => prev.map(c => c.id === lockTarget ? { ...c, status: c.status === 'Active' ? 'Locked' : 'Active' } : c));
    } else {
      setStaff(prev => prev.map(s => s.id === lockTarget ? { ...s, status: s.status === 'Active' ? 'Locked' : 'Active' } : s));
    }
    setLockOpen(false);
  };

  const lockUser = lockType === 'customer'
    ? customers.find(c => c.id === lockTarget)
    : staff.find(s => s.id === lockTarget);
  const isLocking = lockUser?.status === 'Active';

  const custData = filteredCustomers();
  const staffData = filteredStaff();

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
            <h2 className="font-bold" style={{ fontSize: '24px', color: '#00694c' }}>Users</h2>
            <div className="search-bar hidden lg:flex w-80">
              <span className="material-symbols-outlined" style={{ color: '#b47b10', fontSize: '20px' }}>search</span>
              <input placeholder="Search name, phone, email..." value={search} onChange={e => setSearch(e.target.value)} />
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
                <div><p className="text-on-surface-variant font-label-md text-label-md mb-1">Total Customers</p><h3 className="font-bold" style={{ fontSize: '24px' }}>1,284</h3></div>
                <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#00694c', background: '#e0f5ed' }}>group</span>
              </div>
              <div className="mt-4 flex items-center gap-1"><span className="material-symbols-outlined" style={{ color: '#00694c', fontSize: '18px' }}>trending_up</span><span className="font-label-sm text-label-sm" style={{ color: '#00694c' }}>+28 this month</span></div>
            </div>
            <div className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between" style={{ borderColor: '#fcd97a', boxShadow: '0 0 0 1px #f59e0b1a,0 4px 20px #f59e0b14' }}>
              <div className="flex justify-between items-start">
                <div><p className="text-on-surface-variant font-label-md text-label-md mb-1">Staff Accounts</p><h3 className="font-bold" style={{ fontSize: '24px' }}>8</h3></div>
                <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#b47b10', background: '#fff3d6' }}>badge</span>
              </div>
              <div className="mt-4"><span className="font-label-sm text-label-sm" style={{ color: '#b47b10' }}>Active employees</span></div>
            </div>
            <div className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between" style={{ borderColor: '#b8e0cc', boxShadow: '0 0 0 1px #00694c1a,0 4px 20px #00694c14' }}>
              <div className="flex justify-between items-start">
                <div><p className="text-on-surface-variant font-label-md text-label-md mb-1">New This Month</p><h3 className="font-bold" style={{ fontSize: '24px' }}>28</h3></div>
                <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#00694c', background: '#e0f5ed' }}>person_add</span>
              </div>
              <div className="mt-4 flex items-center gap-1"><span className="material-symbols-outlined" style={{ color: '#00694c', fontSize: '18px' }}>trending_up</span><span className="font-label-sm text-label-sm" style={{ color: '#00694c' }}>+5.2% vs last month</span></div>
            </div>
            <div className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between" style={{ borderColor: '#fca5a5', boxShadow: '0 0 0 1px #dc262622,0 4px 20px #dc262614' }}>
              <div className="flex justify-between items-start">
                <div><p className="text-on-surface-variant font-label-md text-label-md mb-1">Locked Accounts</p><h3 className="font-bold" style={{ fontSize: '24px', color: '#dc2626' }}>3</h3></div>
                <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#dc2626', background: '#fee2e2' }}>lock</span>
              </div>
              <div className="mt-4"><span className="font-label-sm text-label-sm" style={{ color: '#dc2626' }}>Need review</span></div>
            </div>
          </div>

          {/* Tabs + Table */}
          <div className="bg-surface-container-lowest border rounded-xl overflow-hidden" style={{ borderColor: '#c8e4d8' }}>
            <div className="flex border-b px-6" style={{ borderColor: '#c8e4d8' }}>
              <button className={`tab-btn${activeTab === 'customers' ? ' tab-active' : ''}`} onClick={() => setActiveTab('customers')}>Customers</button>
              <button className={`tab-btn${activeTab === 'staff' ? ' tab-active' : ''}`} onClick={() => setActiveTab('staff')}>Staff</button>
            </div>

            {/* Customers Tab */}
            {activeTab === 'customers' && (
              <>
                <div className="p-6 border-b flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: '#c8e4d8' }}>
                  <div className="flex items-center gap-3">
                    <select value={custStatusFilter} onChange={e => setCustStatusFilter(e.target.value)} className="filter-select">
                      <option value="">All Status</option>
                      <option>Active</option>
                      <option>Locked</option>
                    </select>
                    <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} className="filter-select">
                      <option value="">All Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                  <button onClick={openAddCust} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg font-bold" style={{ fontSize: '14px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                    Add Customer
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead style={{ background: '#f4fbf7' }}>
                      <tr>
                        <th className="px-4 py-3 w-10"><input type="checkbox" className="rounded" /></th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Customer</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Phone</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Email</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Loyalty Points</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Registered</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Status</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: '#c8e4d8' }}>
                      {custData.map((c, i) => (
                        <tr key={c.id} className="transition-colors" style={{ borderColor: '#c8e4d8' }}>
                          <td className="px-4 py-3"><input type="checkbox" className="rounded" /></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: avatarColors[i % avatarColors.length], fontSize: '12px' }}>
                                {initials(c.name)}
                              </div>
                              <div>
                                <p className="font-bold text-on-surface" style={{ fontSize: '13px' }}>{c.name}</p>
                                <p className="text-on-surface-variant" style={{ fontSize: '11px' }}>{c.gender}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-on-surface" style={{ fontSize: '13px' }}>{c.phone}</td>
                          <td className="px-4 py-3 text-on-surface-variant" style={{ fontSize: '12px' }}>{c.email}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#f59e0b' }}>star</span>
                              <span className="font-bold text-on-surface" style={{ fontSize: '13px' }}>{c.points.toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-on-surface-variant" style={{ fontSize: '12px' }}>{c.registered}</td>
                          <td className="px-4 py-3">
                            {c.status === 'Active'
                              ? <span style={{ background: '#e0f5ed', color: '#004d38', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>Active</span>
                              : <span style={{ background: '#fee2e2', color: '#7f1d1d', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>Locked</span>
                            }
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => openEditCust(c.id)} className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors" style={{ borderColor: '#c8e4d8' }}
                                onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = '#e0f5ed'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#00694c'; }}
                                onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; (e.currentTarget as HTMLButtonElement).style.borderColor = '#c8e4d8'; }} title="Edit">
                                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#3d4943' }}>edit</span>
                              </button>
                              <button onClick={() => openLock(c.id, 'customer')} className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors" style={{ borderColor: '#c8e4d8' }}
                                onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = c.status === 'Active' ? '#fff3d6' : '#e0f5ed'; (e.currentTarget as HTMLButtonElement).style.borderColor = c.status === 'Active' ? '#f59e0b' : '#00694c'; }}
                                onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; (e.currentTarget as HTMLButtonElement).style.borderColor = '#c8e4d8'; }} title={c.status === 'Active' ? 'Lock' : 'Unlock'}>
                                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#3d4943' }}>{c.status === 'Active' ? 'lock' : 'lock_open'}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: '#c8e4d8' }}>
                  <p className="text-on-surface-variant" style={{ fontSize: '13px' }}>Showing {custData.length} of {customers.length} customers</p>
                  <div className="flex items-center gap-1">
                    <button className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-surface-container" style={{ borderColor: '#c8e4d8' }}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_left</span></button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold btn-primary" style={{ fontSize: '13px' }}>1</button>
                    <button className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-surface-container" style={{ borderColor: '#c8e4d8', fontSize: '13px' }}>2</button>
                    <button className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-surface-container" style={{ borderColor: '#c8e4d8' }}><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span></button>
                  </div>
                </div>
              </>
            )}

            {/* Staff Tab */}
            {activeTab === 'staff' && (
              <>
                <div className="p-6 border-b flex items-center justify-between gap-3" style={{ borderColor: '#c8e4d8' }}>
                  <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="filter-select">
                    <option value="">All Roles</option>
                    <option>Admin</option>
                    <option>Staff</option>
                  </select>
                  <button onClick={openAddStaff} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg font-bold" style={{ fontSize: '14px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                    Add Staff
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead style={{ background: '#f4fbf7' }}>
                      <tr>
                        <th className="px-4 py-3 w-10"><input type="checkbox" className="rounded" /></th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Staff</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Phone</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Email</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Role</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Status</th>
                        <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: '#c8e4d8' }}>
                      {staffData.map((s, i) => (
                        <tr key={s.id} className="transition-colors" style={{ borderColor: '#c8e4d8' }}>
                          <td className="px-4 py-3"><input type="checkbox" className="rounded" /></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: avatarColors[(i + 2) % avatarColors.length], fontSize: '12px' }}>
                                {initials(s.name)}
                              </div>
                              <div>
                                <p className="font-bold text-on-surface" style={{ fontSize: '13px' }}>{s.name}</p>
                                <p className="text-on-surface-variant" style={{ fontSize: '11px' }}>{s.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-on-surface" style={{ fontSize: '13px' }}>{s.phone}</td>
                          <td className="px-4 py-3 text-on-surface-variant" style={{ fontSize: '12px' }}>{s.email}</td>
                          <td className="px-4 py-3">
                            {s.role === 'Admin'
                              ? <span style={{ background: '#fff3d6', color: '#7a5c00', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600 }}>Admin</span>
                              : <span style={{ background: '#e0f5ed', color: '#004d38', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600 }}>Staff</span>
                            }
                          </td>
                          <td className="px-4 py-3">
                            {s.status === 'Active'
                              ? <span style={{ background: '#e0f5ed', color: '#004d38', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>Active</span>
                              : <span style={{ background: '#fee2e2', color: '#7f1d1d', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>Locked</span>
                            }
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => openEditStaff(s.id)} className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors" style={{ borderColor: '#c8e4d8' }}
                                onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = '#e0f5ed'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#00694c'; }}
                                onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; (e.currentTarget as HTMLButtonElement).style.borderColor = '#c8e4d8'; }} title="Edit">
                                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#3d4943' }}>edit</span>
                              </button>
                              <button onClick={() => openLock(s.id, 'staff')} className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors" style={{ borderColor: '#c8e4d8' }}
                                onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = s.status === 'Active' ? '#fff3d6' : '#e0f5ed'; (e.currentTarget as HTMLButtonElement).style.borderColor = s.status === 'Active' ? '#f59e0b' : '#00694c'; }}
                                onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; (e.currentTarget as HTMLButtonElement).style.borderColor = '#c8e4d8'; }} title={s.status === 'Active' ? 'Lock' : 'Unlock'}>
                                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#3d4943' }}>{s.status === 'Active' ? 'lock' : 'lock_open'}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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

      {/* Customer Modal */}
      {custOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) setCustOpen(false); }}>
          <div className="bg-surface-container-lowest rounded-xl border w-[520px] max-w-[95vw] max-h-[90vh] overflow-y-auto" style={{ borderColor: '#c8e4d8' }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#c8e4d8' }}>
              <h3 className="font-bold text-on-surface" style={{ fontSize: '18px' }}>{editCustId ? 'Edit Customer' : 'Add Customer'}</h3>
              <button onClick={() => setCustOpen(false)} className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container rounded-full p-1">close</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Full Name *</label>
                  <input type="text" placeholder="Enter full name" value={custForm.name} onChange={e => setCustForm(p => ({ ...p, name: e.target.value }))} className="modal-input" />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Gender</label>
                  <select value={custForm.gender} onChange={e => setCustForm(p => ({ ...p, gender: e.target.value }))} className="modal-input">
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Phone *</label>
                  <input type="text" placeholder="0901234567" value={custForm.phone} onChange={e => setCustForm(p => ({ ...p, phone: e.target.value }))} className="modal-input" />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Email</label>
                  <input type="email" placeholder="email@example.com" value={custForm.email} onChange={e => setCustForm(p => ({ ...p, email: e.target.value }))} className="modal-input" />
                </div>
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Address</label>
                <input type="text" placeholder="Street, District, City" value={custForm.address} onChange={e => setCustForm(p => ({ ...p, address: e.target.value }))} className="modal-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Username</label>
                  <input type="text" placeholder="username" value={custForm.username} onChange={e => setCustForm(p => ({ ...p, username: e.target.value }))} className="modal-input" />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Status</label>
                  <select value={custForm.status} onChange={e => setCustForm(p => ({ ...p, status: e.target.value }))} className="modal-input">
                    <option>Active</option>
                    <option>Locked</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: '#c8e4d8' }}>
              <button onClick={() => setCustOpen(false)} className="px-4 py-2 rounded-lg border text-on-surface-variant hover:bg-surface-container" style={{ borderColor: '#c8e4d8', fontSize: '14px' }}>Cancel</button>
              <button onClick={saveCust} className="btn-primary px-4 py-2 rounded-lg text-white font-bold" style={{ fontSize: '14px' }}>Save Customer</button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Modal */}
      {staffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) setStaffOpen(false); }}>
          <div className="bg-surface-container-lowest rounded-xl border w-[520px] max-w-[95vw] max-h-[90vh] overflow-y-auto" style={{ borderColor: '#c8e4d8' }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#c8e4d8' }}>
              <h3 className="font-bold text-on-surface" style={{ fontSize: '18px' }}>{editStaffId ? 'Edit Staff' : 'Add Staff'}</h3>
              <button onClick={() => setStaffOpen(false)} className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container rounded-full p-1">close</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Full Name *</label>
                  <input type="text" placeholder="Enter full name" value={staffForm.name} onChange={e => setStaffForm(p => ({ ...p, name: e.target.value }))} className="modal-input" />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Role *</label>
                  <select value={staffForm.role} onChange={e => setStaffForm(p => ({ ...p, role: e.target.value }))} className="modal-input">
                    <option>Staff</option>
                    <option>Admin</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Phone *</label>
                  <input type="text" placeholder="0901234567" value={staffForm.phone} onChange={e => setStaffForm(p => ({ ...p, phone: e.target.value }))} className="modal-input" />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Email</label>
                  <input type="email" placeholder="email@example.com" value={staffForm.email} onChange={e => setStaffForm(p => ({ ...p, email: e.target.value }))} className="modal-input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Username *</label>
                  <input type="text" placeholder="username" value={staffForm.username} onChange={e => setStaffForm(p => ({ ...p, username: e.target.value }))} className="modal-input" />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Password *</label>
                  <input type="password" placeholder="••••••••" value={staffForm.password} onChange={e => setStaffForm(p => ({ ...p, password: e.target.value }))} className="modal-input" />
                </div>
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Address</label>
                <input type="text" placeholder="Street, District, City" value={staffForm.address} onChange={e => setStaffForm(p => ({ ...p, address: e.target.value }))} className="modal-input" />
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Status</label>
                <select value={staffForm.status} onChange={e => setStaffForm(p => ({ ...p, status: e.target.value }))} className="modal-input">
                  <option>Active</option>
                  <option>Locked</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: '#c8e4d8' }}>
              <button onClick={() => setStaffOpen(false)} className="px-4 py-2 rounded-lg border text-on-surface-variant hover:bg-surface-container" style={{ borderColor: '#c8e4d8', fontSize: '14px' }}>Cancel</button>
              <button onClick={saveStaff} className="btn-primary px-4 py-2 rounded-lg text-white font-bold" style={{ fontSize: '14px' }}>Save Staff</button>
            </div>
          </div>
        </div>
      )}

      {/* Lock/Unlock Modal */}
      {lockOpen && lockUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) setLockOpen(false); }}>
          <div className="bg-surface-container-lowest rounded-xl border w-[360px] p-8 text-center" style={{ borderColor: '#c8e4d8' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: isLocking ? '#fff3d6' : '#e0f5ed' }}>
              <span className="material-symbols-outlined" style={{ color: isLocking ? '#7a5c00' : '#004d38', fontSize: '28px' }}>{isLocking ? 'lock' : 'lock_open'}</span>
            </div>
            <h3 className="font-bold text-on-surface mb-2" style={{ fontSize: '18px' }}>{isLocking ? 'Lock account?' : 'Unlock account?'}</h3>
            <p className="text-on-surface-variant mb-6" style={{ fontSize: '14px' }}>
              {isLocking ? 'Lock' : 'Unlock'} account for &quot;{lockUser.name}&quot;?
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setLockOpen(false)} className="px-5 py-2 rounded-lg border text-on-surface-variant hover:bg-surface-container" style={{ borderColor: '#c8e4d8', fontSize: '14px' }}>Cancel</button>
              <button onClick={confirmLock} className="px-5 py-2 rounded-lg text-white font-bold" style={{ background: isLocking ? '#f59e0b' : '#00694c', fontSize: '14px' }}>
                {isLocking ? 'Lock' : 'Unlock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

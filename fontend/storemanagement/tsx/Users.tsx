import React, { useState } from 'react';
import Layout from '../components/Layout';

interface Customer { id: number; name: string; gender: string; phone: string; email: string; address: string; username: string; points: number; registered: string; status: string; }
interface Staff { id: number; name: string; phone: string; email: string; username: string; role: string; address: string; status: string; }

const avatarColors = ['#00694c','#b47b10','#00694c','#b47b10','#004d38','#854f0b','#00a86b','#f59e0b'];
const initials = (name: string) => name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();

const initialCustomers: Customer[] = [
  { id:1,  name:'Minh Hoang',  gender:'Male',   phone:'0901234567', email:'minh@gmail.com',     address:'123 Le Loi, Q1',       username:'minhhoang',  points:1250, registered:'12 Jan 2024', status:'Active' },
  { id:2,  name:'Phuong Linh', gender:'Female', phone:'0912345678', email:'phuong@gmail.com',   address:'45 Nguyen Hue, Q1',    username:'phuonglinh', points:890,  registered:'20 Jan 2024', status:'Active' },
  { id:3,  name:'Tran Anh',    gender:'Male',   phone:'0923456789', email:'trananh@gmail.com',  address:'78 Hai Ba Trung, Q3',  username:'trananh',    points:2100, registered:'05 Feb 2024', status:'Active' },
  { id:4,  name:'Duc Huy',     gender:'Male',   phone:'0934567890', email:'duchuy@gmail.com',   address:'12 Vo Van Tan, Q3',    username:'duchuy',     points:450,  registered:'14 Feb 2024', status:'Locked' },
  { id:5,  name:'Lan Anh',     gender:'Female', phone:'0945678901', email:'lananh@gmail.com',   address:'22 Vo Thi Sau, Q3',    username:'lananh',     points:980,  registered:'01 Mar 2024', status:'Active' },
  { id:6,  name:'Bao Long',    gender:'Male',   phone:'0956789012', email:'baolong@gmail.com',  address:'55 CMT8, Q10',         username:'baolong',    points:320,  registered:'10 Mar 2024', status:'Active' },
  { id:7,  name:'Thu Hang',    gender:'Female', phone:'0967890123', email:'thuhang@gmail.com',  address:'33 Le Van Sy, Q3',     username:'thuhang',    points:1560, registered:'22 Mar 2024', status:'Active' },
  { id:8,  name:'Quoc Viet',   gender:'Male',   phone:'0978901234', email:'quocviet@gmail.com', address:'88 Nguyen Dinh Chieu', username:'quocviet',   points:760,  registered:'05 Apr 2024', status:'Locked' },
];

const initialStaff: Staff[] = [
  { id:1, name:'Alex Nguyen', phone:'0901111111', email:'alex@retailpro.vn',  username:'alex.nguyen', role:'Admin', address:'HCM City', status:'Active' },
  { id:2, name:'Minh Tran',   phone:'0902222222', email:'minh@retailpro.vn',  username:'minh.tran',   role:'Staff', address:'HCM City', status:'Active' },
  { id:3, name:'Lan Pham',    phone:'0903333333', email:'lan@retailpro.vn',   username:'lan.pham',    role:'Staff', address:'HCM City', status:'Active' },
  { id:4, name:'Hung Le',     phone:'0904444444', email:'hung@retailpro.vn',  username:'hung.le',     role:'Staff', address:'HCM City', status:'Active' },
  { id:5, name:'Thao Nguyen', phone:'0905555555', email:'thao@retailpro.vn',  username:'thao.nguyen', role:'Staff', address:'HCM City', status:'Locked' },
];

const emptyCustomer = { name:'', gender:'Male', phone:'', email:'', address:'', username:'', status:'Active' };
const emptyStaff = { name:'', phone:'', email:'', username:'', password:'', address:'', role:'Staff', status:'Active' };

const StatusBadge: React.FC<{ s: string }> = ({ s }) => (
  <span style={{ background:s==='Active'?'#e0f5ed':'#fee2e2', color:s==='Active'?'#004d38':'#7f1d1d', padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700 }}>{s}</span>
);

const Users: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [activeTab, setActiveTab] = useState<'customers'|'staff'>('customers');
  const [search, setSearch] = useState('');
  const [custStatusF, setCustStatusF] = useState('');
  const [genderF, setGenderF] = useState('');
  const [roleF, setRoleF] = useState('');
  const [showCustForm, setShowCustForm] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editCustId, setEditCustId] = useState<number|null>(null);
  const [editStaffId, setEditStaffId] = useState<number|null>(null);
  const [custForm, setCustForm] = useState(emptyCustomer);
  const [staffForm, setStaffForm] = useState(emptyStaff);
  const [lockTarget, setLockTarget] = useState<{id:number;type:'customer'|'staff'}|null>(null);

  const filteredCustomers = customers.filter(c =>
    (!search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.email.toLowerCase().includes(search.toLowerCase())) &&
    (!custStatusF || c.status === custStatusF) && (!genderF || c.gender === genderF)
  );
  const filteredStaff = staff.filter(s =>
    (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search) || s.email.toLowerCase().includes(search.toLowerCase())) &&
    (!roleF || s.role === roleF)
  );

  const saveCust = () => {
    if (!custForm.name.trim()) return alert('Name is required');
    if (editCustId !== null) {
      setCustomers(prev => prev.map(c => c.id === editCustId ? { ...c, ...custForm } : c));
    } else {
      setCustomers(prev => [...prev, { id:Date.now(), ...custForm, points:0, registered: new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) }]);
    }
    setShowCustForm(false);
  };

  const saveStaff = () => {
    if (!staffForm.name.trim()) return alert('Name is required');
    if (editStaffId !== null) {
      setStaff(prev => prev.map(s => s.id === editStaffId ? { ...s, ...staffForm } : s));
    } else {
      setStaff(prev => [...prev, { id:Date.now(), ...staffForm }]);
    }
    setShowStaffForm(false);
  };

  const confirmLock = () => {
    if (!lockTarget) return;
    if (lockTarget.type === 'customer') {
      setCustomers(prev => prev.map(c => c.id === lockTarget.id ? { ...c, status: c.status==='Active'?'Locked':'Active' } : c));
    } else {
      setStaff(prev => prev.map(s => s.id === lockTarget.id ? { ...s, status: s.status==='Active'?'Locked':'Active' } : s));
    }
    setLockTarget(null);
  };

  const selStyle: React.CSSProperties = { background:'#fff8e6', border:'1.5px solid #fcd97a', borderRadius:8, padding:'8px 12px', fontSize:13, color:'#3d4943', outline:'none' };
  const inputStyle: React.CSSProperties = { width:'100%', border:'1.5px solid #c8e4d8', borderRadius:8, padding:'8px 12px', fontSize:14, background:'#f4fbf7', outline:'none', boxSizing:'border-box' };
  const btnPrimary: React.CSSProperties = { background:'linear-gradient(135deg,#00694c,#00a86b)', color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:8 };
  const tabBtn = (active: boolean): React.CSSProperties => ({ padding:'8px 16px', borderRadius:8, border:'none', cursor:'pointer', fontSize:14, fontWeight:active?700:500, background:active?'#00694c':'none', color:active?'#fff':'#3d4943', transition:'all .15s' });

  const lockUser = lockTarget?.type === 'customer' ? customers.find(c => c.id === lockTarget?.id) : staff.find(s => s.id === lockTarget?.id);
  const isLocking = lockUser?.status === 'Active';

  const statCards = [
    { label:'Total Customers', value:248, icon:'group', trend:'+18 this month', borderColor:'#b8e0cc', iconBg:'#e0f5ed', iconColor:'#00694c', trendColor:'#00694c', trendIcon:'trending_up', shadow:'0 0 0 1px #00694c1a,0 4px 20px #00694c14' },
    { label:'Active Customers', value:235, icon:'person_check', trend:'94.8% active rate', borderColor:'#fcd97a', iconBg:'#fff3d6', iconColor:'#b47b10', trendColor:'#b47b10', shadow:'0 0 0 1px #f59e0b1a,0 4px 20px #f59e0b14' },
    { label:'Staff Members', value:5, icon:'badge', trend:'All positions filled', borderColor:'#b8e0cc', iconBg:'#e0f5ed', iconColor:'#00694c', trendColor:'#00694c', shadow:'0 0 0 1px #00694c1a,0 4px 20px #00694c14' },
    { label:'Locked Accounts', value:13, icon:'lock', trend:'Need review', borderColor:'#fca5a5', iconBg:'#fee2e2', iconColor:'#dc2626', trendColor:'#dc2626', shadow:'0 0 0 1px #dc262622,0 4px 20px #dc262614', valueColor:'#dc2626' },
  ];

  return (
    <Layout activePage="users" title="Users" searchPlaceholder="Search name, phone, email..." onSearch={setSearch}>
      <div style={{ padding:32 }}>
        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24, marginBottom:24 }}>
          {statCards.map((c, i) => (
            <div key={i} style={{ background:'#fff', border:`1px solid ${c.borderColor}`, borderRadius:12, padding:24, display:'flex', flexDirection:'column', justifyContent:'space-between', boxShadow:c.shadow, transition:'transform 0.18s' }}
              onMouseEnter={e => (e.currentTarget.style.transform='translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform='')}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <p style={{ fontSize:14, fontWeight:500, color:'#3d4943', marginBottom:4 }}>{c.label}</p>
                  <h3 style={{ fontSize:24, fontWeight:700, color:(c as any).valueColor||'#191c1e' }}>{c.value}</h3>
                </div>
                <span className="material-symbols-outlined" style={{ padding:8, borderRadius:8, color:c.iconColor, background:c.iconBg }}>{c.icon}</span>
              </div>
              <div style={{ marginTop:16, display:'flex', alignItems:'center', gap:4 }}>
                {(c as any).trendIcon && <span className="material-symbols-outlined" style={{ color:c.trendColor, fontSize:18 }}>{(c as any).trendIcon}</span>}
                <span style={{ fontSize:10, fontWeight:600, color:c.trendColor }}>{c.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ background:'#fff', border:'1px solid #c8e4d8', borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'16px 24px', borderBottom:'1px solid #c8e4d8', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <div style={{ display:'flex', gap:4 }}>
              <button onClick={() => setActiveTab('customers')} style={tabBtn(activeTab==='customers')}>👥 Customers ({customers.length})</button>
              <button onClick={() => setActiveTab('staff')} style={tabBtn(activeTab==='staff')}>🧑‍💼 Staff ({staff.length})</button>
            </div>
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              {activeTab === 'customers' && (
                <>
                  <select value={custStatusF} onChange={e => setCustStatusF(e.target.value)} style={selStyle}>
                    <option value="">All Status</option><option>Active</option><option>Locked</option>
                  </select>
                  <select value={genderF} onChange={e => setGenderF(e.target.value)} style={selStyle}>
                    <option value="">All Gender</option><option>Male</option><option>Female</option>
                  </select>
                  <button onClick={() => { setEditCustId(null); setCustForm(emptyCustomer); setShowCustForm(true); }} style={btnPrimary}>
                    <span className="material-symbols-outlined" style={{ fontSize:18 }}>add</span>Add Customer
                  </button>
                </>
              )}
              {activeTab === 'staff' && (
                <>
                  <select value={roleF} onChange={e => setRoleF(e.target.value)} style={selStyle}>
                    <option value="">All Roles</option><option>Admin</option><option>Staff</option>
                  </select>
                  <button onClick={() => { setEditStaffId(null); setStaffForm(emptyStaff); setShowStaffForm(true); }} style={btnPrimary}>
                    <span className="material-symbols-outlined" style={{ fontSize:18 }}>add</span>Add Staff
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Customers Table */}
          {activeTab === 'customers' && (
            <>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', textAlign:'left' }}>
                  <thead style={{ background:'#f4fbf7' }}>
                    <tr>
                      <th style={{ padding:'12px 16px', width:40 }}><input type="checkbox" /></th>
                      {['Customer','Phone','Email','Loyalty Points','Registered','Status','Actions'].map(h => (
                        <th key={h} style={{ padding:'12px 16px', fontSize:10, fontWeight:600, color:'#3d4943', textTransform:'uppercase', textAlign:h==='Actions'?'center':'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((c, i) => (
                      <tr key={c.id} style={{ borderTop:'1px solid #c8e4d8' }}
                        onMouseEnter={e => (e.currentTarget.style.background='#f4fbf7')}
                        onMouseLeave={e => (e.currentTarget.style.background='')}>
                        <td style={{ padding:'12px 16px' }}><input type="checkbox" /></td>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <div style={{ width:36, height:36, borderRadius:'50%', background:avatarColors[i%avatarColors.length], color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>{initials(c.name)}</div>
                            <div><p style={{ fontWeight:700, fontSize:13 }}>{c.name}</p><p style={{ color:'#3d4943', fontSize:11 }}>{c.gender}</p></div>
                          </div>
                        </td>
                        <td style={{ padding:'12px 16px', fontSize:13 }}>{c.phone}</td>
                        <td style={{ padding:'12px 16px', color:'#3d4943', fontSize:12 }}>{c.email}</td>
                        <td style={{ padding:'12px 16px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                            <span className="material-symbols-outlined" style={{ fontSize:16, color:'#f59e0b' }}>star</span>
                            <span style={{ fontWeight:700, fontSize:13 }}>{c.points.toLocaleString()}</span>
                          </div>
                        </td>
                        <td style={{ padding:'12px 16px', color:'#3d4943', fontSize:12 }}>{c.registered}</td>
                        <td style={{ padding:'12px 16px' }}><StatusBadge s={c.status} /></td>
                        <td style={{ padding:'12px 16px', textAlign:'center' }}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                            <button onClick={() => { setEditCustId(c.id); setCustForm({ name:c.name, gender:c.gender, phone:c.phone, email:c.email, address:c.address, username:c.username, status:c.status }); setShowCustForm(true); }}
                              style={{ width:32, height:32, borderRadius:8, border:'1px solid #c8e4d8', background:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
                              onMouseEnter={e => { e.currentTarget.style.background='#e0f5ed'; e.currentTarget.style.borderColor='#00694c'; }}
                              onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.borderColor='#c8e4d8'; }}>
                              <span className="material-symbols-outlined" style={{ fontSize:16, color:'#3d4943' }}>edit</span>
                            </button>
                            <button onClick={() => setLockTarget({id:c.id,type:'customer'})}
                              style={{ width:32, height:32, borderRadius:8, border:'1px solid #c8e4d8', background:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
                              onMouseEnter={e => { e.currentTarget.style.background=c.status==='Active'?'#fff3d6':'#e0f5ed'; e.currentTarget.style.borderColor=c.status==='Active'?'#f59e0b':'#00694c'; }}
                              onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.borderColor='#c8e4d8'; }}>
                              <span className="material-symbols-outlined" style={{ fontSize:16, color:'#3d4943' }}>{c.status==='Active'?'lock':'lock_open'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding:'16px 24px', borderTop:'1px solid #c8e4d8' }}>
                <p style={{ color:'#3d4943', fontSize:13 }}>Showing {filteredCustomers.length} of {customers.length} customers</p>
              </div>
            </>
          )}

          {/* Staff Table */}
          {activeTab === 'staff' && (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', textAlign:'left' }}>
                <thead style={{ background:'#f4fbf7' }}>
                  <tr>
                    <th style={{ padding:'12px 16px', width:40 }}><input type="checkbox" /></th>
                    {['Staff','Phone','Email','Role','Status','Actions'].map(h => (
                      <th key={h} style={{ padding:'12px 16px', fontSize:10, fontWeight:600, color:'#3d4943', textTransform:'uppercase', textAlign:h==='Actions'?'center':'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((s, i) => (
                    <tr key={s.id} style={{ borderTop:'1px solid #c8e4d8' }}
                      onMouseEnter={e => (e.currentTarget.style.background='#f4fbf7')}
                      onMouseLeave={e => (e.currentTarget.style.background='')}>
                      <td style={{ padding:'12px 16px' }}><input type="checkbox" /></td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <div style={{ width:36, height:36, borderRadius:'50%', background:avatarColors[(i+2)%avatarColors.length], color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>{initials(s.name)}</div>
                          <div><p style={{ fontWeight:700, fontSize:13 }}>{s.name}</p><p style={{ color:'#3d4943', fontSize:11 }}>{s.username}</p></div>
                        </div>
                      </td>
                      <td style={{ padding:'12px 16px', fontSize:13 }}>{s.phone}</td>
                      <td style={{ padding:'12px 16px', color:'#3d4943', fontSize:12 }}>{s.email}</td>
                      <td style={{ padding:'12px 16px' }}>
                        {s.role === 'Admin'
                          ? <span style={{ background:'#fff3d6', color:'#7a5c00', padding:'2px 8px', borderRadius:999, fontSize:11, fontWeight:600 }}>Admin</span>
                          : <span style={{ background:'#e0f5ed', color:'#004d38', padding:'2px 8px', borderRadius:999, fontSize:11, fontWeight:600 }}>Staff</span>}
                      </td>
                      <td style={{ padding:'12px 16px' }}><StatusBadge s={s.status} /></td>
                      <td style={{ padding:'12px 16px', textAlign:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                          <button onClick={() => { setEditStaffId(s.id); setStaffForm({ name:s.name, phone:s.phone, email:s.email, username:s.username, password:'', address:s.address, role:s.role, status:s.status }); setShowStaffForm(true); }}
                            style={{ width:32, height:32, borderRadius:8, border:'1px solid #c8e4d8', background:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
                            onMouseEnter={e => { e.currentTarget.style.background='#e0f5ed'; e.currentTarget.style.borderColor='#00694c'; }}
                            onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.borderColor='#c8e4d8'; }}>
                            <span className="material-symbols-outlined" style={{ fontSize:16, color:'#3d4943' }}>edit</span>
                          </button>
                          <button onClick={() => setLockTarget({id:s.id,type:'staff'})}
                            style={{ width:32, height:32, borderRadius:8, border:'1px solid #c8e4d8', background:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
                            onMouseEnter={e => { e.currentTarget.style.background=s.status==='Active'?'#fff3d6':'#e0f5ed'; e.currentTarget.style.borderColor=s.status==='Active'?'#f59e0b':'#00694c'; }}
                            onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.borderColor='#c8e4d8'; }}>
                            <span className="material-symbols-outlined" style={{ fontSize:16, color:'#3d4943' }}>{s.status==='Active'?'lock':'lock_open'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Customer Modal */}
      {showCustForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e => e.target === e.currentTarget && setShowCustForm(false)}>
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #c8e4d8', width:480, maxWidth:'95vw', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ padding:24, borderBottom:'1px solid #c8e4d8', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontWeight:700, fontSize:18 }}>{editCustId ? 'Edit Customer' : 'Add Customer'}</h3>
              <button onClick={() => setShowCustForm(false)} className="material-symbols-outlined" style={{ background:'none', border:'none', cursor:'pointer', color:'#3d4943' }}>close</button>
            </div>
            <div style={{ padding:24 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Full Name *</label><input value={custForm.name} onChange={e => setCustForm(f => ({...f, name:e.target.value}))} placeholder="Enter full name" style={inputStyle} /></div>
                <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Gender</label><select value={custForm.gender} onChange={e => setCustForm(f => ({...f, gender:e.target.value}))} style={inputStyle}><option>Male</option><option>Female</option></select></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Phone *</label><input value={custForm.phone} onChange={e => setCustForm(f => ({...f, phone:e.target.value}))} placeholder="0901234567" style={inputStyle} /></div>
                <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Email</label><input value={custForm.email} onChange={e => setCustForm(f => ({...f, email:e.target.value}))} placeholder="email@example.com" style={inputStyle} /></div>
              </div>
              <div style={{ marginBottom:16 }}><label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Address</label><input value={custForm.address} onChange={e => setCustForm(f => ({...f, address:e.target.value}))} placeholder="Street, District, City" style={inputStyle} /></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Username *</label><input value={custForm.username} onChange={e => setCustForm(f => ({...f, username:e.target.value}))} placeholder="username" style={inputStyle} /></div>
                <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Status</label><select value={custForm.status} onChange={e => setCustForm(f => ({...f, status:e.target.value}))} style={inputStyle}><option>Active</option><option>Locked</option></select></div>
              </div>
            </div>
            <div style={{ padding:'16px 24px', borderTop:'1px solid #c8e4d8', display:'flex', justifyContent:'flex-end', gap:12 }}>
              <button onClick={() => setShowCustForm(false)} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid #c8e4d8', background:'none', color:'#3d4943', fontSize:14, cursor:'pointer' }}>Cancel</button>
              <button onClick={saveCust} style={btnPrimary}>Save Customer</button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Modal */}
      {showStaffForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e => e.target === e.currentTarget && setShowStaffForm(false)}>
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #c8e4d8', width:520, maxWidth:'95vw', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ padding:24, borderBottom:'1px solid #c8e4d8', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontWeight:700, fontSize:18 }}>{editStaffId ? 'Edit Staff' : 'Add Staff'}</h3>
              <button onClick={() => setShowStaffForm(false)} className="material-symbols-outlined" style={{ background:'none', border:'none', cursor:'pointer', color:'#3d4943' }}>close</button>
            </div>
            <div style={{ padding:24 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Full Name *</label><input value={staffForm.name} onChange={e => setStaffForm(f => ({...f, name:e.target.value}))} placeholder="Enter full name" style={inputStyle} /></div>
                <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Role *</label><select value={staffForm.role} onChange={e => setStaffForm(f => ({...f, role:e.target.value}))} style={inputStyle}><option>Staff</option><option>Admin</option></select></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Phone *</label><input value={staffForm.phone} onChange={e => setStaffForm(f => ({...f, phone:e.target.value}))} placeholder="0901234567" style={inputStyle} /></div>
                <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Email</label><input value={staffForm.email} onChange={e => setStaffForm(f => ({...f, email:e.target.value}))} placeholder="email@example.com" style={inputStyle} /></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Username *</label><input value={staffForm.username} onChange={e => setStaffForm(f => ({...f, username:e.target.value}))} placeholder="username" style={inputStyle} /></div>
                <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Password *</label><input type="password" value={staffForm.password} onChange={e => setStaffForm(f => ({...f, password:e.target.value}))} placeholder="••••••••" style={inputStyle} /></div>
              </div>
              <div style={{ marginBottom:16 }}><label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Address</label><input value={staffForm.address} onChange={e => setStaffForm(f => ({...f, address:e.target.value}))} placeholder="Street, District, City" style={inputStyle} /></div>
              <div><label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Status</label><select value={staffForm.status} onChange={e => setStaffForm(f => ({...f, status:e.target.value}))} style={inputStyle}><option>Active</option><option>Locked</option></select></div>
            </div>
            <div style={{ padding:'16px 24px', borderTop:'1px solid #c8e4d8', display:'flex', justifyContent:'flex-end', gap:12 }}>
              <button onClick={() => setShowStaffForm(false)} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid #c8e4d8', background:'none', color:'#3d4943', fontSize:14, cursor:'pointer' }}>Cancel</button>
              <button onClick={saveStaff} style={btnPrimary}>Save Staff</button>
            </div>
          </div>
        </div>
      )}

      {/* Lock Modal */}
      {lockTarget && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e => e.target === e.currentTarget && setLockTarget(null)}>
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #c8e4d8', width:360, padding:32, textAlign:'center' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:isLocking?'#fff3d6':'#e0f5ed', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <span className="material-symbols-outlined" style={{ color:isLocking?'#7a5c00':'#004d38', fontSize:28 }}>{isLocking?'lock':'lock_open'}</span>
            </div>
            <h3 style={{ fontWeight:700, fontSize:18, marginBottom:8 }}>{isLocking?'Lock account?':'Unlock account?'}</h3>
            <p style={{ color:'#3d4943', fontSize:14, marginBottom:24 }}>{isLocking?'Lock':'Unlock'} account for "{lockUser?.name}"?</p>
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <button onClick={() => setLockTarget(null)} style={{ padding:'8px 20px', borderRadius:8, border:'1px solid #c8e4d8', background:'none', color:'#3d4943', fontSize:14, cursor:'pointer' }}>Cancel</button>
              <button onClick={confirmLock} style={{ padding:'8px 20px', borderRadius:8, background:isLocking?'#f59e0b':'#00694c', color:'#fff', fontWeight:700, fontSize:14, border:'none', cursor:'pointer' }}>{isLocking?'Lock':'Unlock'}</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Users;

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileTab } from '../../lib/types';
import Badge from '../ui/Badge';
import BtnTeal from '../ui/BtnTeal';
import BtnOutline from '../ui/BtnOutline';
import ToggleSwitch from '../ui/ToggleSwitch';

const navItems: { id: ProfileTab; icon: string; label: string }[] = [
  { id: 'info',     icon: 'person',        label: 'Personal Info' },
  { id: 'address',  icon: 'location_on',   label: 'Addresses' },
  { id: 'security', icon: 'lock',          label: 'Security' },
  { id: 'notif',    icon: 'notifications', label: 'Notifications' },
];

const notifOpts: [string, string, boolean][] = [
  ['Order Updates',     'Get notified when your order status changes', true],
  ['Promotions & Deals','Exclusive discounts and flash sales',         true],
  ['New Arrivals',      'Be first to know about new products',         false],
  ['Review Reminders',  'Reminders to review your purchases',          true],
  ['Newsletter',        'Weekly picks and lifestyle content',           false],
];

/* ── Delete confirmation + success notification ── */
interface DeleteState { label: string; onConfirm: () => void; }

function DeleteModal({ state, onClose }: { state: DeleteState; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '1.25rem', padding: '2rem', width: '90%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,.2)', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#ef4444' }}>delete</span>
        </div>
        <h3 className="serif" style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.5rem' }}>Delete this item?</h3>
        <p style={{ color: '#64748b', fontSize: '.875rem', marginBottom: '1.5rem' }}>
          Are you sure you want to delete <strong style={{ color: '#1e293b' }}>{state.label}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <BtnTeal onClick={() => { state.onConfirm(); onClose(); }} style={{ background: '#ef4444', padding: '.6rem 1.5rem' }}>
            Yes, Delete
          </BtnTeal>
          <BtnOutline onClick={onClose} style={{ padding: '.6rem 1.5rem' } as React.CSSProperties}>Cancel</BtnOutline>
        </div>
      </div>
    </div>
  );
}

function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', background: '#fff', borderRadius: '0.75rem', padding: '1rem 1.25rem', boxShadow: '0 8px 30px rgba(0,0,0,.15)', display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 400, border: '1px solid #e2e8f0', minWidth: 280, animation: 'fadeUp .3s ease' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#166534' }}>check</span>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: '.875rem', color: '#166534' }}>{message}</p>
        <p style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: 2 }}>The item has been removed.</p>
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
      </button>
    </div>
  );
}

export default function ProfileContent() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<ProfileTab>('info');
  const [editing, setEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [hoverAvatar, setHoverAvatar] = useState(false);
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [addresses, setAddresses] = useState([
    { id: 1, type: 'Home',   name: 'John Doe', addr: '123 Nguyen Hue Street, District 1', city: 'Ho Chi Minh City, 70000', def: true },
    { id: 2, type: 'Office', name: 'John Doe', addr: '456 Le Loi Blvd, Floor 12',         city: 'District 3, Ho Chi Minh City, 70000', def: false },
  ]);

  const [form, setForm] = useState({
    firstName: 'John', lastName: 'Doe', email: 'john.doe@email.com',
    phone: '+84 912 345 678', dob: '1992-01-15', gender: 'Male',
  });

  /* Auto-dismiss success toast after 5 s */
  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 5000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const showSuccess = (msg: string) => setSuccessMsg(msg);

  const confirmDelete = (label: string, onConfirm: () => void) =>
    setDeleteState({ label, onConfirm });

  /* Avatar upload */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarUrl(URL.createObjectURL(file));
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Modals */}
      {deleteState && <DeleteModal state={deleteState} onClose={() => setDeleteState(null)} />}
      {successMsg  && <SuccessToast message={successMsg} onClose={() => setSuccessMsg(null)} />}

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>

        {/* ── Sidebar ── */}
        <aside style={{ width: 232, flexShrink: 0 }}>
          <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,.05)' }}>

            {/* Avatar with edit on hover */}
            <div style={{ textAlign: 'center', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.75rem' }}>
              <div
                style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 0.75rem', cursor: 'pointer' }}
                onMouseEnter={() => setHoverAvatar(true)}
                onMouseLeave={() => setHoverAvatar(false)}
                onClick={() => fileRef.current?.click()}
                title="Change profile photo"
              >
                {/* Circle */}
                <div style={{ width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--teal)', boxShadow: '0 4px 12px rgba(0,105,76,.25)' }}>
                  {avatarUrl
                    ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#00694c,#003028)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.6rem' }}>JD</div>
                  }
                </div>

                {/* Hover overlay */}
                {hoverAvatar && (
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#fff' }}>edit</span>
                  </div>
                )}

                {/* Edit badge (bottom-right) */}
                <div style={{
                  position: 'absolute', bottom: 2, right: 2,
                  width: 26, height: 26, borderRadius: '50%',
                  background: hoverAvatar ? 'var(--teal-dk)' : 'var(--teal)',
                  border: '2px solid #fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,.2)',
                  transition: '.2s',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#fff' }}>edit</span>
                </div>

                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </div>

              <p className="serif" style={{ fontWeight: 700, fontSize: '1.1rem' }}>John Doe</p>
              <p style={{ color: '#64748b', fontSize: '.8rem' }}>john.doe@email.com</p>
              <Badge style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'inherit' }}>star</span>
                Gold Member
              </Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {navItems.map(n => (
                <button key={n.id} onClick={() => setTab(n.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '.6rem 1rem', borderRadius: '0.75rem', border: 'none', background: tab === n.id ? 'var(--teal)' : 'transparent', color: tab === n.id ? '#fff' : '#64748b', fontWeight: 500, fontSize: '.875rem', cursor: 'pointer', width: '100%', textAlign: 'left', transition: '.18s' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{n.icon}</span>{n.label}
                </button>
              ))}
              <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0.25rem 0' }} />
              <button onClick={() => router.push('/orders')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '.6rem 1rem', borderRadius: '0.75rem', border: 'none', background: 'transparent', color: '#64748b', fontWeight: 500, fontSize: '.875rem', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>inventory_2</span>
                Order History
              </button>
              <button onClick={() => router.push('/reviews')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '.6rem 1rem', borderRadius: '0.75rem', border: 'none', background: 'transparent', color: '#64748b', fontWeight: 500, fontSize: '.875rem', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>star</span>
                My Reviews
              </button>
              <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0.25rem 0' }} />
              <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '.6rem 1rem', borderRadius: '0.75rem', border: 'none', background: 'transparent', color: '#ef4444', fontWeight: 500, fontSize: '.875rem', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#ef4444' }}>logout</span>
                Sign Out
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,.05)', marginTop: '1rem' }}>
            <p style={{ fontWeight: 600, fontSize: '.875rem', marginBottom: '0.75rem' }}>Account Stats</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[['12', 'Orders'], ['8', 'Reviews'], ['3', 'Wishlist'], ['$842', 'Spent']].map(([v, l]) => (
                <div key={l} style={{ background: 'var(--teal-xs)', borderRadius: '0.75rem', padding: '0.75rem', textAlign: 'center' }}>
                  <p className="serif" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--teal)' }}>{v}</p>
                  <p style={{ fontSize: '.75rem', color: '#64748b' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* PERSONAL INFO */}
          {tab === 'info' && (
            <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="serif" style={{ fontSize: '1.35rem', fontWeight: 700 }}>Personal Information</h2>
                {!editing
                  ? <BtnOutline onClick={() => setEditing(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>Edit
                    </BtnOutline>
                  : <BtnOutline onClick={() => setEditing(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>Cancel
                    </BtnOutline>}
              </div>
              {!editing ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  {[['First Name', form.firstName], ['Last Name', form.lastName], ['Email', form.email], ['Phone', form.phone], ['Date of Birth', form.dob], ['Gender', form.gender]].map(([l, v]) => (
                    <div key={l}><p style={{ fontSize: '.75rem', color: '#94a3b8', marginBottom: 4 }}>{l}</p><p style={{ fontWeight: 500 }}>{v}</p></div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {(['firstName', 'lastName', 'email', 'phone'] as const).map(k => (
                    <div key={k}>
                      <label style={{ fontSize: '.75rem', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: 4 }}>
                        {k === 'firstName' ? 'First Name' : k === 'lastName' ? 'Last Name' : k === 'email' ? 'Email' : 'Phone'}
                      </label>
                      <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontSize: '.75rem', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: 4 }}>Date of Birth</label>
                    <input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: '.75rem', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: 4 }}>Gender</label>
                    <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                      {['Male', 'Female', 'Other', 'Prefer not to say'].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <BtnTeal onClick={() => setEditing(false)} style={{ padding: '0.6rem 1.5rem' }}>Save Changes</BtnTeal>
                    <BtnOutline onClick={() => setEditing(false)}>Cancel</BtnOutline>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ADDRESSES */}
          {tab === 'address' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="serif" style={{ fontSize: '1.35rem', fontWeight: 700 }}>Saved Addresses</h2>
                <BtnTeal style={{ fontSize: '.875rem', padding: '0.5rem 1.2rem' }}>+ Add Address</BtnTeal>
              </div>
              {addresses.map(a => (
                <div key={a.id} style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)', border: `2px solid ${a.def ? 'var(--teal)' : '#e2e8f0'}`, marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <Badge>{a.type}</Badge>
                        {a.def && <Badge style={{ background: '#dcfce7', color: '#166534' }}>Default</Badge>}
                      </div>
                      <p style={{ fontWeight: 600, fontSize: '.9rem' }}>{a.name}</p>
                      <p style={{ color: '#64748b', fontSize: '.875rem' }}>{a.addr}</p>
                      <p style={{ color: '#64748b', fontSize: '.875rem' }}>{a.city}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {!a.def && <span style={{ fontSize: '.8rem', color: 'var(--teal)', cursor: 'pointer' }}>Set Default</span>}
                      <span style={{ fontSize: '.8rem', color: 'var(--teal)', cursor: 'pointer' }}>Edit</span>
                      <button
                        onClick={() => confirmDelete(a.type, () => {
                          setAddresses(prev => prev.filter(x => x.id !== a.id));
                          showSuccess('Address deleted successfully');
                        })}
                        style={{ fontSize: '.8rem', color: '#ef4444', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {addresses.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                  <p style={{ color: '#94a3b8' }}>No saved addresses.</p>
                </div>
              )}
            </div>
          )}

          {/* SECURITY */}
          {tab === 'security' && (
            <div>
              <h2 className="serif" style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem' }}>Security Settings</h2>
              <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Change Password</h3>
                {['Current Password', 'New Password', 'Confirm New Password'].map(l => (
                  <div key={l} style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '.75rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>{l}</label>
                    <input type="password" placeholder="••••••••" style={{ maxWidth: 340 }} />
                  </div>
                ))}
                <BtnTeal style={{ marginTop: '0.5rem', padding: '0.6rem 1.5rem' }}>Update Password</BtnTeal>
              </div>
              <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Two-Factor Authentication</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '.9rem' }}>Authenticator App</p>
                    <p style={{ color: '#64748b', fontSize: '.8rem' }}>Extra security layer</p>
                  </div>
                  <ToggleSwitch defaultOn={false} />
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {tab === 'notif' && (
            <div>
              <h2 className="serif" style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem' }}>Notification Preferences</h2>
              <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                {notifOpts.map(([title, desc, checked], i) => (
                  <div key={title} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: i < notifOpts.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: '.9rem' }}>{title}</p>
                      <p style={{ color: '#64748b', fontSize: '.8rem', marginTop: 2 }}>{desc}</p>
                    </div>
                    <ToggleSwitch defaultOn={checked} />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

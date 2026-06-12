'use client';
import { useState, useEffect } from 'react';

interface Props { onNav: (p: string) => void; }

const pageCSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Hanken+Grotesk:wght@600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
.setting-nav-btn { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; color: #3d4943; cursor: pointer; transition: all .15s; width: 100%; background: none; border: none; text-align: left; }
.setting-nav-btn:hover { background: #e8f5ee; }
.setting-nav-btn.snav-active { background: #fff3d6; color: #00694c; font-weight: 700; border-left: 3px solid #f59e0b; }
.save-btn { padding: 9px 20px; background: linear-gradient(135deg, #00694c 0%, #00a86b 100%); color: white; border-radius: 8px; font-size: 14px; font-weight: 700; border: none; cursor: pointer; box-shadow: 0 2px 8px #00694c33; }
.save-btn:hover { box-shadow: 0 4px 14px #00694c55; }
.cancel-btn { padding: 9px 20px; border: 1.5px solid #bbe8d4; color: #3d4943; border-radius: 8px; font-size: 14px; cursor: pointer; background: transparent; }
.cancel-btn:hover { background: #e8f5ee; }
.form-input { width: 100%; border: 1.5px solid #bbe8d4; border-radius: 8px; padding: 9px 12px; font-size: 14px; background: #f4fbf7; color: #191c1e; outline: none; }
.form-input:focus { border-color: #00694c; background: #fff; box-shadow: 0 0 0 3px #00694c1a; }
.section-card { background: #fff; border: 1px solid #d4f0e4; border-radius: 12px; padding: 24px; margin-bottom: 16px; }
.section-card h3 { font-size: 16px; font-weight: 700; color: #191c1e; margin-bottom: 4px; }
.section-card p.desc { font-size: 13px; color: #3d4943; margin-bottom: 20px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.field-row.full { grid-template-columns: 1fr; }
.field-label { font-size: 12px; font-weight: 600; color: #3d4943; margin-bottom: 5px; display: block; }
.divider { border: none; border-top: 1px solid #d4f0e4; margin: 20px 0; }
.toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #edf7f2; }
.toggle-row:last-child { border-bottom: none; }
.danger-btn { padding: 9px 20px; background: #fee2e2; color: #991b1b; border-radius: 8px; font-size: 14px; font-weight: 700; border: 1px solid #fca5a5; cursor: pointer; }
.danger-btn:hover { background: #fca5a5; }
.toggle { position: relative; width: 44px; height: 24px; cursor: pointer; display: inline-block; }
.toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
.toggle-track { position: absolute; inset: 0; background: #bbe8d4; border-radius: 99px; transition: .2s; }
.toggle input:checked + .toggle-track { background: #00694c; }
.toggle-thumb { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; background: white; border-radius: 50%; transition: .2s; pointer-events: none; }
.toggle input:checked ~ .toggle-thumb { transform: translateX(20px); }
`;

type Section = 'store' | 'profile' | 'notifications' | 'payment' | 'pos' | 'security';

interface ToggleItem { label: string; desc: string; on: boolean; }

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} />
      <div className="toggle-track"></div>
      <div className="toggle-thumb"></div>
    </label>
  );
}

export default function AdminSettingsPage({ onNav }: Props) {
  const [activeSection, setActiveSection] = useState<Section>('store');
  const [toast, setToast] = useState<{ msg: string; visible: boolean; fading: boolean }>({ msg: '', visible: false, fading: false });

  // Notification toggles
  const [notifs, setNotifs] = useState<ToggleItem[]>([
    { label: 'New order placed',         desc: 'Alert when a new order is received',               on: true  },
    { label: 'Order status update',      desc: 'When an order status changes',                     on: true  },
    { label: 'Order cancelled',          desc: 'When a customer cancels an order',                 on: false },
    { label: 'Low stock alert',          desc: 'When product stock falls below threshold',          on: true  },
    { label: 'Out of stock',             desc: 'When a product runs out completely',                on: true  },
    { label: 'New user registered',      desc: 'When a new customer registers',                    on: false },
    { label: 'Promotion expiring soon',  desc: '7 days before a promotion ends',                   on: true  },
  ]);

  // Payment method toggles
  const [payMethods, setPayMethods] = useState<ToggleItem[]>([
    { label: 'Cash',          desc: 'Accept cash payments at POS',            on: true },
    { label: 'VNPay',         desc: 'Online payment gateway',                 on: true },
    { label: 'COD',           desc: 'Cash on delivery for online orders',     on: true },
  ]);

  // POS toggles
  const [posToggles, setPosToggles] = useState<ToggleItem[]>([
    { label: 'Auto-print receipt',            desc: 'Automatically print receipt after checkout', on: true  },
    { label: 'Barcode scanner mode',          desc: 'Enable USB barcode scanner input',           on: true  },
    { label: 'Require customer selection',    desc: 'Must select a customer before checkout',     on: false },
    { label: 'Allow manual price override',   desc: 'Staff can change price during checkout',     on: false },
  ]);

  // Security toggles
  const [secToggles, setSecToggles] = useState<ToggleItem[]>([
    { label: 'OTP verification on registration', desc: 'Require SMS OTP when new customer registers', on: true  },
    { label: 'Two-factor for admin login',        desc: 'Require OTP for admin panel access',          on: false },
    { label: 'Auto logout after inactivity',      desc: 'Log out staff session after 30 minutes',      on: true  },
  ]);

  const showToast = (msg: string) => {
    setToast({ msg, visible: true, fading: false });
  };

  useEffect(() => {
    if (toast.visible) {
      const t1 = setTimeout(() => setToast(prev => ({ ...prev, fading: true })), 2500);
      const t2 = setTimeout(() => setToast({ msg: '', visible: false, fading: false }), 2800);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [toast.visible]);

  const updateToggle = (setter: React.Dispatch<React.SetStateAction<ToggleItem[]>>, idx: number, val: boolean) => {
    setter(prev => prev.map((item, i) => i === idx ? { ...item, on: val } : item));
  };

  const sectionNav = [
    { id: 'store',         label: 'Store Info',     icon: 'store',         group: 'General' },
    { id: 'profile',       label: 'My Profile',     icon: 'manage_accounts', group: 'General' },
    { id: 'notifications', label: 'Notifications',  icon: 'notifications', group: 'General' },
    { id: 'payment',       label: 'Payment',        icon: 'payments',      group: 'System' },
    { id: 'pos',           label: 'POS',            icon: 'point_of_sale', group: 'System' },
    { id: 'security',      label: 'Security',       icon: 'security',      group: 'System' },
  ] as const;

  return (
    <>
      <style>{pageCSS}</style>
      <div className="p-8 space-y-6">
          <div className="flex gap-5">
            {/* Settings Nav */}
            <div className="w-56 flex-shrink-0">
              <div className="rounded-xl p-3 sticky top-24" style={{ background: '#f4fbf7', border: '1px solid #d4f0e4' }}>
                <p className="text-on-surface-variant px-3 mb-2" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>General</p>
                {sectionNav.filter(n => n.group === 'General').map(n => (
                  <button key={n.id} className={`setting-nav-btn${activeSection === n.id ? ' snav-active' : ''}`} onClick={() => setActiveSection(n.id as Section)}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{n.icon}</span>
                    {n.label}
                  </button>
                ))}
                <hr className="my-3 border-outline-variant" />
                <p className="text-on-surface-variant px-3 mb-2" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>System</p>
                {sectionNav.filter(n => n.group === 'System').map(n => (
                  <button key={n.id} className={`setting-nav-btn${activeSection === n.id ? ' snav-active' : ''}`} onClick={() => setActiveSection(n.id as Section)}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{n.icon}</span>
                    {n.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">

              {/* Store Info */}
              {activeSection === 'store' && (
                <>
                  <div className="section-card">
                    <h3>Store Information</h3>
                    <p className="desc">Basic information about your retail store</p>
                    <div className="field-row">
                      <div><label className="field-label">Store Name *</label><input className="form-input" type="text" defaultValue="RetailPro Store" /></div>
                      <div><label className="field-label">Store Code</label><input className="form-input" type="text" defaultValue="RP-001" readOnly style={{ opacity: .6 }} /></div>
                    </div>
                    <div className="field-row">
                      <div><label className="field-label">Phone Number</label><input className="form-input" type="text" defaultValue="028 3825 1234" /></div>
                      <div><label className="field-label">Email</label><input className="form-input" type="email" defaultValue="store@retailpro.vn" /></div>
                    </div>
                    <div className="field-row full">
                      <div><label className="field-label">Address</label><input className="form-input" type="text" defaultValue="123 Nguyen Hue, District 1, Ho Chi Minh City" /></div>
                    </div>
                    <div className="field-row">
                      <div><label className="field-label">Tax Code</label><input className="form-input" type="text" defaultValue="0312345678" /></div>
                      <div><label className="field-label">Currency</label><select className="form-input"><option>VND — Vietnamese Dong</option><option>USD — US Dollar</option></select></div>
                    </div>
                    <div className="field-row">
                      <div><label className="field-label">Opening Time</label><input className="form-input" type="time" defaultValue="08:00" /></div>
                      <div><label className="field-label">Closing Time</label><input className="form-input" type="time" defaultValue="22:00" /></div>
                    </div>
                  </div>
                  <div className="section-card">
                    <h3>Invoice Settings</h3>
                    <p className="desc">Configure how invoices are generated</p>
                    <div className="field-row">
                      <div><label className="field-label">Invoice Prefix</label><input className="form-input" type="text" defaultValue="ORD" /></div>
                      <div><label className="field-label">VAT Rate (%)</label><input className="form-input" type="number" defaultValue="10" min="0" max="100" /></div>
                    </div>
                    <div className="field-row full">
                      <div><label className="field-label">Invoice Footer Note</label><textarea className="form-input" rows={2} style={{ resize: 'none' }} defaultValue="Thank you for shopping at RetailPro! Please keep this receipt for warranty claims." /></div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button className="cancel-btn">Cancel</button>
                    <button className="save-btn" onClick={() => showToast('Store settings saved!')}>Save Changes</button>
                  </div>
                </>
              )}

              {/* My Profile */}
              {activeSection === 'profile' && (
                <>
                  <div className="section-card">
                    <h3>Profile Information</h3>
                    <p className="desc">Update your personal account details</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#008560', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="material-symbols-outlined text-white" style={{ fontSize: '32px' }}>person</span>
                      </div>
                      <div>
                        <button className="save-btn" style={{ fontSize: '13px', padding: '7px 14px' }}>Change Avatar</button>
                        <p style={{ fontSize: '12px', color: '#3d4943', marginTop: '4px' }}>JPG, PNG up to 2MB</p>
                      </div>
                    </div>
                    <div className="field-row">
                      <div><label className="field-label">Full Name</label><input className="form-input" type="text" defaultValue="Alex Nguyen" /></div>
                      <div><label className="field-label">Username</label><input className="form-input" type="text" defaultValue="alex.nguyen" readOnly style={{ opacity: .6 }} /></div>
                    </div>
                    <div className="field-row">
                      <div><label className="field-label">Phone</label><input className="form-input" type="text" defaultValue="0901111111" /></div>
                      <div><label className="field-label">Email</label><input className="form-input" type="email" defaultValue="alex@retailpro.vn" /></div>
                    </div>
                  </div>
                  <div className="section-card">
                    <h3>Change Password</h3>
                    <p className="desc">Update your login password</p>
                    <div className="field-row full" style={{ marginBottom: 12 }}>
                      <div><label className="field-label">Current Password</label><input className="form-input" type="password" placeholder="••••••••" /></div>
                    </div>
                    <div className="field-row">
                      <div><label className="field-label">New Password</label><input className="form-input" type="password" placeholder="••••••••" /></div>
                      <div><label className="field-label">Confirm New Password</label><input className="form-input" type="password" placeholder="••••••••" /></div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#3d4943' }}>Password must be at least 8 characters with uppercase, lowercase and number.</p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button className="cancel-btn">Cancel</button>
                    <button className="save-btn" onClick={() => showToast('Profile updated!')}>Save Changes</button>
                  </div>
                </>
              )}

              {/* Notifications */}
              {activeSection === 'notifications' && (
                <>
                  <div className="section-card">
                    <h3>Notification Preferences</h3>
                    <p className="desc">Choose what alerts you want to receive</p>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#3d4943', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Orders</p>
                    {notifs.slice(0, 3).map((n, i) => (
                      <div key={i} className="toggle-row">
                        <div><p style={{ fontSize: '14px', fontWeight: 500, color: '#191c1e' }}>{n.label}</p><p style={{ fontSize: '12px', color: '#3d4943' }}>{n.desc}</p></div>
                        <Toggle value={n.on} onChange={v => updateToggle(setNotifs, i, v)} />
                      </div>
                    ))}
                    <hr className="divider" />
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#3d4943', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Inventory</p>
                    {notifs.slice(3, 5).map((n, i) => (
                      <div key={i} className="toggle-row">
                        <div><p style={{ fontSize: '14px', fontWeight: 500, color: '#191c1e' }}>{n.label}</p><p style={{ fontSize: '12px', color: '#3d4943' }}>{n.desc}</p></div>
                        <Toggle value={n.on} onChange={v => updateToggle(setNotifs, i + 3, v)} />
                      </div>
                    ))}
                    <hr className="divider" />
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#3d4943', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>System</p>
                    {notifs.slice(5).map((n, i) => (
                      <div key={i} className="toggle-row">
                        <div><p style={{ fontSize: '14px', fontWeight: 500, color: '#191c1e' }}>{n.label}</p><p style={{ fontSize: '12px', color: '#3d4943' }}>{n.desc}</p></div>
                        <Toggle value={n.on} onChange={v => updateToggle(setNotifs, i + 5, v)} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-3">
                    <button className="save-btn" onClick={() => showToast('Notification preferences saved!')}>Save Changes</button>
                  </div>
                </>
              )}

              {/* Payment */}
              {activeSection === 'payment' && (
                <>
                  <div className="section-card">
                    <h3>Payment Methods</h3>
                    <p className="desc">Configure accepted payment methods</p>
                    {payMethods.map((p, i) => {
                      const icons: Record<string, { bg: string; color: string; icon: string }> = {
                        'Cash':          { bg: '#d1fae5', color: '#00694c', icon: 'payments' },
                        'VNPay':         { bg: '#ede9fe', color: '#6941c6', icon: 'qr_code_2' },
                        'COD':           { bg: '#fef3c7', color: '#D97706', icon: 'local_shipping' },
                      };
                      const ic = icons[p.label];
                      return (
                        <div key={i} className="toggle-row">
                          <div className="flex items-center gap-3">
                            <div style={{ width: 36, height: 36, background: ic.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span className="material-symbols-outlined" style={{ color: ic.color, fontSize: 20 }}>{ic.icon}</span>
                            </div>
                            <div><p style={{ fontSize: '14px', fontWeight: 500, color: '#191c1e' }}>{p.label}</p><p style={{ fontSize: '12px', color: '#3d4943' }}>{p.desc}</p></div>
                          </div>
                          <Toggle value={p.on} onChange={v => updateToggle(setPayMethods, i, v)} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="section-card">
                    <h3>VNPay Configuration</h3>
                    <p className="desc">Enter your VNPay merchant credentials</p>
                    <div className="field-row">
                      <div><label className="field-label">Terminal ID (TMN Code)</label><input className="form-input" type="text" placeholder="e.g. ABCD1234" /></div>
                      <div><label className="field-label">Secret Key</label><input className="form-input" type="password" placeholder="••••••••••••••••" /></div>
                    </div>
                    <div className="field-row full">
                      <div><label className="field-label">Return URL</label><input className="form-input" type="text" defaultValue="https://retailpro.vn/payment/vnpay/return" /></div>
                    </div>
                    <div className="field-row">
                      <div><label className="field-label">Environment</label><select className="form-input"><option>Sandbox (Testing)</option><option>Production</option></select></div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button className="cancel-btn">Cancel</button>
                    <button className="save-btn" onClick={() => showToast('Payment settings saved!')}>Save Changes</button>
                  </div>
                </>
              )}

              {/* POS */}
              {activeSection === 'pos' && (
                <>
                  <div className="section-card">
                    <h3>POS Settings</h3>
                    <p className="desc">Configure point of sale behavior</p>
                    {posToggles.map((t, i) => (
                      <div key={i} className="toggle-row">
                        <div><p style={{ fontSize: '14px', fontWeight: 500, color: '#191c1e' }}>{t.label}</p><p style={{ fontSize: '12px', color: '#3d4943' }}>{t.desc}</p></div>
                        <Toggle value={t.on} onChange={v => updateToggle(setPosToggles, i, v)} />
                      </div>
                    ))}
                  </div>
                  <div className="section-card">
                    <h3>Receipt Printer</h3>
                    <p className="desc">Configure your thermal receipt printer</p>
                    <div className="field-row">
                      <div><label className="field-label">Printer Name</label><input className="form-input" type="text" defaultValue="EPSON TM-T82" /></div>
                      <div><label className="field-label">Paper Width</label><select className="form-input"><option>80mm</option><option>58mm</option></select></div>
                    </div>
                    <div className="field-row">
                      <div><label className="field-label">Low Stock Warning Threshold</label><input className="form-input" type="number" defaultValue="10" min="1" /></div>
                      <div><label className="field-label">Default Discount (%)</label><input className="form-input" type="number" defaultValue="0" min="0" max="100" /></div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button className="cancel-btn">Cancel</button>
                    <button className="save-btn" onClick={() => showToast('POS settings saved!')}>Save Changes</button>
                  </div>
                </>
              )}

              {/* Security */}
              {activeSection === 'security' && (
                <>
                  <div className="section-card">
                    <h3>Security Settings</h3>
                    <p className="desc">Manage authentication and access control</p>
                    {secToggles.map((t, i) => (
                      <div key={i} className="toggle-row">
                        <div><p style={{ fontSize: '14px', fontWeight: 500, color: '#191c1e' }}>{t.label}</p><p style={{ fontSize: '12px', color: '#3d4943' }}>{t.desc}</p></div>
                        <Toggle value={t.on} onChange={v => updateToggle(setSecToggles, i, v)} />
                      </div>
                    ))}
                  </div>
                  <div className="section-card">
                    <h3>SMS Provider (OTP)</h3>
                    <p className="desc">Configure SMS service for OTP delivery</p>
                    <div className="field-row">
                      <div><label className="field-label">Provider</label><select className="form-input"><option>Twilio</option><option>Viettel SMS</option><option>VNPT SMS</option></select></div>
                      <div><label className="field-label">Sender Name</label><input className="form-input" type="text" defaultValue="RetailPro" /></div>
                    </div>
                    <div className="field-row">
                      <div><label className="field-label">Account SID / API Key</label><input className="form-input" type="password" placeholder="••••••••••••••••" /></div>
                      <div><label className="field-label">Auth Token / Secret</label><input className="form-input" type="password" placeholder="••••••••••••••••" /></div>
                    </div>
                  </div>
                  <div className="section-card" style={{ borderColor: '#fca5a5' }}>
                    <h3 style={{ color: '#991b1b' }}>Danger Zone</h3>
                    <p className="desc">Irreversible actions — proceed with caution</p>
                    <div className="toggle-row">
                      <div><p style={{ fontSize: '14px', fontWeight: 500, color: '#191c1e' }}>Reset all settings to default</p><p style={{ fontSize: '12px', color: '#3d4943' }}>This will clear all custom configurations</p></div>
                      <button className="danger-btn">Reset</button>
                    </div>
                    <div className="toggle-row">
                      <div><p style={{ fontSize: '14px', fontWeight: 500, color: '#191c1e' }}>Clear all transaction logs</p><p style={{ fontSize: '12px', color: '#3d4943' }}>Permanently delete all activity logs</p></div>
                      <button className="danger-btn">Clear Logs</button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button className="cancel-btn">Cancel</button>
                    <button className="save-btn" onClick={() => showToast('Security settings saved!')}>Save Changes</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      {/* Toast */}
      {toast.visible && (
        <div style={{ position: 'fixed', bottom: 32, right: 32, background: '#191c1e', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 999, display: 'flex', alignItems: 'center', gap: 8, opacity: toast.fading ? 0 : 1, transition: 'opacity .3s' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#4ade80' }}>check_circle</span>
          <span>{toast.msg}</span>
        </div>
      )}
    </>
  );
}

import { useState } from 'react';
import Layout from '../components/Layout';

type Section = 'store' | 'profile' | 'notifications' | 'payment' | 'pos' | 'security';

interface ToggleProps {
  defaultChecked?: boolean;
}
function Toggle({ defaultChecked = false }: ToggleProps) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <label style={{ position: 'relative', width: 44, height: 24, cursor: 'pointer', display: 'inline-block', flexShrink: 0 }}>
      <input type="checkbox" checked={on} onChange={() => setOn(!on)} style={{ opacity: 0, width: 0, height: 0 }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: on ? '#00694c' : '#bccac1',
        borderRadius: 99, transition: '.2s',
      }} />
      <div style={{
        position: 'absolute', top: 3, left: on ? 23 : 3,
        width: 18, height: 18, background: 'white',
        borderRadius: '50%', transition: '.2s',
      }} />
    </label>
  );
}

interface SectionCardProps {
  title: string;
  desc: string;
  children: React.ReactNode;
  danger?: boolean;
}
function SectionCard({ title, desc, children, danger }: SectionCardProps) {
  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${danger ? '#fca5a5' : '#bccac1'}`,
      borderRadius: 12, padding: 24, marginBottom: 16,
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: danger ? '#991b1b' : '#191c1e', marginBottom: 4 }}>{title}</h3>
      <p style={{ fontSize: 13, color: '#3d4943', marginBottom: 20 }}>{desc}</p>
      {children}
    </div>
  );
}

function FieldRow({ children, full }: { children: React.ReactNode; full?: boolean }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: full ? '1fr' : '1fr 1fr',
      gap: 16, marginBottom: 16,
    }}>{children}</div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#3d4943', marginBottom: 5, display: 'block' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid #bccac1', borderRadius: 8,
  padding: '9px 12px', fontSize: 14, background: '#eceef0',
  color: '#191c1e', outline: 'none', boxSizing: 'border-box',
};

function ToggleRow({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 0', borderBottom: '1px solid #eceef0',
    }}>
      <div>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#191c1e' }}>{label}</p>
        <p style={{ fontSize: 12, color: '#3d4943' }}>{desc}</p>
      </div>
      <Toggle defaultChecked={defaultChecked} />
    </div>
  );
}

function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid #bccac1', margin: '20px 0' }} />;
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState<Section>('store');
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }

  const navItems: { id: Section; icon: string; label: string }[] = [
    { id: 'store', icon: 'store', label: 'Store Info' },
    { id: 'profile', icon: 'manage_accounts', label: 'My Profile' },
    { id: 'notifications', icon: 'notifications', label: 'Notifications' },
  ];
  const sysItems: { id: Section; icon: string; label: string }[] = [
    { id: 'payment', icon: 'payments', label: 'Payment' },
    { id: 'pos', icon: 'point_of_sale', label: 'POS' },
    { id: 'security', icon: 'security', label: 'Security' },
  ];

  function NavBtn({ id, icon, label }: { id: Section; icon: string; label: string }) {
    const active = activeSection === id;
    return (
      <button onClick={() => setActiveSection(id)} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', borderRadius: 8, fontSize: 14, fontWeight: active ? 700 : 500,
        color: active ? '#00694c' : '#3d4943',
        background: active ? '#dae2fd' : 'transparent',
        border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
        transition: 'all .15s',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
        {label}
      </button>
    );
  }

  const btnRow = (saveMsg: string) => (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
      <button style={{ padding: '9px 20px', border: '1px solid #bccac1', color: '#3d4943', borderRadius: 8, fontSize: 14, cursor: 'pointer', background: 'transparent' }}>Cancel</button>
      <button onClick={() => showToast(saveMsg)} style={{ padding: '9px 20px', background: '#00694c', color: 'white', borderRadius: 8, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>Save Changes</button>
    </div>
  );

  return (
    <Layout activePage="settings" title="Settings">
      <div style={{ display: 'flex', gap: 24 }}>
        {/* Settings Nav */}
        <div style={{ width: 224, flexShrink: 0 }}>
          <div style={{ background: '#fff', border: '1px solid #bccac1', borderRadius: 12, padding: 12, position: 'sticky', top: 80 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#3d4943', textTransform: 'uppercase', letterSpacing: '.05em', padding: '0 12px', marginBottom: 8 }}>General</p>
            {navItems.map(n => <NavBtn key={n.id} {...n} />)}
            <hr style={{ margin: '12px 0', borderColor: '#bccac1', border: 'none', borderTop: '1px solid #bccac1' }} />
            <p style={{ fontSize: 11, fontWeight: 600, color: '#3d4943', textTransform: 'uppercase', letterSpacing: '.05em', padding: '0 12px', marginBottom: 8 }}>System</p>
            {sysItems.map(n => <NavBtn key={n.id} {...n} />)}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Store Info */}
          {activeSection === 'store' && (
            <div>
              <SectionCard title="Store Information" desc="Basic information about your retail store">
                <FieldRow>
                  <Field label="Store Name *"><input style={inputStyle} defaultValue="RetailPro Store" /></Field>
                  <Field label="Store Code"><input style={{ ...inputStyle, opacity: .6 }} defaultValue="RP-001" readOnly /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Phone Number"><input style={inputStyle} defaultValue="028 3825 1234" /></Field>
                  <Field label="Email"><input style={inputStyle} type="email" defaultValue="store@retailpro.vn" /></Field>
                </FieldRow>
                <FieldRow full>
                  <Field label="Address"><input style={inputStyle} defaultValue="123 Nguyen Hue, District 1, Ho Chi Minh City" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Tax Code"><input style={inputStyle} defaultValue="0312345678" /></Field>
                  <Field label="Currency">
                    <select style={inputStyle}>
                      <option>VND — Vietnamese Dong</option>
                      <option>USD — US Dollar</option>
                    </select>
                  </Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Opening Time"><input style={inputStyle} type="time" defaultValue="08:00" /></Field>
                  <Field label="Closing Time"><input style={inputStyle} type="time" defaultValue="22:00" /></Field>
                </FieldRow>
              </SectionCard>

              <SectionCard title="Invoice Settings" desc="Configure how invoices are generated">
                <FieldRow>
                  <Field label="Invoice Prefix"><input style={inputStyle} defaultValue="ORD" /></Field>
                  <Field label="VAT Rate (%)"><input style={inputStyle} type="number" defaultValue={10} min={0} max={100} /></Field>
                </FieldRow>
                <FieldRow full>
                  <Field label="Invoice Footer Note">
                    <textarea style={{ ...inputStyle, resize: 'none' }} rows={2} defaultValue="Thank you for shopping at RetailPro! Please keep this receipt for warranty claims." />
                  </Field>
                </FieldRow>
              </SectionCard>

              {btnRow('Store settings saved!')}
            </div>
          )}

          {/* My Profile */}
          {activeSection === 'profile' && (
            <div>
              <SectionCard title="Profile Information" desc="Update your personal account details">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#008560', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'white' }}>person</span>
                  </div>
                  <div>
                    <button style={{ padding: '7px 14px', background: '#00694c', color: 'white', borderRadius: 8, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>Change Avatar</button>
                    <p style={{ fontSize: 12, color: '#3d4943', marginTop: 4 }}>JPG, PNG up to 2MB</p>
                  </div>
                </div>
                <FieldRow>
                  <Field label="Full Name"><input style={inputStyle} defaultValue="Alex Nguyen" /></Field>
                  <Field label="Username"><input style={{ ...inputStyle, opacity: .6 }} defaultValue="alex.nguyen" readOnly /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Phone"><input style={inputStyle} defaultValue="0901111111" /></Field>
                  <Field label="Email"><input style={inputStyle} type="email" defaultValue="alex@retailpro.vn" /></Field>
                </FieldRow>
              </SectionCard>

              <SectionCard title="Change Password" desc="Update your login password">
                <FieldRow full>
                  <Field label="Current Password"><input style={inputStyle} type="password" placeholder="••••••••" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="New Password"><input style={inputStyle} type="password" placeholder="••••••••" /></Field>
                  <Field label="Confirm New Password"><input style={inputStyle} type="password" placeholder="••••••••" /></Field>
                </FieldRow>
                <p style={{ fontSize: 12, color: '#3d4943' }}>Password must be at least 8 characters with uppercase, lowercase and number.</p>
              </SectionCard>

              {btnRow('Profile updated!')}
            </div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div>
              <SectionCard title="Notification Preferences" desc="Choose what alerts you want to receive">
                <p style={{ fontSize: 12, fontWeight: 700, color: '#3d4943', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Orders</p>
                <ToggleRow label="New order placed" desc="Alert when a new order is received" defaultChecked />
                <ToggleRow label="Order status update" desc="When an order status changes" defaultChecked />
                <ToggleRow label="Order cancelled" desc="When a customer cancels an order" />
                <Divider />
                <p style={{ fontSize: 12, fontWeight: 700, color: '#3d4943', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Inventory</p>
                <ToggleRow label="Low stock alert" desc="When product stock falls below threshold" defaultChecked />
                <ToggleRow label="Out of stock" desc="When a product runs out completely" defaultChecked />
                <Divider />
                <p style={{ fontSize: 12, fontWeight: 700, color: '#3d4943', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>System</p>
                <ToggleRow label="New user registered" desc="When a new customer registers" />
                <ToggleRow label="Promotion expiring soon" desc="7 days before a promotion ends" defaultChecked />
              </SectionCard>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => showToast('Notification preferences saved!')} style={{ padding: '9px 20px', background: '#00694c', color: 'white', borderRadius: 8, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>Save Changes</button>
              </div>
            </div>
          )}

          {/* Payment */}
          {activeSection === 'payment' && (
            <div>
              <SectionCard title="Payment Methods" desc="Configure accepted payment methods">
                {[
                  { icon: 'payments', label: 'Cash', desc: 'Accept cash payments at POS', bg: '#d1fae5', color: '#00694c', checked: true },
                  { icon: 'account_balance', label: 'Bank Transfer', desc: 'Accept bank transfers via QR code', bg: '#dbeafe', color: '#1d6fb8', checked: true },
                  { icon: 'qr_code', label: 'VNPay', desc: 'Online payment gateway', bg: '#ede9fe', color: '#6941c6', checked: true },
                  { icon: 'local_shipping', label: 'COD', desc: 'Cash on delivery for online orders', bg: '#fef3c7', color: '#D97706', checked: true },
                ].map(m => (
                  <div key={m.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #eceef0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, background: m.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ color: m.color, fontSize: 20 }}>{m.icon}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: '#191c1e' }}>{m.label}</p>
                        <p style={{ fontSize: 12, color: '#3d4943' }}>{m.desc}</p>
                      </div>
                    </div>
                    <Toggle defaultChecked={m.checked} />
                  </div>
                ))}
              </SectionCard>

              <SectionCard title="VNPay Configuration" desc="Enter your VNPay merchant credentials">
                <FieldRow>
                  <Field label="Terminal ID (TMN Code)"><input style={inputStyle} placeholder="e.g. ABCD1234" /></Field>
                  <Field label="Secret Key"><input style={inputStyle} type="password" placeholder="••••••••••••••••" /></Field>
                </FieldRow>
                <FieldRow full>
                  <Field label="Return URL"><input style={inputStyle} defaultValue="https://retailpro.vn/payment/vnpay/return" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Environment">
                    <select style={inputStyle}>
                      <option>Sandbox (Testing)</option>
                      <option>Production</option>
                    </select>
                  </Field>
                </FieldRow>
              </SectionCard>

              {btnRow('Payment settings saved!')}
            </div>
          )}

          {/* POS */}
          {activeSection === 'pos' && (
            <div>
              <SectionCard title="POS Settings" desc="Configure point of sale behavior">
                <ToggleRow label="Auto-print receipt" desc="Automatically print receipt after checkout" defaultChecked />
                <ToggleRow label="Barcode scanner mode" desc="Enable USB barcode scanner input" defaultChecked />
                <ToggleRow label="Require customer selection" desc="Must select a customer before checkout" />
                <ToggleRow label="Allow manual price override" desc="Staff can change price during checkout" />
              </SectionCard>

              <SectionCard title="Receipt Printer" desc="Configure your thermal receipt printer">
                <FieldRow>
                  <Field label="Printer Name"><input style={inputStyle} defaultValue="EPSON TM-T82" /></Field>
                  <Field label="Paper Width">
                    <select style={inputStyle}>
                      <option>80mm</option>
                      <option>58mm</option>
                    </select>
                  </Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Low Stock Warning Threshold"><input style={inputStyle} type="number" defaultValue={10} min={1} /></Field>
                  <Field label="Default Discount (%)"><input style={inputStyle} type="number" defaultValue={0} min={0} max={100} /></Field>
                </FieldRow>
              </SectionCard>

              {btnRow('POS settings saved!')}
            </div>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <div>
              <SectionCard title="Security Settings" desc="Manage authentication and access control">
                <ToggleRow label="OTP verification on registration" desc="Require SMS OTP when new customer registers" defaultChecked />
                <ToggleRow label="Two-factor for admin login" desc="Require OTP for admin panel access" />
                <ToggleRow label="Auto logout after inactivity" desc="Log out staff session after 30 minutes" defaultChecked />
              </SectionCard>

              <SectionCard title="SMS Provider (OTP)" desc="Configure SMS service for OTP delivery">
                <FieldRow>
                  <Field label="Provider">
                    <select style={inputStyle}>
                      <option>Twilio</option>
                      <option>Viettel SMS</option>
                      <option>VNPT SMS</option>
                    </select>
                  </Field>
                  <Field label="Sender Name"><input style={inputStyle} defaultValue="RetailPro" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Account SID / API Key"><input style={inputStyle} type="password" placeholder="••••••••••••••••" /></Field>
                  <Field label="Auth Token / Secret"><input style={inputStyle} type="password" placeholder="••••••••••••••••" /></Field>
                </FieldRow>
              </SectionCard>

              <SectionCard title="Danger Zone" desc="Irreversible actions — proceed with caution" danger>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #eceef0' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#191c1e' }}>Reset all settings to default</p>
                    <p style={{ fontSize: 12, color: '#3d4943' }}>This will clear all custom configurations</p>
                  </div>
                  <button style={{ padding: '9px 20px', background: '#fee2e2', color: '#991b1b', borderRadius: 8, fontSize: 14, fontWeight: 700, border: '1px solid #fca5a5', cursor: 'pointer' }}>Reset</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: '#191c1e' }}>Clear all transaction logs</p>
                    <p style={{ fontSize: 12, color: '#3d4943' }}>Permanently delete all activity logs</p>
                  </div>
                  <button style={{ padding: '9px 20px', background: '#fee2e2', color: '#991b1b', borderRadius: 8, fontSize: 14, fontWeight: 700, border: '1px solid #fca5a5', cursor: 'pointer' }}>Clear Logs</button>
                </div>
              </SectionCard>

              {btnRow('Security settings saved!')}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      <div style={{
        position: 'fixed', bottom: 32, right: 32,
        background: '#191c1e', color: '#fff',
        padding: '12px 20px', borderRadius: 10,
        fontSize: 14, fontWeight: 500, zIndex: 999,
        display: 'flex', alignItems: 'center', gap: 8,
        opacity: toastVisible ? 1 : 0,
        transition: 'opacity .3s',
        pointerEvents: 'none',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#4ade80' }}>check_circle</span>
        {toast}
      </div>
    </Layout>
  );
}

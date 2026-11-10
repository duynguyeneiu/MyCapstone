'use client';
import { useEffect, useState } from 'react';
import { promotionService, ApiPromotion } from '@/src/services/promotionService';
import { getApiErrorMessage } from '@/src/lib/apiError';

interface Props { search: string; }

const pageCSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Hanken+Grotesk:wght@600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
.filter-select { background: #fff8e6; border: 1.5px solid #fcd97a; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #3d4943; outline: none; }
.filter-select:focus { border-color: #f59e0b; }
.modal-input { border: 1.5px solid #c8e4d8; background: #f4fbf7; border-radius: 8px; padding: 8px 12px; font-size: 14px; width: 100%; outline: none; }
.modal-input:focus { border-color: #00694c; }
`;

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' VND';

const statusConfig: Record<string, { bg: string; color: string }> = {
  'Active':   { bg: '#e0f5ed', color: '#004d38' },
  'Inactive': { bg: '#e5e7eb', color: '#374151' },
  'Expired':  { bg: '#fee2e2', color: '#7f1d1d' },
  'Scheduled':{ bg: '#dbeafe', color: '#1e40af' },
};

interface Promo {
  id: number; code: string; desc: string; type: string; value: number;
  minOrder: number; start: string; end: string;
  status: string;      // display status: Active | Inactive | Expired | Scheduled
  rawStatus: string;   // stored status: Active | Inactive (used by the edit form)
  usageCount: number; totalDiscount: number;
}

const toPromo = (p: ApiPromotion): Promo => ({
  id: p.promotionId,
  code: p.code,
  desc: p.description ?? '',
  type: p.discountType,
  value: p.discountValue,
  minOrder: p.minOrderValue,
  start: p.startDate.slice(0, 10),
  end: p.endDate.slice(0, 10),
  status: p.displayStatus,
  rawStatus: p.status,
  usageCount: p.usageCount,
  totalDiscount: p.totalDiscount,
});


const emptyForm = { code: '', desc: '', type: 'Percentage', value: '', minOrder: '', start: new Date().toISOString().split('T')[0], end: '', status: 'Active' };

function daysLeft(endDate: string) {
  const end = new Date(endDate);
  const today = new Date();
  const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { text: 'Expired', color: '#7f1d1d' };
  if (diff === 0) return { text: 'Ends today!', color: '#dc2626', bold: true };
  if (diff <= 7) return { text: `${diff}d left`, color: '#854f0b', bold: true };
  return { text: `${diff}d left`, color: '#3d4943' };
}

export default function PromotionsPage({ search }: Props) {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadPromos = async () => {
    try {
      setPromos((await promotionService.getAll()).map(toPromo));
      setLoadError(null);
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Could not load promotions.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPromos(); }, []);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [checkAll, setCheckAll] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = () => promos.filter(p =>
    (!search || p.code.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase())) &&
    (!statusFilter || p.status === statusFilter) &&
    (!typeFilter || p.type === typeFilter)
  );

  const updateForm = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (id: number) => {
    const p = promos.find(x => x.id === id);
    if (!p) return;
    setEditId(id);
    setForm({ code: p.code, desc: p.desc, type: p.type, value: String(p.value), minOrder: String(p.minOrder), start: p.start, end: p.end, status: p.rawStatus });
    setFormOpen(true);
  };

  const savePromo = async () => {
    const code = form.code.trim().toUpperCase();
    const value = parseFloat(form.value);
    if (!code) { alert('Promo code is required'); return; }
    if (!value || value <= 0) { alert('Discount value must be greater than 0'); return; }
    if (form.type === 'Percentage' && value > 100) { alert('Percentage cannot exceed 100'); return; }
    if (!form.start || !form.end) { alert('Start date and end date are required'); return; }
    if (form.end < form.start) { alert('End date must be on or after start date'); return; }

    const body = {
      code,
      description: form.desc.trim() || undefined,
      discountType: form.type,
      discountValue: value,
      minOrderValue: parseFloat(form.minOrder) || 0,
      startDate: form.start,
      endDate: form.end,
      status: form.status,
    };

    setSaving(true);
    try {
      if (editId) await promotionService.update(editId, body);
      else await promotionService.create(body);
      setFormOpen(false);
      await loadPromos();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Could not save promotion.'));   // e.g. 409 duplicate code
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (id: number) => { setDeleteId(id); setDelOpen(true); };
  const confirmDelete = async () => {
    if (deleteId == null) return;
    try {
      await promotionService.remove(deleteId);
      setDelOpen(false);
      await loadPromos();
    } catch (err) {
      setDelOpen(false);
      alert(getApiErrorMessage(err, 'Could not delete promotion.'));   // 409: used by orders -> set Inactive
    }
  };

  // ---- stat cards (computed from API data) ----
  const activeCount = promos.filter(p => p.status === 'Active').length;
  const totalDiscountGiven = promos.reduce((s, p) => s + p.totalDiscount, 0);
  const expiringSoon = promos.filter(p => {
    if (p.status !== 'Active') return false;
    const days = Math.ceil((new Date(p.end).getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 7;
  }).length;

  const PAGE_SIZE = 6;
  const [curPage, setCurPage] = useState(1);
  const data = filtered();
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const pagedData = data.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE);
  const goTo = (p: number) => setCurPage(Math.max(1, Math.min(p, totalPages)));
  const deletePromo = promos.find(p => p.id === deleteId);

  const previewCode = form.code.toUpperCase() || 'CODE';
  const previewDiscount = form.type === 'Percentage'
    ? `${form.value || 0}% off`
    : `${new Intl.NumberFormat('vi-VN').format(Number(form.value) || 0)} VND off`;
  const previewMin = Number(form.minOrder) > 0
    ? `Min order: ${new Intl.NumberFormat('vi-VN').format(Number(form.minOrder))} VND`
    : 'No minimum order';

  return (
    <>
      <style>{pageCSS}</style>
      <div className="p-8 space-y-6">
          <div className="grid grid-cols-4 gap-5">
            <div className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between" style={{ borderColor: '#b8e0cc', boxShadow: '0 0 0 1px #00694c1a,0 4px 20px #00694c14' }}>
              <div className="flex justify-between items-start">
                <div><p className="text-on-surface-variant font-label-md text-label-md mb-1">Total Promotions</p><h3 className="font-bold" style={{ fontSize: '24px' }}>{promos.length}</h3></div>
                <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#00694c', background: '#e0f5ed' }}>campaign</span>
              </div>
              <div className="mt-4"><span className="font-label-sm text-label-sm" style={{ color: '#00694c' }}>All time</span></div>
            </div>
            <div className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between" style={{ borderColor: '#fcd97a', boxShadow: '0 0 0 1px #f59e0b1a,0 4px 20px #f59e0b14' }}>
              <div className="flex justify-between items-start">
                <div><p className="text-on-surface-variant font-label-md text-label-md mb-1">Active Now</p><h3 className="font-bold" style={{ fontSize: '24px' }}>{activeCount}</h3></div>
                <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#b47b10', background: '#fff3d6' }}>local_offer</span>
              </div>
              <div className="mt-4"><span className="font-label-sm text-label-sm" style={{ color: '#b47b10' }}>Currently running</span></div>
            </div>
            <div className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between" style={{ borderColor: '#b8e0cc', boxShadow: '0 0 0 1px #00694c1a,0 4px 20px #00694c14' }}>
              <div className="flex justify-between items-start">
                <div><p className="text-on-surface-variant font-label-md text-label-md mb-1">Total Discount Given</p><h3 className="font-bold" style={{ fontSize: '22px' }}>{fmt(totalDiscountGiven)}</h3></div>
                <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#00694c', background: '#e0f5ed' }}>savings</span>
              </div>
              <div className="mt-4"><span className="font-label-sm text-label-sm" style={{ color: '#00694c' }}>All time (excl. cancelled orders)</span></div>
            </div>
            <div className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between" style={{ borderColor: '#fac057', boxShadow: '0 0 0 1px #D9770622,0 4px 20px #D9770614' }}>
              <div className="flex justify-between items-start">
                <div><p className="text-on-surface-variant font-label-md text-label-md mb-1">Expiring Soon</p><h3 className="font-bold" style={{ fontSize: '24px', color: '#854f0b' }}>{expiringSoon}</h3></div>
                <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#854f0b', background: '#fff3d6' }}>timer</span>
              </div>
              <div className="mt-4"><span className="font-label-sm text-label-sm" style={{ color: '#854f0b' }}>Within 7 days</span></div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border rounded-xl overflow-hidden" style={{ borderColor: '#c8e4d8' }}>
            <div className="p-6 border-b flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: '#c8e4d8' }}>
              <div className="flex items-center gap-3">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="filter-select">
                  <option value="">All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Expired</option>
                  <option>Scheduled</option>
                </select>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="filter-select">
                  <option value="">All Types</option>
                  <option>Percentage</option>
                  <option>Fixed</option>
                </select>
              </div>
              <button onClick={openAdd} className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg font-bold" style={{ fontSize: '14px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                Add Promotion
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead style={{ background: '#f4fbf7' }}>
                  <tr>
                    <th className="px-4 py-3 w-10"><input type="checkbox" className="rounded" checked={checkAll} onChange={e => setCheckAll(e.target.checked)} /></th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Code</th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Description</th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Type</th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Discount</th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Min Order</th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Period</th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Status</th>
                    <th className="px-4 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#c8e4d8' }}>
                  {loading && (
                    <tr><td colSpan={9} className="px-4 py-8 text-center" style={{ fontSize: '13px', color: '#6d7a73' }}>Loading promotions…</td></tr>
                  )}
                  {!loading && loadError && (
                    <tr><td colSpan={9} className="px-4 py-8 text-center" style={{ fontSize: '13px', color: '#dc2626' }}>{loadError}</td></tr>
                  )}
                  {!loading && !loadError && pagedData.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-8 text-center" style={{ fontSize: '13px', color: '#6d7a73' }}>No promotions found</td></tr>
                  )}
                  {pagedData.map(p => {
                    const sc = statusConfig[p.status] || statusConfig['Inactive'];
                    const dl = daysLeft(p.end);
                    return (
                      <tr key={p.id} className="transition-colors" style={{ borderColor: '#c8e4d8' }}>
                        <td className="px-4 py-3"><input type="checkbox" className="rounded" checked={checkAll} readOnly /></td>
                        <td className="px-4 py-3">
                          <div className="inline-flex px-3 py-1 rounded-lg border-2 border-dashed" style={{ borderColor: '#00694c', background: '#e0f5ed' }}>
                            <span className="font-bold" style={{ fontSize: '12px', color: '#00694c', letterSpacing: '.05em' }}>{p.code}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant" style={{ fontSize: '13px', maxWidth: '200px' }}>{p.desc}</td>
                        <td className="px-4 py-3">
                          {p.type === 'Percentage'
                            ? <span style={{ background: '#e0f5ed', color: '#004d38', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600 }}>% Percent</span>
                            : <span style={{ background: '#fff3d6', color: '#7a5c00', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 600 }}>VND Fixed</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          {p.type === 'Percentage'
                            ? <span className="font-bold" style={{ fontSize: '15px', color: '#00694c' }}>{p.value}%</span>
                            : <span className="font-bold" style={{ fontSize: '14px', color: '#b47b10' }}>{fmt(p.value)}</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant" style={{ fontSize: '13px' }}>{p.minOrder ? fmt(p.minOrder) : '—'}</td>
                        <td className="px-4 py-3">
                          <p style={{ fontSize: '12px', color: '#3d4943' }}>{p.start} → {p.end}</p>
                          <div className="mt-1"><span style={{ fontSize: '11px', color: dl.color, fontWeight: dl.bold ? 700 : 400 }}>{dl.text}</span></div>
                        </td>
                        <td className="px-4 py-3"><span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700 }}>{p.status}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => openEdit(p.id)} className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors" style={{ borderColor: '#c8e4d8' }}
                              onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = '#e0f5ed'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#00694c'; }}
                              onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; (e.currentTarget as HTMLButtonElement).style.borderColor = '#c8e4d8'; }} title="Edit">
                              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#3d4943' }}>edit</span>
                            </button>
                            <button onClick={() => openDelete(p.id)} className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors" style={{ borderColor: '#c8e4d8' }}
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
            <div className="px-6 py-4 border-t flex items-center justify-center" style={{ borderColor: '#c8e4d8' }}>
              <div className="flex items-center gap-1">
                <button onClick={() => goTo(curPage - 1)} disabled={curPage === 1}
                  className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-surface-container"
                  style={{ borderColor: '#c8e4d8', opacity: curPage === 1 ? 0.4 : 1 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_left</span>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => goTo(p)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold${p === curPage ? ' btn-primary' : ' border hover:bg-surface-container'}`}
                    style={{ fontSize: '13px', borderColor: p !== curPage ? '#c8e4d8' : undefined, color: p !== curPage ? '#3d4943' : undefined }}>
                    {p}
                  </button>
                ))}
                <button onClick={() => goTo(curPage + 1)} disabled={curPage === totalPages}
                  className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-surface-container"
                  style={{ borderColor: '#c8e4d8', opacity: curPage === totalPages ? 0.4 : 1 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
          onClick={e => { if (e.target === e.currentTarget) setFormOpen(false); }}>
          <div className="rounded-2xl w-[520px] max-w-[95vw] max-h-[90vh] overflow-y-auto" style={{ background: '#ffffff', border: '2px solid #00a86b', boxShadow: '0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,105,76,0.15)' }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#b2e8d0' }}>
              <h3 className="font-bold text-on-surface" style={{ fontSize: '18px' }}>{editId ? 'Edit Promotion' : 'Add Promotion'}</h3>
              <button onClick={() => setFormOpen(false)} className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container rounded-full p-1">close</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Promo Code *</label>
                  <input type="text" placeholder="e.g. SUMMER20" value={form.code} onChange={e => updateForm('code', e.target.value.toUpperCase())} className="modal-input" style={{ textTransform: 'uppercase' }} />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Discount Type *</label>
                  <select value={form.type} onChange={e => updateForm('type', e.target.value)} className="modal-input">
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Amount (VND)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Description</label>
                <input type="text" placeholder="Promotion description" value={form.desc} onChange={e => updateForm('desc', e.target.value)} className="modal-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Discount Value *</label>
                  <input type="number" min="0" placeholder="0" value={form.value} onChange={e => updateForm('value', e.target.value)} className="modal-input" />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Min Order Value (VND)</label>
                  <input type="number" min="0" placeholder="0" value={form.minOrder} onChange={e => updateForm('minOrder', e.target.value)} className="modal-input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Start Date *</label>
                  <input type="date" value={form.start} onChange={e => updateForm('start', e.target.value)} className="modal-input" />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">End Date *</label>
                  <input type="date" value={form.end} onChange={e => updateForm('end', e.target.value)} className="modal-input" />
                </div>
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Status</label>
                <select value={form.status} onChange={e => updateForm('status', e.target.value)} className="modal-input">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div className="rounded-xl p-4" style={{ background: '#fffdf0', border: '1.5px dashed #f59e0b' }}>
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-2">Preview</p>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-xl border-2 border-dashed" style={{ borderColor: '#00694c', background: '#e0f5ed' }}>
                    <p className="font-bold" style={{ fontSize: '16px', color: '#00694c', letterSpacing: '.06em' }}>{previewCode}</p>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface" style={{ fontSize: '14px' }}>{previewDiscount}</p>
                    <p className="text-on-surface-variant" style={{ fontSize: '12px' }}>{previewMin}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: '#c8e4d8' }}>
              <button onClick={() => setFormOpen(false)} className="px-4 py-2 rounded-lg border text-on-surface-variant hover:bg-surface-container" style={{ borderColor: '#c8e4d8', fontSize: '14px' }}>Cancel</button>
              <button onClick={savePromo} disabled={saving} className="btn-primary px-4 py-2 rounded-lg text-white font-bold" style={{ fontSize: '14px', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving…' : 'Save Promotion'}</button>
            </div>
          </div>
        </div>
      )}

      {delOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
          onClick={e => { if (e.target === e.currentTarget) setDelOpen(false); }}>
          <div className="rounded-2xl w-[360px] p-8 text-center" style={{ background: '#ffffff', border: '2px solid #00a86b', boxShadow: '0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(0,105,76,0.15)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#fee2e2' }}>
              <span className="material-symbols-outlined" style={{ color: '#991b1b', fontSize: '28px' }}>delete</span>
            </div>
            <h3 className="font-bold text-on-surface mb-2" style={{ fontSize: '18px' }}>Delete promotion?</h3>
            <p className="text-on-surface-variant mb-6" style={{ fontSize: '14px' }}>
              Promotion &quot;{deletePromo?.code}&quot; will be permanently removed. Codes already used by orders cannot be deleted – set them to Inactive instead.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDelOpen(false)} className="px-5 py-2 rounded-lg border text-on-surface-variant hover:bg-surface-container" style={{ borderColor: '#c8e4d8', fontSize: '14px' }}>Cancel</button>
              <button onClick={confirmDelete} className="px-5 py-2 rounded-lg text-white font-bold" style={{ background: '#dc2626', fontSize: '14px' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

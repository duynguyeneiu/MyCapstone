'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { userService, ApiUser } from '@/src/services/userService';
import { initials } from '@/src/lib/utils';

interface Props { search: string; }

const pageCSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Hanken+Grotesk:wght@600;700&display=swap');
.font-hanken { font-family: 'Hanken Grotesk', sans-serif; }
.usr-tab { padding: 8px 22px; font-size: 14px; font-weight: 500; border-radius: 999px; border: 2px solid #00a86b; color: #00694c; cursor: pointer; transition: all .18s; background: #fff; }
.usr-tab:hover { background: #e0f5ed; }
.usr-tab.tab-active { background: linear-gradient(135deg,#00694c,#00a86b); color: #fff; border-color: transparent; box-shadow: 0 2px 8px #00694c44; }
.filter-select { background: #fff8e6; border: 1.5px solid #fcd97a; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #3d4943; outline: none; }
`;

const AVATAR_COLORS = ['#00694c', '#b47b10', '#1d6fb8', '#7c3aed', '#004d38', '#854f0b', '#00a86b', '#f59e0b'];
const PAGE_SIZE = 6;

function isStaffRole(u: ApiUser) {
  const name = u.role?.roleName?.toLowerCase();
  if (name) return name === 'admin' || name === 'staff';
  return u.roleId === 1 || u.roleId === 2;
}

function isActive(u: ApiUser) {
  return (u.status ?? '').toLowerCase() === 'active';
}

export default function AdminUsersPage({ search }: Props) {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'customers' | 'staff'>('customers');
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [lockTarget, setLockTarget] = useState<ApiUser | null>(null);
  const [lockBusy, setLockBusy] = useState(false);

  const load = () => {
    setLoading(true);
    userService
      .getAll()
      .then(setUsers)
      .catch((err) => {
        console.error(err);
        setError('Failed to load users.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const customers = useMemo(() => users.filter((u) => !isStaffRole(u)), [users]);
  const staff = useMemo(() => users.filter(isStaffRole), [users]);

  // Status values are derived from real data rather than assumed, since the
  // backend doesn't document a fixed enum for User.status.
  const statusOptions = useMemo(
    () => [...new Set(users.map((u) => u.status).filter(Boolean))],
    [users]
  );

  const now = new Date();
  const newThisMonth = users.filter((u) => {
    const raw = u.registerDate ?? u.createdAt;
    if (!raw) return false;
    const d = new Date(raw);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const inactiveCount = users.filter((u) => !isActive(u)).length;

  const q = search.trim().toLowerCase();
  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (u) =>
          (!q ||
            u.fullName.toLowerCase().includes(q) ||
            (u.phone ?? '').includes(q) ||
            (u.email ?? '').toLowerCase().includes(q)) &&
          (!statusFilter || u.status === statusFilter) &&
          (!genderFilter || (u.gender ?? '').toLowerCase() === genderFilter.toLowerCase())
      ),
    [customers, q, statusFilter, genderFilter]
  );
  const filteredStaff = useMemo(
    () =>
      staff.filter(
        (u) =>
          (!q ||
            u.fullName.toLowerCase().includes(q) ||
            (u.phone ?? '').includes(q) ||
            (u.email ?? '').toLowerCase().includes(q)) &&
          (!roleFilter || (u.role?.roleName ?? '').toLowerCase() === roleFilter.toLowerCase())
      ),
    [staff, q, roleFilter]
  );

  const activeList = tab === 'customers' ? filteredCustomers : filteredStaff;
  const totalPages = Math.max(1, Math.ceil(activeList.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedList = activeList.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const switchTab = (t: 'customers' | 'staff') => {
    setTab(t);
    setPage(1);
  };

  const confirmLockToggle = async () => {
    if (!lockTarget) return;
    setLockBusy(true);
    try {
      const { role, ...rest } = lockTarget;
      const nextStatus = isActive(lockTarget) ? 'Inactive' : 'Active';
      await userService.update(lockTarget.userId, { ...rest, status: nextStatus });
      setUsers((prev) =>
        prev.map((u) => (u.userId === lockTarget.userId ? { ...u, status: nextStatus } : u))
      );
      setLockTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLockBusy(false);
    }
  };

  return (
    <>
      <style>{pageCSS}</style>
      <div className="p-8 space-y-6 font-hanken">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#191c1e' }}>Users</h1>
            <p className="text-sm" style={{ color: '#6d7a73' }}>Manage customers and staff accounts</p>
          </div>
          <Link href="/admin/users/create" className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg,#00694c,#00a86b)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Add User
          </Link>
        </div>

        {error && <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>}

        {loading ? (
          <div className="text-center py-20" style={{ color: '#94a3b8' }}>Loading users…</div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="rounded-xl p-6 bg-white border" style={{ borderColor: '#b8e0cc', boxShadow: '0 4px 20px #00694c14' }}>
                <div className="flex justify-between items-start">
                  <div><p className="text-xs mb-1" style={{ color: '#6d7a73' }}>Total Customers</p><h3 className="text-xl font-bold">{customers.length}</h3></div>
                  <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#00694c', background: '#e0f5ed' }}>group</span>
                </div>
              </div>
              <div className="rounded-xl p-6 bg-white border" style={{ borderColor: '#fcd97a', boxShadow: '0 4px 20px #f59e0b14' }}>
                <div className="flex justify-between items-start">
                  <div><p className="text-xs mb-1" style={{ color: '#6d7a73' }}>Staff Accounts</p><h3 className="text-xl font-bold">{staff.length}</h3></div>
                  <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#b47b10', background: '#fff3d6' }}>badge</span>
                </div>
              </div>
              <div className="rounded-xl p-6 bg-white border" style={{ borderColor: '#b8e0cc', boxShadow: '0 4px 20px #00694c14' }}>
                <div className="flex justify-between items-start">
                  <div><p className="text-xs mb-1" style={{ color: '#6d7a73' }}>New This Month</p><h3 className="text-xl font-bold">{newThisMonth}</h3></div>
                  <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#00694c', background: '#e0f5ed' }}>person_add</span>
                </div>
              </div>
              <div className="rounded-xl p-6 bg-white border" style={{ borderColor: '#fca5a5', boxShadow: '0 4px 20px #dc262614' }}>
                <div className="flex justify-between items-start">
                  <div><p className="text-xs mb-1" style={{ color: '#6d7a73' }}>Inactive Accounts</p><h3 className="text-xl font-bold" style={{ color: '#dc2626' }}>{inactiveCount}</h3></div>
                  <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#dc2626', background: '#fee2e2' }}>lock</span>
                </div>
              </div>
            </div>

            {/* Tabs + table */}
            <div className="rounded-xl bg-white border overflow-hidden" style={{ borderColor: '#c8e4d8' }}>
              <div className="flex gap-2 px-6 py-3 border-b" style={{ borderColor: '#c8e4d8' }}>
                <button className={`usr-tab${tab === 'customers' ? ' tab-active' : ''}`} onClick={() => switchTab('customers')}>Customers</button>
                <button className={`usr-tab${tab === 'staff' ? ' tab-active' : ''}`} onClick={() => switchTab('staff')}>Staff</button>
              </div>

              <div className="p-4 border-b flex items-center gap-3 flex-wrap" style={{ borderColor: '#c8e4d8' }}>
                {tab === 'customers' ? (
                  <>
                    <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="filter-select">
                      <option value="">All Status</option>
                      {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={genderFilter} onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }} className="filter-select">
                      <option value="">All Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </>
                ) : (
                  <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="filter-select">
                    <option value="">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                  </select>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead style={{ background: '#f4fbf7' }}>
                    <tr>
                      <th className="px-4 py-3 text-xs uppercase" style={{ color: '#6d7a73' }}>{tab === 'customers' ? 'Customer' : 'Staff'}</th>
                      <th className="px-4 py-3 text-xs uppercase" style={{ color: '#6d7a73' }}>Phone</th>
                      <th className="px-4 py-3 text-xs uppercase" style={{ color: '#6d7a73' }}>Email</th>
                      <th className="px-4 py-3 text-xs uppercase" style={{ color: '#6d7a73' }}>{tab === 'customers' ? 'Loyalty Points' : 'Role'}</th>
                      <th className="px-4 py-3 text-xs uppercase" style={{ color: '#6d7a73' }}>Status</th>
                      <th className="px-4 py-3 text-xs uppercase text-center" style={{ color: '#6d7a73' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#f1f5f9' }}>
                    {pagedList.map((u, i) => (
                      <tr key={u.userId}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length], fontSize: 12 }}>
                              {initials(u.fullName)}
                            </div>
                            <div>
                              <p className="font-bold" style={{ fontSize: 13 }}>{u.fullName}</p>
                              <p style={{ fontSize: 11, color: '#6d7a73' }}>{tab === 'customers' ? (u.gender ?? '—') : u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{u.phone ?? '—'}</td>
                        <td className="px-4 py-3" style={{ color: '#6d7a73' }}>{u.email ?? '—'}</td>
                        <td className="px-4 py-3">
                          {tab === 'customers' ? (
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#f59e0b' }}>star</span>
                              <span className="font-bold">{(u.loyaltyPoint ?? 0).toLocaleString()}</span>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: '#fff3d6', color: '#7a5c00' }}>{u.role?.roleName ?? '—'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isActive(u) ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: '#e0f5ed', color: '#004d38' }}>{u.status}</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: '#fee2e2', color: '#7f1d1d' }}>{u.status || 'Inactive'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/admin/users/${u.userId}/edit`} className="w-8 h-8 rounded-lg border flex items-center justify-center" style={{ borderColor: '#c8e4d8' }} title="Edit">
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                            </Link>
                            <button onClick={() => setLockTarget(u)} className="w-8 h-8 rounded-lg border flex items-center justify-center" style={{ borderColor: '#c8e4d8' }} title={isActive(u) ? 'Deactivate' : 'Activate'}>
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{isActive(u) ? 'lock' : 'lock_open'}</span>
                            </button>
                            <Link href={`/admin/users/${u.userId}/delete`} className="w-8 h-8 rounded-lg border flex items-center justify-center" style={{ borderColor: '#fca5a5', color: '#dc2626' }} title="Delete">
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pagedList.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-8 text-center" style={{ color: '#94a3b8' }}>No users match your filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-4 border-t flex items-center justify-center gap-1" style={{ borderColor: '#c8e4d8' }}>
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center" style={{ borderColor: '#c8e4d8', opacity: safePage === 1 ? 0.4 : 1 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                      style={p === safePage
                        ? { background: 'linear-gradient(135deg,#00694c,#00a86b)', color: '#fff' }
                        : { border: '1px solid #c8e4d8', color: '#3d4943' }}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center" style={{ borderColor: '#c8e4d8', opacity: safePage === totalPages ? 0.4 : 1 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Lock/unlock confirm modal */}
      {lockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.55)' }}
          onClick={(e) => { if (e.target === e.currentTarget && !lockBusy) setLockTarget(null); }}>
          <div className="rounded-2xl w-[360px] p-8 text-center font-hanken" style={{ background: '#fff', border: '2px solid #00a86b' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: isActive(lockTarget) ? '#fff3d6' : '#e0f5ed' }}>
              <span className="material-symbols-outlined" style={{ color: isActive(lockTarget) ? '#7a5c00' : '#004d38', fontSize: 28 }}>
                {isActive(lockTarget) ? 'lock' : 'lock_open'}
              </span>
            </div>
            <h3 className="font-bold mb-2" style={{ fontSize: 18 }}>{isActive(lockTarget) ? 'Deactivate account?' : 'Activate account?'}</h3>
            <p className="mb-6 text-sm" style={{ color: '#6d7a73' }}>
              {isActive(lockTarget) ? 'Deactivate' : 'Activate'} account for &quot;{lockTarget.fullName}&quot;?
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setLockTarget(null)} disabled={lockBusy} className="px-5 py-2 rounded-lg border text-sm" style={{ borderColor: '#c8e4d8' }}>Cancel</button>
              <button onClick={confirmLockToggle} disabled={lockBusy} className="px-5 py-2 rounded-lg text-white font-bold text-sm" style={{ background: isActive(lockTarget) ? '#f59e0b' : '#00694c' }}>
                {lockBusy ? 'Saving…' : isActive(lockTarget) ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

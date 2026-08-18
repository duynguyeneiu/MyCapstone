'use client';

import React, { useState, useEffect } from 'react';
import { ReviewTab } from '../../lib/types';
import { STAR_LABELS } from '../../lib/data';
import { productService } from '@/src/services/productService';
import { categoryService } from '@/src/services/categoryService';
import { reviewService, ApiReview } from '@/src/services/reviewService';
import { Product, Category } from '@/src/lib/data';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import StarRow from '../ui/StarRow';
import BtnTeal from '../ui/BtnTeal';
import BtnOutline from '../ui/BtnOutline';

/* ── Shared confirmation modal ── */
interface DeleteState { label: string; onConfirm: () => void; }

function DeleteModal({ state, onClose }: { state: DeleteState; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '1.25rem', padding: '2rem', width: '90%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,.2)', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#ef4444' }}>delete</span>
        </div>
        <h3 className="serif" style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.5rem' }}>Delete this review?</h3>
        <p style={{ color: '#64748b', fontSize: '.875rem', marginBottom: '1.5rem' }}>
          Are you sure you want to delete your review for <strong style={{ color: '#1e293b' }}>{state.label}</strong>? This action cannot be undone.
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
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
      </button>
    </div>
  );
}

function formatDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ReviewsContent() {
  const { orders } = useOrders();
  const { user } = useAuth();
  const [tab, setTab] = useState<ReviewTab>('pending');
  const [picked, setPicked] = useState<Product | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [star, setStar] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [comment, setComment] = useState('');
  const [allReviews, setAllReviews] = useState<ApiReview[]>([]);
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [minePage, setMinePage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, categoriesData, reviewsData] = await Promise.all([
          productService.getAll(),
          categoryService.getAll(),
          reviewService.getAll(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setAllReviews(reviewsData);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const categoryName = (categoryId: number) => categories.find(c => c.id === categoryId)?.name ?? '';

  useEffect(() => {
    if (!successMsg) return;
    const t = setTimeout(() => setSuccessMsg(null), 5000);
    return () => clearTimeout(t);
  }, [successMsg]);

  const confirmDelete = (label: string, onConfirm: () => void) =>
    setDeleteState({ label, onConfirm });

  // ── Tính toán dynamic ──────────────────────────────────────────
  const myReviews = user ? allReviews.filter(r => r.userId === Number(user.id)) : [];

  // 1. Tất cả sản phẩm từ đơn hàng ĐÃ GIAO (status = delivered)
  const deliveredPids = [...new Set(
    orders
      .filter(o => ['delivered', 'paid'].includes(o.orderStatus.toLowerCase()))
      .flatMap(o => o.items.map(i => i.productId))
  )];

  // 2. Sản phẩm đã được review (không được review lại)
  const reviewedPids = new Set(myReviews.map(r => r.productId));

  // 3. Sản phẩm chờ review = đã giao NHƯNG chưa review
  const pendingPids = deliveredPids.filter(pid => !reviewedPids.has(pid));

  const hasDeliveredOrders = deliveredPids.length > 0;
  const displayStar = hoverStar || star;

  // ── Submit review (create or edit) ──────────────────────────────
  const resetForm = () => {
    setPicked(null);
    setEditingReviewId(null);
    setStar(0);
    setComment('');
  };

  const submitReview = async () => {
    if (!star || !comment.trim()) return;
    try {
      if (editingReviewId) {
        await reviewService.update(editingReviewId, { rating: star, comment });
      } else if (picked) {
        await reviewService.create({ productId: picked.id, rating: star, comment });
      } else {
        return;
      }
      const refreshed = await reviewService.getAll();
      setAllReviews(refreshed);
      resetForm();
      setMinePage(1);
      setTab('mine');
      setSuccessMsg(editingReviewId ? 'Review updated successfully' : 'Review submitted successfully');
    } catch (err) {
      console.error(err);
    }
  };

  const startReview = (p: Product) => {
    resetForm();
    setPicked(p);
    setTab('write');
  };

  const startEdit = (r: ApiReview) => {
    const p = products.find(x => x.id === r.productId) ?? null;
    setEditingReviewId(r.reviewId);
    setPicked(p);
    setStar(r.rating);
    setComment(r.comment ?? '');
    setTab('write');
  };

  const deleteReview = (r: ApiReview) => {
    const p = products.find(x => x.id === r.productId);
    confirmDelete(p?.name ?? 'this review', async () => {
      try {
        await reviewService.delete(r.reviewId);
        setAllReviews(prev => prev.filter(x => x.reviewId !== r.reviewId));
        setSuccessMsg('Review deleted successfully');
      } catch (err) {
        console.error(err);
      }
    });
  };

  // ── My Reviews pagination ─────────────────────────────────────
  const MINE_PAGE_SIZE = 5;
  const mineTotalPages = Math.max(1, Math.ceil(myReviews.length / MINE_PAGE_SIZE));
  const mineSafePage = Math.min(minePage, mineTotalPages);
  const mineStart = (mineSafePage - 1) * MINE_PAGE_SIZE;
  const pagedReviews = myReviews.slice(mineStart, mineStart + MINE_PAGE_SIZE);
  const mineGoTo = (p: number) => setMinePage(Math.max(1, Math.min(mineTotalPages, p)));
  let mLo = Math.max(1, mineSafePage - 2);
  let mHi = Math.min(mineTotalPages, mineSafePage + 2);
  if (mHi - mLo < 4) { if (mLo === 1) mHi = Math.min(mineTotalPages, mLo + 4); else mLo = Math.max(1, mHi - 4); }
  const minePageNums: number[] = [];
  for (let i = mLo; i <= mHi; i++) minePageNums.push(i);

  // ── Tab labels ─────────────────────────────────────────────────
  const tabs: { id: ReviewTab; icon: string; label: string }[] = [
    { id: 'pending', icon: 'schedule',  label: `Pending (${pendingPids.length})` },
    { id: 'write',   icon: 'edit',      label: 'Write Review' },
    { id: 'mine',    icon: 'list_alt',  label: `My Reviews (${myReviews.length})` },
  ];

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {deleteState && <DeleteModal state={deleteState} onClose={() => setDeleteState(null)} />}
      {successMsg  && <SuccessToast message={successMsg} onClose={() => setSuccessMsg(null)} />}

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="serif" style={{ fontSize: '2rem', fontWeight: 700 }}>Product Reviews</h1>
        <p style={{ color: '#64748b', fontSize: '.875rem', marginTop: 4 }}>
          You can only review products from delivered orders.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', background: '#fff', borderRadius: '1rem', padding: '0.5rem', boxShadow: '0 2px 8px rgba(0,0,0,.04)', width: 'fit-content', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '.4rem 1rem', borderRadius: 9999, border: 'none', background: tab === t.id ? 'var(--teal)' : 'transparent', color: tab === t.id ? '#fff' : '#64748b', fontWeight: 500, fontSize: '.85rem', cursor: 'pointer', transition: '.2s' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PENDING TAB ─────────────────────────────────────────── */}
      {tab === 'pending' && (
        <div>
          {/* Chưa mua gì */}
          {!hasDeliveredOrders && (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#fff', borderRadius: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '3.5rem', color: '#94a3b8' }}>shopping_bag</span>
              <p className="serif" style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem' }}>
                No purchases yet
              </p>
              <p style={{ color: '#64748b', marginBottom: '1.25rem', fontSize: '.875rem' }}>
                You need to purchase and receive a product before you can write a review.
              </p>
              <BtnTeal onClick={() => window.location.href = '/shop'}>Start Shopping</BtnTeal>
            </div>
          )}

          {/* Đã mua nhưng đã review hết */}
          {hasDeliveredOrders && pendingPids.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#fff', borderRadius: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '3.5rem', color: '#16a34a' }}>check_circle</span>
              <p className="serif" style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem' }}>
                All reviewed!
              </p>
              <p style={{ color: '#64748b', fontSize: '.875rem' }}>
                You&apos;ve reviewed all your purchased products. Thank you!
              </p>
            </div>
          )}

          {/* Danh sách chờ review */}
          {pendingPids.length > 0 && (
            <div>
              <p style={{ color: '#64748b', fontSize: '.875rem', marginBottom: '1rem' }}>
                These products from your delivered orders are waiting for your review:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pendingPids.map(pid => {
                  const p = products.find(x => x.id === pid)!;
                  return (
                    <div key={pid} style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 56, height: 56, borderRadius: '0.75rem', background: 'var(--teal-xs)', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '.9rem' }}>{p.name}</p>
                        <p style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: 2 }}>{categoryName(p.categoryId)}</p>
                        <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} style={{ color: '#e2e8f0', fontSize: '.9rem' }}>★</span>
                          ))}
                        </div>
                      </div>
                      <BtnTeal onClick={() => startReview(p)} style={{ fontSize: '.8rem', padding: '0.5rem 1rem' }}>
                        Write Review
                      </BtnTeal>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── WRITE TAB ───────────────────────────────────────────── */}
      {tab === 'write' && (
        <div>
          {/* Chưa có đơn hàng delivered và không phải đang edit */}
          {!hasDeliveredOrders && !picked && (
            <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#94a3b8' }}>lock</span>
              <p className="serif" style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem' }}>
                Purchase required
              </p>
              <p style={{ color: '#64748b', fontSize: '.875rem', marginBottom: '1.25rem' }}>
                You can only review products that you have purchased and received.
              </p>
              <BtnTeal onClick={() => window.location.href = '/shop'}>Go to Shop</BtnTeal>
            </div>
          )}

          {/* Đã review hết rồi */}
          {hasDeliveredOrders && pendingPids.length === 0 && !picked && (
            <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#16a34a' }}>check_circle</span>
              <p className="serif" style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem' }}>
                Nothing left to review
              </p>
              <p style={{ color: '#64748b', fontSize: '.875rem' }}>
                You&apos;ve already reviewed all your purchased products.
              </p>
            </div>
          )}

          {/* Chọn sản phẩm để review */}
          {hasDeliveredOrders && pendingPids.length > 0 && !picked && (
            <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
              <h3 className="serif" style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.35rem' }}>
                Select a Product to Review
              </h3>
              <p style={{ color: '#64748b', fontSize: '.8rem', marginBottom: '1.25rem' }}>
                Only products from your delivered orders are shown.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '0.75rem' }}>
                {pendingPids.map(pid => {
                  const p = products.find(x => x.id === pid)!;
                  return (
                    <button key={pid} onClick={() => setPicked(p)}
                      style={{ padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', textAlign: 'center', transition: '.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.background = 'var(--teal-xs)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; }}>
                      <div style={{ width: 56, height: 56, borderRadius: '0.5rem', background: 'var(--teal-xs)', overflow: 'hidden', margin: '0 auto 6px' }}>
                        <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }} />
                      </div>
                      <p style={{ fontSize: '.78rem', fontWeight: 500, lineHeight: 1.3 }}>{p.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form review (create hoặc edit) */}
          {picked && (
            <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
              {/* Product header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.75rem', background: 'var(--teal-xs)', marginBottom: '1.5rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '0.5rem', background: '#fff', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={picked.image} alt={picked.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '.9rem' }}>{picked.name}</p>
                  <p style={{ fontSize: '.75rem', color: '#64748b' }}>{categoryName(picked.categoryId)}</p>
                </div>
                <button onClick={resetForm}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                </button>
              </div>

              {/* Rating */}
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: '0.5rem' }}>
                  Your Rating <span style={{ color: '#ef4444' }}>*</span>
                </p>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <span key={n}
                      onClick={() => setStar(n)}
                      onMouseEnter={() => setHoverStar(n)}
                      onMouseLeave={() => setHoverStar(0)}
                      style={{ fontSize: '2rem', cursor: 'pointer', color: n <= displayStar ? '#f59e0b' : '#e2e8f0', transition: '.15s' }}>
                      ★
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: 4 }}>
                  {star ? `${STAR_LABELS[star]} — ${star}/5` : 'Click to rate'}
                </p>
              </div>

              {/* Comment */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '.75rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                  Your Review <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
                  placeholder="What did you like or dislike? How was quality, value, and delivery?" />
                <p style={{ fontSize: '.75rem', color: '#94a3b8', textAlign: 'right', marginTop: 2 }}>
                  {comment.length} / 500
                </p>
              </div>

              {/* Submit */}
              {(!star || !comment.trim()) && (
                <p style={{ fontSize: '.75rem', color: '#f59e0b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#f59e0b' }}>warning</span>
                  Rating and review text are required.
                </p>
              )}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <BtnTeal
                  onClick={submitReview}
                  style={{ flex: 1, padding: '0.75rem', opacity: (!star || !comment.trim()) ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {editingReviewId ? 'Update Review' : 'Submit Review'}
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                </BtnTeal>
                <BtnOutline onClick={resetForm}
                  style={{ padding: '0.75rem 1.25rem' } as React.CSSProperties}>
                  Cancel
                </BtnOutline>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MY REVIEWS TAB ──────────────────────────────────────── */}
      {tab === 'mine' && (
        <div>
          {myReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#94a3b8' }}>edit_note</span>
              <p className="serif" style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem' }}>
                No reviews yet
              </p>
              <p style={{ color: '#64748b', fontSize: '.875rem' }}>
                Your submitted reviews will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pagedReviews.map(r => {
                const p = products.find(x => x.id === r.productId);
                if (!p) return null;
                return (
                  <div key={r.reviewId}
                    style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)', transition: '.2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(0,105,76,.12)'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 10px rgba(0,0,0,.05)'}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: 'var(--teal-xs)', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '.9rem' }}>{p.name}</p>
                          <p style={{ fontSize: '.75rem', color: '#94a3b8' }}>{formatDate(r.createdAt)}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => startEdit(r)}
                          style={{ fontSize: '.8rem', color: 'var(--teal)', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontFamily: 'inherit' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteReview(r)}
                          style={{ fontSize: '.8rem', color: '#f87171', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontFamily: 'inherit' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}>
                      <StarRow rating={r.rating} size="text-base" />
                    </div>

                    {r.comment && (
                      <p style={{ color: '#4b5563', fontSize: '.875rem', lineHeight: 1.65, marginBottom: '0.75rem' }}>
                        {r.comment}
                      </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', alignItems: 'center' }}>
                      <span style={{ background: '#dcfce7', color: '#166534', borderRadius: 9999, padding: '.15rem .65rem', fontSize: '.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>verified</span>
                        Verified Purchase
                      </span>
                    </div>
                  </div>
                );
              })}
              {mineTotalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: '1rem' }}>
                  <button onClick={() => mineGoTo(mineSafePage - 1)} disabled={mineSafePage === 1}
                    style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid', borderColor: mineSafePage === 1 ? '#e2e8f0' : 'var(--teal)', background: '#fff', color: mineSafePage === 1 ? '#cbd5e1' : 'var(--teal)', cursor: mineSafePage === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                  </button>
                  {minePageNums.map(n => (
                    <button key={n} onClick={() => mineGoTo(n)}
                      style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid', borderColor: n === mineSafePage ? 'var(--teal)' : '#e2e8f0', background: n === mineSafePage ? 'var(--teal)' : '#fff', color: n === mineSafePage ? '#fff' : '#374151', fontWeight: n === mineSafePage ? 700 : 400, cursor: 'pointer', fontSize: '.875rem' }}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => mineGoTo(mineSafePage + 1)} disabled={mineSafePage === mineTotalPages}
                    style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid', borderColor: mineSafePage === mineTotalPages ? '#e2e8f0' : 'var(--teal)', background: '#fff', color: mineSafePage === mineTotalPages ? '#cbd5e1' : 'var(--teal)', cursor: mineSafePage === mineTotalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

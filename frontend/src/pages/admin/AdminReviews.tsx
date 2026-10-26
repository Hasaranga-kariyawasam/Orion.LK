import React, { useEffect, useState } from 'react';
import { Check, Loader2, Star, Trash2, X } from 'lucide-react';
import { ApiReview, deleteReview, getReviews, updateReviewStatus } from '../../lib/api';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      setReviews(await getReviews({ admin: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load customer reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const moderate = async (review: ApiReview, status: ApiReview['status']) => {
    setBusyId(review._id);
    try {
      const updated = await updateReviewStatus(review._id, status);
      setReviews(current => current.map(item => item._id === updated._id ? updated : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update review.');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (review: ApiReview) => {
    if (!window.confirm(`Delete the review for ${review.productName}?`)) return;
    setBusyId(review._id);
    try {
      await deleteReview(review._id);
      setReviews(current => current.filter(item => item._id !== review._id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete review.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="space-y-5">
      <header>
        <h2 className="text-2xl font-black text-white">Customer Reviews</h2>
        <p className="mt-1 text-sm text-gray-500">{reviews.filter(review => review.status === 'Pending').length} awaiting moderation</p>
      </header>
      {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#2ee661]" /></div>
      ) : reviews.length ? (
        <div className="space-y-3">
          {reviews.map(review => (
            <article key={review._id} className="rounded-xl border border-[#30363D] bg-[#161B22] p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-white">{review.productName}</h3>
                  <p className="mt-1 text-xs text-gray-400">{review.customerName} · {review.customerEmail} · Order {review.orderNumber}</p>
                  <div className="mt-2 flex items-center gap-1 text-amber-400" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: review.rating }, (_, index) => <Star key={index} size={13} fill="currentColor" />)}
                    <span className="ml-1 text-xs text-gray-400">{review.rating}/5</span>
                  </div>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${review.status === 'Approved' ? 'border-emerald-500/30 text-emerald-400' : review.status === 'Rejected' ? 'border-red-500/30 text-red-400' : 'border-amber-500/30 text-amber-300'}`}>
                  {review.status}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-300">{review.comment}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#30363D] pt-3">
                <time className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleString()}</time>
                <div className="flex gap-2">
                  {review.status !== 'Approved' && <button disabled={busyId === review._id} onClick={() => void moderate(review, 'Approved')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"><Check size={14} /> Approve</button>}
                  {review.status !== 'Rejected' && <button disabled={busyId === review._id} onClick={() => void moderate(review, 'Rejected')} className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"><X size={14} /> Reject</button>}
                  <button disabled={busyId === review._id} onClick={() => void remove(review)} aria-label="Delete review" className="rounded-lg p-2 text-gray-500 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"><Trash2 size={15} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : <p className="rounded-xl border border-[#30363D] bg-[#161B22] py-14 text-center text-sm text-gray-400">No customer reviews yet.</p>}
    </section>
  );
}
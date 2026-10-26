import React, { useCallback, useEffect, useState } from 'react';
import { Check, RefreshCw, Star, Trash2 } from 'lucide-react';
import { ApiProductReview, fetchAdminProductReviews, moderateProductReview } from '../../lib/api';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<ApiProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setReviews(await fetchAdminProductReviews());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const moderate = async (review: ApiProductReview, action: 'approve' | 'pending' | 'delete') => {
    setBusyId(review._id);
    setError('');
    try {
      await moderateProductReview(review._id, action);
      if (action === 'delete') {
        setReviews(previous => previous.filter(item => item._id !== review._id));
      } else {
        setReviews(previous => previous.map(item => item._id === review._id
          ? { ...item, status: action === 'approve' ? 'Approved' : 'Pending' }
          : item));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update review');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Product Reviews</h2>
          <p className="text-gray-500 text-sm mt-1">Approve reviews from customers with delivered orders.</p>
        </div>
        <button onClick={() => void refresh()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-[#30363D] px-4 py-2 text-xs font-bold text-gray-300 hover:text-white disabled:opacity-50">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      {loading ? (
        <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-10 text-center text-gray-400">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-[#30363D] bg-[#161B22] p-10 text-center text-gray-400">No product reviews have been submitted.</div>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <article key={review._id} className="rounded-2xl border border-[#30363D] bg-[#161B22] p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-white">{review.productName || 'Product'}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${review.status === 'Approved' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-300'}`}>{review.status}</span>
                  </div>
                  <p className="text-xs text-gray-400">{review.customerName} · {new Date(review.createdAt).toLocaleDateString()}</p>
                  <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} className={index < review.rating ? 'fill-current' : 'text-gray-600'} />)}
                  </div>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{review.comment}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {review.status !== 'Approved' && (
                    <button onClick={() => void moderate(review, 'approve')} disabled={busyId === review._id} className="inline-flex items-center gap-1.5 rounded-lg bg-[#2ee661] px-3 py-2 text-xs font-bold text-black disabled:opacity-50">
                      <Check size={14} /> Approve
                    </button>
                  )}
                  {review.status === 'Approved' && (
                    <button onClick={() => void moderate(review, 'pending')} disabled={busyId === review._id} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 px-3 py-2 text-xs font-bold text-amber-300 disabled:opacity-50">
                      Hide
                    </button>
                  )}
                  <button onClick={() => void moderate(review, 'delete')} disabled={busyId === review._id} className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-bold text-red-300 disabled:opacity-50">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

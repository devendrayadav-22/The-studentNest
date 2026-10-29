import React, { useState, useEffect } from 'react';
import { Star, Trash2, ShieldAlert } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StarRating from '../../components/StarRating';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { success, error: toastError } = useToast();

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllReviews();
      setReviews(data || []);
    } catch (err) {
      console.error('Failed to load reviews for moderation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      setDeleteLoading(true);
      await adminApi.deleteReview(deletingId);
      setReviews((prev) => prev.filter((r) => r.id !== deletingId));
      success('Review removed by administrator.');
      setDeletingId(null);
    } catch (err) {
      toastError('Failed to delete review');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Review Moderation</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Audit ratings and comments to ensure authentic, respectful feedback for campus accommodations
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-28 bg-white/70 animate-pulse rounded-2xl" />
          <div className="h-28 bg-white/70 animate-pulse rounded-2xl" />
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No Reviews on Platform"
          description="There are currently zero student reviews to moderate."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <Card key={rev.id} className="p-5 bg-white/85 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{rev.studentName}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    Target: {rev.targetType} #{rev.targetId}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <StarRating rating={rev.rating} size="sm" showNumber />
                  <span className="text-xs text-slate-400">{formatDate(rev.createdAt)}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-xl">
                "{rev.comment}"
              </p>

              {rev.ownerReply && (
                <div className="p-3 bg-purple-50/60 border border-purple-200/50 rounded-xl text-xs space-y-1">
                  <strong className="text-purple-900 block">Owner Response:</strong>
                  <span className="text-purple-800">{rev.ownerReply}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  variant="danger"
                  size="xs"
                  icon={Trash2}
                  onClick={() => setDeletingId(rev.id)}
                >
                  Delete Inappropriate Review
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Admin Delete Review?"
        message="Are you sure you want to permanently delete this student review? It will be removed from listing averages."
        confirmText="Delete Review"
        loading={deleteLoading}
      />
    </div>
  );
};

export default ReviewModeration;


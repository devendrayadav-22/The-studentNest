import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Edit3, Trash2, ExternalLink } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import StarRating from '../../components/StarRating';
import EmptyState from '../../components/EmptyState';
import { reviewApi } from '../../api/reviewApi';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export const StudentReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error: toastError } = useToast();

  // Edit State
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewApi.getMyReviews();
      setReviews(data || []);
    } catch (err) {
      console.error('Failed to load student reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const openEditModal = (review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editComment.trim()) return;

    try {
      setSavingEdit(true);
      const updated = await reviewApi.updateReview(editingReview.id, {
        targetType: editingReview.targetType,
        targetId: editingReview.targetId,
        rating: editRating,
        comment: editComment.trim()
      });

      setReviews((prev) =>
        prev.map((r) => (r.id === editingReview.id ? updated : r))
      );
      success('Review updated successfully!');
      setEditingReview(null);
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update review');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      setDeleteLoading(true);
      await reviewApi.deleteReview(deletingId);
      setReviews((prev) => prev.filter((r) => r.id !== deletingId));
      success('Review deleted.');
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
        <h1 className="text-2xl font-black text-slate-900">My Reviews & Ratings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage and update the accommodation and dining reviews you have shared
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-28 bg-white/70 animate-pulse rounded-2xl" />
          <div className="h-28 bg-white/70 animate-pulse rounded-2xl" />
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No Reviews Submitted"
          description="You haven't posted any reviews yet. Share your experience on PG or Mess listing pages to help junior students."
          actionLabel="Find a PG to Review"
          onAction={() => (window.location.href = '/pgs')}
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => {
            const linkPath = rev.targetType === 'MESS' ? `/messes/${rev.targetId}` : `/pgs/${rev.targetId}`;

            return (
              <Card key={rev.id} className="p-5 bg-white/85 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {rev.targetType} #{rev.targetId}
                    </span>
                    <Link
                      to={linkPath}
                      className="text-xs font-bold text-slate-700 hover:text-teal-700 flex items-center gap-1"
                    >
                      <span>View Listing</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="flex items-center gap-3">
                    <StarRating rating={rev.rating} size="sm" showNumber />
                    <span className="text-xs text-slate-400">
                      {formatDate(rev.createdAt)}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {rev.comment}
                </p>

                {rev.ownerReply && (
                  <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200/60 text-xs">
                    <strong className="text-teal-900 block">Owner Reply:</strong>
                    <span className="text-teal-800">{rev.ownerReply}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="ghost"
                    size="xs"
                    icon={Edit3}
                    onClick={() => openEditModal(rev)}
                  >
                    Edit Review
                  </Button>
                  <Button
                    variant="danger"
                    size="xs"
                    icon={Trash2}
                    onClick={() => setDeletingId(rev.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <Modal
          isOpen={true}
          onClose={() => setEditingReview(null)}
          title="Edit Your Review"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Rating</label>
              <StarRating
                rating={editRating}
                interactive={true}
                onChange={setEditRating}
                size="lg"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Comment</label>
              <textarea
                rows={4}
                required
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setEditingReview(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" loading={savingEdit}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Review?"
        message="Are you sure you want to delete this review? Your star rating will be removed from the listing average."
        confirmText="Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

export default StudentReviews;


import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import StarRating from '../../components/StarRating';
import EmptyState from '../../components/EmptyState';
import { messOwnerApi } from '../../api/messOwnerApi';
import { reviewApi } from '../../api/reviewApi';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export const MessOwnerReviews = () => {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [replyingReview, setReplyingReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const { success, error: toastError } = useToast();

  useEffect(() => {
    const loadMessReviews = async () => {
      try {
        setLoading(true);
        const myProfile = await messOwnerApi.getProfile();
        setProfile(myProfile);
        if (myProfile?.id) {
          const revs = await reviewApi.getReviews('MESS', myProfile.id);
          setReviews(revs || []);
        }
      } catch (err) {
        console.error('Failed to load mess reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMessReviews();
  }, []);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setSubmittingReply(true);
      const updated = await reviewApi.replyToReview(replyingReview.id, replyText.trim());
      setReviews((prev) =>
        prev.map((r) => (r.id === replyingReview.id ? updated : r))
      );
      success('Response posted successfully!');
      setReplyingReview(null);
      setReplyText('');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to submit response');
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Student Reviews & Feedback</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Read what diners say about your food hygiene and post official owner responses
        </p>
      </div>

      {loading ? (
        <div className="h-64 bg-white/70 animate-pulse rounded-2xl" />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No Reviews Yet"
          description="Your mess profile hasn't received student reviews yet."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <Card key={rev.id} className="p-5 bg-white/85 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{rev.studentName}</span>
                  <span className="text-[11px] text-slate-500">{rev.studentCollege || 'IPS Academy'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={rev.rating} size="sm" showNumber />
                  <span className="text-xs text-slate-400">{formatDate(rev.createdAt)}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{rev.comment}</p>

              {rev.ownerReply ? (
                <div className="p-3 bg-orange-50/70 border border-orange-200/60 rounded-xl text-xs space-y-1">
                  <strong className="text-orange-900 block">Your Official Response:</strong>
                  <p className="text-orange-800">{rev.ownerReply}</p>
                </div>
              ) : (
                <div className="flex justify-end pt-1">
                  <Button
                    variant="secondary"
                    size="xs"
                    icon={MessageSquare}
                    onClick={() => {
                      setReplyingReview(rev);
                      setReplyText('');
                    }}
                  >
                    Reply to Review
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {replyingReview && (
        <Modal
          isOpen={true}
          onClose={() => setReplyingReview(null)}
          title={`Reply to ${replyingReview.studentName}`}
        >
          <form onSubmit={handleSendReply} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Diner Review:</span>
              <p className="italic">"{replyingReview.comment}"</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Your Public Response
              </label>
              <textarea
                rows={4}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Thank you for dining with us! We have instructed our chef to ensure..."
                className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setReplyingReview(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" loading={submittingReply} icon={Send} className="bg-orange-600 hover:bg-orange-700">
                Post Response
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MessOwnerReviews;


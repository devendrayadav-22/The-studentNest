import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Heart,
  Phone,
  MessageCircle,
  Flag,
  Navigation,
  Bed,
  Users,
  ShieldCheck,
  Clock,
  Send,
  Eye,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  Lock
} from 'lucide-react';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import StarRating from '../../components/StarRating';
import MapView from '../../components/MapView';
import Modal from '../../components/Modal';
import LoginPromptModal from '../../components/LoginPromptModal';
import ImageWithFallback from '../../components/ImageWithFallback';
import Skeleton from '../../components/Skeleton';
import ErrorState from '../../components/ErrorState';
import { pgApi } from '../../api/pgApi';
import { reviewApi } from '../../api/reviewApi';
import { wishlistApi } from '../../api/wishlistApi';
import { inquiryApi } from '../../api/inquiryApi';
import { reportApi } from '../../api/reportApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice, formatDistance, formatDate, formatRelativeDays } from '../../utils/formatters';
import { FACILITY_MAP } from '../../constants/facilities';
import COLLEGE_CONFIG from '../../constants/college';

export const PgDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, role } = useAuth();
  const { success, error: toastError } = useToast();

  const [pg, setPg] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lightbox state
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Modals state
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  // Wishlist state
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Load PG details & reviews
  const loadPgData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [pgData, reviewList] = await Promise.all([
        pgApi.getById(id),
        reviewApi.getReviews('PG', id)
      ]);

      setPg(pgData);
      setReviews(reviewList || []);

      // Check wishlist
      if (isAuthenticated && role === 'STUDENT') {
        const myWishlist = await wishlistApi.getWishlist();
        const found = myWishlist.find((w) => w.targetType === 'PG' && String(w.targetId) === String(id));
        if (found) {
          setIsWishlisted(true);
          setWishlistId(found.id);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load PG listing details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPgData();
  }, [id, isAuthenticated, role]);

  const requireAuth = (callback) => {
    if (!isAuthenticated) {
      setLoginPromptOpen(true);
      return;
    }
    if (role !== 'STUDENT') {
      toastError('Only students can perform this action.');
      return;
    }
    callback();
  };

  // Toggle Wishlist
  const handleToggleWishlist = () => {
    requireAuth(async () => {
      try {
        if (isWishlisted && wishlistId) {
          await wishlistApi.removeFromWishlist(wishlistId);
          setIsWishlisted(false);
          setWishlistId(null);
          success('Removed from your wishlist.');
        } else {
          const res = await wishlistApi.addToWishlist('PG', id);
          setIsWishlisted(true);
          setWishlistId(res.id);
          success('Saved to your wishlist!');
        }
      } catch (err) {
        toastError(err.response?.data?.message || 'Failed to update wishlist');
      }
    });
  };

  // Send Inquiry
  const handleSendInquiry = async (e) => {
    e.preventDefault();
    if (!inquiryMessage.trim()) return;

    requireAuth(async () => {
      try {
        setSendingInquiry(true);
        await inquiryApi.sendInquiry({
          targetType: 'PG',
          targetId: Number(id),
          message: inquiryMessage.trim()
        });
        success('Inquiry sent successfully to owner!');
        setInquiryModalOpen(false);
        setInquiryMessage('');
      } catch (err) {
        toastError(err.response?.data?.message || 'Failed to send inquiry');
      } finally {
        setSendingInquiry(false);
      }
    });
  };

  // Submit Report
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    requireAuth(async () => {
      try {
        setSubmittingReport(true);
        await reportApi.createReport({
          targetType: 'PG',
          targetId: Number(id),
          reason: reportReason.trim()
        });
        success('Report submitted. Our campus administration will review it.');
        setReportModalOpen(false);
        setReportReason('');
      } catch (err) {
        toastError(err.response?.data?.message || 'Failed to submit report');
      } finally {
        setSubmittingReport(false);
      }
    });
  };

  // Post Review
  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingReview(true);
      const res = await reviewApi.postReview({
        targetType: 'PG',
        targetId: Number(id),
        rating: newRating,
        comment: newComment.trim()
      });
      setReviews((prev) => [res, ...prev]);
      setNewComment('');
      success('Thank you! Your review has been posted.');
    } catch (err) {
      if (err.response?.status === 409) {
        toastError('You have already submitted a review for this PG.');
      } else {
        toastError(err.response?.data?.message || 'Failed to submit review');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="aspect-[16/8] w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="md:col-span-2 h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !pg) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <ErrorState message={error || 'Listing not found'} onRetry={loadPgData} />
      </div>
    );
  }

  const images = pg.images && pg.images.length > 0 ? pg.images : [];
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${pg.lat},${pg.lng}&destination=${COLLEGE_CONFIG.lat},${COLLEGE_CONFIG.lng}`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <Link to="/pgs" className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-800">
          <ChevronLeft className="w-4 h-4" />
          Back to Listings
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              isWishlisted
                ? 'bg-red-50 text-red-600 border-red-200 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-red-600' : ''}`} />
            <span>{isWishlisted ? 'Saved' : 'Save'}</span>
          </button>

          <button
            type="button"
            onClick={() => requireAuth(() => setReportModalOpen(true))}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-600 hover:text-red-600 text-xs font-semibold transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
        </div>
      </div>

      {/* Title & Badges Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-lg bg-teal-100 text-teal-800 font-bold text-xs uppercase tracking-wider">
            {pg.type} &bull; {pg.gender}
          </span>
          {pg.verified && <Badge variant="verified" size="sm" />}
          {pg.stale && <Badge variant="stale" size="sm" />}
          <span className="text-xs text-slate-500 flex items-center gap-1 ml-auto">
            <Clock className="w-3.5 h-3.5" />
            {formatRelativeDays(pg.lastUpdatedDaysAgo)}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
          {pg.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 pt-1">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{pg.address}</span>
          </div>
          <div className="text-teal-700 font-bold bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200/60">
            {formatDistance(pg.distanceKm)}
          </div>
          <StarRating rating={pg.averageRating} count={pg.reviewCount} showNumber size="sm" />
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {pg.viewCount || 0} views
          </span>
        </div>
      </div>

      {/* Image Gallery with Lightbox */}
      <div className="space-y-3">
        {images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Primary Main Photo */}
            <div
              className="md:col-span-3 aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-200 cursor-pointer relative group"
              onClick={() => {
                setActiveImageIdx(0);
                setLightboxOpen(true);
              }}
            >
              <ImageWithFallback
                src={images[0]}
                alt={pg.title}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                fallbackType="pg"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                Click to view full photo
              </div>
            </div>

            {/* Side Thumbnail Stack */}
            <div className="hidden md:flex flex-col gap-3">
              {images.slice(1, 4).map((img, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-xl overflow-hidden bg-slate-200 cursor-pointer relative group"
                  onClick={() => {
                    setActiveImageIdx(idx + 1);
                    setLightboxOpen(true);
                  }}
                >
                  <ImageWithFallback
                    src={img}
                    alt={`${pg.title} photo ${idx + 2}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    fallbackType="pg"
                  />
                </div>
              ))}
              {images.length < 2 && (
                <div className="flex-1 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-[11px] text-slate-400">
                  No additional photos
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="aspect-[16/8] rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400">
            No listing photos available
          </div>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Content (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Key Quick Facts Strip */}
          <Card className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center bg-white/80">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                Monthly Rent
              </span>
              <span className="text-xl font-black text-slate-900 mt-0.5 block">
                {formatPrice(pg.rent)}
              </span>
            </div>

            <div className="border-l border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                Security Deposit
              </span>
              <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                {formatPrice(pg.deposit)}
              </span>
            </div>

            <div className="border-l border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                Room Sharing
              </span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {pg.sharing}
              </span>
            </div>

            <div className="border-l border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                Available Beds
              </span>
              <span className="text-base font-bold text-teal-700 mt-0.5 block">
                {pg.availableBeds} beds
              </span>
            </div>
          </Card>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900">About this Accommodation</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white/60 p-5 rounded-2xl border border-slate-200/80">
              {pg.description || 'No detailed description provided by owner.'}
            </p>
          </div>

          {/* Facilities Icons Grid */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900">Available Facilities</h3>
            {pg.facilities && pg.facilities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pg.facilities.map((facKey) => {
                  const facility = FACILITY_MAP[facKey] || { label: facKey };
                  return (
                    <div
                      key={facKey}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-white/70 border border-slate-200/80 shadow-xs"
                    >
                      <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="text-xs font-semibold text-slate-800">
                        {facility.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No facilities specified.</p>
            )}
          </div>

          {/* House Rules */}
          {pg.rules && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900">Hostel & House Rules</h3>
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p>{pg.rules}</p>
              </div>
            </div>
          )}

          {/* Leaflet Map with Directions button */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Location & Commute</h3>
                <p className="text-xs text-slate-500">
                  {formatDistance(pg.distanceKm)} from {COLLEGE_CONFIG.name}
                </p>
              </div>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outlineTeal" size="sm" icon={Navigation}>
                  Get Directions
                </Button>
              </a>
            </div>

            <MapView
              singleTarget={pg}
              height="360px"
              targetType="PG"
            />
          </div>

          {/* Reviews & Ratings Section */}
          <div className="space-y-6 pt-4 border-t border-slate-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Student Reviews</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={pg.averageRating} size="md" />
                  <span className="text-sm font-extrabold text-slate-900">
                    {pg.averageRating ? pg.averageRating.toFixed(1) : 'New'}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>
            </div>

            {/* Add Review Box (STUDENT only) */}
            {role === 'STUDENT' && (
              <form onSubmit={handlePostReview} className="bg-white/80 p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-800">Write a Review for IPS Students</h4>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Your Rating</label>
                  <StarRating
                    rating={newRating}
                    max={5}
                    interactive={true}
                    onChange={setNewRating}
                    size="lg"
                  />
                </div>
                <div>
                  <textarea
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                    placeholder="Share your experience regarding food, Wi-Fi speed, electricity bills, warden behavior..."
                    className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={submittingReview}
                  icon={Send}
                >
                  Post Review
                </Button>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <Card key={rev.id} className="p-4 sm:p-5 bg-white/75 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm text-slate-900">{rev.studentName}</span>
                        {rev.studentCollege && (
                          <span className="text-[11px] text-slate-500 block">
                            {rev.studentCollege}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <StarRating rating={rev.rating} size="xs" />
                        <span className="text-[11px] text-slate-400">
                          {formatDate(rev.createdAt)}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {rev.comment}
                    </p>

                    {/* Owner reply */}
                    {rev.ownerReply && (
                      <div className="mt-3 p-3 rounded-xl bg-teal-50/70 border border-teal-200/70 text-xs space-y-1">
                        <span className="font-bold text-teal-900 block">Owner Response:</span>
                        <p className="text-teal-800">{rev.ownerReply}</p>
                      </div>
                    )}
                  </Card>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">
                  No reviews yet. Be the first IPS student to review!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Sticky Contact Sidebar (4 cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-5">
          <Card className="p-6 bg-white/90 shadow-lg space-y-5">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block">
                Monthly Rent
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-black text-slate-900">{formatPrice(pg.rent)}</span>
                <span className="text-xs text-slate-500">/month</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Deposit: {formatPrice(pg.deposit)} &bull; {pg.availableBeds} beds available
              </p>
            </div>

            {/* Owner Details */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                Managed By
              </span>
              <p className="text-sm font-bold text-slate-900">
                {pg.ownerBusinessName || pg.ownerName}
              </p>
              {pg.ownerBusinessName && (
                <p className="text-xs text-slate-600">Contact: {pg.ownerName}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              {!isAuthenticated ? (
                <>
                  <Button
                    variant="primary"
                    size="md"
                    icon={Lock}
                    className="w-full justify-center shadow-xs"
                    onClick={() => setLoginPromptOpen(true)}
                  >
                    Login to view contact
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    icon={Send}
                    className="w-full justify-center"
                    onClick={() => setLoginPromptOpen(true)}
                  >
                    Send Message Inquiry
                  </Button>
                </>
              ) : role !== 'STUDENT' ? (
                <div className="p-3.5 rounded-xl bg-slate-100 text-center text-xs font-semibold text-slate-600 border border-slate-200">
                  Only students can contact
                </div>
              ) : (
                <>
                  {pg.ownerPhone && (
                    <>
                      <a
                        href={`https://wa.me/91${pg.ownerPhone}?text=${encodeURIComponent(`Hi, I am an IPS Academy student interested in ${pg.title}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button
                          variant="primary"
                          size="md"
                          icon={MessageCircle}
                          className="w-full bg-[#15803D] hover:bg-[#166534] shadow-xs"
                        >
                          Chat on WhatsApp
                        </Button>
                      </a>

                      <a href={`tel:${pg.ownerPhone}`} className="block">
                        <Button
                          variant="secondary"
                          size="md"
                          icon={Phone}
                          className="w-full"
                        >
                          Call Owner ({pg.ownerPhone})
                        </Button>
                      </a>
                    </>
                  )}

                  <Button
                    variant="accent"
                    size="md"
                    icon={Send}
                    className="w-full"
                    onClick={() => setInquiryModalOpen(true)}
                  >
                    Send Message Inquiry
                  </Button>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 text-center space-y-1">
              <p className="flex items-center justify-center gap-1 text-emerald-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                No middleman or broker fee
              </p>
              <p>Direct contact with verified accommodation owner</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Inquiry Modal */}
      <Modal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        title={`Inquire about ${pg.title}`}
      >
        <form onSubmit={handleSendInquiry} className="space-y-4">
          <p className="text-xs text-slate-600">
            Your name ({user?.name}) and contact details will be shared directly with the owner.
          </p>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Your Message
            </label>
            <textarea
              rows={4}
              required
              value={inquiryMessage}
              onChange={(e) => setInquiryMessage(e.target.value)}
              placeholder="Hi, I am an IPS student looking to move in next month. Is a double bed room available?"
              className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setInquiryModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={sendingInquiry}>
              Send Inquiry
            </Button>
          </div>
        </form>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report this Listing"
      >
        <form onSubmit={handleSubmitReport} className="space-y-4">
          <p className="text-xs text-slate-600">
            Help keep StudentNest safe and trustworthy. Reports are investigated by the student administration team.
          </p>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Reason for Report
            </label>
            <textarea
              rows={3}
              required
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="e.g. Inaccurate rent, fake photos, incorrect address, misleading sharing details..."
              className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setReportModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" type="submit" loading={submittingReport}>
              Submit Report
            </Button>
          </div>
        </form>
      </Modal>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-white/10"
            aria-label="Close photo view"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-4xl max-h-[80vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <ImageWithFallback
              src={images[activeImageIdx]}
              alt={`Photo ${activeImageIdx + 1}`}
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl"
              fallbackType="pg"
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <LoginPromptModal
        isOpen={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
      />
    </div>
  );
};

export default PgDetail;


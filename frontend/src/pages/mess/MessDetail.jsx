import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  MapPin,
  Truck,
  Phone,
  MessageCircle,
  Flag,
  Navigation,
  Send,
  Star,
  CheckCircle,
  ChevronLeft,
  Calendar,
  Utensils,
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
import { messApi } from '../../api/messApi';
import { reviewApi } from '../../api/reviewApi';
import { inquiryApi } from '../../api/inquiryApi';
import { reportApi } from '../../api/reportApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatPrice, formatDistance, formatDate } from '../../utils/formatters';
import COLLEGE_CONFIG from '../../constants/college';

export const MessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, role } = useAuth();
  const { success, error: toastError } = useToast();

  const [mess, setMess] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Day Filter for Menu
  const [selectedDay, setSelectedDay] = useState('ALL');

  // Modals state
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Review state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  const loadMessData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [messData, reviewList] = await Promise.all([
        messApi.getById(id),
        reviewApi.getReviews('MESS', id)
      ]);

      setMess(messData);
      setReviews(reviewList || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load mess details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessData();
  }, [id]);

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

  const handleSendInquiry = async (e) => {
    e.preventDefault();
    if (!inquiryMessage.trim()) return;

    requireAuth(async () => {
      try {
        setSendingInquiry(true);
        await inquiryApi.sendInquiry({
          targetType: 'MESS',
          targetId: Number(id),
          message: inquiryMessage.trim()
        });
        success('Inquiry sent to mess owner!');
        setInquiryModalOpen(false);
        setInquiryMessage('');
      } catch (err) {
        toastError(err.response?.data?.message || 'Failed to send inquiry');
      } finally {
        setSendingInquiry(false);
      }
    });
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    requireAuth(async () => {
      try {
        setSubmittingReport(true);
        await reportApi.createReport({
          targetType: 'MESS',
          targetId: Number(id),
          reason: reportReason.trim()
        });
        success('Report submitted successfully.');
        setReportModalOpen(false);
        setReportReason('');
      } catch (err) {
        toastError(err.response?.data?.message || 'Failed to submit report');
      } finally {
        setSubmittingReport(false);
      }
    });
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingReview(true);
      const res = await reviewApi.postReview({
        targetType: 'MESS',
        targetId: Number(id),
        rating: newRating,
        comment: newComment.trim()
      });
      setReviews((prev) => [res, ...prev]);
      setNewComment('');
      success('Review posted successfully!');
    } catch (err) {
      if (err.response?.status === 409) {
        toastError('You have already submitted a review for this mess.');
      } else {
        toastError(err.response?.data?.message || 'Failed to post review');
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
      </div>
    );
  }

  if (error || !mess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <ErrorState message={error || 'Mess profile not found'} onRetry={loadMessData} />
      </div>
    );
  }

  const foodTypeVariant =
    mess.foodType === 'VEG' ? 'veg' : mess.foodType === 'NONVEG' ? 'nonveg' : 'both';

  const menuItems = mess.menuItems || [];

  // Filter menu items by selected day
  const filteredMenu = menuItems.filter((item) => {
    if (selectedDay === 'ALL') return true;
    return item.dayOfWeek === 'ALL' || item.dayOfWeek === selectedDay;
  });

  const breakfasts = filteredMenu.filter((item) => item.mealType === 'BREAKFAST');
  const lunches = filteredMenu.filter((item) => item.mealType === 'LUNCH');
  const dinners = filteredMenu.filter((item) => item.mealType === 'DINNER');

  const daysList = [
    { id: 'ALL', label: 'All Days' },
    { id: 'MON', label: 'Monday' },
    { id: 'TUE', label: 'Tuesday' },
    { id: 'WED', label: 'Wednesday' },
    { id: 'THU', label: 'Thursday' },
    { id: 'FRI', label: 'Friday' },
    { id: 'SAT', label: 'Saturday' },
    { id: 'SUN', label: 'Sunday' },
  ];

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${mess.lat},${mess.lng}&destination=${COLLEGE_CONFIG.lat},${COLLEGE_CONFIG.lng}`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <Link to="/messes" className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-800">
          <ChevronLeft className="w-4 h-4" />
          Back to Mess Services
        </Link>

        <button
          type="button"
          onClick={() => requireAuth(() => setReportModalOpen(true))}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-600 hover:text-red-600 font-semibold transition-colors"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Report Mess</span>
        </button>
      </div>

      {/* Header Info */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={foodTypeVariant} size="sm" />
          <Badge variant={mess.isOpen ? 'open' : 'closed'} size="sm" />
          {mess.verified && <Badge variant="verified" size="sm" />}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
          {mess.name}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 pt-1">
          <div className="flex items-center gap-1 text-slate-700 font-medium">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{mess.address}</span>
          </div>
          <div className="text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
            {formatDistance(mess.distanceKm)}
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Clock className="w-3.5 h-3.5" />
            <span>{mess.openTime} - {mess.closeTime}</span>
          </div>
          <StarRating rating={mess.averageRating} count={mess.reviewCount} showNumber size="sm" />
        </div>
      </div>

      {/* Cover Image */}
      {mess.images && mess.images.length > 0 && (
        <div className="aspect-[16/7] rounded-3xl overflow-hidden bg-slate-200 border border-slate-300/80 shadow-md">
          <ImageWithFallback
            src={mess.images[0]}
            alt={mess.name}
            className="w-full h-full object-cover"
            fallbackType="mess"
          />
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Pricing & Delivery Summary Card */}
          <Card className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center bg-white/80">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                Per Meal / Thali
              </span>
              <span className="text-xl font-black text-slate-900 mt-0.5 block">
                {formatPrice(mess.pricePerMeal)}
              </span>
            </div>

            <div className="border-l border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                Monthly Subscription
              </span>
              <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                {formatPrice(mess.monthlyPrice)}
              </span>
            </div>

            <div className="border-l border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                Delivery Charge
              </span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {mess.deliveryCharge > 0 ? formatPrice(mess.deliveryCharge) : 'Free Delivery'}
              </span>
            </div>

            <div className="border-l border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                Operating Status
              </span>
              <span className={`text-base font-bold mt-0.5 block ${mess.isOpen ? 'text-emerald-700' : 'text-slate-500'}`}>
                {mess.isOpen ? 'Open Now' : 'Closed'}
              </span>
            </div>
          </Card>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900">About this Mess / Tiffin Service</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white/60 p-5 rounded-2xl border border-slate-200/80">
              {mess.description || 'Home-style fresh cooking with daily changing vegetable curries and hot rotis.'}
            </p>
          </div>

          {/* Delivery Area Information */}
          {mess.deliveryArea && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
              <Truck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs uppercase tracking-wide text-amber-900 block">
                  Tiffin Delivery Coverage
                </span>
                <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
                  Delivers to student PGs in: <strong>{mess.deliveryArea}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Weekly Menu Table Grouped by Day and Meal */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Weekly Food Menu</h3>
                <p className="text-xs text-slate-500">Grouped by breakfast, lunch, and dinner schedule</p>
              </div>

              {/* Day filter selector */}
              <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
                {daysList.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setSelectedDay(day.id)}
                    className={`px-3 py-1 text-xs font-semibold rounded-xl border whitespace-nowrap transition-all ${
                      selectedDay === day.id
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Groupings */}
            <div className="space-y-4">
              {/* Breakfast */}
              <Card className="p-5 bg-white/80 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Utensils className="w-4 h-4 text-amber-600" />
                  <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                    Breakfast (Nashta)
                  </h4>
                </div>
                {breakfasts.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {breakfasts.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.foodType === 'NONVEG' ? 'bg-red-500' : 'bg-green-500'}`} />
                          <span className="text-xs sm:text-sm font-semibold text-slate-800">{item.name}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            {item.dayOfWeek}
                          </span>
                        </div>
                        {item.price > 0 && (
                          <span className="text-xs font-bold text-slate-900">
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-1">No breakfast items listed for this schedule.</p>
                )}
              </Card>

              {/* Lunch */}
              <Card className="p-5 bg-white/80 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Utensils className="w-4 h-4 text-teal-600" />
                  <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                    Lunch (Dopahar Ka Khana)
                  </h4>
                </div>
                {lunches.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {lunches.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.foodType === 'NONVEG' ? 'bg-red-500' : 'bg-green-500'}`} />
                          <span className="text-xs sm:text-sm font-semibold text-slate-800">{item.name}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            {item.dayOfWeek}
                          </span>
                        </div>
                        {item.price > 0 && (
                          <span className="text-xs font-bold text-slate-900">
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-1">No lunch items listed for this schedule.</p>
                )}
              </Card>

              {/* Dinner */}
              <Card className="p-5 bg-white/80 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Utensils className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                    Dinner (Raat Ka Khana)
                  </h4>
                </div>
                {dinners.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {dinners.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.foodType === 'NONVEG' ? 'bg-red-500' : 'bg-green-500'}`} />
                          <span className="text-xs sm:text-sm font-semibold text-slate-800">{item.name}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            {item.dayOfWeek}
                          </span>
                        </div>
                        {item.price > 0 && (
                          <span className="text-xs font-bold text-slate-900">
                            {formatPrice(item.price)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-1">No dinner items listed for this schedule.</p>
                )}
              </Card>
            </div>
          </div>

          {/* Location Map with Directions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Mess Location</h3>
                <p className="text-xs text-slate-500">{formatDistance(mess.distanceKm)} from campus</p>
              </div>

              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outlineTeal" size="sm" icon={Navigation}>
                  Get Directions
                </Button>
              </a>
            </div>

            <MapView singleTarget={mess} height="320px" targetType="MESS" />
          </div>

          {/* Reviews Section */}
          <div className="space-y-6 pt-4 border-t border-slate-300">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Mess Reviews & Ratings</h3>
              <StarRating rating={mess.averageRating} count={reviews.length} showNumber size="sm" />
            </div>

            {/* Post Review for Student */}
            {role === 'STUDENT' && (
              <form onSubmit={handlePostReview} className="bg-white/80 p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-800">Rate Taste & Hygiene</h4>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Star Rating</label>
                  <StarRating
                    rating={newRating}
                    interactive={true}
                    onChange={setNewRating}
                    size="lg"
                  />
                </div>
                <textarea
                  rows={3}
                  required
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="How is the food quality, roti softness, timely delivery, and hygiene?"
                  className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <Button type="submit" variant="accent" size="sm" loading={submittingReview} icon={Send}>
                  Submit Review
                </Button>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-3">
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <Card key={rev.id} className="p-4 bg-white/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{rev.studentName}</span>
                      <div className="flex items-center gap-2">
                        <StarRating rating={rev.rating} size="xs" />
                        <span className="text-[11px] text-slate-400">{formatDate(rev.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700">{rev.comment}</p>
                    {rev.ownerReply && (
                      <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs">
                        <strong className="text-amber-900">Mess Owner Response:</strong> {rev.ownerReply}
                      </div>
                    )}
                  </Card>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">No student reviews yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Sticky Contact Sidebar (4 cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-5">
          <Card className="p-6 bg-white/90 shadow-lg space-y-5">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide block">Meal Plan</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl font-black text-slate-900">{formatPrice(mess.pricePerMeal)}</span>
                <span className="text-xs text-slate-500">/thali</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Monthly: {formatPrice(mess.monthlyPrice)} /month
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                Operated By
              </span>
              <p className="text-sm font-bold text-slate-900">
                {mess.ownerBusinessName || mess.ownerName}
              </p>
              {mess.ownerBusinessName && (
                <p className="text-xs text-slate-600">Contact Person: {mess.ownerName}</p>
              )}
            </div>

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
                    Send Delivery Inquiry
                  </Button>
                </>
              ) : role !== 'STUDENT' ? (
                <div className="p-3.5 rounded-xl bg-slate-100 text-center text-xs font-semibold text-slate-600 border border-slate-200">
                  Only students can contact
                </div>
              ) : (
                <>
                  {mess.ownerPhone && (
                    <>
                      <a
                        href={`https://wa.me/91${mess.ownerPhone}?text=${encodeURIComponent(`Hi, I am an IPS Academy student interested in your mess/tiffin service: ${mess.name}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button variant="primary" size="md" icon={MessageCircle} className="w-full bg-[#15803D] hover:bg-[#166534]">
                          Order via WhatsApp
                        </Button>
                      </a>

                      <a href={`tel:${mess.ownerPhone}`} className="block">
                        <Button variant="secondary" size="md" icon={Phone} className="w-full">
                          Call ({mess.ownerPhone})
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
                    Send Delivery Inquiry
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Inquiry Modal */}
      <Modal isOpen={inquiryModalOpen} onClose={() => setInquiryModalOpen(false)} title={`Inquire with ${mess.name}`}>
        <form onSubmit={handleSendInquiry} className="space-y-4">
          <p className="text-xs text-slate-600">
            Ask about trial tiffin meals, delivery timings to your hostel, or monthly discount plans.
          </p>
          <textarea
            rows={4}
            required
            value={inquiryMessage}
            onChange={(e) => setInquiryMessage(e.target.value)}
            placeholder="Hi, do you deliver to Bhawarkua near Professor Colony for lunch and dinner?"
            className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
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
      <Modal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} title="Report Mess Listing">
        <form onSubmit={handleSubmitReport} className="space-y-4">
          <textarea
            rows={3}
            required
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Reason for reporting this mess (e.g. Inaccurate hygiene, wrong timings, delivery failure)..."
            className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
          />
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

      <LoginPromptModal
        isOpen={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
      />
    </div>
  );
};

export default MessDetail;


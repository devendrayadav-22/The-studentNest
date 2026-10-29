import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Star, Compass, ArrowRight, User, ShieldCheck } from 'lucide-react';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { wishlistApi } from '../../api/wishlistApi';
import { inquiryApi } from '../../api/inquiryApi';
import { reviewApi } from '../../api/reviewApi';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';

export const StudentOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    wishlistCount: 0,
    inquiryCount: 0,
    reviewCount: 0
  });
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        setLoading(true);
        const [wList, inqList, revList] = await Promise.allSettled([
          wishlistApi.getWishlist(),
          inquiryApi.getMyInquiries(),
          reviewApi.getMyReviews()
        ]);

        const wishlist = wList.status === 'fulfilled' ? wList.value : [];
        const inquiries = inqList.status === 'fulfilled' ? inqList.value : [];
        const reviews = revList.status === 'fulfilled' ? revList.value : [];

        setStats({
          wishlistCount: wishlist.length,
          inquiryCount: inquiries.length,
          reviewCount: reviews.length
        });

        setRecentInquiries(inquiries.slice(0, 3));
      } catch (err) {
        console.error('Error fetching student overview:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOverviewData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-800 to-teal-950 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-teal-300 uppercase tracking-wider block mb-1">
            Student Dashboard
          </span>
          <h1 className="text-2xl font-black">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {user?.course || 'IPS Academy Student'} &bull; {user?.college || 'Indore Campus'}
          </p>
        </div>

        <Link to="/pgs">
          <Button variant="accent" size="sm" icon={Compass}>
            Browse More PGs
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Saved Accommodations"
          value={stats.wishlistCount}
          subtitle="Shortlisted PGs and messes"
          icon={Heart}
          roleAccent="student"
        />
        <StatCard
          title="My Inquiries"
          value={stats.inquiryCount}
          subtitle="Sent to listing owners"
          icon={MessageSquare}
          roleAccent="student"
        />
        <StatCard
          title="Reviews Submitted"
          value={stats.reviewCount}
          subtitle="Helping fellow IPS students"
          icon={Star}
          roleAccent="student"
        />
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/student/wishlist" className="block">
          <Card hover className="p-4 bg-white/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Wishlist</span>
                <span className="text-[11px] text-slate-500">View saved stays</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Card>
        </Link>

        <Link to="/student/compare" className="block">
          <Card hover className="p-4 bg-white/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Compare PGs</span>
                <span className="text-[11px] text-slate-500">Side-by-side specs</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Card>
        </Link>

        <Link to="/student/profile" className="block">
          <Card hover className="p-4 bg-white/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">My Profile</span>
                <span className="text-[11px] text-slate-500">Update course & city</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Card>
        </Link>
      </div>

      {/* Recent Inquiries List */}
      <Card className="p-5 bg-white/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
            Recent Inquiries
          </h3>
          <Link to="/student/inquiries" className="text-xs font-semibold text-teal-700 hover:underline">
            View All &rarr;
          </Link>
        </div>

        {recentInquiries.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentInquiries.map((inq) => (
              <div key={inq.id} className="py-3 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {inq.targetTitle || `Listing #${inq.targetId}`}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(inq.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1 italic">
                    "{inq.message}"
                  </p>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  inq.status === 'CONTACTED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {inq.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-3 text-center">
            You haven't sent any inquiries yet. Explore PGs and message owners directly!
          </p>
        )}
      </Card>
    </div>
  );
};

export default StudentOverview;


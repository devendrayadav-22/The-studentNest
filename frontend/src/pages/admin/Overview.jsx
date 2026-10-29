import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  UtensilsCrossed,
  ShieldAlert,
  Star,
  CheckCircle,
  Clock,
  Radio,
  ArrowRight
} from 'lucide-react';
import Card from '../../components/Card';
import StatCard from '../../components/StatCard';
import Button from '../../components/Button';
import { adminApi } from '../../api/adminApi';

export const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminStats = async () => {
      try {
        setLoading(true);
        const data = await adminApi.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAdminStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900 via-purple-950 to-slate-900 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider block mb-1">
            Campus Administration Console
          </span>
          <h1 className="text-2xl font-black">
            Platform Overview & Moderation
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Monitoring verified accommodations, student reviews, reports, and campus announcements
          </p>
        </div>

        <Link to="/admin/pending">
          <Button variant="accent" size="sm" icon={Clock}>
            Review Pending Approvals ({stats?.pendingPgs || 0 + (stats?.pendingMesses || 0)})
          </Button>
        </Link>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
          subtitle={`${stats?.totalStudents || 0} students, ${stats?.totalPgOwners || 0} PG owners`}
          icon={Users}
          roleAccent="admin"
        />
        <StatCard
          title="PG Listings"
          value={stats?.totalPgs}
          subtitle={`${stats?.approvedPgs || 0} approved, ${stats?.pendingPgs || 0} pending`}
          icon={Building2}
          roleAccent="admin"
        />
        <StatCard
          title="Mess Services"
          value={stats?.totalMesses}
          subtitle={`${stats?.approvedMesses || 0} approved, ${stats?.pendingMesses || 0} pending`}
          icon={UtensilsCrossed}
          roleAccent="admin"
        />
        <StatCard
          title="Open Reports"
          value={stats?.openReports}
          subtitle={`Out of ${stats?.totalReports || 0} total reports`}
          icon={ShieldAlert}
          roleAccent="admin"
        />
      </div>

      {/* Visual Bar Charts: Platform Health Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PG Listings Breakdown Bar Chart */}
        <Card className="p-5 bg-white/85 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              PG Listings Verification Breakdown
            </h3>
            <span className="text-xs text-purple-700 font-bold">{stats?.totalPgs || 0} Total</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Approved Bar */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">Approved & Verified</span>
                <span className="font-bold text-emerald-700">{stats?.approvedPgs || 0}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats?.totalPgs ? ((stats.approvedPgs || 0) / stats.totalPgs) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            {/* Pending Bar */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">Pending Review</span>
                <span className="font-bold text-amber-700">{stats?.pendingPgs || 0}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats?.totalPgs ? ((stats.pendingPgs || 0) / stats.totalPgs) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            {/* Inquiries & Views ratio */}
            <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
              <span>Total Reviews on Platform: <strong>{stats?.totalReviews || 0}</strong></span>
              <Link to="/admin/pending" className="text-purple-700 font-bold hover:underline">
                Review Pending &rarr;
              </Link>
            </div>
          </div>
        </Card>

        {/* User Roles Breakdown Bar Chart */}
        <Card className="p-5 bg-white/85 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              User Community Distribution
            </h3>
            <span className="text-xs text-purple-700 font-bold">{stats?.totalUsers || 0} Registered</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Students */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">IPS Students</span>
                <span className="font-bold text-teal-700">{stats?.totalStudents || 0}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats?.totalUsers ? ((stats.totalStudents || 0) / stats.totalUsers) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            {/* PG Owners */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">PG & Hostel Owners</span>
                <span className="font-bold text-blue-700">{stats?.totalPgOwners || 0}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats?.totalUsers ? ((stats.totalPgOwners || 0) / stats.totalUsers) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            {/* Mess Owners */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">Mess / Tiffin Providers</span>
                <span className="font-bold text-orange-700">{stats?.totalMessOwners || 0}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats?.totalUsers ? ((stats.totalMessOwners || 0) / stats.totalUsers) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Admin Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/admin/pending" className="block">
          <Card hover className="p-4 bg-white/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Pending Approvals</span>
                <span className="text-[11px] text-slate-500">Approve or reject submissions</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Card>
        </Link>

        <Link to="/admin/users" className="block">
          <Card hover className="p-4 bg-white/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">User Management</span>
                <span className="text-[11px] text-slate-500">Block or unblock accounts</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Card>
        </Link>

        <Link to="/admin/announcements" className="block">
          <Card hover className="p-4 bg-white/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Announcements</span>
                <span className="text-[11px] text-slate-500">Broadcast campus advisories</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default AdminOverview;


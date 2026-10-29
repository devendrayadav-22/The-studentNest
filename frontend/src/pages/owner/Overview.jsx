import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle2, Clock, Eye, MessageSquare, Bed, PlusCircle } from 'lucide-react';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { ownerApi } from '../../api/ownerApi';
import { useAuth } from '../../context/AuthContext';

export const OwnerOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalListings: 0,
    approvedListings: 0,
    pendingListings: 0,
    totalViews: 0,
    totalInquiries: 0,
    totalBeds: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await ownerApi.getStats();
        if (data) setStats(data);
      } catch (err) {
        console.error('Failed to load owner stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider block mb-1">
            PG Owner Workspace
          </span>
          <h1 className="text-2xl font-black">
            Welcome, {user?.name}!
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {user?.ownerBusinessName || 'Sharma Residency & Accommodations'}
          </p>
        </div>

        <Link to="/owner/listings/new">
          <Button variant="primary" size="sm" icon={PlusCircle} className="bg-blue-600 hover:bg-blue-700">
            List New PG / Hostel
          </Button>
        </Link>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Properties"
          value={stats.totalListings}
          subtitle="Registered under your account"
          icon={Building2}
          roleAccent="pgOwner"
        />
        <StatCard
          title="Approved & Live"
          value={stats.approvedListings}
          subtitle="Visible to students on map"
          icon={CheckCircle2}
          roleAccent="pgOwner"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pendingListings}
          subtitle="Under admin verification"
          icon={Clock}
          roleAccent="pgOwner"
        />
        <StatCard
          title="Total Student Views"
          value={stats.totalViews}
          subtitle="Listing impressions"
          icon={Eye}
          roleAccent="pgOwner"
        />
        <StatCard
          title="Student Inquiries"
          value={stats.totalInquiries}
          subtitle="Direct student messages"
          icon={MessageSquare}
          roleAccent="pgOwner"
        />
        <StatCard
          title="Total Beds Capacity"
          value={stats.totalBeds}
          subtitle="Available capacity"
          icon={Bed}
          roleAccent="pgOwner"
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card hover className="p-5 bg-white/85 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Manage Your PG Listings</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Update room rent, refresh available bed counts, and confirm availability.
            </p>
          </div>
          <Link to="/owner/listings">
            <Button variant="secondary" size="sm">
              View Listings &rarr;
            </Button>
          </Link>
        </Card>

        <Card hover className="p-5 bg-white/85 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Check Student Inquiries</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              View messages from IPS Academy students and update contact status.
            </p>
          </div>
          <Link to="/owner/inquiries">
            <Button variant="secondary" size="sm">
              View Inquiries &rarr;
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default OwnerOverview;


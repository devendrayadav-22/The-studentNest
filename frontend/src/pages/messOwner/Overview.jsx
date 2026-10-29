import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, MenuSquare, MessageSquare, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { messOwnerApi } from '../../api/messOwnerApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const MessOwnerOverview = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [stats, setStats] = useState({
    totalMenuItems: 0,
    isOpen: true,
    verified: false,
    status: 'PENDING',
    totalInquiries: 0
  });

  const [togglingOpen, setTogglingOpen] = useState(false);
  const [confirmingAvail, setConfirmingAvail] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await messOwnerApi.getStats();
      if (data) setStats(data);
    } catch (err) {
      console.error('Failed to load mess stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleToggleOpen = async () => {
    try {
      setTogglingOpen(true);
      const res = await messOwnerApi.toggleOpen();
      setStats((prev) => ({ ...prev, isOpen: res.isOpen }));
      success(`Mess status updated: ${res.isOpen ? 'OPEN NOW' : 'CLOSED'}`);
    } catch (err) {
      toastError('Failed to toggle open status');
    } finally {
      setTogglingOpen(false);
    }
  };

  const handleConfirmAvailability = async () => {
    try {
      setConfirmingAvail(true);
      await messOwnerApi.confirmAvailability();
      success('Mess availability timestamp confirmed and updated!');
    } catch (err) {
      toastError('Failed to confirm availability');
    } finally {
      setConfirmingAvail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-800 via-orange-900 to-slate-900 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-orange-300 uppercase tracking-wider block mb-1">
            Mess & Tiffin Center Workspace
          </span>
          <h1 className="text-2xl font-black">
            Welcome, {user?.name}!
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Keep your open/close status, daily thali rates, and weekly menus up to date
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Real-time Toggle Open/Closed */}
          <Button
            variant={stats.isOpen ? 'danger' : 'primary'}
            size="sm"
            loading={togglingOpen}
            onClick={handleToggleOpen}
            className={stats.isOpen ? '' : 'bg-emerald-600 hover:bg-emerald-700'}
          >
            {stats.isOpen ? 'Mark as Closed' : 'Mark as Open Now'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={confirmingAvail}
            onClick={handleConfirmAvailability}
          >
            Confirm Availability
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Operating Status"
          value={stats.isOpen ? 'OPEN' : 'CLOSED'}
          subtitle="Real-time live badge"
          icon={Clock}
          roleAccent="messOwner"
        />
        <StatCard
          title="Weekly Menu Items"
          value={stats.totalMenuItems}
          subtitle="Active meals in schedule"
          icon={MenuSquare}
          roleAccent="messOwner"
        />
        <StatCard
          title="Student Inquiries"
          value={stats.totalInquiries}
          subtitle="Received for delivery"
          icon={MessageSquare}
          roleAccent="messOwner"
        />
        <StatCard
          title="Approval Status"
          value={stats.status}
          subtitle={stats.verified ? 'Verified badge active' : 'Awaiting verification'}
          icon={CheckCircle2}
          roleAccent="messOwner"
        />
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card hover className="p-5 bg-white/85 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Manage Weekly Menu</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add daily lunch thali items, breakfast nashta, and dinner specials.
            </p>
          </div>
          <Link to="/mess/menu">
            <Button variant="secondary" size="sm" icon={MenuSquare}>
              Manage Menu &rarr;
            </Button>
          </Link>
        </Card>

        <Card hover className="p-5 bg-white/85 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Mess Profile & Timings</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Update monthly tiffin rates, delivery areas, and operating hours.
            </p>
          </div>
          <Link to="/mess/profile">
            <Button variant="secondary" size="sm" icon={UtensilsCrossed}>
              Edit Profile &rarr;
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default MessOwnerOverview;


import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, AlertTriangle, Building2, UtensilsCrossed } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import Tabs from '../../components/Tabs';
import EmptyState from '../../components/EmptyState';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import { formatPrice, formatDate } from '../../utils/formatters';

export const PendingApprovals = () => {
  const [activeTab, setActiveTab] = useState('pgs'); // 'pgs' | 'messes'
  const [pendingPgs, setPendingPgs] = useState([]);
  const [pendingMesses, setPendingMesses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reject Modal state
  const [rejectingItem, setRejectingItem] = useState(null); // { type: 'PG' | 'MESS', item }
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Details Modal
  const [viewingItem, setViewingItem] = useState(null);

  const { success, error: toastError } = useToast();

  const loadPending = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPending();
      setPendingPgs(data.pgs || []);
      setPendingMesses(data.messes || []);
    } catch (err) {
      console.error('Failed to load pending approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (type, id, title) => {
    try {
      setActionLoading(true);
      if (type === 'PG') {
        await adminApi.approvePg(id);
        setPendingPgs((prev) => prev.filter((p) => p.id !== id));
        success(`PG listing "${title}" approved and verified successfully!`);
      } else {
        await adminApi.approveMess(id);
        setPendingMesses((prev) => prev.filter((m) => m.id !== id));
        success(`Mess profile "${title}" approved and verified successfully!`);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toastError('Rejection reason is required.');
      return;
    }

    try {
      setActionLoading(true);
      const { type, item } = rejectingItem;
      if (type === 'PG') {
        await adminApi.rejectPg(item.id, rejectReason.trim());
        setPendingPgs((prev) => prev.filter((p) => p.id !== item.id));
        success(`PG "${item.title}" rejected with reason recorded.`);
      } else {
        await adminApi.rejectMess(item.id, rejectReason.trim());
        setPendingMesses((prev) => prev.filter((m) => m.id !== item.id));
        success(`Mess "${item.name}" rejected with reason recorded.`);
      }
      setRejectingItem(null);
      setRejectReason('');
    } catch (err) {
      toastError(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const tabs = [
    { id: 'pgs', label: 'Pending PGs & Hostels', count: pendingPgs.length, icon: Building2 },
    { id: 'messes', label: 'Pending Mess Services', count: pendingMesses.length, icon: UtensilsCrossed },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Pending Approvals</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review newly submitted accommodations and dining centers before they appear publicly to students
        </p>
      </div>

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        roleAccent="admin"
      />

      {loading ? (
        <div className="space-y-3">
          <div className="h-28 bg-white/70 animate-pulse rounded-2xl" />
          <div className="h-28 bg-white/70 animate-pulse rounded-2xl" />
        </div>
      ) : activeTab === 'pgs' ? (
        pendingPgs.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="All PGs Reviewed"
            description="There are currently zero pending PG accommodation listings awaiting admin review."
          />
        ) : (
          <div className="space-y-4">
            {pendingPgs.map((pg) => (
              <Card key={pg.id} className="p-5 bg-white/85 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-purple-100 text-purple-800">
                        {pg.type} &bull; {pg.gender}
                      </span>
                      <Badge variant="pending" size="xs">Pending Approval</Badge>
                      <span className="text-[10px] text-slate-400">
                        Submitted on {formatDate(pg.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{pg.title}</h3>
                    <p className="text-xs text-slate-500">{pg.address}</p>
                    <p className="text-xs text-slate-600">
                      Owner: <strong>{pg.ownerName}</strong> ({pg.ownerPhone}) &bull; Business: {pg.ownerBusinessName || 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="xs"
                      icon={Eye}
                      onClick={() => setViewingItem({ type: 'PG', data: pg })}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="primary"
                      size="xs"
                      icon={CheckCircle}
                      disabled={actionLoading}
                      onClick={() => handleApprove('PG', pg.id, pg.title)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Approve & Verify
                    </Button>
                    <Button
                      variant="danger"
                      size="xs"
                      icon={XCircle}
                      disabled={actionLoading}
                      onClick={() => {
                        setRejectingItem({ type: 'PG', item: pg });
                        setRejectReason('');
                      }}
                    >
                      Reject with Reason
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Rent</span>
                    <strong className="text-slate-900 font-bold">{formatPrice(pg.rent)}/mo</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Deposit</span>
                    <strong className="text-slate-900 font-bold">{formatPrice(pg.deposit)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Sharing</span>
                    <strong className="text-slate-900 font-bold">{pg.sharing}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Available Beds</span>
                    <strong className="text-purple-700 font-bold">{pg.availableBeds} beds</strong>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : pendingMesses.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="All Messes Reviewed"
          description="There are currently zero pending mess profiles awaiting admin review."
        />
      ) : (
        <div className="space-y-4">
          {pendingMesses.map((mess) => (
            <Card key={mess.id} className="p-5 bg-white/85 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-orange-100 text-orange-800">
                      {mess.foodType}
                    </span>
                    <Badge variant="pending" size="xs">Pending Approval</Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{mess.name}</h3>
                  <p className="text-xs text-slate-500">{mess.address}</p>
                  <p className="text-xs text-slate-600">
                    Owner: <strong>{mess.ownerName}</strong> ({mess.ownerPhone})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    icon={Eye}
                    onClick={() => setViewingItem({ type: 'MESS', data: mess })}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="primary"
                    size="xs"
                    icon={CheckCircle}
                    disabled={actionLoading}
                    onClick={() => handleApprove('MESS', mess.id, mess.name)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Approve & Verify
                  </Button>
                  <Button
                    variant="danger"
                    size="xs"
                    icon={XCircle}
                    disabled={actionLoading}
                    onClick={() => {
                      setRejectingItem({ type: 'MESS', item: mess });
                      setRejectReason('');
                    }}
                  >
                    Reject with Reason
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Per Meal</span>
                  <strong className="text-slate-900 font-bold">{formatPrice(mess.pricePerMeal)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Monthly</span>
                  <strong className="text-slate-900 font-bold">{formatPrice(mess.monthlyPrice)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Timings</span>
                  <strong className="text-slate-900 font-bold">{mess.openTime} - {mess.closeTime}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Delivery</span>
                  <strong className="text-slate-900 font-bold">{mess.deliveryArea || 'None'}</strong>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Modal with REQUIRED reason */}
      {rejectingItem && (
        <Modal
          isOpen={true}
          onClose={() => setRejectingItem(null)}
          title={`Reject ${rejectingItem.type === 'PG' ? rejectingItem.item.title : rejectingItem.item.name}`}
        >
          <form onSubmit={handleConfirmReject} className="space-y-4">
            <p className="text-xs text-slate-600">
              Please state the specific reason for rejecting this listing. The owner will be notified to correct and re-submit.
            </p>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Required Rejection Reason *
              </label>
              <textarea
                rows={4}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Incomplete address, photos do not match location, invalid contact number..."
                className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setRejectingItem(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" type="submit" loading={actionLoading}>
                Confirm Rejection
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Details View Modal */}
      {viewingItem && (
        <Modal
          isOpen={true}
          onClose={() => setViewingItem(null)}
          title={`Details: ${viewingItem.data.title || viewingItem.data.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div>
              <span className="font-bold text-slate-700 block">Description:</span>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-xl mt-1">
                {viewingItem.data.description || 'No description provided.'}
              </p>
            </div>
            <div>
              <span className="font-bold text-slate-700 block">Coordinates & Address:</span>
              <p className="text-slate-600 mt-0.5">
                {viewingItem.data.address} (Lat: {viewingItem.data.lat}, Lng: {viewingItem.data.lng})
              </p>
            </div>
            {viewingItem.data.rules && (
              <div>
                <span className="font-bold text-slate-700 block">Rules:</span>
                <p className="text-slate-600 mt-0.5">{viewingItem.data.rules}</p>
              </div>
            )}
            <div className="flex justify-end pt-3">
              <Button variant="secondary" size="sm" onClick={() => setViewingItem(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PendingApprovals;


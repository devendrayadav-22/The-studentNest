import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Bed
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import ConfirmDialog from '../../components/ConfirmDialog';
import Modal from '../../components/Modal';
import { ownerApi } from '../../api/ownerApi';
import { useToast } from '../../context/ToastContext';
import { formatPrice, formatRelativeDays, formatDate } from '../../utils/formatters';

export const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error: toastError } = useToast();

  // Delete State
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Quick Bed Update State
  const [bedModalListing, setBedModalListing] = useState(null);
  const [newBeds, setNewBeds] = useState(1);
  const [updatingBeds, setUpdatingBeds] = useState(false);

  // Confirming availability
  const [refreshingId, setRefreshingId] = useState(null);

  const loadListings = async () => {
    try {
      setLoading(true);
      const data = await ownerApi.getMyListings();
      setListings(data || []);
    } catch (err) {
      console.error('Failed to load owner listings:', err);
      toastError('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleConfirmAvailability = async (id, title) => {
    try {
      setRefreshingId(id);
      const updated = await ownerApi.confirmAvailability(id);
      setListings((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      success(`Availability confirmed for "${title}"! Listing timestamp refreshed.`);
    } catch (err) {
      toastError('Failed to refresh availability');
    } finally {
      setRefreshingId(null);
    }
  };

  const handleSaveBeds = async (e) => {
    e.preventDefault();
    if (!bedModalListing) return;

    try {
      setUpdatingBeds(true);
      const updated = await ownerApi.updateBeds(bedModalListing.id, Number(newBeds));
      setListings((prev) =>
        prev.map((item) => (item.id === bedModalListing.id ? updated : item))
      );
      success('Bed count updated.');
      setBedModalListing(null);
    } catch (err) {
      toastError('Failed to update bed count');
    } finally {
      setUpdatingBeds(false);
    }
  };

  const handleDeleteListing = async () => {
    if (!deletingId) return;

    try {
      setDeleteLoading(true);
      await ownerApi.deleteListing(deletingId);
      setListings((prev) => prev.filter((item) => item.id !== deletingId));
      success('Listing deleted.');
      setDeletingId(null);
    } catch (err) {
      toastError('Failed to delete listing');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Check if any listing is stale (>30 days since update)
  const staleListings = listings.filter((l) => l.stale);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My PG / Hostel Listings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your accommodations, verify availability and check approval status
          </p>
        </div>

        <Link to="/owner/listings/new">
          <Button variant="primary" size="sm" icon={PlusCircle} className="bg-blue-600 hover:bg-blue-700">
            Add New Accommodation
          </Button>
        </Link>
      </div>

      {/* Stale Listing Banner */}
      {staleListings.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-900">
              {staleListings.length} of your listings need availability confirmation
            </h4>
            <p className="text-xs text-amber-800">
              Accommodations not updated for over 30 days are marked with an amber "Not recently updated" tag for students. Click "Confirm Availability" to keep them highlighted and fresh.
            </p>
          </div>
        </div>
      )}

      {/* Listings Table / Cards */}
      {loading ? (
        <div className="space-y-3">
          <div className="h-32 bg-white/70 animate-pulse rounded-2xl" />
          <div className="h-32 bg-white/70 animate-pulse rounded-2xl" />
        </div>
      ) : listings.length === 0 ? (
        <Card className="p-12 text-center bg-white/80 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">No Listings Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              You haven't added any PG or hostel accommodations. Add your first property to start receiving student inquiries.
            </p>
          </div>
          <Link to="/owner/listings/new">
            <Button variant="primary" size="sm" icon={PlusCircle} className="bg-blue-600 hover:bg-blue-700">
              Create Listing Now
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((item) => (
            <Card key={item.id} className="p-5 bg-white/85 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-700">
                      {item.type} &bull; {item.gender}
                    </span>

                    {/* Status Badge */}
                    {item.status === 'APPROVED' && <Badge variant="verified" size="xs">Approved</Badge>}
                    {item.status === 'PENDING' && <Badge variant="pending" size="xs">Pending Approval</Badge>}
                    {item.status === 'REJECTED' && <Badge variant="rejected" size="xs">Rejected</Badge>}

                    {item.stale && <Badge variant="stale" size="xs" />}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-500">{item.address}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Confirm Availability Button */}
                  <Button
                    variant="secondary"
                    size="xs"
                    icon={RefreshCw}
                    loading={refreshingId === item.id}
                    onClick={() => handleConfirmAvailability(item.id, item.title)}
                    title="Refresh listing timestamp"
                  >
                    Confirm Availability
                  </Button>

                  {/* Bed update button */}
                  <Button
                    variant="secondary"
                    size="xs"
                    icon={Bed}
                    onClick={() => {
                      setBedModalListing(item);
                      setNewBeds(item.availableBeds || 1);
                    }}
                  >
                    {item.availableBeds} Beds
                  </Button>

                  <Link to={`/owner/listings/${item.id}/edit`}>
                    <Button variant="ghost" size="xs" icon={Edit}>
                      Edit
                    </Button>
                  </Link>

                  <Button
                    variant="danger"
                    size="xs"
                    icon={Trash2}
                    onClick={() => setDeletingId(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {/* Rejection Reason notice if rejected */}
              {item.status === 'REJECTED' && item.rejectionReason && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                  <strong>Admin Rejection Reason:</strong> {item.rejectionReason}
                  <span className="block mt-1 text-slate-600">
                    You can edit the details to fix the issues and submit for re-approval.
                  </span>
                </div>
              )}

              {/* Metrics strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Rent</span>
                  <strong className="text-slate-900 font-bold">{formatPrice(item.rent)}/mo</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Deposit</span>
                  <strong className="text-slate-900 font-bold">{formatPrice(item.deposit)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Distance to Campus</span>
                  <strong className="text-slate-900 font-bold">{item.distanceKm ? `${item.distanceKm.toFixed(2)} km` : 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Last Updated</span>
                  <strong className="text-slate-900 font-bold">{formatRelativeDays(item.lastUpdatedDaysAgo)}</strong>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Bed Count Modal */}
      {bedModalListing && (
        <Modal
          isOpen={true}
          onClose={() => setBedModalListing(null)}
          title={`Update Beds: ${bedModalListing.title}`}
          maxWidth="max-w-sm"
        >
          <form onSubmit={handleSaveBeds} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Currently Available Beds
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={newBeds}
                onChange={(e) => setNewBeds(e.target.value)}
                required
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Setting this accurately ensures students know if your hostel has vacancies.
              </span>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setBedModalListing(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" loading={updatingBeds}>
                Update Beds
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteListing}
        title="Delete PG Listing?"
        message="Are you sure you want to delete this PG accommodation? It will be permanently removed from student search."
        confirmText="Delete Property"
        loading={deleteLoading}
      />
    </div>
  );
};

export default MyListings;


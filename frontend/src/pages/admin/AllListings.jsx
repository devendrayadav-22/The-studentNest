import React, { useState, useEffect } from 'react';
import { Search, Building2, UtensilsCrossed, Trash2, ExternalLink } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Tabs from '../../components/Tabs';
import ConfirmDialog from '../../components/ConfirmDialog';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import { formatPrice, formatDate } from '../../utils/formatters';

export const AllListings = () => {
  const [activeTab, setActiveTab] = useState('pgs');
  const [pgs, setPgs] = useState([]);
  const [messes, setMesses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Delete State
  const [deletingItem, setDeletingItem] = useState(null); // { type: 'PG' | 'MESS', id, title }
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { success, error: toastError } = useToast();

  const loadAllListings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllListings();
      setPgs(data.pgs || []);
      setMesses(data.messes || []);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllListings();
  }, []);

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      setDeleteLoading(true);
      if (deletingItem.type === 'PG') {
        await adminApi.deletePg(deletingItem.id);
        setPgs((prev) => prev.filter((p) => p.id !== deletingItem.id));
        success(`PG listing "${deletingItem.title}" deleted.`);
      } else {
        await adminApi.deleteMess(deletingItem.id);
        setMesses((prev) => prev.filter((m) => m.id !== deletingItem.id));
        success(`Mess profile "${deletingItem.title}" deleted.`);
      }
      setDeletingItem(null);
    } catch (err) {
      toastError('Failed to delete listing');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredPgs = pgs.filter((p) =>
    (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.address || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMesses = messes.filter((m) =>
    (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.address || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'pgs', label: 'All PGs & Hostels', count: pgs.length, icon: Building2 },
    { id: 'messes', label: 'All Mess Profiles', count: messes.length, icon: UtensilsCrossed },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">All Platform Listings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full directory of all accommodations and mess services across all approval statuses
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or address..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-white/90 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        roleAccent="admin"
      />

      {loading ? (
        <div className="h-64 bg-white/70 animate-pulse rounded-2xl" />
      ) : activeTab === 'pgs' ? (
        <Card className="overflow-x-auto p-4 bg-white/85">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Title & Area</th>
                <th className="py-3 px-3">Owner Contact</th>
                <th className="py-3 px-3">Rent</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPgs.map((pg) => (
                <tr key={pg.id} className="hover:bg-purple-50/20">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block">{pg.title}</span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{pg.address}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800 block">{pg.ownerName}</span>
                    <span className="text-[11px] text-slate-500">{pg.ownerPhone}</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {formatPrice(pg.rent)}/mo
                  </td>
                  <td className="py-3 px-3">
                    {pg.status === 'APPROVED' && <Badge variant="verified" size="xs">Approved</Badge>}
                    {pg.status === 'PENDING' && <Badge variant="pending" size="xs">Pending</Badge>}
                    {pg.status === 'REJECTED' && <Badge variant="rejected" size="xs">Rejected</Badge>}
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-xs">
                    {formatDate(pg.createdAt)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Button
                      variant="danger"
                      size="xs"
                      icon={Trash2}
                      onClick={() => setDeletingItem({ type: 'PG', id: pg.id, title: pg.title })}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <Card className="overflow-x-auto p-4 bg-white/85">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Mess Name</th>
                <th className="py-3 px-3">Owner Contact</th>
                <th className="py-3 px-3">Price / Thali</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Delivery Area</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMesses.map((mess) => (
                <tr key={mess.id} className="hover:bg-purple-50/20">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block">{mess.name}</span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{mess.address}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800 block">{mess.ownerName}</span>
                    <span className="text-[11px] text-slate-500">{mess.ownerPhone}</span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {formatPrice(mess.pricePerMeal)}
                  </td>
                  <td className="py-3 px-3">
                    {mess.status === 'APPROVED' && <Badge variant="verified" size="xs">Approved</Badge>}
                    {mess.status === 'PENDING' && <Badge variant="pending" size="xs">Pending</Badge>}
                    {mess.status === 'REJECTED' && <Badge variant="rejected" size="xs">Rejected</Badge>}
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-600">
                    {mess.deliveryArea || 'None'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Button
                      variant="danger"
                      size="xs"
                      icon={Trash2}
                      onClick={() => setDeletingItem({ type: 'MESS', id: mess.id, title: mess.name })}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
        title="Admin Delete Listing?"
        message={`Are you sure you want to permanently delete "${deletingItem?.title}" from the platform? This cannot be undone.`}
        confirmText="Confirm Admin Deletion"
        loading={deleteLoading}
      />
    </div>
  );
};

export default AllListings;


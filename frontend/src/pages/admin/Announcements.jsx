import React, { useState, useEffect } from 'react';
import { Radio, Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import { announcementApi } from '../../api/announcementApi';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { success, error: toastError } = useToast();

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementApi.getAll();
      setAnnouncements(data || []);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ title: '', content: '' });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ title: item.title, content: item.content });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    try {
      setSubmitting(true);
      if (editingItem) {
        const updated = await adminApi.updateAnnouncement(editingItem.id, {
          title: formData.title.trim(),
          content: formData.content.trim()
        });
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === editingItem.id ? updated : a))
        );
        success('Announcement updated.');
      } else {
        const created = await adminApi.createAnnouncement({
          title: formData.title.trim(),
          content: formData.content.trim()
        });
        setAnnouncements((prev) => [created, ...prev]);
        success('New announcement broadcasted to portal home!');
      }
      setModalOpen(false);
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to save announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      setDeleteLoading(true);
      await adminApi.deleteAnnouncement(deletingId);
      setAnnouncements((prev) => prev.filter((a) => a.id !== deletingId));
      success('Announcement removed.');
      setDeletingId(null);
    } catch (err) {
      toastError('Failed to delete announcement');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Campus Announcements & Advisories</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish public bulletins displayed on the portal homepage for all IPS students
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={openAddModal}
          className="bg-purple-700 hover:bg-purple-800"
        >
          Create Announcement
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-28 bg-white/70 animate-pulse rounded-2xl" />
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Radio}
          title="No Active Announcements"
          description="Create a bulletin to notify students about summer PG charges, admission deadlines, or mess timings."
          actionLabel="Create Announcement"
          onAction={openAddModal}
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <Card key={item.id} className="p-5 bg-white/85 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                    <Radio className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">{item.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    {formatDate(item.createdAt)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="xs"
                      icon={Edit2}
                      onClick={() => openEditModal(item)}
                    >
                      Edit
                    </Button>
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
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {item.content}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setModalOpen(false)}
          title={editingItem ? 'Edit Announcement' : 'Broadcast New Announcement'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Announcement Headline *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Advisory on Summer PG Electricity Sub-Meter Charges"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Content / Message Details *
              </label>
              <textarea
                rows={5}
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write the full message details for IPS Academy students..."
                className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                loading={submitting}
                className="bg-purple-700 hover:bg-purple-800"
              >
                {editingItem ? 'Save Updates' : 'Broadcast Announcement'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Announcement?"
        message="Are you sure you want to delete this announcement? It will immediately disappear from the homepage."
        confirmText="Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

export default AdminAnnouncements;


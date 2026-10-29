import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Utensils, Calendar } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import { messOwnerApi } from '../../api/messOwnerApi';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/formatters';
import { DayOfWeek, MealType, FoodType } from '../../constants/enums';

export const MenuManager = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error: toastError } = useToast();

  // Modal form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    foodType: 'VEG',
    dayOfWeek: 'ALL',
    mealType: 'LUNCH',
    price: 80
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const data = await messOwnerApi.getMenuItems();
      setMenuItems(data || []);
    } catch (err) {
      console.error('Failed to load menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      foodType: 'VEG',
      dayOfWeek: 'ALL',
      mealType: 'LUNCH',
      price: 80
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      foodType: item.foodType,
      dayOfWeek: item.dayOfWeek,
      mealType: item.mealType,
      price: item.price || 0
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const payload = {
      name: formData.name.trim(),
      foodType: formData.foodType,
      dayOfWeek: formData.dayOfWeek,
      mealType: formData.mealType,
      price: Number(formData.price || 0)
    };

    try {
      setSubmitting(true);
      if (editingItem) {
        const updated = await messOwnerApi.updateMenuItem(editingItem.id, payload);
        setMenuItems((prev) =>
          prev.map((item) => (item.id === editingItem.id ? updated : item))
        );
        success('Menu item updated.');
      } else {
        const created = await messOwnerApi.addMenuItem(payload);
        setMenuItems((prev) => [...prev, created]);
        success('New menu item added!');
      }
      setModalOpen(false);
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to save menu item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingId) return;

    try {
      setDeleteLoading(true);
      await messOwnerApi.deleteMenuItem(deletingId);
      setMenuItems((prev) => prev.filter((item) => item.id !== deletingId));
      success('Menu item deleted.');
      setDeletingId(null);
    } catch (err) {
      toastError('Failed to delete menu item');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Weekly Menu Manager</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure breakfast, lunch, and dinner meal offerings across the week
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={openAddModal}
          className="bg-orange-600 hover:bg-orange-700"
        >
          Add Menu Item
        </Button>
      </div>

      {loading ? (
        <div className="h-48 bg-white/70 animate-pulse rounded-2xl" />
      ) : menuItems.length === 0 ? (
        <EmptyState
          icon={Utensils}
          title="No Menu Items Configured"
          description="Add items like Poha Jalebi, Dal Tadka, Paneer Butter Masala to showcase your food offerings."
          actionLabel="Add First Item"
          onAction={openAddModal}
        />
      ) : (
        <Card className="overflow-x-auto p-4 bg-white/85">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Item Name</th>
                <th className="py-3 px-3">Food Type</th>
                <th className="py-3 px-3">Meal Slot</th>
                <th className="py-3 px-3">Day of Week</th>
                <th className="py-3 px-3">Thali / Item Price</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {menuItems.map((item) => (
                <tr key={item.id} className="hover:bg-orange-50/20">
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {item.name}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                      item.foodType === 'NONVEG' ? 'text-red-700' : 'text-green-700'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${item.foodType === 'NONVEG' ? 'bg-red-600' : 'bg-green-600'}`} />
                      {item.foodType}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700">
                    {item.mealType}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-md font-mono">
                      {item.dayOfWeek}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {formatPrice(item.price)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setModalOpen(false)}
          title={editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Item Name / Thali Description *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dal Tadka, Paneer Butter Masala, 4 Butter Roti, Rice"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Food Type</label>
                <select
                  value={formData.foodType}
                  onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="VEG">Pure Veg</option>
                  <option value="NONVEG">Non-Veg</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Meal Timing</label>
                <select
                  value={formData.mealType}
                  onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {Object.values(MealType).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Day of Week</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {Object.values(DayOfWeek).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Thali Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full text-sm p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" loading={submitting} className="bg-orange-600 hover:bg-orange-700">
                {editingItem ? 'Update Item' : 'Add Item'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteItem}
        title="Delete Menu Item?"
        message="Are you sure you want to remove this item from your weekly menu schedule?"
        confirmText="Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

export default MenuManager;


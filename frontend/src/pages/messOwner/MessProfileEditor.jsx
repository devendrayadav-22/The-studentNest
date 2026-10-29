import React, { useState, useEffect } from 'react';
import { Save, UtensilsCrossed, Clock, MapPin, Truck } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LocationPicker from '../../components/LocationPicker';
import ImageUploader from '../../components/ImageUploader';
import { messOwnerApi } from '../../api/messOwnerApi';
import { useToast } from '../../context/ToastContext';
import { FoodType } from '../../constants/enums';
import COLLEGE_CONFIG from '../../constants/college';

export const MessProfileEditor = () => {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    foodType: 'VEG',
    openTime: '07:30 AM',
    closeTime: '10:30 PM',
    pricePerMeal: '',
    monthlyPrice: '',
    deliveryCharge: 0,
    deliveryArea: 'Rajendra Nagar, Bhawarkua, IPS Campus Road',
    address: 'Bhawarkua Square, Indore',
    lat: 22.6950,
    lng: 75.8670,
    images: ['/images/Mimage1.jpg'],
    isOpen: true
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setFetching(true);
        const data = await messOwnerApi.getProfile();
        if (data) {
          setFormData({
            name: data.name || '',
            description: data.description || '',
            foodType: data.foodType || 'VEG',
            openTime: data.openTime || '07:30 AM',
            closeTime: data.closeTime || '10:30 PM',
            pricePerMeal: data.pricePerMeal || '',
            monthlyPrice: data.monthlyPrice || '',
            deliveryCharge: data.deliveryCharge ?? 0,
            deliveryArea: data.deliveryArea || '',
            address: data.address || '',
            lat: data.lat || COLLEGE_CONFIG.lat,
            lng: data.lng || COLLEGE_CONFIG.lng,
            images: data.images || ['/images/Mimage1.jpg'],
            isOpen: data.isOpen ?? true
          });
        }
      } catch (err) {
        // If not found yet, default values remain
      } finally {
        setFetching(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLocationChange = (lat, lng) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.pricePerMeal || !formData.address.trim()) {
      toastError('Please provide mess name, price per meal, and address.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      foodType: formData.foodType,
      openTime: formData.openTime.trim(),
      closeTime: formData.closeTime.trim(),
      pricePerMeal: Number(formData.pricePerMeal),
      monthlyPrice: Number(formData.monthlyPrice || 0),
      deliveryCharge: Number(formData.deliveryCharge || 0),
      deliveryArea: formData.deliveryArea.trim(),
      address: formData.address.trim(),
      lat: Number(formData.lat),
      lng: Number(formData.lng),
      images: formData.images.length > 0 ? formData.images : ['/images/Mimage1.jpg'],
      isOpen: formData.isOpen
    };

    try {
      setLoading(true);
      await messOwnerApi.updateProfile(payload);
      success('Mess profile saved successfully!');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to save mess profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <Card className="p-8 text-center text-slate-500">Loading mess profile...</Card>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Mess & Tiffin Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure your service timings, thali pricing, delivery radius, and photos
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Mess Information */}
        <Card className="p-6 bg-white/85 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200">
            1. Service Information
          </h2>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Mess / Tiffin Service Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Maa Annapurna Shuddh Shakahari Mess"
              className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Dietary Food Type *
              </label>
              <select
                name="foodType"
                value={formData.foodType}
                onChange={handleChange}
                className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                {Object.values(FoodType).map((f) => (
                  <option key={f} value={f}>
                    {f === 'VEG' ? 'Pure Veg' : f === 'NONVEG' ? 'Non-Veg' : 'Veg & Non-Veg'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Opening Time
              </label>
              <input
                type="text"
                name="openTime"
                value={formData.openTime}
                onChange={handleChange}
                placeholder="07:30 AM"
                className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Closing Time
              </label>
              <input
                type="text"
                name="closeTime"
                value={formData.closeTime}
                onChange={handleChange}
                placeholder="10:30 PM"
                className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Description & Specialities
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="100% pure ghee rotis, unlimited dal tadka, Sunday special sweets..."
              className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
        </Card>

        {/* Pricing & Delivery */}
        <Card className="p-6 bg-white/85 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200">
            2. Thali Pricing & Delivery Coverage
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Price Per Meal / Thali (₹) *
              </label>
              <input
                type="number"
                name="pricePerMeal"
                required
                min="20"
                value={formData.pricePerMeal}
                onChange={handleChange}
                placeholder="80"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Monthly Tiffin Plan (₹)
              </label>
              <input
                type="number"
                name="monthlyPrice"
                min="0"
                value={formData.monthlyPrice}
                onChange={handleChange}
                placeholder="2400"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Delivery Charge (₹, 0 for free)
              </label>
              <input
                type="number"
                name="deliveryCharge"
                min="0"
                value={formData.deliveryCharge}
                onChange={handleChange}
                placeholder="0"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Delivery Areas / Hostels Covered
            </label>
            <input
              type="text"
              name="deliveryArea"
              value={formData.deliveryArea}
              onChange={handleChange}
              placeholder="e.g. Bhawarkua, Vishnupuri, Rajendra Nagar, IPS Campus Road"
              className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
        </Card>

        {/* Location & Map */}
        <Card className="p-6 bg-white/85 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200">
            3. Physical Location
          </h2>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Mess Address *
            </label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. 12 Bholaram Ustad Marg, Bhawarkua, Indore"
              className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Pin Location on Map
            </label>
            <LocationPicker
              lat={formData.lat}
              lng={formData.lng}
              onChange={handleLocationChange}
              height="300px"
            />
          </div>
        </Card>

        {/* Photos */}
        <Card className="p-6 bg-white/85 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200">
            4. Dining Hall & Thali Photos
          </h2>
          <ImageUploader
            value={formData.images}
            onChange={(imgs) => setFormData((prev) => ({ ...prev, images: imgs }))}
            max={6}
          />
        </Card>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            icon={Save}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Save Mess Profile
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MessProfileEditor;


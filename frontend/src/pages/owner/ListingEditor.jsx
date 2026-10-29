import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Save, Building2, MapPin, Sparkles } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LocationPicker from '../../components/LocationPicker';
import ImageUploader from '../../components/ImageUploader';
import { ownerApi } from '../../api/ownerApi';
import { pgApi } from '../../api/pgApi';
import { useToast } from '../../context/ToastContext';
import { AVAILABLE_FACILITIES } from '../../constants/facilities';
import { PgType, Gender, SharingType } from '../../constants/enums';
import COLLEGE_CONFIG from '../../constants/college';

export const ListingEditor = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'PG',
    rent: '',
    deposit: '',
    gender: 'BOYS',
    sharing: 'DOUBLE',
    facilities: ['WIFI', 'RO_WATER', 'GEYSER'],
    rules: 'Main gate locks at 10:30 PM. No loud noise during study hours.',
    address: 'Rajendra Nagar, Near IPS Academy, Indore',
    lat: 22.6850,
    lng: 75.8450,
    availableBeds: 2,
    images: ['/images/Pimage1.jpg']
  });

  useEffect(() => {
    if (isEditing) {
      const loadExisting = async () => {
        try {
          setFetching(true);
          const data = await pgApi.getById(id);
          setFormData({
            title: data.title || '',
            description: data.description || '',
            type: data.type || 'PG',
            rent: data.rent || '',
            deposit: data.deposit || '',
            gender: data.gender || 'BOYS',
            sharing: data.sharing || 'DOUBLE',
            facilities: data.facilities || [],
            rules: data.rules || '',
            address: data.address || '',
            lat: data.lat || COLLEGE_CONFIG.lat,
            lng: data.lng || COLLEGE_CONFIG.lng,
            availableBeds: data.availableBeds ?? 1,
            images: data.images || []
          });
        } catch (err) {
          toastError('Failed to load listing for editing');
          navigate('/owner/listings');
        } finally {
          setFetching(false);
        }
      };
      loadExisting();
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFacilityToggle = (facId) => {
    setFormData((prev) => {
      const exists = prev.facilities.includes(facId);
      return {
        ...prev,
        facilities: exists
          ? prev.facilities.filter((f) => f !== facId)
          : [...prev.facilities, facId]
      };
    });
  };

  const handleLocationChange = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      lat,
      lng
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.rent || !formData.address.trim()) {
      toastError('Please fill in required fields: title, rent, and address.');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      type: formData.type,
      rent: Number(formData.rent),
      deposit: Number(formData.deposit || 0),
      gender: formData.gender,
      sharing: formData.sharing,
      facilities: formData.facilities,
      rules: formData.rules.trim(),
      address: formData.address.trim(),
      lat: Number(formData.lat),
      lng: Number(formData.lng),
      availableBeds: Number(formData.availableBeds || 1),
      images: formData.images.length > 0 ? formData.images : ['/images/Pimage1.jpg']
    };

    try {
      setLoading(true);
      if (isEditing) {
        await ownerApi.updateListing(id, payload);
        success('Listing updated successfully!');
      } else {
        await ownerApi.createListing(payload);
        success('Listing submitted for admin approval! It will appear publicly once verified.');
      }
      navigate('/owner/listings');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to save listing');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <Card className="p-8 text-center text-slate-500">Loading accommodation details...</Card>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/owner/listings" className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {isEditing ? 'Edit Accommodation' : 'Add New Accommodation'}
            </h1>
            <p className="text-xs text-slate-500">
              {isEditing ? 'Update pricing, room rules, and details' : 'List your PG, hostel or flat for IPS Academy students'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <Card className="p-6 bg-white/85 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200">
            1. Basic Accommodation Details
          </h2>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Listing Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Shree Krishna Boys PG - Near Bhawarkua Square"
              className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Accommodation Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {Object.values(PgType).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Gender Restriction *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {Object.values(Gender).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Room Sharing Type *
              </label>
              <select
                name="sharing"
                value={formData.sharing}
                onChange={handleChange}
                className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {Object.values(SharingType).map((s) => (
                  <option key={s} value={s}>{s} Sharing</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Description & Highlights
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe student amenities, proximity to college, quiet study environment, cleanliness..."
              className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </Card>

        {/* Section 2: Pricing & Capacity */}
        <Card className="p-6 bg-white/85 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200">
            2. Rent, Deposit & Available Beds
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Monthly Rent (₹) *
              </label>
              <input
                type="number"
                name="rent"
                min="500"
                required
                value={formData.rent}
                onChange={handleChange}
                placeholder="e.g. 5500"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Security Deposit (₹)
              </label>
              <input
                type="number"
                name="deposit"
                min="0"
                value={formData.deposit}
                onChange={handleChange}
                placeholder="e.g. 5000"
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Currently Available Beds *
              </label>
              <input
                type="number"
                name="availableBeds"
                min="0"
                required
                value={formData.availableBeds}
                onChange={handleChange}
                className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Section 3: Facilities Chips */}
        <Card className="p-6 bg-white/85 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200">
            3. Amenities & Facilities (Select all that apply)
          </h2>

          <div className="flex flex-wrap gap-2">
            {AVAILABLE_FACILITIES.map((fac) => {
              const isSelected = formData.facilities.includes(fac.id);
              return (
                <button
                  key={fac.id}
                  type="button"
                  onClick={() => handleFacilityToggle(fac.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {fac.label}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Section 4: House Rules */}
        <Card className="p-6 bg-white/85 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200">
            4. Hostel Rules & Timings
          </h2>
          <div>
            <textarea
              name="rules"
              rows={2}
              value={formData.rules}
              onChange={handleChange}
              placeholder="e.g. Gate locking time, guest rules, smoking/drinking restrictions..."
              className="w-full text-xs sm:text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </Card>

        {/* Section 5: Location & Map Picker */}
        <Card className="p-6 bg-white/85 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200">
            5. Exact Physical Location & Distance
          </h2>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Full Street Address *
            </label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Plot 42, Professor Colony, Near Bhawarkua Tower, Indore"
              className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Pin Exact Location on Map (Drag marker to your PG location)
            </label>
            <LocationPicker
              lat={formData.lat}
              lng={formData.lng}
              onChange={handleLocationChange}
              height="340px"
            />
          </div>
        </Card>

        {/* Section 6: Image Uploader */}
        <Card className="p-6 bg-white/85 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200">
            6. Property Photos
          </h2>
          <ImageUploader
            value={formData.images}
            onChange={(imgs) => setFormData((prev) => ({ ...prev, images: imgs }))}
            max={6}
          />
        </Card>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link to="/owner/listings">
            <Button variant="secondary" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            icon={Save}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isEditing ? 'Save Changes' : 'Submit Property for Verification'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ListingEditor;


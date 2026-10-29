import React from 'react';
import { X, RotateCcw, Filter } from 'lucide-react';
import Button from './Button';
import { AVAILABLE_FACILITIES } from '../constants/facilities';
import { PgType, Gender, SharingType } from '../constants/enums';

export const FilterSidebar = ({
  filters,
  onChange,
  onReset,
  isOpen = false, // for mobile sheet
  onClose,
  className = ''
}) => {
  const handleRangeChange = (e) => {
    onChange('maxRent', e.target.value ? Number(e.target.value) : '');
  };

  const handleFacilityToggle = (facilityId) => {
    const current = filters.facilities ? filters.facilities.split(',').filter(Boolean) : [];
    let updated;
    if (current.includes(facilityId)) {
      updated = current.filter((id) => id !== facilityId);
    } else {
      updated = [...current, facilityId];
    }
    onChange('facilities', updated.length > 0 ? updated.join(',') : '');
  };

  const currentFacilities = filters.facilities ? filters.facilities.split(',') : [];

  const filterContent = (
    <div className="space-y-6">
      {/* Header for mobile or desktop */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-teal-700" />
          <h3 className="font-bold text-slate-900 text-base">Filters</h3>
        </div>
        <Button variant="ghost" size="xs" icon={RotateCcw} onClick={onReset}>
          Reset
        </Button>
      </div>

      {/* Max Distance from IPS Academy */}
      <div>
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
          Distance from IPS
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: 'Any', value: '' },
            { label: '1 km', value: '1' },
            { label: '2 km', value: '2' },
            { label: '5 km', value: '5' }
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange('maxDistanceKm', item.value)}
              className={`py-1.5 px-2 text-xs font-semibold rounded-xl border transition-all ${
                filters.maxDistanceKm === item.value
                  ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                  : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Budget Range */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Max Rent
          </label>
          <span className="text-sm font-extrabold text-teal-700">
            {filters.maxRent ? `₹${Number(filters.maxRent).toLocaleString('en-IN')}` : 'Up to ₹20,000+'}
          </span>
        </div>
        <input
          type="range"
          min="2000"
          max="20000"
          step="500"
          value={filters.maxRent || 20000}
          onChange={handleRangeChange}
          className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
        />
        <div className="flex justify-between text-[11px] text-slate-500 mt-1">
          <span>₹2,000</span>
          <span>₹20,000+</span>
        </div>
      </div>

      {/* Accommodation Type */}
      <div>
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
          Accommodation Type
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => onChange('type', '')}
            className={`py-1.5 px-2 text-xs font-semibold rounded-xl border transition-all ${
              !filters.type ? 'bg-teal-700 text-white border-teal-700' : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          {Object.values(PgType).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange('type', filters.type === t ? '' : t)}
              className={`py-1.5 px-2 text-xs font-semibold rounded-xl border transition-all ${
                filters.type === t ? 'bg-teal-700 text-white border-teal-700' : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div>
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
          Gender
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => onChange('gender', '')}
            className={`py-1.5 px-2 text-xs font-semibold rounded-xl border transition-all ${
              !filters.gender ? 'bg-teal-700 text-white border-teal-700' : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Any
          </button>
          {Object.values(Gender).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onChange('gender', filters.gender === g ? '' : g)}
              className={`py-1.5 px-2 text-xs font-semibold rounded-xl border transition-all ${
                filters.gender === g ? 'bg-teal-700 text-white border-teal-700' : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {g === 'BOYS' ? 'Boys' : g === 'GIRLS' ? 'Girls' : 'Co-ed'}
            </button>
          ))}
        </div>
      </div>

      {/* Sharing Type */}
      <div>
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
          Room Sharing
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => onChange('sharing', '')}
            className={`py-1.5 px-2 text-xs font-semibold rounded-xl border transition-all ${
              !filters.sharing ? 'bg-teal-700 text-white border-teal-700' : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          {Object.values(SharingType).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange('sharing', filters.sharing === s ? '' : s)}
              className={`py-1.5 px-2 text-xs font-semibold rounded-xl border transition-all ${
                filters.sharing === s ? 'bg-teal-700 text-white border-teal-700' : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {s === 'SINGLE' ? '1 Bed' : s === 'DOUBLE' ? '2 Beds' : '3 Beds'}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Checkboxes */}
      <div>
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
          Must-Have Facilities
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {AVAILABLE_FACILITIES.map((facility) => {
            const isChecked = currentFacilities.includes(facility.id);
            return (
              <label
                key={facility.id}
                className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none hover:text-slate-900"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleFacilityToggle(facility.id)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                />
                <span>{facility.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Verified Only Filter */}
      <div className="pt-2 border-t border-slate-200">
        <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.verifiedOnly === true || filters.verifiedOnly === 'true'}
            onChange={(e) => onChange('verifiedOnly', e.target.checked ? 'true' : '')}
            className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
          />
          <span>Show Verified Listings Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block w-72 shrink-0 p-5 bg-white/75 backdrop-blur-md border border-slate-300/70 rounded-2xl shadow-sm self-start sticky top-24 ${className}`}>
        {filterContent}
      </aside>

      {/* Mobile Bottom Sheet / Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end"
          onClick={onClose}
        >
          <div
            className="bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-slate-900 text-lg">Filters</h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {filterContent}

            <div className="pt-6 mt-6 border-t border-slate-200 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={onReset}>
                Reset
              </Button>
              <Button variant="primary" className="flex-1" onClick={onClose}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterSidebar;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ShieldCheck, Home, Utensils, Sparkles, Navigation } from 'lucide-react';
import Button from './Button';
import COLLEGE_CONFIG from '../constants/college';

export const HeroSection = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState('');
  const [gender, setGender] = useState('');
  const [maxRent, setMaxRent] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchType) params.append('type', searchType);
    if (gender) params.append('gender', gender);
    if (maxRent) params.append('maxRent', maxRent);
    navigate(`/pgs?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-14 lg:py-16">
      {/* Background ambient decorative blurs */}
      <div className="absolute top-0 -left-10 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text Block */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-teal-200/80 shadow-xs text-teal-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Now live near IPS Academy, Indore</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Find Your Stay, Food & Comfort -{' '}
              <span className="text-teal-700 underline decoration-amber-400 decoration-wavy decoration-2">
                All in one Place
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              PG, Mess aur Map, ek jagah. Abhi IPS Academy, Indore ke liye live.
            </p>

            {/* Quick Search Bar Card */}
            <form
              onSubmit={handleSearch}
              className="bg-white/85 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-300/70 shadow-lg space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Type */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                    Looking For
                  </label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">All (PG / Hostel / Flat)</option>
                    <option value="PG">PG</option>
                    <option value="HOSTEL">Hostel</option>
                    <option value="FLAT">Flat</option>
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Any Gender</option>
                    <option value="BOYS">Boys Only</option>
                    <option value="GIRLS">Girls Only</option>
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                    Max Rent / Mo
                  </label>
                  <select
                    value={maxRent}
                    onChange={(e) => setMaxRent(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Any Budget</option>
                    <option value="5000">Up to ₹5,000</option>
                    <option value="7000">Up to ₹7,000</option>
                    <option value="10000">Up to ₹10,000</option>
                    <option value="15000">Up to ₹15,000</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>Calculated from {COLLEGE_CONFIG.name}</span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={Search}
                  className="w-full sm:w-auto"
                >
                  Search Accommodations
                </Button>
              </div>
            </form>

            {/* Trust points */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Physical Verification
              </span>
              <span className="flex items-center gap-1">
                <Navigation className="w-4 h-4 text-teal-600" />
                Walking Distance Accuracy
              </span>
              <span className="flex items-center gap-1">
                <Utensils className="w-4 h-4 text-amber-600" />
                Live Mess Menus
              </span>
            </div>
          </div>

          {/* Right Container Reserved for 3D Scene / Animated Gradient Fallback */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-square max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-300/80 bg-gradient-to-br from-teal-800 via-slate-900 to-indigo-950 p-6 flex flex-col justify-between text-white group">
              {/* Animated decorative glowing orbs */}
              <div className="absolute top-4 right-4 w-40 h-40 bg-teal-400/25 rounded-full blur-2xl animate-pulse" />
              <div className="absolute bottom-6 left-6 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl animate-pulse delay-1000" />

              {/* Top tag */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-teal-200 border border-white/10">
                  Campus 3D Viewport
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  22.69° N, 75.87° E
                </span>
              </div>

              {/* Center graphic preview */}
              <div className="relative z-10 text-center my-auto space-y-4">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-tr from-teal-500 to-teal-300/80 p-0.5 shadow-lg shadow-teal-500/30 flex items-center justify-center transform group-hover:rotate-6 group-hover:scale-105 transition-transform duration-500">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center text-center p-2">
                    <Home className="w-8 h-8 text-teal-400 mb-1" />
                    <span className="text-[10px] font-bold text-slate-200">IPS Zone</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">Interactive Indore Map</h3>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto mt-1">
                    Explore Rajendra Nagar, Bhawarkua, Vishnu Puri & AB Road hostels with distance metrics.
                  </p>
                </div>
              </div>

              {/* Bottom live stats pill */}
              <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex items-center justify-around text-center">
                <div>
                  <span className="block text-base font-extrabold text-teal-300">500m</span>
                  <span className="text-[10px] text-slate-300">Nearest PG</span>
                </div>
                <div className="w-px h-6 bg-white/20" />
                <div>
                  <span className="block text-base font-extrabold text-amber-300">₹80</span>
                  <span className="text-[10px] text-slate-300">Min Thali</span>
                </div>
                <div className="w-px h-6 bg-white/20" />
                <div>
                  <span className="block text-base font-extrabold text-white">0%</span>
                  <span className="text-[10px] text-slate-300">Brokerage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;


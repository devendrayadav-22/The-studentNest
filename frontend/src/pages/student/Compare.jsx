import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Check, X, Plus, Trash2, ArrowRight } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ImageWithFallback from '../../components/ImageWithFallback';
import StarRating from '../../components/StarRating';
import { pgApi } from '../../api/pgApi';
import { formatPrice, formatDistance } from '../../utils/formatters';
import { AVAILABLE_FACILITIES } from '../../constants/facilities';

export const Compare = () => {
  const [allPgs, setAllPgs] = useState([]);
  const [selectedPgIds, setSelectedPgIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const res = await pgApi.getAll({ size: 50 });
        const list = res.content || [];
        setAllPgs(list);
        // Pre-select first two if available
        if (list.length >= 2) {
          setSelectedPgIds([list[0].id, list[1].id]);
        } else if (list.length === 1) {
          setSelectedPgIds([list[0].id]);
        }
      } catch (err) {
        console.error('Failed to load listings for comparison:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleSelectChange = (slotIndex, pgId) => {
    const updated = [...selectedPgIds];
    if (!pgId) {
      updated.splice(slotIndex, 1);
    } else {
      updated[slotIndex] = Number(pgId);
    }
    setSelectedPgIds(updated);
  };

  const addSlot = () => {
    if (selectedPgIds.length < 3) {
      const remaining = allPgs.find((p) => !selectedPgIds.includes(p.id));
      if (remaining) {
        setSelectedPgIds([...selectedPgIds, remaining.id]);
      }
    }
  };

  const removeSlot = (slotIndex) => {
    setSelectedPgIds(selectedPgIds.filter((_, idx) => idx !== slotIndex));
  };

  const selectedPgs = selectedPgIds
    .map((id) => allPgs.find((p) => p.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Compare Accommodations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare rent, facilities, distance and beds side-by-side (up to 3 PGs)
          </p>
        </div>

        {selectedPgIds.length < 3 && allPgs.length > selectedPgIds.length && (
          <Button variant="secondary" size="sm" icon={Plus} onClick={addSlot}>
            Add Another PG to Compare
          </Button>
        )}
      </div>

      {loading ? (
        <Card className="p-8 text-center text-slate-500">Loading listings for comparison...</Card>
      ) : selectedPgs.length === 0 ? (
        <Card className="p-8 text-center text-slate-500">
          No accommodations available to compare. Please explore the directory first.
        </Card>
      ) : (
        <Card className="overflow-x-auto p-4 sm:p-6 bg-white/90">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 px-3 w-40 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  Property
                </th>
                {selectedPgs.map((pg, slotIdx) => (
                  <th key={pg.id} className="py-3 px-4 min-w-[200px] align-top">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <select
                          value={pg.id}
                          onChange={(e) => handleSelectChange(slotIdx, e.target.value)}
                          className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg p-1.5 text-slate-900 max-w-[170px] truncate"
                        >
                          {allPgs.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title}
                            </option>
                          ))}
                        </select>

                        {selectedPgs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSlot(slotIdx)}
                            className="p-1 text-slate-400 hover:text-red-500"
                            title="Remove from comparison"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="aspect-video rounded-xl overflow-hidden bg-slate-100">
                        <ImageWithFallback
                          src={pg.images?.[0]}
                          alt={pg.title}
                          className="w-full h-full object-cover"
                          fallbackType="pg"
                        />
                      </div>

                      <Link to={`/pgs/${pg.id}`} className="font-bold text-slate-900 hover:text-teal-700 block line-clamp-1">
                        {pg.title}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-3 font-semibold text-slate-600 bg-slate-50/50">Monthly Rent</td>
                {selectedPgs.map((pg) => (
                  <td key={pg.id} className="py-3 px-4 font-extrabold text-teal-800 text-base">
                    {formatPrice(pg.rent)}/mo
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-3 font-semibold text-slate-600 bg-slate-50/50">Security Deposit</td>
                {selectedPgs.map((pg) => (
                  <td key={pg.id} className="py-3 px-4 text-slate-800">
                    {formatPrice(pg.deposit)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-3 font-semibold text-slate-600 bg-slate-50/50">Distance to IPS</td>
                {selectedPgs.map((pg) => (
                  <td key={pg.id} className="py-3 px-4 font-semibold text-slate-900">
                    {formatDistance(pg.distanceKm)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-3 font-semibold text-slate-600 bg-slate-50/50">Type & Gender</td>
                {selectedPgs.map((pg) => (
                  <td key={pg.id} className="py-3 px-4 text-slate-800 font-medium">
                    {pg.type} &bull; {pg.gender}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-3 font-semibold text-slate-600 bg-slate-50/50">Sharing Type</td>
                {selectedPgs.map((pg) => (
                  <td key={pg.id} className="py-3 px-4 text-slate-800 font-medium">
                    {pg.sharing} Sharing
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-3 font-semibold text-slate-600 bg-slate-50/50">Available Beds</td>
                {selectedPgs.map((pg) => (
                  <td key={pg.id} className="py-3 px-4 text-teal-700 font-bold">
                    {pg.availableBeds} beds
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-3 font-semibold text-slate-600 bg-slate-50/50">Rating</td>
                {selectedPgs.map((pg) => (
                  <td key={pg.id} className="py-3 px-4">
                    <StarRating rating={pg.averageRating} count={pg.reviewCount} showNumber size="xs" />
                  </td>
                ))}
              </tr>

              {/* Compare key facilities */}
              {AVAILABLE_FACILITIES.map((facility) => (
                <tr key={facility.id}>
                  <td className="py-2.5 px-3 font-medium text-slate-600 bg-slate-50/50">
                    {facility.label}
                  </td>
                  {selectedPgs.map((pg) => {
                    const has = pg.facilities?.includes(facility.id);
                    return (
                      <td key={pg.id} className="py-2.5 px-4">
                        {has ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                            <Check className="w-4 h-4 text-emerald-600" /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 text-xs">
                            <X className="w-3.5 h-3.5" /> No
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              <tr>
                <td className="py-4 px-3 bg-slate-50/50">Action</td>
                {selectedPgs.map((pg) => (
                  <td key={pg.id} className="py-4 px-4">
                    <Link to={`/pgs/${pg.id}`}>
                      <Button variant="primary" size="xs" icon={ArrowRight}>
                        View Details
                      </Button>
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default Compare;


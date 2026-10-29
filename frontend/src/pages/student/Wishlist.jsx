import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ExternalLink, MapPin } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import ImageWithFallback from '../../components/ImageWithFallback';
import { wishlistApi } from '../../api/wishlistApi';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/formatters';

export const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error: toastError } = useToast();

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const data = await wishlistApi.getWishlist();
      setItems(data || []);
    } catch (err) {
      toastError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (id, title) => {
    try {
      await wishlistApi.removeFromWishlist(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      success(`Removed "${title || 'item'}" from your wishlist.`);
    } catch (err) {
      toastError('Failed to remove item');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">My Saved Wishlist</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Shortlisted accommodations and dining services for quick comparison
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-40 bg-white/70 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Browse verified PGs and click the heart icon on any listing to save it here."
          actionLabel="Browse PGs"
          onAction={() => (window.location.href = '/pgs')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => {
            const linkPath = item.targetType === 'MESS' ? `/messes/${item.targetId}` : `/pgs/${item.targetId}`;

            return (
              <Card key={item.id} className="p-4 bg-white/85 flex gap-4 overflow-hidden group">
                <div className="w-28 h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <ImageWithFallback
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    fallbackType={item.targetType === 'MESS' ? 'mess' : 'pg'}
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
                      {item.targetType}
                    </span>
                    <Link to={linkPath}>
                      <h3 className="font-bold text-slate-900 text-sm hover:text-teal-700 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{item.address}</span>
                    </p>
                    <span className="text-sm font-black text-slate-900 block mt-1">
                      {formatPrice(item.price)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <Link
                      to={linkPath}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id, item.title)}
                      className="text-xs text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 flex items-center gap-1"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;


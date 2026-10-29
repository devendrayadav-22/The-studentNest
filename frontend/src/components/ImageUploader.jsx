import React, { useRef } from 'react';
import { UploadCloud, X, Plus } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

export const ImageUploader = ({
  value = [],
  onChange,
  max = 6,
  className = ''
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = max - value.length;
    const filesToAdd = files.slice(0, remainingSlots);

    // Convert local files to local object URLs for immediate preview
    const newUrls = filesToAdd.map((file) => URL.createObjectURL(file));
    onChange([...value, ...newUrls]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (indexToRemove) => {
    const updated = value.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {value.map((url, idx) => (
          <div
            key={idx}
            className="group relative aspect-video sm:aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs"
          >
            <ImageWithFallback
              src={url}
              alt={`Upload preview ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-1 right-1 p-1 rounded-full bg-red-600/90 text-white hover:bg-red-700 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-sm"
              title="Remove image"
              aria-label={`Remove image ${idx + 1}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
              {idx === 0 ? 'Cover' : `#${idx + 1}`}
            </span>
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video sm:aspect-square flex flex-col items-center justify-center border-2 border-dashed border-teal-600/40 hover:border-teal-600 rounded-xl bg-teal-50/40 hover:bg-teal-50/80 transition-colors cursor-pointer text-teal-800 p-2"
          >
            <Plus className="w-5 h-5 mb-1 text-teal-600" />
            <span className="text-xs font-medium">Add Photo</span>
            <span className="text-[10px] text-slate-500">{value.length}/{max}</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <p className="text-[11px] text-slate-500">
        Upload up to {max} photos (JPG, PNG). The first image will be used as the cover photo.
      </p>
    </div>
  );
};

export default ImageUploader;


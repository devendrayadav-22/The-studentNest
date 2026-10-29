import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import COLLEGE_CONFIG from '../constants/college';
import { formatPrice, formatDistance } from '../utils/formatters';

// Clean SVG markers to avoid broken Leaflet default asset issues in Vite
const createSvgIcon = (bgColor, label = '') => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${bgColor};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 11px;
          font-weight: bold;
        ">${label}</div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

const collegeIcon = createSvgIcon('#8B5CF6', 'IPS');
const pgIcon = createSvgIcon('#0D9488', 'PG');
const messIcon = createSvgIcon('#F97316', '🍽');

// Helper to fit bounds if listings are provided
const AutoBounds = ({ listings, center }) => {
  const map = useMap();

  useEffect(() => {
    if (listings && listings.length > 0) {
      const validPoints = listings
        .filter((item) => item.lat && item.lng)
        .map((item) => [item.lat, item.lng]);

      validPoints.push([COLLEGE_CONFIG.lat, COLLEGE_CONFIG.lng]);

      if (validPoints.length > 1) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      } else {
        map.setView(center, 14);
      }
    } else {
      map.setView(center, 14);
    }
  }, [listings, center, map]);

  return null;
};

export const MapView = ({
  listings = [],
  singleTarget = null,
  height = '400px',
  className = '',
  targetType = 'PG'
}) => {
  const center = singleTarget
    ? [singleTarget.lat || COLLEGE_CONFIG.lat, singleTarget.lng || COLLEGE_CONFIG.lng]
    : [COLLEGE_CONFIG.lat, COLLEGE_CONFIG.lng];

  return (
    <div className={`w-full rounded-2xl overflow-hidden border border-slate-300 shadow-sm relative ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={COLLEGE_CONFIG.defaultZoom}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* College Pin */}
        <Marker position={[COLLEGE_CONFIG.lat, COLLEGE_CONFIG.lng]} icon={collegeIcon}>
          <Popup>
            <div className="p-1 font-sans">
              <span className="font-bold text-indigo-700 block text-xs uppercase tracking-wide">Campus Origin</span>
              <p className="font-semibold text-slate-900 text-sm">{COLLEGE_CONFIG.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">Reference college location</p>
            </div>
          </Popup>
        </Marker>

        {/* Single Target Listing Pin */}
        {singleTarget && singleTarget.lat && singleTarget.lng && (
          <Marker
            position={[singleTarget.lat, singleTarget.lng]}
            icon={targetType === 'MESS' ? messIcon : pgIcon}
          >
            <Popup>
              <div className="p-1 font-sans max-w-[200px]">
                <h4 className="font-bold text-slate-900 text-sm leading-snug">{singleTarget.title || singleTarget.name}</h4>
                <p className="text-teal-700 font-bold text-xs mt-1">
                  {formatPrice(singleTarget.rent || singleTarget.pricePerMeal || singleTarget.monthlyPrice)}
                  {singleTarget.rent ? '/mo' : ''}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {formatDistance(singleTarget.distanceKm)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Multiple Listings Pins */}
        {!singleTarget && listings.map((item) => {
          if (!item.lat || !item.lng) return null;
          const isMess = item.foodType !== undefined;
          const linkPath = isMess ? `/messes/${item.id}` : `/pgs/${item.id}`;

          return (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={isMess ? messIcon : pgIcon}
            >
              <Popup>
                <div className="p-1 font-sans max-w-[210px]">
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                    {item.type || (item.foodType ? `${item.foodType} MESS` : 'PG')}
                  </p>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug mt-0.5">{item.title || item.name}</h4>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                    <span className="font-extrabold text-slate-900 text-xs">
                      {formatPrice(item.rent || item.pricePerMeal || item.monthlyPrice)}
                      {item.rent ? '/mo' : ''}
                    </span>
                    <Link
                      to={linkPath}
                      className="text-xs font-medium text-teal-700 hover:text-teal-900 underline"
                    >
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <AutoBounds listings={singleTarget ? [singleTarget] : listings} center={center} />
      </MapContainer>
    </div>
  );
};

export default MapView;


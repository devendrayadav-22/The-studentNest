import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import COLLEGE_CONFIG from '../constants/college';

const pickerIcon = L.divIcon({
  className: 'custom-picker-marker',
  html: `
    <div style="
      background-color: #EF4444;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
    ">
      <div style="
        width: 10px;
        height: 10px;
        background-color: white;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const collegeRefIcon = L.divIcon({
  className: 'custom-college-marker',
  html: `
    <div style="
      background-color: #8B5CF6;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      color: white;
      font-size: 10px;
      font-weight: bold;
    ">IPS</div>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

// Click handler component
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
    },
  });
  return null;
};

export const LocationPicker = ({
  lat,
  lng,
  onChange,
  height = '320px',
  className = ''
}) => {
  const currentLat = lat || COLLEGE_CONFIG.lat;
  const currentLng = lng || COLLEGE_CONFIG.lng;

  const eventHandlers = useMemo(
    () => ({
      dragend(e) {
        const marker = e.target;
        const position = marker.getLatLng();
        onChange(Number(position.lat.toFixed(6)), Number(position.lng.toFixed(6)));
      },
    }),
    [onChange]
  );

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-100 p-2 rounded-xl border border-slate-200">
        <span>Click anywhere or drag the red pin to set exact coordinates</span>
        <div className="font-mono text-slate-700 font-medium">
          Lat: {currentLat.toFixed(4)}, Lng: {currentLng.toFixed(4)}
        </div>
      </div>

      <div className="w-full rounded-2xl overflow-hidden border border-slate-300 shadow-sm relative" style={{ height }}>
        <MapContainer
          center={[currentLat, currentLng]}
          zoom={14}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Reference College Marker */}
          <Marker position={[COLLEGE_CONFIG.lat, COLLEGE_CONFIG.lng]} icon={collegeRefIcon}>
            <Popup>
              <span className="font-semibold text-xs">{COLLEGE_CONFIG.name} (Origin)</span>
            </Popup>
          </Marker>

          {/* Draggable Listing Marker */}
          <Marker
            position={[currentLat, currentLng]}
            icon={pickerIcon}
            draggable={true}
            eventHandlers={eventHandlers}
          >
            <Popup>
              <span className="text-xs font-semibold">Listing Location (Drag me)</span>
            </Popup>
          </Marker>

          <MapClickHandler onLocationSelect={onChange} />
        </MapContainer>
      </div>
    </div>
  );
};

export default LocationPicker;


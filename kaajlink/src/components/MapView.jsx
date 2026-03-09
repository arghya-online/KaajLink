import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color, emoji) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:16px;">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

export const userIcon = createCustomIcon('#3B82F6', '📍');
export const workerIcon = createCustomIcon('#F97316', '🔧');
export const workerActiveIcon = createCustomIcon('#22C55E', '✅');
export const jobIcon = createCustomIcon('#EF4444', '📋');

// Component to recenter map
const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

// Main Map component
const MapView = ({
  center = [22.572, 88.363],
  zoom = 12,
  markers = [],
  className = '',
  style = {},
  showUserLocation = false,
  userPosition = null,
  onMapClick = null,
  height = '300px'
}) => {
  return (
    <div className={`rounded-2xl overflow-hidden border border-gray-200 shadow-sm ${className}`} style={{ height, ...style }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={center} />

        {/* User location marker */}
        {showUserLocation && userPosition && (
          <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-bold text-sm">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Dynamic markers */}
        {markers.map((marker, index) => (
          <Marker
            key={marker.id || index}
            position={[marker.lat, marker.lng]}
            icon={marker.icon || workerIcon}
            eventHandlers={marker.onClick ? { click: marker.onClick } : {}}
          >
            {marker.popup && (
              <Popup>
                <div className="text-center min-w-[140px]">
                  {marker.image && (
                    <img src={marker.image} alt={marker.name} className="w-10 h-10 rounded-full mx-auto mb-1 object-cover" />
                  )}
                  <p className="font-bold text-sm">{marker.name}</p>
                  {marker.service && <p className="text-xs text-gray-500">{marker.service}</p>}
                  {marker.rating && (
                    <p className="text-xs mt-1">⭐ {marker.rating} • {marker.distance || ''}</p>
                  )}
                  {marker.popupContent}
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;

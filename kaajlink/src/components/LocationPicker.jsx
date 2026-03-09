import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const pinIcon = L.divIcon({
  className: 'custom-pin',
  html: `<div style="background:#F97316;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.3);font-size:20px;">📍</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
};

const FlyToLocation = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 15, { duration: 1 });
    }
  }, [position, map]);
  return null;
};

const LocationPicker = ({ onLocationSelect, initialPosition = null, height = '250px' }) => {
  const [position, setPosition] = useState(initialPosition || { lat: 22.572, lng: 88.363 });
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [address, setAddress] = useState('');

  const handleMapClick = useCallback((coords) => {
    setPosition(coords);
    if (onLocationSelect) {
      onLocationSelect(coords);
    }
    // Reverse geocode using Nominatim (free)
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`)
      .then(res => res.json())
      .then(data => {
        if (data.display_name) {
          setAddress(data.display_name);
        }
      })
      .catch(() => {});
  }, [onLocationSelect]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        handleMapClick(coords);
        setLoadingGPS(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please select manually on the map.');
        setLoadingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative" style={{ height }}>
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleMapClick} />
          <FlyToLocation position={position} />
          <Marker position={[position.lat, position.lng]} icon={pinIcon} />
        </MapContainer>

        {/* GPS button overlay */}
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={loadingGPS}
          className="absolute bottom-3 right-3 z-[1000] bg-white hover:bg-gray-50 text-primary border border-gray-200 rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 text-sm font-semibold transition-all"
        >
          {loadingGPS ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Navigation size={16} />
          )}
          {loadingGPS ? 'Locating...' : 'Use GPS'}
        </button>
      </div>

      {/* Address display */}
      {address && (
        <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-text-secondary flex items-start gap-2">
          <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{address}</span>
        </div>
      )}

      <p className="text-xs text-text-secondary text-center">Tap on the map to select location or use GPS</p>
    </div>
  );
};

export default LocationPicker;

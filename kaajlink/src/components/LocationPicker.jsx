import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Loader2, Target, AlertTriangle } from 'lucide-react';

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

const FlyToLocation = ({ position, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], zoom || 16, { duration: 1.2 });
    }
  }, [position, map, zoom]);
  return null;
};

// Get location via IP as a rough fallback (free, no key)
const getIPLocation = async () => {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    if (data.latitude && data.longitude) {
      return { lat: data.latitude, lng: data.longitude, accuracy: 5000, source: 'ip' };
    }
  } catch {}
  return null;
};

// Get location via GPS with progressive accuracy
const getGPSLocation = (timeout = 30000) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    let bestResult = null;
    let watchId;

    // Use watchPosition to get progressively more accurate fixes
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const result = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy, // in meters
          source: 'gps',
        };

        // Accept if accuracy is good enough (<100m) or if it's better than what we had
        if (!bestResult || result.accuracy < bestResult.accuracy) {
          bestResult = result;
        }

        // If accuracy is very good, resolve immediately
        if (result.accuracy <= 50) {
          navigator.geolocation.clearWatch(watchId);
          resolve(bestResult);
        }
      },
      (err) => {
        navigator.geolocation.clearWatch(watchId);
        if (bestResult) {
          resolve(bestResult); // Return best we got
        } else {
          reject(err);
        }
      },
      { enableHighAccuracy: true, timeout, maximumAge: 0 }
    );

    // After timeout, return whatever we have
    setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
      if (bestResult) {
        resolve(bestResult);
      }
      // If nothing, the error handler above will reject
    }, timeout);
  });
};

const LocationPicker = ({ onLocationSelect, initialPosition = null, height = '250px' }) => {
  const [position, setPosition] = useState(initialPosition || { lat: 22.572, lng: 88.363 });
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [address, setAddress] = useState('');
  const [accuracy, setAccuracy] = useState(null); // in meters
  const [locationSource, setLocationSource] = useState(null); // 'gps', 'ip', 'manual'
  const [flyTarget, setFlyTarget] = useState(null);
  const [flyZoom, setFlyZoom] = useState(null);

  // Auto-detect location on mount via IP (rough but fast)
  useEffect(() => {
    if (!initialPosition) {
      getIPLocation().then((loc) => {
        if (loc) {
          setPosition({ lat: loc.lat, lng: loc.lng });
          setAccuracy(loc.accuracy);
          setLocationSource('ip');
          setFlyTarget({ lat: loc.lat, lng: loc.lng });
          setFlyZoom(13);
        }
      });
    }
  }, []);

  const handleMapClick = useCallback((coords) => {
    setPosition(coords);
    setAccuracy(null); // Manual selection = exact
    setLocationSource('manual');
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

  const getCurrentLocation = async () => {
    setLoadingGPS(true);

    try {
      const loc = await getGPSLocation(20000);
      const coords = { lat: loc.lat, lng: loc.lng };
      setPosition(coords);
      setAccuracy(Math.round(loc.accuracy));
      setLocationSource(loc.source);
      setFlyTarget(coords);
      // Zoom based on accuracy
      setFlyZoom(loc.accuracy < 100 ? 17 : loc.accuracy < 500 ? 15 : loc.accuracy < 2000 ? 14 : 13);
      handleMapClick(coords);
    } catch {
      // Fallback to IP-based location
      const ipLoc = await getIPLocation();
      if (ipLoc) {
        const coords = { lat: ipLoc.lat, lng: ipLoc.lng };
        setPosition(coords);
        setAccuracy(ipLoc.accuracy);
        setLocationSource('ip');
        setFlyTarget(coords);
        setFlyZoom(13);
        handleMapClick(coords);
      } else {
        alert('Unable to detect your location. Please tap on the map to set it manually.');
      }
    } finally {
      setLoadingGPS(false);
    }
  };

  const accuracyLabel = () => {
    if (!accuracy) return null;
    if (accuracy <= 20) return { text: 'Exact', color: 'text-green-600 bg-green-50 border-green-200' };
    if (accuracy <= 100) return { text: `±${accuracy}m`, color: 'text-green-600 bg-green-50 border-green-200' };
    if (accuracy <= 500) return { text: `±${accuracy}m`, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    if (accuracy <= 2000) return { text: `±${(accuracy/1000).toFixed(1)}km`, color: 'text-orange-600 bg-orange-50 border-orange-200' };
    return { text: `±${(accuracy/1000).toFixed(0)}km — tap map to fix`, color: 'text-red-600 bg-red-50 border-red-200' };
  };

  const accInfo = accuracyLabel();

  return (
    <div className="flex flex-col gap-3">
      {/* Accuracy warning */}
      {accInfo && accuracy > 500 && locationSource !== 'manual' && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${accInfo.color}`}>
          <AlertTriangle size={14} />
          Location may be approximate ({accInfo.text}). Tap the map to pin your exact spot.
        </div>
      )}

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
          {flyTarget && <FlyToLocation position={flyTarget} zoom={flyZoom} />}
          <Marker position={[position.lat, position.lng]} icon={pinIcon} />

          {/* Accuracy circle — shows uncertainty radius */}
          {accuracy && accuracy > 20 && locationSource !== 'manual' && (
            <Circle
              center={[position.lat, position.lng]}
              radius={accuracy}
              pathOptions={{
                color: accuracy <= 100 ? '#22C55E' : accuracy <= 500 ? '#EAB308' : '#F97316',
                fillColor: accuracy <= 100 ? '#22C55E' : accuracy <= 500 ? '#EAB308' : '#F97316',
                fillOpacity: 0.1,
                weight: 2,
                dashArray: '6, 6',
              }}
            />
          )}
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
          {loadingGPS ? 'Getting accurate fix...' : 'Use GPS'}
        </button>

        {/* Accuracy badge */}
        {accInfo && locationSource !== 'manual' && (
          <div className={`absolute top-3 left-3 z-[1000] px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm ${accInfo.color}`}>
            <Target size={12} className="inline mr-1" />{accInfo.text}
          </div>
        )}
        {locationSource === 'manual' && (
          <div className="absolute top-3 left-3 z-[1000] px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm text-green-600 bg-green-50 border-green-200">
            <Target size={12} className="inline mr-1" />Pinned manually
          </div>
        )}
      </div>

      {/* Address display */}
      {address && (
        <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-text-secondary flex items-start gap-2">
          <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{address}</span>
        </div>
      )}

      <p className="text-xs text-text-secondary text-center">
        {accuracy && accuracy > 200 && locationSource !== 'manual'
          ? '⚠️ GPS is approximate — tap the map to pin your exact location'
          : 'Tap on the map to select location or use GPS'}
      </p>
    </div>
  );
};

export default LocationPicker;

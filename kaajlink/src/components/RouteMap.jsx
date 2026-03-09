import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Clock, Route as RouteIcon, Loader2 } from 'lucide-react';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createIcon = (color, emoji) =>
  L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 3px 12px rgba(0,0,0,0.35);font-size:18px;">${emoji}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });

const startIcon = createIcon('#3B82F6', '📍');
const endIcon = createIcon('#22C55E', '🏠');
const workerRouteIcon = createIcon('#F97316', '🔧');

// OSRM Route drawing via raw polyline (no leaflet-routing-machine needed)
const OSRMRoute = ({ from, to, onRouteFound }) => {
  const map = useMap();
  const routeLayerRef = useRef(null);

  useEffect(() => {
    if (!from || !to) return;

    // Clean previous route
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
    }

    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=true`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.code === 'Ok' && data.routes?.length > 0) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

          // Draw route on map
          const polyline = L.polyline(coords, {
            color: '#F97316',
            weight: 5,
            opacity: 0.8,
            smoothFactor: 1,
            dashArray: null,
          });

          // Animated dashed overlay
          const dashLine = L.polyline(coords, {
            color: '#FFFFFF',
            weight: 2,
            opacity: 0.5,
            dashArray: '10, 15',
          });

          const routeGroup = L.layerGroup([polyline, dashLine]);
          routeGroup.addTo(map);
          routeLayerRef.current = routeGroup;

          // Fit bounds to show entire route
          map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

          // Extract route info
          const distanceKm = (route.distance / 1000).toFixed(1);
          const durationMin = Math.round(route.duration / 60);

          // Parse turn-by-turn steps
          const steps = route.legs[0]?.steps?.map((step, i) => ({
            id: i,
            instruction: step.maneuver?.type
              ? `${step.maneuver.type.replace(/_/g, ' ')}${step.name ? ` onto ${step.name}` : ''}`
              : step.name || 'Continue',
            distance: step.distance > 1000
              ? `${(step.distance / 1000).toFixed(1)} km`
              : `${Math.round(step.distance)} m`,
            duration: Math.round(step.duration / 60),
          })).filter(s => s.distance !== '0 m') || [];

          if (onRouteFound) {
            onRouteFound({ distanceKm, durationMin, steps });
          }
        }
      } catch (err) {
        console.error('OSRM routing error:', err);
      }
    };

    fetchRoute();

    return () => {
      if (routeLayerRef.current) {
        map.removeLayer(routeLayerRef.current);
      }
    };
  }, [from, to, map, onRouteFound]);

  return null;
};

const RouteMap = ({
  from,          // { lat, lng, label? }
  to,            // { lat, lng, label? }
  height = '300px',
  className = '',
  showDirections = true,
  fromIcon = null,
  toIcon = null,
}) => {
  const [routeInfo, setRouteInfo] = useState(null);
  const [showSteps, setShowSteps] = useState(false);

  const center = from
    ? [from.lat, from.lng]
    : to
      ? [to.lat, to.lng]
      : [22.572, 88.363];

  if (!from || !to) {
    return (
      <div className={`rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center bg-gray-50 text-gray-400 text-sm ${className}`} style={{ height }}>
        <Loader2 size={20} className="animate-spin mr-2" /> Waiting for locations...
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Route Info Bar */}
      {routeInfo && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl px-5 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <RouteIcon size={18} />
                <span className="text-lg font-bold">{routeInfo.distanceKm} km</span>
              </div>
              <div className="w-px h-6 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span className="text-lg font-bold">
                  {routeInfo.durationMin >= 60
                    ? `${Math.floor(routeInfo.durationMin / 60)}h ${routeInfo.durationMin % 60}m`
                    : `${routeInfo.durationMin} min`
                  }
                </span>
              </div>
            </div>
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold">ETA</span>
          </div>
          {routeInfo.durationMin > 0 && (
            <p className="text-white/80 text-xs mt-2">
              Estimated arrival: {new Date(Date.now() + routeInfo.durationMin * 60000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      )}

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height }}>
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <OSRMRoute from={from} to={to} onRouteFound={setRouteInfo} />

          <Marker position={[from.lat, from.lng]} icon={fromIcon || startIcon}>
            <Popup>
              <div className="text-center font-semibold text-sm">
                {from.label || '📍 Start Location'}
              </div>
            </Popup>
          </Marker>

          <Marker position={[to.lat, to.lng]} icon={toIcon || endIcon}>
            <Popup>
              <div className="text-center font-semibold text-sm">
                {to.label || '🏠 Destination'}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Turn-by-turn directions */}
      {showDirections && routeInfo?.steps?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <Navigation size={16} className="text-primary" />
              Turn-by-Turn Directions ({routeInfo.steps.length} steps)
            </span>
            <span className={`text-gray-400 transition-transform ${showSteps ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showSteps && (
            <div className="border-t border-gray-100 max-h-60 overflow-y-auto">
              {routeInfo.steps.map((step, i) => (
                <div
                  key={step.id}
                  className="flex items-start gap-3 px-5 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary font-medium capitalize">{step.instruction}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{step.distance}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { OSRMRoute, startIcon, endIcon, workerRouteIcon };
export default RouteMap;

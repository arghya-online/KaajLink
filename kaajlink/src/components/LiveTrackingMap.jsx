import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import { Navigation, Clock, Route as RouteIcon, Wifi, WifiOff } from 'lucide-react';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createIcon = (color, emoji, size = 44) =>
  L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 3px 12px rgba(0,0,0,0.35);font-size:${size * 0.45}px;">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });

const customerIcon = createIcon('#3B82F6', '📍');
const workerLiveIcon = createIcon('#22C55E', '🔧', 48);
const destinationIcon = createIcon('#EF4444', '🏠');

const SOCKET_URL = 'http://localhost:5000';

// Smoothly animate marker position
const SmoothMarker = ({ position, icon, children }) => {
  const [currentPos, setCurrentPos] = useState(position);
  const animationRef = useRef(null);
  const prevPos = useRef(position);

  useEffect(() => {
    if (!position) return;

    const from = prevPos.current;
    const to = position;
    const duration = 1000; // 1s animation
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      setCurrentPos({
        lat: from.lat + (to.lat - from.lat) * eased,
        lng: from.lng + (to.lng - from.lng) * eased,
      });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animate);
    prevPos.current = to;

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [position]);

  if (!currentPos) return null;

  return (
    <Marker position={[currentPos.lat, currentPos.lng]} icon={icon}>
      {children}
    </Marker>
  );
};

// Auto-fit map bounds
const FitBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length >= 2) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [60, 60] });
    } else if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 15);
    }
  }, [points, map]);
  return null;
};

const LiveTrackingMap = ({
  workerId,
  workerName = 'Worker',
  customerPosition,   // { lat, lng }
  destinationPosition, // { lat, lng } (job location)
  bookingId,
  height = '350px',
  className = '',
  onWorkerLocationUpdate,
  mode = 'customer', // 'customer' (tracking worker) or 'worker' (broadcasting position)
}) => {
  const [workerPosition, setWorkerPosition] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const routeFetchRef = useRef(null);

  // Fetch route from OSRM
  const fetchRoute = useCallback(async (from, to) => {
    if (!from || !to) return;
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.code === 'Ok' && data.routes?.[0]) {
        const route = data.routes[0];
        setRouteCoords(route.geometry.coordinates.map(([lng, lat]) => [lat, lng]));
        setRouteInfo({
          distanceKm: (route.distance / 1000).toFixed(1),
          durationMin: Math.round(route.duration / 60),
        });
      }
    } catch (err) {
      console.error('Route fetch error:', err);
    }
  }, []);

  // Socket.IO connection
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('Live tracking connected');

      if (mode === 'customer' && workerId) {
        socket.emit('customer:track-worker', { workerId, bookingId });
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Listen for worker location updates
    socket.on('worker:location-changed', ({ lat, lng, timestamp }) => {
      const newPos = { lat, lng };
      setWorkerPosition(newPos);

      if (onWorkerLocationUpdate) {
        onWorkerLocationUpdate(newPos);
      }

      // Debounce route re-fetch (every 10 seconds max)
      const dest = destinationPosition || customerPosition;
      if (dest) {
        if (routeFetchRef.current) clearTimeout(routeFetchRef.current);
        routeFetchRef.current = setTimeout(() => fetchRoute(newPos, dest), 10000);
      }
    });

    // Booking status changes
    socket.on('booking:status-changed', ({ bookingId: bId, status }) => {
      console.log(`Booking ${bId} status: ${status}`);
    });

    return () => {
      if (mode === 'customer' && workerId) {
        socket.emit('customer:stop-tracking', { workerId });
      }
      socket.disconnect();
    };
  }, [workerId, bookingId, mode]);

  // Initial route fetch
  useEffect(() => {
    if (workerPosition && (destinationPosition || customerPosition)) {
      fetchRoute(workerPosition, destinationPosition || customerPosition);
    }
  }, [workerPosition, destinationPosition, customerPosition, fetchRoute]);

  // Worker mode: broadcast location periodically
  useEffect(() => {
    if (mode !== 'worker' || !workerId) return;

    let watchId;
    const broadcastLocation = () => {
      if (!navigator.geolocation) return;

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setWorkerPosition({ lat: latitude, lng: longitude });

          if (socketRef.current?.connected) {
            socketRef.current.emit('worker:location-update', {
              workerId,
              lat: latitude,
              lng: longitude,
            });
          }
        },
        (err) => console.error('GPS error:', err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 30000 }
      );
    };

    // Emit online
    if (socketRef.current?.connected) {
      socketRef.current.emit('worker:online', {
        workerId,
        lat: customerPosition?.lat || 22.572,
        lng: customerPosition?.lng || 88.363,
      });
    }

    broadcastLocation();

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (socketRef.current?.connected) {
        socketRef.current.emit('worker:offline', { workerId });
      }
    };
  }, [mode, workerId]);

  const center = workerPosition
    ? [workerPosition.lat, workerPosition.lng]
    : customerPosition
      ? [customerPosition.lat, customerPosition.lng]
      : [22.572, 88.363];

  const boundPoints = [
    workerPosition,
    customerPosition,
    destinationPosition,
  ].filter(Boolean);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Live Status Bar */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold ${
        connected
          ? 'bg-green-500/10 border border-green-500/20 text-green-600'
          : 'bg-red-500/10 border border-red-500/20 text-red-500'
      }`}>
        <div className="flex items-center gap-2">
          {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
          {connected ? 'Live Tracking Active' : 'Connecting...'}
          {connected && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
          )}
        </div>
        {workerPosition && <span className="text-xs opacity-70">{workerName}</span>}
      </div>

      {/* Route info */}
      {routeInfo && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl px-5 py-4 shadow-lg">
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
                    : `${routeInfo.durationMin} min`}
                </span>
              </div>
            </div>
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold">LIVE ETA</span>
          </div>
          <p className="text-white/80 text-xs mt-2">
            Worker arriving at ~{new Date(Date.now() + routeInfo.durationMin * 60000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height }}>
        <MapContainer
          center={center}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {boundPoints.length >= 2 && <FitBounds points={boundPoints} />}

          {/* Route polyline */}
          {routeCoords.length > 0 && (
            <>
              <Polyline
                positions={routeCoords}
                pathOptions={{ color: '#3B82F6', weight: 5, opacity: 0.8 }}
              />
              <Polyline
                positions={routeCoords}
                pathOptions={{ color: '#FFFFFF', weight: 2, opacity: 0.5, dashArray: '10, 15' }}
              />
            </>
          )}

          {/* Worker (smoothly animated) */}
          {workerPosition && (
            <SmoothMarker position={workerPosition} icon={workerLiveIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-sm">🔧 {workerName}</p>
                  <p className="text-xs text-gray-500">On the way</p>
                </div>
              </Popup>
            </SmoothMarker>
          )}

          {/* Customer position */}
          {customerPosition && (
            <Marker position={[customerPosition.lat, customerPosition.lng]} icon={customerIcon}>
              <Popup>
                <div className="text-center font-semibold text-sm">📍 Your Location</div>
              </Popup>
            </Marker>
          )}

          {/* Destination */}
          {destinationPosition && (
            <Marker position={[destinationPosition.lat, destinationPosition.lng]} icon={destinationIcon}>
              <Popup>
                <div className="text-center font-semibold text-sm">🏠 Job Location</div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default LiveTrackingMap;

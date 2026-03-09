import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Phone, MessageCircle, Star, ShieldCheck, Zap, Search, Map as MapIcon, List } from 'lucide-react';
import api from '../services/api';
import Button from '../components/Button';
import MapView, { workerIcon, userIcon } from '../components/MapView';
import RouteMap from '../components/RouteMap';

const AvailablePros = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const serviceCategory = searchParams.get('service') || 'Electrician';
    const location = searchParams.get('loc') || 'Your location';
    const lat = parseFloat(searchParams.get('lat')) || null;
    const lng = parseFloat(searchParams.get('lng')) || null;

    const [isSearching, setIsSearching] = useState(true);
    const [workers, setWorkers] = useState([]);
    const [showMap, setShowMap] = useState(true);
    const [userPos, setUserPos] = useState(lat && lng ? { lat, lng } : null);
    const [userAccuracy, setUserAccuracy] = useState(null);
    const [selectedWorkerForRoute, setSelectedWorkerForRoute] = useState(null);

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                // Try nearby endpoint first if we have user coordinates
                if (userPos) {
                    const { data } = await api.get(`/workers/nearby?lat=${userPos.lat}&lng=${userPos.lng}&service=${encodeURIComponent(serviceCategory)}&radius=50`);
                    setWorkers(data);
                } else {
                    const { data } = await api.get(`/workers/service/${encodeURIComponent(serviceCategory)}`);
                    setWorkers(data);
                }
            } catch (error) {
                console.error('Failed to fetch workers:', error);
                try {
                    const { data } = await api.get('/workers');
                    setWorkers(data.slice(0, 3));
                } catch (e) {
                    console.error('Fallback fetch failed:', e);
                }
            }
        };

        // Get user location if not provided — try GPS then IP fallback
        if (!userPos) {
            const detectLocation = async () => {
                if (navigator.geolocation) {
                    try {
                        const pos = await new Promise((resolve, reject) => {
                            let best = null;
                            const wId = navigator.geolocation.watchPosition(
                                (p) => {
                                    if (!best || p.coords.accuracy < best.accuracy) {
                                        best = p.coords;
                                    }
                                    if (p.coords.accuracy <= 100) {
                                        navigator.geolocation.clearWatch(wId);
                                        resolve(best);
                                    }
                                },
                                (e) => {
                                    navigator.geolocation.clearWatch(wId);
                                    if (best) resolve(best);
                                    else reject(e);
                                },
                                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
                            );
                            setTimeout(() => {
                                navigator.geolocation.clearWatch(wId);
                                if (best) resolve(best);
                            }, 8000);
                        });
                        setUserPos({ lat: pos.latitude, lng: pos.longitude });
                        setUserAccuracy(Math.round(pos.accuracy));
                        return;
                    } catch {}
                }
                // IP-based fallback
                try {
                    const res = await fetch('https://ipapi.co/json/');
                    const data = await res.json();
                    if (data.latitude && data.longitude) {
                        setUserPos({ lat: data.latitude, lng: data.longitude });
                        setUserAccuracy(5000); // IP-based — rough
                        return;
                    }
                } catch {}
                setUserPos({ lat: 22.572, lng: 88.363 }); // Last resort
            };
            detectLocation();
        }

        const timer = setTimeout(() => {
            setIsSearching(false);
        }, 1500);

        fetchWorkers();
        return () => clearTimeout(timer);
    }, [serviceCategory, userPos]);

    if (isSearching) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-6 animate-pulse">
                    <Search className="text-primary animate-bounce" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Locating Pros Nearby...</h2>
                <p className="text-text-secondary">Finding available {serviceCategory}s around {location}</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50/50 min-h-screen pb-12 pt-4 px-4 md:px-8">
            <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 bg-white border border-gray-100 shadow-sm rounded-full flex items-center justify-center text-text-primary hover:bg-gray-50 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-text-primary tracking-tight">Available {serviceCategory}s</h1>
                        <p className="text-xs font-medium text-text-secondary flex items-center gap-1 mt-0.5">
                            <MapPin size={12} /> Near {location}
                        </p>
                    </div>
                </div>

                <div className="bg-green-50 text-green-700 p-3 rounded-xl border border-green-200 text-sm font-medium flex items-center gap-2">
                    <Zap size={18} className="text-green-600" />
                    Found {workers.length} professionals ready to help.
                </div>

                {/* Map/List toggle */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowMap(true)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${showMap ? 'bg-primary text-white shadow-sm' : 'bg-white text-text-secondary border border-gray-200'}`}
                    >
                        <MapIcon size={16} /> Map View
                    </button>
                    <button
                        onClick={() => setShowMap(false)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${!showMap ? 'bg-primary text-white shadow-sm' : 'bg-white text-text-secondary border border-gray-200'}`}
                    >
                        <List size={16} /> List View
                    </button>
                </div>

                {/* Map or Route */}
                {showMap && !selectedWorkerForRoute && (
                    <MapView
                        center={userPos ? [userPos.lat, userPos.lng] : [22.572, 88.363]}
                        zoom={11}
                        height="280px"
                        showUserLocation={!!userPos}
                        userPosition={userPos}
                        userAccuracy={userAccuracy}
                        markers={workers.filter(w => w.coordinates?.lat && w.coordinates?.lng).map(w => ({
                            id: w._id,
                            lat: w.coordinates.lat,
                            lng: w.coordinates.lng,
                            name: w.name,
                            service: w.service,
                            rating: w.rating,
                            distance: w.distance || w.calculatedDistance ? `${w.calculatedDistance} km` : '',
                            image: w.image,
                            popup: true,
                            icon: workerIcon,
                            onClick: () => setSelectedWorkerForRoute(w)
                        }))}
                    />
                )}

                {/* Route to selected worker */}
                {showMap && selectedWorkerForRoute && userPos && selectedWorkerForRoute.coordinates?.lat && (
                    <div className="flex flex-col gap-2">
                        <RouteMap
                            from={{ lat: userPos.lat, lng: userPos.lng, label: '📍 Your Location' }}
                            to={{ lat: selectedWorkerForRoute.coordinates.lat, lng: selectedWorkerForRoute.coordinates.lng, label: `🔧 ${selectedWorkerForRoute.name}` }}
                            height="280px"
                            showDirections={true}
                        />
                        <button
                            onClick={() => setSelectedWorkerForRoute(null)}
                            className="text-sm text-text-secondary hover:text-primary transition-colors text-center py-1 font-medium"
                        >
                            ← Back to all workers map
                        </button>
                    </div>
                )}

                {/* Pros List */}
                <div className="flex flex-col gap-4">
                    {workers.map(worker => (
                        <div key={worker._id} className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-5">
                            <div className="flex gap-4 items-start mb-5">
                                <img
                                    src={worker.image}
                                    alt={worker.name}
                                    className="w-16 h-16 rounded-2xl object-cover border border-gray-100"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg text-text-primary leading-tight">{worker.name}</h3>
                                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md text-xs font-bold">
                                            <Star size={12} className="fill-primary text-primary" /> {worker.rating}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-1.5 text-xs font-medium text-text-secondary">
                                        <ShieldCheck size={14} className="text-emerald-500" />
                                        <span className="text-emerald-600">Background Verified</span>
                                        <span className="text-gray-300">•</span>
                                        <span>{worker.distance}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <a href={`tel:${worker.phone}`} className="flex-1">
                                    <Button variant="primary" fullWidth className="bg-text-primary hover:bg-black w-full flex items-center justify-center gap-2 rounded-xl h-12 shadow-sm">
                                        <Phone size={18} /> Call Now
                                    </Button>
                                </a>
                                <a href={`https://wa.me/${worker.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex-1">
                                    <Button variant="secondary" fullWidth className="bg-green-50 text-green-700 hover:bg-green-100 w-full flex items-center justify-center gap-2 rounded-xl h-12 shadow-sm border border-green-200">
                                        <MessageCircle size={18} /> WhatsApp
                                    </Button>
                                </a>
                            </div>

                            {/* Route & Book buttons */}
                            <div className="flex gap-3 mt-3">
                                {userPos && worker.coordinates?.lat && (
                                    <button
                                        onClick={() => setSelectedWorkerForRoute(worker)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-xl h-12 text-sm font-bold transition-all"
                                    >
                                        <MapPin size={16} /> View Route
                                    </button>
                                )}
                                <button
                                    onClick={() => navigate(`/worker-profile/${worker._id}`)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-xl h-12 text-sm font-bold transition-all"
                                >
                                    Book →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AvailablePros;

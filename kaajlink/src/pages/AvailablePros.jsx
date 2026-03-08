import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Phone, MessageCircle, Star, ShieldCheck, Zap } from 'lucide-react';
import { workers } from '../data/mockData';
import Button from '../components/Button';

const AvailablePros = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const serviceCategory = searchParams.get('service') || 'Electrician';
    const location = searchParams.get('loc') || 'Your location';

    const [isSearching, setIsSearching] = useState(true);

    // Filter workers by service to simulate a backend match
    const matchingWorkers = workers.filter(w => w.service.toLowerCase().includes(serviceCategory.toLowerCase()));

    // Simulate finding animation
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsSearching(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

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
                    Found {matchingWorkers.length || 3} professionals ready to help.
                </div>

                {/* Pros List */}
                <div className="flex flex-col gap-4">
                    {(matchingWorkers.length > 0 ? matchingWorkers : workers.slice(0, 3)).map(worker => (
                        <div key={worker.id} className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] p-5">
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
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AvailablePros;

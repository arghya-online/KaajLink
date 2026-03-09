import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, MapPin, Search, CalendarClock, Briefcase } from 'lucide-react';
import Button from '../components/Button';
import api from '../services/api';
import LocationPicker from '../components/LocationPicker';

const PostRequest = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Pre-fill if coming from a specific service card
    const initialService = searchParams.get('service') || '';

    const [serviceType, setServiceType] = useState(initialService);
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [time, setTime] = useState('As soon as possible');
    const [services, setServices] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const { data } = await api.get('/services');
                setServices(data);
            } catch (error) {
                console.error('Failed to fetch services:', error);
            }
        };
        fetchServices();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const params = new URLSearchParams({
            service: serviceType,
            loc: address
        });
        if (selectedLocation) {
            params.set('lat', selectedLocation.lat);
            params.set('lng', selectedLocation.lng);
        }
        navigate(`/available-pros?${params.toString()}`);
    };

    return (
        <div className="bg-gray-50/50 min-h-screen pb-12 pt-4 px-4 md:px-8">
            <div className="max-w-xl mx-auto w-full flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 bg-white border border-gray-100 shadow-sm rounded-full flex items-center justify-center text-text-primary hover:bg-gray-50 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-text-primary tracking-tight">What do you need?</h1>
                </div>

                <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                        {/* Service Category */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">Service Category</label>
                            <div className="relative flex items-center">
                                <div className="absolute left-4 text-text-secondary">
                                    <Briefcase size={20} />
                                </div>
                                <select
                                    className="w-full h-14 pl-12 pr-4 bg-gray-50/50 text-sm md:text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white border border-gray-200 rounded-2xl transition-all appearance-none cursor-pointer"
                                    value={serviceType}
                                    onChange={(e) => setServiceType(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select a service</option>
                                    {services.map(s => (
                                        <option key={s._id || s} value={s.name || s}>{s.name || s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">Describe the issue</label>
                            <textarea
                                placeholder="E.g. Leaking pipe under the kitchen sink..."
                                className="w-full h-28 bg-gray-50/50 text-sm md:text-base text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white border border-gray-200 rounded-2xl p-4 resize-none transition-all"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        {/* Location */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">Your Location</label>
                            <div className="relative flex items-center">
                                <div className="absolute left-4 text-text-secondary">
                                    <MapPin size={20} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter your address or locality"
                                    className="w-full h-14 pl-12 pr-4 bg-gray-50/50 text-sm md:text-base text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white border border-gray-200 rounded-2xl transition-all"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Map Location Picker */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">Pin Your Location on Map</label>
                            <LocationPicker
                                onLocationSelect={(coords) => setSelectedLocation(coords)}
                                height="200px"
                            />
                        </div>

                        {/* Time */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">When do you need it?</label>
                            <div className="relative flex items-center">
                                <div className="absolute left-4 text-text-secondary">
                                    <CalendarClock size={20} />
                                </div>
                                <select
                                    className="w-full h-14 pl-12 pr-4 bg-gray-50/50 text-sm md:text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white border border-gray-200 rounded-2xl transition-all appearance-none cursor-pointer"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                >
                                    <option>As soon as possible</option>
                                    <option>Within 2 hours</option>
                                    <option>Today Evening</option>
                                    <option>Tomorrow Morning</option>
                                    <option>Schedule for later</option>
                                </select>
                            </div>
                        </div>

                        {/* Submit */}
                        <Button type="submit" variant="primary" fullWidth size="lg" className="mt-4 shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] rounded-2xl h-14 text-base font-bold flex gap-2">
                            <Search size={20} />
                            Find Providers Near Me
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PostRequest;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import SectionHeader from '../components/SectionHeader';
import api from '../services/api';
import { Zap, Droplet, Hammer, Thermometer, PenTool, Wrench, BookOpen, Brush, Key, Bug, Smartphone, Scissors, Car } from 'lucide-react';

const iconMap = {
    Zap, Droplet, Hammer, Thermometer, PenTool, Wrench, BookOpen, Brush, Key, Bug, Smartphone, Scissors, Car
};

const Services = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const { data } = await api.get('/services');
                setServices(data);
            } catch (error) {
                console.error('Failed to fetch services:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    // Fallback icon/color mapping
    const serviceDetails = {
        "Electrician": { icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
        "Plumber": { icon: Droplet, color: "text-cyan-600", bg: "bg-cyan-50" },
        "Carpenter": { icon: Hammer, color: "text-orange-600", bg: "bg-orange-50" },
        "Painter": { icon: Brush, color: "text-purple-600", bg: "bg-purple-50" },
        "AC Repair": { icon: Thermometer, color: "text-red-600", bg: "bg-red-50" },
        "Mechanic": { icon: Wrench, color: "text-slate-600", bg: "bg-slate-100" },
        "Tutor": { icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50" },
        "House Cleaner": { icon: Brush, color: "text-emerald-600", bg: "bg-emerald-50" },
        "Pest Control": { icon: Bug, color: "text-red-600", bg: "bg-red-50" },
        "Appliance Repair": { icon: Wrench, color: "text-blue-600", bg: "bg-blue-50" },
        "Beautician": { icon: Scissors, color: "text-pink-600", bg: "bg-pink-50" },
        "Driver": { icon: Car, color: "text-green-600", bg: "bg-green-50" },
    };

    return (
        <div className="px-5 md:px-8 flex flex-col pb-10 pt-6">
            <SectionHeader title="All Services" />

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mt-2">
                    {services.map((service) => {
                        const details = serviceDetails[service.name] || { icon: iconMap[service.icon] || Zap, color: service.color || "text-primary", bg: service.bg || "bg-orange-50" };

                        return (
                            <ServiceCard
                                key={service._id}
                                name={service.name}
                                icon={details.icon}
                                color={details.color}
                                bg={details.bg}
                                onClick={() => navigate(`/post-request?service=${encodeURIComponent(service.name)}`)}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Services;

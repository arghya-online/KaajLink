import React from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import SectionHeader from '../components/SectionHeader';
import { services } from '../data/mockData';
import { Zap, Droplet, Hammer, Thermometer, PenTool, Wrench, BookOpen, Brush, Key } from 'lucide-react';

const Services = () => {
    const navigate = useNavigate();

    // Mapping mock data services to icons and vibrant colors
    const serviceDetails = {
        "Electrician": { icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
        "Plumber": { icon: Droplet, color: "text-cyan-600", bg: "bg-cyan-50" },
        "Carpenter": { icon: Hammer, color: "text-orange-600", bg: "bg-orange-50" },
        "Painter": { icon: Brush, color: "text-purple-600", bg: "bg-purple-50" },
        "AC Repair": { icon: Thermometer, color: "text-red-600", bg: "bg-red-50" },
        "Mechanic": { icon: Wrench, color: "text-slate-600", bg: "bg-slate-100" },
        "Tutor": { icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50" },
        "Locksmith": { icon: Key, color: "text-emerald-600", bg: "bg-emerald-50" },
    };

    return (
        <div className="px-5 md:px-8 flex flex-col pb-10 pt-6">
            <SectionHeader title="All Services" />

            {/* Changed from grid-cols-1 to grid-cols-2 to force two columns on mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mt-2">
                {services.map((serviceName) => {
                    const details = serviceDetails[serviceName] || { icon: Zap, color: "text-primary", bg: "bg-orange-50" };

                    return (
                        <ServiceCard
                            key={serviceName}
                            name={serviceName}
                            icon={details.icon}
                            color={details.color}
                            bg={details.bg}
                            onClick={() => navigate(`/post-request?service=${encodeURIComponent(serviceName)}`)}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default Services;

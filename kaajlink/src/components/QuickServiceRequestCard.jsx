import React from 'react';
import { Zap, Droplet, Hammer, Thermometer, PenTool, Wrench, BookOpen, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickServiceRequestCard = () => {
    const navigate = useNavigate();

    const topServices = [
        { name: 'Electrician', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { name: 'Plumber', icon: Droplet, color: 'text-blue-600', bg: 'bg-blue-50' },
        { name: 'Carpenter', icon: Hammer, color: 'text-orange-600', bg: 'bg-orange-50' },
        { name: 'AC Repair', icon: Thermometer, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    ];

    return (
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05),0_10px_20px_-2px_rgba(0,0,0,0.02)] relative z-10 w-full">
            <h2 className="text-lg md:text-xl font-bold text-text-primary mb-4 tracking-tight">
                What do you need help with?
            </h2>
            <div className="grid grid-cols-4 gap-2 md:gap-4">
                {topServices.map((service) => {
                    const Icon = service.icon;
                    return (
                        <button
                            key={service.name}
                            onClick={() => navigate(`/post-request?service=${service.name}`)}
                            className="flex flex-col items-center gap-2 md:gap-3 p-2 md:p-4 rounded-xl border border-transparent hover:border-gray-200 hover:shadow-sm hover:translate-y-[-2px] transition-all text-center group cursor-pointer active:scale-95 bg-white w-full"
                        >
                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center ${service.bg} ${service.color} transition-colors group-hover:bg-primary group-hover:text-white shadow-inner`}>
                                <Icon size={22} strokeWidth={2} />
                            </div>
                            <span className="font-semibold text-[11px] md:text-sm text-text-primary group-hover:text-primary transition-colors line-clamp-1">{service.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuickServiceRequestCard;

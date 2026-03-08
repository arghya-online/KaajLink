import React from 'react';

const ServiceCard = ({ name, icon: Icon, onClick, color = "text-text-secondary", bg = "bg-gray-50" }) => {
    return (
        <button
            onClick={onClick}
            className="w-full aspect-square bg-white p-3 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100/80 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)] hover:border-gray-200 transition-all flex flex-col justify-center items-center gap-4 md:gap-5 group text-center cursor-pointer active:scale-95"
        >
            <div className={`w-14 h-14 md:w-20 md:h-20 ${bg} rounded-2xl md:rounded-[24px] flex items-center justify-center ${color} transition-transform duration-300 group-hover:scale-110`}>
                {Icon ? <Icon size={26} className="md:w-9 md:h-9" strokeWidth={2.5} /> : <div className="w-6 h-6 bg-primary/20 rounded-sm" />}
            </div>

            <span className="font-semibold text-text-primary text-[15px] md:text-lg tracking-tight group-hover:text-primary transition-colors line-clamp-2 leading-tight w-full">
                {name}
            </span>
        </button>
    );
};

export default ServiceCard;

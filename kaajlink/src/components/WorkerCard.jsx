import React from 'react';
import { Star, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const WorkerCard = ({ worker, onRequest }) => {
    const navigate = useNavigate();
    const workerId = worker._id || worker.id;

    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md flex flex-col gap-5 group h-full">
            <div className="flex gap-4 items-start cursor-pointer" onClick={() => navigate(`/worker/${workerId}`)}>
                <img
                    src={worker.image}
                    alt={worker.name}
                    className="w-16 h-16 rounded-xl object-cover bg-gray-100"
                />
                <div className="flex-1">
                    <h3 className="font-semibold text-base text-text-primary line-clamp-1">{worker.name}</h3>
                    <p className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">{worker.service}</p>

                    <div className="flex flex-col gap-1.5 text-xs font-medium text-text-secondary">
                        <div className="flex items-center gap-1.5 font-semibold text-text-primary">
                            <Star size={14} className="fill-primary text-primary" />
                            <span>{worker.rating}</span>
                            <span className="text-gray-300 font-normal">・</span>
                            <span className="text-text-secondary font-normal">{worker.totalReviews || 0} reviews</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin size={14} />
                            <span className="truncate">{worker.distance} away in {worker.location}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto">
                <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => onRequest(worker)}
                >
                    Book Professional
                </Button>
            </div>
        </div>
    );
};

export default WorkerCard;

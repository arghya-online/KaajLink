import React from 'react';
import { Star, MapPin, CheckCircle, Clock } from 'lucide-react';
import Button from './Button';

const WorkerProfileCard = ({ worker, onBook }) => {
    return (
        <div className="bg-surface rounded-2xl overflow-hidden border border-border pb-4 w-full">
            <div className="h-24 bg-primary/20 relative">
                <div className="absolute -bottom-10 left-4">
                    <img
                        src={worker.image}
                        alt={worker.name}
                        className="w-20 h-20 rounded-full border-4 border-surface object-cover bg-background"
                    />
                </div>
            </div>

            <div className="px-4 pt-12">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h2 className="text-xl font-heading font-bold text-text-primary">{worker.name}</h2>
                        <p className="text-text-secondary flex items-center gap-1 mt-0.5">
                            {worker.service} <CheckCircle size={14} className="text-blue-500" />
                        </p>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        <Star size={14} className="fill-amber-500 text-amber-500" />
                        <span className="font-bold text-amber-700">{worker.rating}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6 mb-6">
                    <div className="flex flex-col gap-1.5 p-3 bg-background rounded-xl border border-border/50">
                        <div className="text-text-secondary flex items-center gap-1.5 text-xs font-medium">
                            <MapPin size={12} /> Distance
                        </div>
                        <span className="font-semibold text-sm text-text-primary">{worker.distance} remote</span>
                    </div>
                    <div className="flex flex-col gap-1.5 p-3 bg-background rounded-xl border border-border/50">
                        <div className="text-text-secondary flex items-center gap-1.5 text-xs font-medium">
                            <Clock size={12} /> Jobs done
                        </div>
                        <span className="font-semibold text-sm text-text-primary">124+</span>
                    </div>
                </div>

                <Button variant="primary" fullWidth onClick={onBook} size="lg">
                    Book Now
                </Button>
            </div>
        </div>
    );
};

export default WorkerProfileCard;

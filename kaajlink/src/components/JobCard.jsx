import React from 'react';
import { Calendar, Clock } from 'lucide-react';

const JobCard = ({ job }) => {
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700',
        completed: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700'
    };

    return (
        <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-heading font-semibold text-text-primary">{job.service}</h3>
                    <p className="text-sm text-text-secondary">{job.workerName}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-md ${statusColors[job.status] || statusColors.pending}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-text-secondary mt-1">
                <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {job.date}
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {job.time}
                </div>
            </div>
        </div>
    );
};

export default JobCard;

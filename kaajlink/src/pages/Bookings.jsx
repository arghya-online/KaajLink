import React from 'react';
import SectionHeader from '../components/SectionHeader';
import JobCard from '../components/JobCard';

const Bookings = () => {
    const mockJobs = [
        { id: 1, service: 'AC Repair', workerName: 'Raj Kumar', status: 'pending', date: 'Today, Oct 12', time: '02:00 PM' },
        { id: 2, service: 'Plumbing Repair', workerName: 'Sanjay Plumber', status: 'completed', date: 'Oct 05, 2023', time: '11:30 AM' },
        { id: 3, service: 'Electrical Fix', workerName: 'Raju Electrician', status: 'cancelled', date: 'Sep 28, 2023', time: '04:00 PM' }
    ];

    return (
        <div className="p-4 md:p-8 flex flex-col pb-8 pt-6">
            <SectionHeader title="My Bookings" />

            <div className="flex flex-col gap-4">
                {mockJobs.map(job => (
                    <JobCard key={job.id} job={job} />
                ))}
            </div>
        </div>
    );
};

export default Bookings;

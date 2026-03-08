import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WorkerCard from '../components/WorkerCard';
import SectionHeader from '../components/SectionHeader';
import ModalBottomSheet from '../components/ModalBottomSheet';
import BookingForm from '../components/BookingForm';
import { workers } from '../data/mockData';

const WorkersList = () => {
    const { service } = useParams();
    const navigate = useNavigate();
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Format the service name from URL for display
    const title = service ? service.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + 's' : 'Workers';

    // In a real app we'd filter workers by service, for now we just use the mock data
    const filteredWorkers = workers;

    const handleRequestService = (worker) => {
        setSelectedWorker(worker);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedWorker(null), 300);
    };

    return (
        <div className="p-4 md:p-8 flex flex-col pb-8 pt-6">
            <div className="mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors mb-2 inline-flex items-center"
                >
                    ← Back
                </button>
                <SectionHeader title={title} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWorkers.map(worker => (
                    <WorkerCard
                        key={worker.id}
                        worker={worker}
                        onRequest={handleRequestService}
                    />
                ))}
            </div>

            <ModalBottomSheet
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title="Request Service"
            >
                <BookingForm worker={selectedWorker} onBook={handleCloseModal} />
            </ModalBottomSheet>
        </div>
    );
};

export default WorkersList;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WorkerCard from '../components/WorkerCard';
import SectionHeader from '../components/SectionHeader';
import ModalBottomSheet from '../components/ModalBottomSheet';
import BookingForm from '../components/BookingForm';
import api from '../services/api';

const WorkersList = () => {
    const { service } = useParams();
    const navigate = useNavigate();
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Format the service name from URL for display
    const title = service ? service.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + 's' : 'Workers';

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const { data } = await api.get(`/workers/service/${encodeURIComponent(service || '')}`);
                setWorkers(data);
            } catch (error) {
                console.error('Failed to fetch workers:', error);
                // fallback to all workers
                const { data } = await api.get('/workers');
                setWorkers(data);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkers();
    }, [service]);

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
                {loading ? (
                    <div className="col-span-full flex justify-center py-8">
                        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : workers.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                        <p className="text-text-secondary">No workers found for this service.</p>
                    </div>
                ) : (
                    workers.map(worker => (
                        <WorkerCard
                            key={worker._id}
                            worker={worker}
                            onRequest={handleRequestService}
                        />
                    ))
                )}
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

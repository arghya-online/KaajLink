import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WorkerProfileCard from '../components/WorkerProfileCard';
import SectionHeader from '../components/SectionHeader';
import ModalBottomSheet from '../components/ModalBottomSheet';
import BookingForm from '../components/BookingForm';
import api from '../services/api';
import { Star } from 'lucide-react';

const WorkerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [worker, setWorker] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorker = async () => {
            try {
                const { data } = await api.get(`/workers/${id}`);
                setWorker(data);
            } catch (error) {
                console.error('Failed to fetch worker:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchWorker();
    }, [id]);

    const handleBook = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!worker) {
        return (
            <div className="p-4 md:p-8 text-center pt-16">
                <h2 className="text-xl font-bold text-text-primary">Worker not found</h2>
                <button onClick={() => navigate(-1)} className="text-primary mt-4 font-semibold">Go Back</button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 flex flex-col pb-8 pt-6">
            <div className="mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors mb-2 inline-flex items-center"
                >
                    ← Back
                </button>
            </div>

            <WorkerProfileCard worker={worker} onBook={handleBook} />

            <section className="mt-8">
                <SectionHeader title="About" />
                <p className="text-text-secondary text-sm leading-relaxed">
                    {worker.about || `${worker.name} is a top-rated ${worker.service.toLowerCase()} with over ${worker.experience || 5} years of experience in the field. Known for punctuality and high-quality work, they guarantee 100% satisfaction on all jobs.`}
                </p>
            </section>

            <section className="mt-8">
                <SectionHeader title={`Reviews (${worker.reviews?.length || 0})`} />
                {worker.reviews && worker.reviews.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {worker.reviews.map((review, idx) => (
                            <div key={idx} className="bg-surface border border-border rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary">
                                        {review.userName?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-text-primary text-sm">{review.userName}</p>
                                        <div className="flex gap-0.5 text-amber-500 text-sm">
                                            {Array.from({ length: review.rating }, (_, i) => '★').join(' ')}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-text-secondary">"{review.comment}"</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-text-secondary">No reviews yet.</p>
                )}
            </section>

            <ModalBottomSheet
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title="Request Service"
            >
                <BookingForm worker={worker} onBook={handleCloseModal} />
            </ModalBottomSheet>
        </div>
    );
};

export default WorkerProfile;

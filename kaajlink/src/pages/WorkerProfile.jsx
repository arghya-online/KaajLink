import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WorkerProfileCard from '../components/WorkerProfileCard';
import SectionHeader from '../components/SectionHeader';
import ModalBottomSheet from '../components/ModalBottomSheet';
import BookingForm from '../components/BookingForm';
import { workers } from '../data/mockData';

const WorkerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Find worker by id, fallback to first for demo
    const worker = workers.find(w => w.id.toString() === id) || workers[0];

    const handleBook = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
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
            </div>

            <WorkerProfileCard worker={worker} onBook={handleBook} />

            <section className="mt-8">
                <SectionHeader title="About" />
                <p className="text-text-secondary text-sm leading-relaxed">
                    {worker.name} is a top-rated {worker.service.toLowerCase()} with over 5 years of experience in the field.
                    Known for punctuality and high-quality work, they guarantee 100% satisfaction on all jobs.
                </p>
            </section>

            <section className="mt-8">
                <SectionHeader title="Reviews" />
                <div className="bg-surface border border-border rounded-xl p-4 shadow-sm mb-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary">A</div>
                        <div>
                            <p className="font-semibold text-text-primary text-sm">Amit S.</p>
                            <div className="flex gap-0.5 text-amber-500 text-sm">
                                ★ ★ ★ ★ ★
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-text-secondary">"Great service! Arrived on time and fixed the issue perfectly. Highly recommended."</p>
                </div>
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

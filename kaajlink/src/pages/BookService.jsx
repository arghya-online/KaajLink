import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';
import BookingForm from '../components/BookingForm';
import { workers } from '../data/mockData';
import { ChevronLeft, Star, MapPin } from 'lucide-react';

const BookService = () => {
    const { workerId } = useParams();
    const navigate = useNavigate();

    const worker = workers.find(w => w.id.toString() === workerId) || workers[0];

    const handleBook = () => {
        alert("Booking successful! Redirecting to your bookings...");
        navigate('/bookings');
    };

    return (
        <div className="bg-gray-50/50 min-h-screen pb-12 pt-4 px-4 md:px-8">
            <div className="max-w-xl mx-auto w-full flex flex-col gap-6">
                {/* Header / Nav */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 bg-white border border-gray-100 shadow-sm rounded-full flex items-center justify-center text-text-primary hover:bg-gray-50 transition-colors active:scale-95"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-text-primary tracking-tight">Request Service</h1>
                </div>

                {/* Worker Profile Summary Card */}
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] flex gap-4 items-center">
                    <img
                        src={worker.image}
                        alt={worker.name}
                        className="w-16 h-16 rounded-2xl object-cover bg-gray-100"
                    />
                    <div className="flex flex-col">
                        <span className="font-semibold text-lg text-text-primary leading-tight mb-1">{worker.name}</span>
                        <span className="text-sm font-medium text-primary bg-orange-50 px-2 py-0.5 rounded-md w-fit mb-2">{worker.service}</span>
                        <div className="flex items-center gap-3 text-xs font-medium text-text-secondary">
                            <span className="flex items-center gap-1"><Star size={12} className="fill-primary text-primary" /> {worker.rating}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="flex items-center gap-1"><MapPin size={12} /> {worker.distance}</span>
                        </div>
                    </div>
                </div>

                {/* The Form Wrapper */}
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-text-primary tracking-tight mb-2">Job Details</h2>
                        <p className="text-sm text-text-secondary">Provide information so the professional comes prepared.</p>
                    </div>
                    <BookingForm worker={worker} onBook={handleBook} />
                </div>
            </div>
        </div>
    );
};

export default BookService;

import React, { useState } from 'react';
import InputField from './InputField';
import Button from './Button';
import { MapPin, Image as ImageIcon, CalendarClock, Info } from 'lucide-react';

const BookingForm = ({ onBook, worker }) => {
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [date, setDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Booking submitted:", { description, address, date, workerId: worker?.id });
        if (onBook) onBook();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Description Field */}
            <div className="flex flex-col gap-2 relative">
                <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">What needs to be done?</label>
                <div className="relative">
                    <textarea
                        placeholder="E.g. Leaking pipe under the kitchen sink..."
                        className="w-full h-28 bg-gray-50/50 text-sm md:text-base text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white border border-gray-200 rounded-2xl p-4 resize-none transition-all shadow-sm"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                    <Info size={16} className="absolute top-4 right-4 text-gray-400" />
                </div>
            </div>

            {/* Address Field */}
            <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">Service Location</label>
                <div className="relative flex items-center">
                    <div className="absolute left-4 text-text-secondary">
                        <MapPin size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Enter your full address"
                        className="w-full h-14 pl-12 pr-4 bg-gray-50/50 text-sm md:text-base text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white border border-gray-200 rounded-2xl transition-all shadow-sm"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                    />
                </div>
            </div>

            {/* Date/Time Field (New) */}
            <div className="flex flex-col gap-2">
                <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">Preferred Time</label>
                <div className="relative flex items-center">
                    <div className="absolute left-4 text-text-secondary">
                        <CalendarClock size={20} />
                    </div>
                    <input
                        type="datetime-local"
                        className="w-full h-14 pl-12 pr-4 bg-gray-50/50 text-sm md:text-base text-text-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary border border-gray-200 rounded-2xl transition-all shadow-sm"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>
            </div>

            {/* Photo Upload Area */}
            <div className="mt-2 border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-orange-50/30 hover:border-primary/40 transition-all group">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    <ImageIcon size={22} />
                </div>
                <div className="text-center">
                    <p className="text-sm font-bold text-text-primary">Add photos of the problem</p>
                    <p className="text-xs text-text-secondary mt-1">Optional, but helps the pro prepare</p>
                </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="primary" fullWidth size="lg" className="mt-4 shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] hover:-translate-y-0.5 rounded-2xl h-14 text-base">
                Confirm Booking
            </Button>
        </form>
    );
};

export default BookingForm;

import React, { useState, useEffect } from 'react';
import SectionHeader from '../components/SectionHeader';
import { Calendar, Clock, MapPin, User, XCircle, Navigation, Route } from 'lucide-react';
import api from '../services/api';
import Button from '../components/Button';
import LiveTrackingMap from '../components/LiveTrackingMap';
import RouteMap from '../components/RouteMap';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [trackingBookingId, setTrackingBookingId] = useState(null);
    const [userPosition, setUserPosition] = useState(null);

    useEffect(() => {
        fetchBookings();
        // Get user location for tracking
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => setUserPosition({ lat: 22.572, lng: 88.363 })
            );
        }
    }, []);

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings');
            setBookings(data);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            await api.put(`/bookings/${bookingId}/cancel`);
            fetchBookings();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700',
        confirmed: 'bg-blue-100 text-blue-700',
        'in-progress': 'bg-indigo-100 text-indigo-700',
        completed: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700'
    };

    const filteredBookings = filter === 'all'
        ? bookings
        : bookings.filter(b => b.status === filter);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="p-4 md:p-8 flex flex-col pb-8 pt-6">
            <SectionHeader title="My Bookings" />

            {/* Filter tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                            filter === status
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                        }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="text-center py-16">
                    <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-text-primary mb-1">No bookings yet</h3>
                    <p className="text-sm text-text-secondary">Your service bookings will appear here</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filteredBookings.map(booking => (
                        <div key={booking._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3 items-start">
                                    {booking.worker?.image && (
                                        <img src={booking.worker.image} alt={booking.worker.name} className="w-12 h-12 rounded-xl object-cover bg-gray-100" />
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-text-primary">{booking.service}</h3>
                                        <p className="text-sm text-text-secondary flex items-center gap-1">
                                            <User size={12} /> {booking.worker?.name || 'Assigned Pro'}
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${statusColors[booking.status] || statusColors.pending}`}>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                            </div>

                            <p className="text-sm text-text-secondary line-clamp-2">{booking.description}</p>

                            <div className="flex items-center gap-4 text-xs text-text-secondary">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    {formatDate(booking.scheduledDate)}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={14} />
                                    {formatTime(booking.scheduledDate)}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={14} />
                                    <span className="truncate max-w-[120px]">{booking.address}</span>
                                </div>
                            </div>

                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 border-red-200 hover:bg-red-50 self-start"
                                    onClick={() => handleCancel(booking._id)}
                                >
                                    <XCircle size={14} className="mr-1" /> Cancel
                                </Button>
                            )}

                            {/* Live Tracking / Route for active bookings */}
                            {(booking.status === 'confirmed' || booking.status === 'in-progress') && (
                                <div className="flex flex-col gap-3 mt-1">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setTrackingBookingId(trackingBookingId === booking._id ? null : booking._id)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                                trackingBookingId === booking._id
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
                                            }`}
                                        >
                                            <Navigation size={16} />
                                            {trackingBookingId === booking._id ? 'Tracking Live...' : 'Track Worker Live'}
                                        </button>
                                    </div>

                                    {/* Live tracking map */}
                                    {trackingBookingId === booking._id && (
                                        <LiveTrackingMap
                                            workerId={booking.worker?._id}
                                            workerName={booking.worker?.name || 'Worker'}
                                            customerPosition={userPosition}
                                            destinationPosition={booking.coordinates?.lat ? booking.coordinates : null}
                                            bookingId={booking._id}
                                            height="300px"
                                            mode="customer"
                                        />
                                    )}

                                    {/* Static route (if worker + customer coordinates available) */}
                                    {trackingBookingId !== booking._id && booking.worker?.coordinates?.lat && userPosition && (
                                        <RouteMap
                                            from={{ lat: booking.worker.coordinates.lat, lng: booking.worker.coordinates.lng, label: `🔧 ${booking.worker.name}` }}
                                            to={{ lat: userPosition.lat, lng: userPosition.lng, label: '📍 Your Location' }}
                                            height="200px"
                                            showDirections={false}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Bookings;

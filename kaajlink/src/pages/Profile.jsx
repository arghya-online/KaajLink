import React, { useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { Settings, HelpCircle, LogOut, ChevronRight, MapPin, CreditCard, User, Phone, Mail, Save } from 'lucide-react';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || ''
    });
    const [saving, setSaving] = useState(false);

    const menuItems = [
        { icon: MapPin, title: 'Saved Addresses' },
        { icon: CreditCard, title: 'Payment Methods' },
        { icon: Settings, title: 'Settings' },
        { icon: HelpCircle, title: 'Help & Support' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await updateProfile(editData);
            setIsEditing(false);
        } catch (error) {
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 md:p-8 flex flex-col pb-8 pt-6 max-w-2xl mx-auto w-full">
            <SectionHeader title="Profile" />

            <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm flex items-center gap-5 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-heading font-bold text-primary shadow-inner">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                    {isEditing ? (
                        <div className="flex flex-col gap-3">
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full h-10 pl-9 pr-3 bg-gray-50 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Name"
                                />
                            </div>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <input
                                    type="tel"
                                    value={editData.phone}
                                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                    className="w-full h-10 pl-9 pr-3 bg-gray-50 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Phone"
                                />
                            </div>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <input
                                    type="text"
                                    value={editData.address}
                                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                    className="w-full h-10 pl-9 pr-3 bg-gray-50 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Address"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="primary" size="sm" onClick={handleSaveProfile} disabled={saving}>
                                    <Save size={14} className="mr-1" /> {saving ? 'Saving...' : 'Save'}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xl font-heading font-bold text-text-primary">{user?.name || 'User'}</h2>
                            <p className="text-text-secondary text-sm flex items-center gap-1"><Mail size={12} /> {user?.email}</p>
                            {user?.phone && <p className="text-text-secondary text-sm flex items-center gap-1 mt-0.5"><Phone size={12} /> {user.phone}</p>}
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-semibold ${user?.isVerified ? 'bg-green-100/50 text-green-700 border border-green-200' : 'bg-yellow-100/50 text-yellow-700 border border-yellow-200'}`}>
                                    {user?.isVerified ? 'Verified User' : 'Unverified'}
                                </span>
                                <button onClick={() => { setEditData({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' }); setIsEditing(true); }} className="text-xs text-primary font-semibold hover:underline">
                                    Edit Profile
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm mb-6">
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={index}
                            className={`w-full flex items-center justify-between p-4 hover:bg-background transition-colors active:bg-border/50 group ${index !== menuItems.length - 1 ? 'border-b border-border/50' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors group-hover:bg-primary/5">
                                    <Icon size={20} />
                                </div>
                                <span className="font-medium text-text-primary text-sm">{item.title}</span>
                            </div>
                            <ChevronRight size={18} className="text-text-secondary group-hover:text-text-primary transition-colors" />
                        </button>
                    );
                })}
            </div>

            <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 mt-2" onClick={handleLogout}>
                <LogOut size={18} className="mr-2" />
                Log Out
            </Button>
        </div>
    );
};

export default Profile;

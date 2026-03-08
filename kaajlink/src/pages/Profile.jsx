import React from 'react';
import SectionHeader from '../components/SectionHeader';
import { Settings, HelpCircle, LogOut, ChevronRight, MapPin, CreditCard } from 'lucide-react';
import Button from '../components/Button';

const Profile = () => {
    const menuItems = [
        { icon: MapPin, title: 'Saved Addresses' },
        { icon: CreditCard, title: 'Payment Methods' },
        { icon: Settings, title: 'Settings' },
        { icon: HelpCircle, title: 'Help & Support' },
    ];

    return (
        <div className="p-4 md:p-8 flex flex-col pb-8 pt-6 max-w-2xl mx-auto w-full">
            <SectionHeader title="Profile" />

            <div className="bg-surface rounded-3xl border border-border p-6 shadow-sm flex items-center gap-5 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-heading font-bold text-primary shadow-inner">
                    A
                </div>
                <div>
                    <h2 className="text-xl font-heading font-bold text-text-primary">Arghya</h2>
                    <p className="text-text-secondary text-sm">arghya@example.com</p>
                    <span className="inline-block mt-2 text-xs bg-green-100/50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-semibold">Verified User</span>
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

            <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 mt-2">
                <LogOut size={18} className="mr-2" />
                Log Out
            </Button>
        </div>
    );
};

export default Profile;

import React, { useState } from 'react';
import { Menu, User, Search, Bell, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Navbar = () => {
    const [logoError, setLogoError] = useState(false);
    const { isAuthenticated, user } = useAuth();

    return (
        <header className="sticky top-0 h-[64px] bg-white z-[120] flex items-center justify-between px-4 md:px-8 border-b border-gray-100 shadow-sm w-full">
            {/* Left Side: Logo */}
            <Link to="/" className="flex items-center gap-2.5 active:scale-95 transition-transform">
                {!logoError ? (
                    <img
                        src={logo}
                        alt="KaajLink"
                        className="h-16 w-auto object-contain"
                        onError={() => setLogoError(true)}
                    />
                ) : <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                    K
                </div>}
            </Link>

            {/* Middle: Desktop Links */}
            <div className="hidden md:flex items-center space-x-6 text-sm flex-1 justify-end mr-6 font-medium text-text-secondary">
                <Link to="/" className="hover:text-primary transition-colors hover:bg-orange-50 px-3 py-1.5 rounded-md">Home</Link>
                <Link to="/services" className="hover:text-primary transition-colors hover:bg-orange-50 px-3 py-1.5 rounded-md">Services</Link>
                <Link to="/bookings" className="hover:text-primary transition-colors hover:bg-orange-50 px-3 py-1.5 rounded-md">Bookings</Link>
                <Link to="/worker/login" className="hover:text-primary transition-colors hover:bg-orange-50 px-3 py-1.5 rounded-md text-gray-400">Worker Portal</Link>
            </div>

            {/* Right Side: Icons */}
            <div className="flex items-center gap-1 sm:gap-3">
                <button className="p-2.5 text-text-secondary hover:bg-orange-50 hover:text-primary rounded-full transition-colors active:bg-orange-100">
                    <Search size={20} strokeWidth={2.5} />
                </button>
                <button className="p-2.5 text-text-secondary hover:bg-orange-50 hover:text-primary rounded-full transition-colors active:bg-orange-100 md:hidden relative">
                    <Bell size={20} strokeWidth={2.5} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border border-white"></span>
                </button>

                {isAuthenticated ? (
                    <Link to="/profile" className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-text-primary hover:border-primary/50 hover:bg-orange-50 hover:text-primary rounded-full font-semibold transition-all text-sm shadow-sm active:scale-95 cursor-pointer">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span>{user?.name?.split(' ')[0] || 'Profile'}</span>
                    </Link>
                ) : (
                    <Link to="/login" className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-[#ea580c] rounded-full font-semibold transition-all text-sm shadow-sm active:scale-95 cursor-pointer">
                        <LogIn size={16} strokeWidth={2.5} />
                        <span>Login</span>
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Navbar;

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen pb-[64px] md:pb-0 flex flex-col relative w-full max-w-[1200px] mx-auto bg-white text-text-primary">
            <Navbar />

            <main className="flex-1 w-full relative">
                <Outlet />
                {children}
            </main>

            <BottomNav />
        </div>
    );
};

export default MainLayout;

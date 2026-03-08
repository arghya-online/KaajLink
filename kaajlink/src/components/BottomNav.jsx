import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Calendar, User } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const BottomNav = () => {
    const navItems = [
        { name: 'Home', icon: Home, route: '/' },
        { name: 'Services', icon: Grid, route: '/services' },
        { name: 'Bookings', icon: Calendar, route: '/bookings' },
        { name: 'Profile', icon: User, route: '/profile' }
    ];

    return (
        <footer className="md:hidden fixed bottom-0 left-0 w-full h-[60px] bg-white border-t border-gray-100 flex justify-around items-center z-[100] px-1 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.03)] pb-[envs(safe-area-inset-bottom)]">
            {navItems.map((item) => {
                const Icon = item.icon;
                return (
                    <NavLink
                        key={item.name}
                        to={item.route}
                        className={({ isActive }) => twMerge(
                            clsx(
                                "flex flex-col items-center justify-center w-[20%] h-full gap-[2px] transition-all relative pt-1",
                                isActive ? "text-primary" : "text-text-secondary hover:text-text-primary"
                            )
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <div className={clsx("transition-transform duration-200", isActive ? "-translate-y-0.5" : "")}>
                                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "fill-primary/20" : ""} />
                                </div>
                                <span className={clsx("text-[10px] tracking-tight transition-all", isActive ? "font-bold" : "font-medium")}>
                                    {item.name}
                                </span>
                                {isActive && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b-full"></div>
                                )}
                            </>
                        )}
                    </NavLink>
                );
            })}
        </footer>
    );
};

export default BottomNav;

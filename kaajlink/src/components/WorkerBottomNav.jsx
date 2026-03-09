import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, IndianRupee, Settings } from 'lucide-react';

const WorkerBottomNav = () => {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, route: '/worker' },
    { name: 'Jobs', icon: Briefcase, route: '/worker/jobs' },
    { name: 'Earnings', icon: IndianRupee, route: '/worker/earnings' },
    { name: 'Settings', icon: Settings, route: '/worker/settings' }
  ];

  return (
    <footer className="md:hidden fixed bottom-0 left-0 w-full h-[60px] bg-gray-800 border-t border-gray-700 flex justify-around items-center z-[100] px-1 shadow-[0_-4px_10px_rgba(0,0,0,0.3)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.name}
            to={item.route}
            end={item.route === '/worker'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-[25%] h-full gap-[2px] transition-all relative pt-1 ${
                isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`transition-transform duration-200 ${isActive ? '-translate-y-0.5' : ''}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'fill-primary/20' : ''} />
                </div>
                <span className={`text-[10px] tracking-tight transition-all ${isActive ? 'font-bold' : 'font-medium'}`}>
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

export default WorkerBottomNav;

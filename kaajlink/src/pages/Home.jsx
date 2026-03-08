import React from 'react';
import QuickServiceRequestCard from '../components/QuickServiceRequestCard';
import SectionHeader from '../components/SectionHeader';
import WorkerCard from '../components/WorkerCard';
import { workers } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Star } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    const handleRequestService = (worker) => {
        navigate(`/post-request?service=${worker.service}`);
    };

    return (
        <div className="flex flex-col gap-10 pb-[80px] md:pb-16 pt-4 bg-white min-h-screen">
            {/* Hero Section */}
            <section className="px-4 md:px-8">
                <div className="max-w-3xl mx-auto md:mx-0 mb-6">
                    <h1 className="text-[28px] md:text-5xl font-extrabold text-text-primary tracking-tight leading-[1.15] mb-3">
                        Local services,<br />
                        <span className="text-primary">
                            delivered securely.
                        </span>
                    </h1>
                    <p className="text-text-secondary text-sm md:text-lg font-medium max-w-xl">
                        Discover trusted professionals for home maintenance.
                    </p>
                </div>

                <div className="relative z-10 w-full mb-2">
                    <QuickServiceRequestCard />
                </div>
            </section>

            {/* Top Workers */}
            <section className="px-4 md:px-8">
                <SectionHeader
                    title="Highly Rated Pros"
                    action={() => navigate('/services')}
                    actionLabel="See all"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {workers.slice(0, 4).map(worker => (
                        <div key={worker.id} className="transition-transform hover:-translate-y-0.5 duration-200">
                            <WorkerCard
                                worker={worker}
                                onRequest={handleRequestService}
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* Trust Banner (Mobile Friendly) */}
            <section className="px-4 md:px-8 pb-4">
                <div className="bg-orange-50 rounded-[20px] p-5 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-orange-100">
                    <div className="md:w-full flex justify-between flex-col md:flex-row gap-5">
                        <div>
                            <h2 className="text-lg md:text-2xl font-bold mb-1 text-text-primary">The KaajLink Standard</h2>
                            <p className="text-text-secondary text-[13px] md:text-base leading-relaxed max-w-md">
                                All providers pass strict background checks.
                            </p>
                        </div>
                        <div className="flex flex-row gap-3 md:gap-6 shrink-0 pt-1">
                            <div className="flex items-center gap-2 bg-white py-1.5 px-3 rounded-lg shadow-sm border border-gray-100">
                                <ShieldCheck size={16} className="text-primary" />
                                <span className="font-semibold text-text-primary text-[11px] md:text-sm">Vetted Pros</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white py-1.5 px-3 rounded-lg shadow-sm border border-gray-100">
                                <Star size={16} className="text-primary" />
                                <span className="font-semibold text-text-primary text-[11px] md:text-sm">Top Rated</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

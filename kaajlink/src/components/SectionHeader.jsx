import React from 'react';

const SectionHeader = ({ title, action, actionLabel }) => {
    return (
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-text-primary tracking-tight">
                {title}
            </h2>
            {action && actionLabel && (
                <button
                    onClick={action}
                    className="text-primary font-medium text-sm hover:underline underline-offset-4 decoration-primary/30 transition-all"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default SectionHeader;

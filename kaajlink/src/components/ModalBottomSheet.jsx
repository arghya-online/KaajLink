import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const ModalBottomSheet = ({ isOpen, onClose, title, children }) => {
    const [isRendered, setIsRendered] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timeoutId = setTimeout(() => setIsRendered(false), 300);
            document.body.style.overflow = '';
            return () => clearTimeout(timeoutId);
        }
    }, [isOpen]);

    if (!isOpen && !isRendered) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-center items-end sm:items-center">
            <div
                className={twMerge(
                    clsx(
                        "fixed inset-0 bg-black/40 transition-opacity backdrop-blur-sm",
                        isOpen ? "opacity-100" : "opacity-0"
                    )
                )}
                onClick={onClose}
            />
            <div
                className={twMerge(
                    clsx(
                        "relative w-full sm:w-[480px] bg-surface rounded-t-3xl sm:rounded-2xl pb-safe flex flex-col transition-transform duration-300 ease-out sm:scale-100 border-t sm:border border-border",
                        isOpen ? "translate-y-0" : "translate-y-full sm:translate-y-4 sm:opacity-0"
                    )
                )}
            >
                <div className="flex justify-center pt-3 pb-2 sm:hidden">
                    <div className="w-12 h-1.5 bg-border rounded-full" />
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-xl font-heading font-semibold text-text-primary">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-text-secondary hover:bg-background rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[80vh]">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ModalBottomSheet;

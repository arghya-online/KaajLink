import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none rounded-lg active:scale-[0.98]";

    const variants = {
        primary: "bg-primary text-white hover:bg-[#ea580c] shadow-sm",
        secondary: "bg-orange-50 text-primary hover:bg-orange-100 font-bold",
        outline: "border border-border text-text-primary bg-transparent hover:bg-gray-50 hover:border-gray-300",
        ghost: "text-text-secondary hover:bg-gray-50 hover:text-text-primary"
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base"
    };

    return (
        <button
            className={twMerge(
                clsx(baseStyles, variants[variant], sizes[size], fullWidth && "w-full", className)
            )}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;

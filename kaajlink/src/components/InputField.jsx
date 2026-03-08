import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

const InputField = forwardRef(({
    label,
    error,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className,
    wrapperClassName,
    ...props
}, ref) => {
    return (
        <div className={twMerge(clsx("flex flex-col gap-1.5 w-full", wrapperClassName))}>
            {label && (
                <label className="text-sm font-medium text-text-primary">
                    {label}
                </label>
            )}
            <div className="relative w-full">
                {LeftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                        <LeftIcon size={20} />
                    </div>
                )}
                <input
                    ref={ref}
                    className={twMerge(
                        clsx(
                            "w-full h-12 bg-surface text-base text-text-primary placeholder:text-text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-background disabled:cursor-not-allowed border border-border rounded-xl",
                            LeftIcon ? "pl-10" : "pl-4",
                            RightIcon ? "pr-10" : "pr-4",
                            error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
                            className
                        )
                    )}
                    {...props}
                />
                {RightIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
                        <RightIcon size={20} />
                    </div>
                )}
            </div>
            {error && (
                <span className="text-xs text-red-500 mt-0.5">{error}</span>
            )}
        </div>
    );
});

InputField.displayName = 'InputField';

export default InputField;

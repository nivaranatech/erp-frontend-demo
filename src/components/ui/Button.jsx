import React from 'react';
import { cn } from '../../lib/utils';

export function Button({ className, variant = "primary", size = "md", children, ...props }) {
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
        secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
        outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:pointer-events-none",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ className, variant = "default", children, ...props }) {
    const variants = {
        default: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
        primary: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
        success: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200",
        warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200",
        danger: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}

import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }) {
    return (
        <div className={cn("bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm", className)} {...props}>
            {children}
        </div>
    );
}

export function CardHeader({ className, children, ...props }) {
    return (
        <div className={cn("p-6 border-b border-slate-100 dark:border-slate-800", className)} {...props}>
            {children}
        </div>
    );
}

export function CardTitle({ className, children, ...props }) {
    return (
        <h3 className={cn("text-lg font-semibold text-slate-900 dark:text-slate-100", className)} {...props}>
            {children}
        </h3>
    );
}

export function CardDescription({ className, children, ...props }) {
    return (
        <p className={cn("text-sm text-slate-500 dark:text-slate-400", className)} {...props}>
            {children}
        </p>
    );
}

export function CardContent({ className, children, ...props }) {
    return (
        <div className={cn("p-6", className)} {...props}>
            {children}
        </div>
    );
}

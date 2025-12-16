import React from 'react';
import { cn } from '../../lib/utils';

export function Table({ className, children, ...props }) {
    return (
        <div className="w-full overflow-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <table className={cn("w-full caption-bottom text-sm text-left", className)} {...props}>
                {children}
            </table>
        </div>
    );
}

export function TableHeader({ className, children, ...props }) {
    return (
        <thead className={cn("[&_tr]:border-b bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800", className)} {...props}>
            {children}
        </thead>
    );
}

export function TableBody({ className, children, ...props }) {
    return (
        <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props}>
            {children}
        </tbody>
    );
}

export function TableRow({ className, children, ...props }) {
    return (
        <tr
            className={cn(
                "border-b transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800/50 dark:data-[state=selected]:bg-slate-800",
                className
            )}
            {...props}
        >
            {children}
        </tr>
    );
}

export function TableHead({ className, children, ...props }) {
    return (
        <th
            className={cn(
                "h-12 px-4 text-left align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0 dark:text-slate-400",
                className
            )}
            {...props}
        >
            {children}
        </th>
    );
}

export function TableCell({ className, children, ...props }) {
    return (
        <td
            className={cn(
                "p-4 align-middle [&:has([role=checkbox])]:pr-0",
                className
            )}
            {...props}
        >
            {children}
        </td>
    );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings, Sun, Moon, Menu } from 'lucide-react';
import { useSessionData } from '../contexts/SessionDataContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Header({ onMenuClick }) {
    const navigate = useNavigate();
    const { getUnreadNotificationCount, currentUser } = useSessionData();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const unreadCount = getUnreadNotificationCount();

    return (
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 fixed top-0 right-0 left-0 lg:left-64 z-10 flex items-center justify-between lg:justify-end px-4 lg:px-8 shadow-sm transition-colors">
            <div className="flex items-center gap-4 lg:hidden">
                <button
                    onClick={onMenuClick}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded-md" />
                    <span className="font-bold text-slate-900 dark:text-white">Premium IT</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                    title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Show notifications only for admins */}
                {currentUser?.isAdmin && (
                    <button
                        onClick={() => navigate('/app/notifications')}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors relative"
                        title="Notifications"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full px-1">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                )}
                <button
                    onClick={() => navigate('/app/settings')}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}


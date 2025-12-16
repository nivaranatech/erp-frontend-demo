import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Building2,
    Package,
    Wrench,
    Layers,
    FileText,
    ShoppingCart,
    Shield,
    RefreshCcw,
    Calendar,
    ClipboardList,
    Warehouse,
    LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSessionData } from '../contexts/SessionDataContext';

// Nav items with permission mapping
const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/app', permissionId: 'dashboard' },
    { icon: Users, label: 'User Management', path: '/app/users', permissionId: 'user_management' },
    { icon: Building2, label: 'Departments', path: '/app/departments', permissionId: 'departments' },
    { icon: Package, label: 'Item Master', path: '/app/items', permissionId: 'item_master' },
    { icon: Wrench, label: 'Service Addons', path: '/app/addons', permissionId: 'service_addons' },
    { icon: Layers, label: 'Combinations', path: '/app/combinations', permissionId: 'combinations' },
    { icon: FileText, label: 'Estimates', path: '/app/estimates', permissionId: 'estimates' },
    { icon: ShoppingCart, label: 'Orders', path: '/app/orders', permissionId: 'orders' },
    { icon: Shield, label: 'AMC Contracts', path: '/app/amc', permissionId: 'amc_contracts' },
    { icon: ClipboardList, label: 'Complaints/Jobs', path: '/app/complaints', permissionId: 'complaints_jobs' },
    { icon: RefreshCcw, label: 'Replacements (RMA)', path: '/app/rma', permissionId: 'rma' },
    { icon: Warehouse, label: 'Stock Inventory', path: '/app/stock-inventory', permissionId: 'stock_inventory' },
    { icon: Calendar, label: 'HR & Leave', path: '/app/hr', permissionId: 'hr_leave' },
];

export default function Sidebar({ isOpen, onClose }) {
    const navigate = useNavigate();
    const { currentUser, logoutUser } = useSessionData();

    // Close sidebar on route change (mobile)
    React.useEffect(() => {
        if (window.innerWidth < 1024) {
            onClose?.();
        }
    }, [window.location.pathname]);

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    // Get user initials for avatar
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Check if user has permission for a module
    const hasPermission = (permissionId) => {
        // Admin has access to all modules
        if (currentUser?.isAdmin) return true;
        // Check if user has the specific permission
        return currentUser?.permissions?.includes(permissionId) || currentUser?.selectedPermissions?.includes(permissionId);
    };

    // Filter nav items based on user permissions
    const filteredNavItems = navItems.filter(item => {
        if (item.alwaysShow) return true; // Always show items like Notifications
        if (!item.permissionId) return true; // Show if no permission required
        return hasPermission(item.permissionId);
    });

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 overflow-y-auto border-r border-slate-800 flex flex-col z-50 transition-transform duration-300 ease-in-out",
                "lg:translate-x-0", // Always visible on desktop
                isOpen ? "translate-x-0" : "-translate-x-full" // Toggle on mobile
            )}>
                <div className="p-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.jpg"
                            alt="Premium IT Park"
                            className="w-12 h-12 rounded-lg object-contain bg-white"
                        />
                        <div>
                            <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-300 bg-clip-text text-transparent">
                                Premium IT Park
                            </h1>
                            <p className="text-xs text-slate-400">Service & Sales ERP</p>
                        </div>
                    </div>
                </div>
                <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                    {filteredNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium flex-1">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* User Info & Logout */}
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/50 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold">
                            {getInitials(currentUser?.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {currentUser?.name || 'Guest User'}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                                {currentUser?.email || 'Not logged in'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 hover:text-red-300 transition-colors font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}


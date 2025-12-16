import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    AlertCircle,
    FileText,
    Users,
    Package,
    ArrowRight,
    IndianRupee,
    Shield,
    RefreshCcw,
    Warehouse,
    ClipboardList,
    Calendar,
    CheckCircle,
    Clock,
    AlertTriangle,
    Wrench
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useSessionData } from '../contexts/SessionDataContext';

export default function Dashboard() {
    const {
        orders,
        estimates,
        complaints,
        rmaItems,
        amcContracts,
        items,
        users,
        getLowStockItems,
        getStockValuation,
        stockTransactions,
        currentUser
    } = useSessionData();

    // Check if user has permission for a module
    const hasPermission = (permissionId) => {
        if (currentUser?.isAdmin) return true;
        return currentUser?.permissions?.includes(permissionId) || currentUser?.selectedPermissions?.includes(permissionId);
    };

    // Calculate live statistics
    const stats = useMemo(() => {
        // Orders stats
        const totalOrderValue = orders.reduce((sum, o) => sum + (o.total || o.grandTotal || 0), 0);
        const pendingOrders = orders.filter(o => o.paymentStatus === 'Pending' || o.paymentStatus === 'Partial').length;
        const completedOrders = orders.filter(o => o.status === 'Completed').length;

        // Estimates stats
        const pendingEstimates = estimates.filter(e => e.status === 'Pending' || e.status === 'Draft').length;
        const totalEstimateValue = estimates.reduce((sum, e) => sum + (e.total || e.grandTotal || 0), 0);

        // Complaints/Jobs stats
        const openComplaints = complaints.filter(c =>
            c.status === 'Open' || c.status === 'In Progress' || c.status === 'Pending Parts'
        ).length;
        const inProgressJobs = complaints.filter(c => c.status === 'In Progress').length;
        const completedJobs = complaints.filter(c => c.status === 'Completed' || c.status === 'Delivered').length;

        // RMA stats
        const activeRMA = rmaItems.filter(r => r.status !== 'Delivered').length;
        const rmaInbox = rmaItems.filter(r => r.status === 'Inbox').length;

        // AMC stats
        const activeAMC = amcContracts.filter(a => {
            if (!a.endDate) return false;
            return new Date(a.endDate) >= new Date();
        }).length;
        const expiringAMC = amcContracts.filter(a => {
            if (!a.endDate) return false;
            const endDate = new Date(a.endDate);
            const monthFromNow = new Date();
            monthFromNow.setMonth(monthFromNow.getMonth() + 1);
            return endDate >= new Date() && endDate <= monthFromNow;
        }).length;

        // Stock stats
        const lowStockItems = getLowStockItems?.() || [];
        const stockValuation = getStockValuation?.('FIFO') || { totalValue: 0 };
        const issuedStock = stockTransactions?.filter(t => t.status === 'issued').length || 0;

        // User stats
        const activeUsers = users.filter(u => u.status === 'Active').length;
        const engineers = users.filter(u => u.role === 'Engineer').length;

        return {
            totalOrderValue,
            pendingOrders,
            completedOrders,
            pendingEstimates,
            totalEstimateValue,
            openComplaints,
            inProgressJobs,
            completedJobs,
            activeRMA,
            rmaInbox,
            activeAMC,
            expiringAMC,
            lowStockCount: lowStockItems.length,
            stockValue: stockValuation.totalValue,
            issuedStock,
            activeUsers,
            engineers,
            totalItems: items.length
        };
    }, [orders, estimates, complaints, rmaItems, amcContracts, items, users, getLowStockItems, getStockValuation, stockTransactions]);

    // Recent orders from data
    const recentOrders = useMemo(() => {
        return [...orders]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 4);
    }, [orders]);

    // Active jobs from data
    const activeJobs = useMemo(() => {
        return [...complaints]
            .filter(c => c.status !== 'Completed' && c.status !== 'Delivered' && c.status !== 'Cancelled')
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 4);
    }, [complaints]);

    // Low stock items
    const lowStockItems = useMemo(() => {
        return getLowStockItems?.()?.slice(0, 5) || [];
    }, [getLowStockItems]);

    // Recent RMAs
    const recentRMA = useMemo(() => {
        return [...rmaItems]
            .filter(r => r.status !== 'Delivered')
            .slice(0, 3);
    }, [rmaItems]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const getStatusVariant = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'delivered':
            case 'paid':
                return 'success';
            case 'pending':
            case 'in progress':
            case 'partial':
                return 'warning';
            case 'open':
            case 'inbox':
                return 'primary';
            case 'cancelled':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    // Get greeting based on user role
    const getGreeting = () => {
        if (currentUser?.isAdmin) {
            return "Welcome back, Admin! Here's your business overview.";
        }
        const firstName = currentUser?.name?.split(' ')[0] || 'User';
        return `Welcome, ${firstName}! Here's your dashboard.`;
    };

    return (
        <div className="space-y-6">
            {/* Header with greeting */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{getGreeting()}</p>
                    {!currentUser?.isAdmin && (
                        <p className="text-xs text-blue-600 mt-1">Showing modules based on your permissions</p>
                    )}
                </div>
                <div className="text-right text-slate-500 text-sm">
                    <p>{new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            {/* Primary Stats - Revenue & Key Metrics (filtered by permission) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {hasPermission('orders') && (
                    <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-emerald-100 text-sm font-medium">Total Orders Value</p>
                                    <h3 className="text-2xl font-bold mt-1">{formatCurrency(stats.totalOrderValue)}</h3>
                                    <div className="flex items-center gap-1 mt-2">
                                        <TrendingUp className="w-4 h-4 text-emerald-200" />
                                        <span className="text-xs text-emerald-200">{orders.length} orders total</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <IndianRupee className="w-7 h-7" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {hasPermission('stock_inventory') && (
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Stock Value</p>
                                    <h3 className="text-2xl font-bold mt-1">{formatCurrency(stats.stockValue)}</h3>
                                    <div className="flex items-center gap-1 mt-2">
                                        <Package className="w-4 h-4 text-blue-200" />
                                        <span className="text-xs text-blue-200">{stats.totalItems} items in inventory</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Warehouse className="w-7 h-7" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {hasPermission('complaints_jobs') && (
                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">Open Jobs</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.openComplaints}</h3>
                                    <div className="flex items-center gap-1 mt-2">
                                        <Clock className="w-4 h-4 text-purple-200" />
                                        <span className="text-xs text-purple-200">{stats.inProgressJobs} in progress</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Wrench className="w-7 h-7" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {hasPermission('estimates') && (
                    <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-amber-100 text-sm font-medium">Pending Estimates</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.pendingEstimates}</h3>
                                    <div className="flex items-center gap-1 mt-2">
                                        <TrendingUp className="w-4 h-4 text-amber-200" />
                                        <span className="text-xs text-amber-200">{formatCurrency(stats.totalEstimateValue)}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <FileText className="w-7 h-7" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Secondary Stats Row (filtered by permission) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {hasPermission('amc_contracts') && (
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Shield className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Active AMC</p>
                                <p className="text-lg font-bold text-slate-900">{stats.activeAMC}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {hasPermission('rma') && (
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <RefreshCcw className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Active RMA</p>
                                <p className="text-lg font-bold text-slate-900">{stats.activeRMA}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {hasPermission('stock_inventory') && (
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Low Stock</p>
                                <p className="text-lg font-bold text-slate-900">{stats.lowStockCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {hasPermission('user_management') && (
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 bg-teal-100 rounded-lg">
                                <Users className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Engineers</p>
                                <p className="text-lg font-bold text-slate-900">{stats.engineers}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {hasPermission('orders') && (
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <ShoppingCart className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Pending Orders</p>
                                <p className="text-lg font-bold text-slate-900">{stats.pendingOrders}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {hasPermission('complaints_jobs') && (
                    <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 bg-cyan-100 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Jobs Done</p>
                                <p className="text-lg font-bold text-slate-900">{stats.completedJobs}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Quick Actions (filtered by permission) */}
            <Card className="border-slate-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {hasPermission('estimates') && (
                            <Link to="/app/estimates">
                                <Button variant="outline" className="w-full h-auto py-3 flex-col gap-2 hover:bg-blue-50 hover:border-blue-300">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    <span className="text-xs">New Estimate</span>
                                </Button>
                            </Link>
                        )}
                        {hasPermission('orders') && (
                            <Link to="/app/orders">
                                <Button variant="outline" className="w-full h-auto py-3 flex-col gap-2 hover:bg-emerald-50 hover:border-emerald-300">
                                    <ShoppingCart className="w-5 h-5 text-emerald-600" />
                                    <span className="text-xs">New Order</span>
                                </Button>
                            </Link>
                        )}
                        {hasPermission('complaints_jobs') && (
                            <Link to="/app/complaints">
                                <Button variant="outline" className="w-full h-auto py-3 flex-col gap-2 hover:bg-purple-50 hover:border-purple-300">
                                    <ClipboardList className="w-5 h-5 text-purple-600" />
                                    <span className="text-xs">New Job</span>
                                </Button>
                            </Link>
                        )}
                        {hasPermission('amc_contracts') && (
                            <Link to="/app/amc">
                                <Button variant="outline" className="w-full h-auto py-3 flex-col gap-2 hover:bg-green-50 hover:border-green-300">
                                    <Shield className="w-5 h-5 text-green-600" />
                                    <span className="text-xs">New AMC</span>
                                </Button>
                            </Link>
                        )}
                        {hasPermission('rma') && (
                            <Link to="/app/rma">
                                <Button variant="outline" className="w-full h-auto py-3 flex-col gap-2 hover:bg-orange-50 hover:border-orange-300">
                                    <RefreshCcw className="w-5 h-5 text-orange-600" />
                                    <span className="text-xs">New RMA</span>
                                </Button>
                            </Link>
                        )}
                        {hasPermission('stock_inventory') && (
                            <Link to="/app/stock-inventory">
                                <Button variant="outline" className="w-full h-auto py-3 flex-col gap-2 hover:bg-teal-50 hover:border-teal-300">
                                    <Warehouse className="w-5 h-5 text-teal-600" />
                                    <span className="text-xs">Issue Stock</span>
                                </Button>
                            </Link>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Grid (filtered by permission) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders */}
                {hasPermission('orders') && (
                    <Card className="lg:col-span-2 border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-lg">Recent Orders</CardTitle>
                            <Link to="/app/orders">
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                    View All <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentOrders.length === 0 ? (
                                    <p className="text-center text-slate-500 py-4">No orders yet</p>
                                ) : (
                                    recentOrders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg border border-slate-200">
                                                    <ShoppingCart className="w-4 h-4 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{order.customer || order.customerName}</p>
                                                    <p className="text-xs text-slate-500 font-mono">{order.id}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-slate-900">{formatCurrency(order.total || order.grandTotal)}</p>
                                                <Badge variant={getStatusVariant(order.paymentStatus)} className="mt-1">
                                                    {order.paymentStatus}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Alerts & Notifications */}
                <Card className={`border-l-4 border-l-amber-500 ${!hasPermission('orders') ? 'lg:col-span-3' : ''}`}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {hasPermission('stock_inventory') && stats.lowStockCount > 0 && (
                                <Link to="/app/stock-inventory" className="block p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-100">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-red-600" />
                                        <span className="font-medium text-red-700">{stats.lowStockCount} items low on stock</span>
                                    </div>
                                </Link>
                            )}
                            {hasPermission('orders') && stats.pendingOrders > 0 && (
                                <Link to="/app/orders" className="block p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors border border-amber-100">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-amber-600" />
                                        <span className="font-medium text-amber-700">{stats.pendingOrders} orders pending payment</span>
                                    </div>
                                </Link>
                            )}
                            {hasPermission('amc_contracts') && stats.expiringAMC > 0 && (
                                <Link to="/app/amc" className="block p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors border border-orange-100">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-orange-600" />
                                        <span className="font-medium text-orange-700">{stats.expiringAMC} AMCs expiring soon</span>
                                    </div>
                                </Link>
                            )}
                            {hasPermission('rma') && stats.rmaInbox > 0 && (
                                <Link to="/app/rma" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100">
                                    <div className="flex items-center gap-2">
                                        <RefreshCcw className="w-4 h-4 text-blue-600" />
                                        <span className="font-medium text-blue-700">{stats.rmaInbox} RMAs in inbox</span>
                                    </div>
                                </Link>
                            )}
                            {((!hasPermission('stock_inventory') || stats.lowStockCount === 0) &&
                                (!hasPermission('orders') || stats.pendingOrders === 0) &&
                                (!hasPermission('amc_contracts') || stats.expiringAMC === 0) &&
                                (!hasPermission('rma') || stats.rmaInbox === 0)) && (
                                    <div className="p-4 text-center text-slate-500">
                                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                                        <p>All clear! No alerts.</p>
                                    </div>
                                )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Grid (filtered by permission) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Jobs */}
                {hasPermission('complaints_jobs') && (
                    <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-lg">Active Jobs</CardTitle>
                            <Link to="/app/complaints">
                                <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                                    View All <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {activeJobs.length === 0 ? (
                                    <p className="text-center text-slate-500 py-4">No active jobs</p>
                                ) : (
                                    activeJobs.map((job) => (
                                        <div key={job.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                            <div>
                                                <p className="font-medium text-slate-900">{job.customer || job.customerName}</p>
                                                <p className="text-sm text-slate-600">{job.device || job.deviceModel}</p>
                                                <p className="text-xs text-slate-500 font-mono mt-1">{job.id}</p>
                                            </div>
                                            <Badge variant={getStatusVariant(job.status)}>
                                                {job.status}
                                            </Badge>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Low Stock Items */}
                {hasPermission('stock_inventory') && (
                    <Card className="border-l-4 border-l-red-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                Low Stock Items
                            </CardTitle>
                            <Link to="/app/stock-inventory">
                                <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
                                    View All <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {lowStockItems.length === 0 ? (
                                    <div className="text-center py-4">
                                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                                        <p className="text-slate-500">All items properly stocked</p>
                                    </div>
                                ) : (
                                    lowStockItems.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                                            <div>
                                                <p className="font-medium text-slate-900">{item.name}</p>
                                                <p className="text-xs text-slate-500">{item.partId}</p>
                                            </div>
                                            <Badge variant="warning">
                                                {item.stockQty - (item.issuedQty || 0)} left
                                            </Badge>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}


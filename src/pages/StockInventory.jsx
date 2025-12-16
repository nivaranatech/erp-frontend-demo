import React, { useState, useMemo } from 'react';
import {
    Plus, Search, Package, Users, ArrowUpRight, ArrowDownLeft,
    AlertTriangle, RefreshCcw, BarChart3, FileText, Download,
    Warehouse, TrendingUp, CheckCircle, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '../components/ui/Table';
import { useSessionData } from '../contexts/SessionDataContext';
import { StockIssueModal } from '../components/StockIssueModal';
import { StockReturnModal } from '../components/StockReturnModal';

const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'issue', label: 'Issue Stock', icon: ArrowUpRight },
    { id: 'user-stock', label: 'User Stock', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: RefreshCcw },
    { id: 'reports', label: 'Reports', icon: FileText }
];

export default function StockInventory() {
    const {
        items,
        stockTransactions,
        stockSettings,
        getEngineers,
        getUserStock,
        getLowStockItems,
        getAvailableStock,
        getStockValuation,
        getStockSummaryByCategory
    } = useSessionData();

    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [valuationMethod, setValuationMethod] = useState('FIFO');

    // Modal states
    const [issueModalOpen, setIssueModalOpen] = useState(false);
    const [returnModalOpen, setReturnModalOpen] = useState(false);

    const engineers = useMemo(() => getEngineers(), [getEngineers]);
    const lowStockItems = useMemo(() => getLowStockItems(), [getLowStockItems]);
    const categoryStats = useMemo(() => getStockSummaryByCategory(), [getStockSummaryByCategory]);
    const valuation = useMemo(() => getStockValuation(valuationMethod), [getStockValuation, valuationMethod]);

    // Stats calculations
    const stats = useMemo(() => {
        const totalStockValue = valuation.totalValue;
        const totalItems = items.length;
        const totalIssuedQty = items.reduce((sum, item) => sum + (item.issuedQty || 0), 0);
        const activeTransactions = stockTransactions.filter(t => t.status === 'issued').length;

        return {
            totalStockValue,
            totalItems,
            totalIssuedQty,
            lowStockCount: lowStockItems.length,
            activeTransactions
        };
    }, [items, stockTransactions, valuation, lowStockItems]);

    // Filtered transactions
    const filteredTransactions = useMemo(() => {
        return stockTransactions.filter(t =>
            t.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.id?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [stockTransactions, searchTerm]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Stock-in-Hand Inventory</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage stock assignment, returns, and valuations</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setReturnModalOpen(true)} variant="secondary">
                        <ArrowDownLeft className="w-4 h-4 mr-2" />
                        Return Stock
                    </Button>
                    <Button onClick={() => setIssueModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                        <ArrowUpRight className="w-4 h-4 mr-2" />
                        Issue Stock
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600">
                    <CardContent className="p-4 text-white">
                        <div className="flex items-center gap-2 mb-1">
                            <Warehouse className="w-4 h-4 text-emerald-200" />
                            <p className="text-emerald-100 text-sm">Stock Value</p>
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(stats.totalStockValue)}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
                    <CardContent className="p-4 text-white">
                        <div className="flex items-center gap-2 mb-1">
                            <Package className="w-4 h-4 text-blue-200" />
                            <p className="text-blue-100 text-sm">Total Items</p>
                        </div>
                        <p className="text-2xl font-bold">{stats.totalItems}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600">
                    <CardContent className="p-4 text-white">
                        <div className="flex items-center gap-2 mb-1">
                            <ArrowUpRight className="w-4 h-4 text-purple-200" />
                            <p className="text-purple-100 text-sm">Issued Units</p>
                        </div>
                        <p className="text-2xl font-bold">{stats.totalIssuedQty}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500 to-amber-600">
                    <CardContent className="p-4 text-white">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="w-4 h-4 text-amber-200" />
                            <p className="text-amber-100 text-sm">Low Stock</p>
                        </div>
                        <p className="text-2xl font-bold">{stats.lowStockCount}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-teal-500 to-teal-600">
                    <CardContent className="p-4 text-white">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-teal-200" />
                            <p className="text-teal-100 text-sm">Active Issues</p>
                        </div>
                        <p className="text-2xl font-bold">{stats.activeTransactions}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id
                            ? 'border-emerald-600 text-emerald-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Low Stock Alerts */}
                    <Card className="border-l-4 border-l-amber-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-amber-600">
                                <AlertTriangle className="w-5 h-5" />
                                Low Stock Alerts ({lowStockItems.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lowStockItems.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                                    <p>All items are properly stocked</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {lowStockItems.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                                            <div>
                                                <p className="font-medium text-slate-900">{item.name}</p>
                                                <p className="text-xs text-slate-500">{item.partId}</p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="warning">
                                                    {getAvailableStock(item.id)} left
                                                </Badge>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Reorder at {item.reorderLevel || 5}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Category Summary */}
                    <Card className="border-l-4 border-l-emerald-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-emerald-600" />
                                Stock by Category
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {categoryStats.map(cat => (
                                    <div key={cat.category} className="p-3 bg-slate-50 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="font-medium text-slate-900">{cat.category}</p>
                                            <p className="text-sm text-emerald-600 font-semibold">
                                                {formatCurrency(cat.totalValue)}
                                            </p>
                                        </div>
                                        <div className="flex gap-4 text-xs text-slate-500">
                                            <span>{cat.totalItems} items</span>
                                            <span>{cat.totalStock} in stock</span>
                                            <span className="text-purple-600">{cat.totalIssued} issued</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'issue' && (
                <Card className="border-l-4 border-l-cyan-500">
                    <CardHeader>
                        <CardTitle>Stock Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search items..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Part ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Total Stock</TableHead>
                                    <TableHead className="text-right">Issued</TableHead>
                                    <TableHead className="text-right">Available</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items
                                    .filter(item =>
                                        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        item.partId?.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .slice(0, 20)
                                    .map((item) => {
                                        const available = getAvailableStock(item.id);
                                        const isLow = available <= (item.reorderLevel || 5);
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-mono text-xs">{item.partId}</TableCell>
                                                <TableCell>
                                                    <p className="font-medium">{item.name}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{item.category}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">{item.stockQty}</TableCell>
                                                <TableCell className="text-right text-purple-600">
                                                    {item.issuedQty || 0}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <span className={isLow ? 'text-amber-600 font-bold' : 'text-emerald-600'}>
                                                        {available}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setIssueModalOpen(true)}
                                                        disabled={available === 0}
                                                    >
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'user-stock' && (
                <Card className="border-l-4 border-l-teal-500">
                    <CardHeader>
                        <CardTitle>Stock with Engineers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {engineers.map(eng => {
                                const userStock = getUserStock(eng.id);
                                const totalQty = userStock.reduce((sum, item) => sum + item.quantity, 0);
                                return (
                                    <div key={eng.id} className="p-4 border border-slate-200 rounded-lg">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <Users className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{eng.name}</p>
                                                <p className="text-xs text-slate-500">{eng.department}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm text-slate-500">Items Held</span>
                                            <Badge variant={totalQty > 0 ? 'primary' : 'secondary'}>
                                                {totalQty} units
                                            </Badge>
                                        </div>
                                        {userStock.length > 0 && (
                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {userStock.map(item => (
                                                    <div key={item.itemId} className="flex justify-between text-sm p-2 bg-slate-50 rounded">
                                                        <span className="truncate">{item.itemName}</span>
                                                        <span className="text-emerald-600 font-medium ml-2">×{item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {userStock.length === 0 && (
                                            <p className="text-sm text-slate-400 text-center py-2">No stock assigned</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'transactions' && (
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Transaction History</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search transactions..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell className="font-mono text-xs">{t.id}</TableCell>
                                        <TableCell className="text-sm">{formatDate(t.date)}</TableCell>
                                        <TableCell>
                                            {t.type === 'issue' ? (
                                                <Badge variant="primary" className="flex items-center gap-1 w-fit">
                                                    <ArrowUpRight className="w-3 h-3" /> Issue
                                                </Badge>
                                            ) : (
                                                <Badge variant="success" className="flex items-center gap-1 w-fit">
                                                    <ArrowDownLeft className="w-3 h-3" /> Return
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-medium text-sm">{t.itemName}</p>
                                            <p className="text-xs text-slate-500">{t.itemSku}</p>
                                        </TableCell>
                                        <TableCell className="font-semibold">{t.quantity}</TableCell>
                                        <TableCell>
                                            <p className="text-sm">{t.userName}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={t.status === 'issued' ? 'warning' :
                                                    t.status === 'returned' ? 'success' :
                                                        t.status === 'used' ? 'primary' : 'secondary'}
                                            >
                                                {t.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'reports' && (
                <div className="space-y-6">
                    {/* Valuation Report */}
                    <Card className="border-l-4 border-l-emerald-500">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                                Stock Valuation Report
                            </CardTitle>
                            <div className="flex items-center gap-3">
                                <select
                                    value={valuationMethod}
                                    onChange={(e) => setValuationMethod(e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="FIFO">FIFO Method</option>
                                    <option value="LIFO">LIFO Method</option>
                                </select>
                                <Button variant="secondary" size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                <p className="text-sm text-emerald-700">Total Stock Value ({valuationMethod})</p>
                                <p className="text-3xl font-bold text-emerald-600">
                                    {formatCurrency(valuation.totalValue)}
                                </p>
                                <p className="text-xs text-emerald-600 mt-1">
                                    Calculated on {new Date(valuation.calculatedAt).toLocaleString('en-GB')}
                                </p>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Available</TableHead>
                                        <TableHead className="text-right">Unit Value</TableHead>
                                        <TableHead className="text-right">Total Value</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {valuation.items.slice(0, 15).map((item) => (
                                        <TableRow key={item.itemId}>
                                            <TableCell className="font-medium">{item.itemName}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{item.category}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">{item.availableQty}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.unitValue)}</TableCell>
                                            <TableCell className="text-right font-semibold text-emerald-600">
                                                {formatCurrency(item.totalValue)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modals */}
            <StockIssueModal
                isOpen={issueModalOpen}
                onClose={() => setIssueModalOpen(false)}
            />
            <StockReturnModal
                isOpen={returnModalOpen}
                onClose={() => setReturnModalOpen(false)}
            />
        </div>
    );
}

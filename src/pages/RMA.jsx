import React, { useState, useMemo } from 'react';
import {
    Plus, Search, RefreshCcw, Package, Truck, CheckCircle, Edit2, Trash2,
    ArrowRight, Printer, Eye, Key, AlertCircle, X, LayoutGrid, List,
    Inbox, Building2, Send, Clock
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
import { RMAModal } from '../components/RMAModal';
import { RMAPrint } from '../components/RMAPrint';

const RMA_STATUSES = ['Inbox', 'In-Company', 'Outbox', 'Delivered'];
const STATUS_FLOW = {
    'Inbox': 'In-Company',
    'In-Company': 'Outbox',
    'Outbox': 'Delivered',
    'Delivered': null
};

export default function RMA() {
    const {
        rmaItems,
        deleteRMA,
        updateRMAStatus,
        generateRMAOTP,
        verifyRMAOTP
    } = useSessionData();

    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [view, setView] = useState('kanban'); // 'kanban' or 'list'

    // Modal states
    const [rmaModalOpen, setRmaModalOpen] = useState(false);
    const [editingRMA, setEditingRMA] = useState(null);
    const [printingRMA, setPrintingRMA] = useState(null);
    const [printType, setPrintType] = useState('token');

    // OTP Verification states
    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [otpRMA, setOtpRMA] = useState(null);
    const [enteredOTP, setEnteredOTP] = useState('');
    const [generatedOTP, setGeneratedOTP] = useState('');
    const [otpError, setOtpError] = useState('');

    // Delete confirmation
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deletingRMA, setDeletingRMA] = useState(null);

    const filteredRMA = useMemo(() => {
        return rmaItems.filter(item => {
            const matchesSearch = item.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.partName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.serial?.toLowerCase().includes(searchTerm.toLowerCase());

            if (activeTab === 'all') return matchesSearch;
            return matchesSearch && item.status?.toLowerCase().replace(' ', '-') === activeTab;
        });
    }, [rmaItems, searchTerm, activeTab]);

    // Group RMA by status for Kanban view
    const groupByStatus = () => {
        const groups = {};
        RMA_STATUSES.forEach(status => {
            groups[status] = filteredRMA.filter(rma => rma.status === status);
        });
        return groups;
    };

    // Statistics
    const stats = useMemo(() => {
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);

        return {
            total: rmaItems.length,
            inbox: rmaItems.filter(r => r.status === 'Inbox').length,
            inCompany: rmaItems.filter(r => r.status === 'In-Company').length,
            outbox: rmaItems.filter(r => r.status === 'Outbox').length,
            deliveredThisMonth: rmaItems.filter(r =>
                r.status === 'Delivered' && new Date(r.deliveredDate) >= thisMonth
            ).length
        };
    }, [rmaItems]);

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'Inbox': return 'primary';
            case 'In-Company': return 'warning';
            case 'Outbox': return 'default';
            case 'Delivered': return 'success';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Inbox': return <Inbox className="w-5 h-5" />;
            case 'In-Company': return <Building2 className="w-5 h-5" />;
            case 'Outbox': return <Send className="w-5 h-5" />;
            case 'Delivered': return <CheckCircle className="w-5 h-5" />;
            default: return <Package className="w-5 h-5" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Inbox': return 'text-blue-600 bg-blue-50';
            case 'In-Company': return 'text-amber-600 bg-amber-50';
            case 'Outbox': return 'text-indigo-600 bg-indigo-50';
            case 'Delivered': return 'text-green-600 bg-green-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    const tabs = [
        { id: 'all', label: 'All', count: rmaItems.length },
        { id: 'inbox', label: 'Inbox', count: stats.inbox },
        { id: 'in-company', label: 'In-Company', count: stats.inCompany },
        { id: 'outbox', label: 'Outbox', count: stats.outbox },
        { id: 'delivered', label: 'Delivered', count: rmaItems.filter(r => r.status === 'Delivered').length }
    ];

    const handleEdit = (rma) => {
        setEditingRMA(rma);
        setRmaModalOpen(true);
    };

    const handleDelete = (rma) => {
        setDeletingRMA(rma);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (deletingRMA) {
            deleteRMA(deletingRMA.id);
        }
        setDeleteConfirmOpen(false);
        setDeletingRMA(null);
    };

    const handleNextStatus = (rma) => {
        const nextStatus = STATUS_FLOW[rma.status];
        if (nextStatus === 'Delivered') {
            // Need OTP verification for delivery
            handleOTPVerification(rma);
        } else if (nextStatus) {
            updateRMAStatus(rma.id, nextStatus);
        }
    };

    const handlePrint = (rma, type = 'token') => {
        setPrintingRMA(rma);
        setPrintType(type);
    };

    // OTP Verification
    const handleOTPVerification = (rma) => {
        // Generate OTP
        const otp = generateRMAOTP(rma.id);
        setGeneratedOTP(otp);
        setOtpRMA(rma);
        setEnteredOTP('');
        setOtpError('');
        setOtpModalOpen(true);
    };

    const handleVerifyOTP = () => {
        if (!enteredOTP || enteredOTP.length !== 4) {
            setOtpError('Please enter 4-digit OTP');
            return;
        }

        const result = verifyRMAOTP(otpRMA.id, enteredOTP);
        if (result.success) {
            updateRMAStatus(otpRMA.id, 'Delivered');
            setOtpModalOpen(false);
            setOtpRMA(null);
            setGeneratedOTP('');
        } else {
            setOtpError(result.message);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Replacements (RMA)</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage warranty replacements and returns</p>
                </div>
                <Button onClick={() => { setEditingRMA(null); setRmaModalOpen(true); }} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New RMA
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600">
                    <CardContent className="p-4 text-white">
                        <p className="text-purple-100 text-sm">Total RMAs</p>
                        <p className="text-3xl font-bold">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
                    <CardContent className="p-4 text-white">
                        <div className="flex items-center gap-2">
                            <Inbox className="w-5 h-5 text-blue-200" />
                            <p className="text-blue-100 text-sm">Inbox</p>
                        </div>
                        <p className="text-3xl font-bold">{stats.inbox}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500 to-amber-600">
                    <CardContent className="p-4 text-white">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-amber-200" />
                            <p className="text-amber-100 text-sm">In-Company</p>
                        </div>
                        <p className="text-3xl font-bold">{stats.inCompany}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600">
                    <CardContent className="p-4 text-white">
                        <div className="flex items-center gap-2">
                            <Send className="w-5 h-5 text-indigo-200" />
                            <p className="text-indigo-100 text-sm">Ready (Outbox)</p>
                        </div>
                        <p className="text-3xl font-bold">{stats.outbox}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500 to-green-600">
                    <CardContent className="p-4 text-white">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-200" />
                            <p className="text-green-100 text-sm">This Month</p>
                        </div>
                        <p className="text-3xl font-bold">{stats.deliveredThisMonth}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === tab.id
                            ? 'border-purple-600 text-purple-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* View Toggle & Search */}
            <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-2 w-full max-w-sm">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search RMA..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={view === 'kanban' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setView('kanban')}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={view === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setView('list')}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* List View */}
                    {view === 'list' && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>RMA ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Part Name</TableHead>
                                    <TableHead>Serial No</TableHead>
                                    <TableHead>Service Center</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Charge</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRMA.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-mono text-xs text-slate-500">
                                            {item.id}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-slate-900">{item.customer}</p>
                                                <p className="text-xs text-slate-500">{item.mobile}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-medium text-slate-900">{item.partName}</p>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-slate-500">
                                            {item.serial}
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-600">
                                            {item.serviceCenter}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(item.status)}
                                                <Badge variant={getStatusBadgeVariant(item.status)}>
                                                    {item.status}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {item.replacementCharge === 0 ? (
                                                <span className="text-green-600 font-medium">Free</span>
                                            ) : (
                                                <span>₹ {item.replacementCharge}</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {STATUS_FLOW[item.status] && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        title={`Move to ${STATUS_FLOW[item.status]}`}
                                                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                                        onClick={() => handleNextStatus(item)}
                                                    >
                                                        <ArrowRight className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="sm" title="Print Token" onClick={() => handlePrint(item, 'token')}>
                                                    <Printer className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" title="Edit" onClick={() => handleEdit(item)}>
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" title="Delete" onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}

                    {/* Kanban View */}
                    {view === 'kanban' && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {Object.entries(groupByStatus()).map(([status, items]) => (
                                <div key={status} className="space-y-3">
                                    <h3 className={`font-semibold flex items-center gap-2 sticky top-0 py-2 px-3 rounded-lg ${getStatusColor(status)}`}>
                                        {getStatusIcon(status)}
                                        {status} ({items.length})
                                    </h3>
                                    <div className="space-y-2 min-h-[200px]">
                                        {items.map((rma) => (
                                            <Card
                                                key={rma.id}
                                                className="p-3 hover:shadow-md transition-shadow border-l-4"
                                                style={{
                                                    borderLeftColor: status === 'Inbox' ? '#3b82f6' :
                                                        status === 'In-Company' ? '#f59e0b' :
                                                            status === 'Outbox' ? '#6366f1' : '#22c55e'
                                                }}
                                            >
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-mono text-xs text-slate-500">{rma.id}</span>
                                                        {rma.replacementCharge > 0 ? (
                                                            <Badge variant="destructive" className="text-xs">₹{rma.replacementCharge}</Badge>
                                                        ) : (
                                                            <Badge variant="success" className="text-xs">Free</Badge>
                                                        )}
                                                    </div>
                                                    <h4 className="font-medium text-sm text-slate-900">{rma.customer}</h4>
                                                    <p className="text-xs text-slate-600">{rma.partName}</p>
                                                    <p className="text-xs font-mono text-purple-600">{rma.serial}</p>
                                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                                        <p className="text-xs text-slate-500">{rma.serviceCenter?.split(' ')[0]}</p>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => handlePrint(rma, status === 'Delivered' ? 'delivery' : 'token')}
                                                                className="p-1 rounded hover:bg-slate-100 text-slate-600"
                                                                title="Print"
                                                            >
                                                                <Printer className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(rma)}
                                                                className="p-1 rounded hover:bg-slate-100 text-slate-600"
                                                                title="Edit"
                                                            >
                                                                <Edit2 className="w-3 h-3" />
                                                            </button>
                                                            {STATUS_FLOW[status] && (
                                                                <button
                                                                    onClick={() => handleNextStatus(rma)}
                                                                    className="p-1 rounded hover:bg-purple-50 text-purple-600"
                                                                    title={`Move to ${STATUS_FLOW[status]}`}
                                                                >
                                                                    <ArrowRight className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                        {items.length === 0 && (
                                            <div className="text-center py-8 text-slate-400 text-sm">
                                                No items
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* RMA Modal */}
            <RMAModal
                isOpen={rmaModalOpen}
                onClose={() => {
                    setRmaModalOpen(false);
                    setEditingRMA(null);
                }}
                editingRMA={editingRMA}
            />

            {/* RMA Print Modal */}
            <RMAPrint
                rma={printingRMA}
                isOpen={!!printingRMA}
                onClose={() => setPrintingRMA(null)}
                printType={printType}
            />

            {/* Delete Confirmation Modal */}
            {deleteConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-100 rounded-full">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Delete RMA</h3>
                                <p className="text-sm text-slate-500">This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-slate-600 mb-6">
                            Are you sure you want to delete RMA <strong>{deletingRMA?.id}</strong> for {deletingRMA?.customer}?
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setDeleteConfirmOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* OTP Verification Modal */}
            {otpModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <Key className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">OTP Verification</h3>
                                    <p className="text-sm text-slate-500">Verify OTP to mark as delivered</p>
                                </div>
                            </div>
                            <button onClick={() => setOtpModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Demo OTP Display */}
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
                            <p className="text-sm text-green-700 mb-1">📱 OTP sent to customer (Demo):</p>
                            <p className="text-3xl font-bold text-green-600 tracking-widest text-center">{generatedOTP}</p>
                            <p className="text-xs text-green-600 text-center mt-1">Share this OTP with customer for verification</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Enter OTP provided by customer
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter 4-digit OTP"
                                value={enteredOTP}
                                onChange={(e) => {
                                    setEnteredOTP(e.target.value.replace(/\D/g, '').slice(0, 4));
                                    setOtpError('');
                                }}
                                className={`text-center text-2xl tracking-widest font-mono ${otpError ? 'border-red-500' : ''}`}
                                maxLength={4}
                            />
                            {otpError && <p className="text-red-500 text-sm mt-1">{otpError}</p>}
                        </div>

                        <div className="text-sm text-slate-600 mb-4">
                            <p><strong>Customer:</strong> {otpRMA?.customer}</p>
                            <p><strong>Part:</strong> {otpRMA?.partName}</p>
                            {otpRMA?.replacementCharge > 0 && (
                                <p className="text-red-600 mt-2">
                                    <strong>Collect Charge:</strong> ₹{otpRMA.replacementCharge}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setOtpModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleVerifyOTP} className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Verify & Deliver
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

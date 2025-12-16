import React, { useState, useMemo } from 'react';
import {
    Plus, Search, Shield, QrCode, Calendar, Clock, AlertTriangle,
    Edit2, Trash2, Eye, RefreshCw, Wrench, ChevronRight
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
import { AMCModal } from '../components/AMCModal';
import { QRDisplay } from '../components/QRDisplay';
import { useSessionData } from '../contexts/SessionDataContext';

export default function AMC() {
    const {
        amcContracts,
        deleteAMC,
        renewAMC,
        getUpcomingRenewals
    } = useSessionData();

    // Modal states
    const [amcModalOpen, setAmcModalOpen] = useState(false);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [editingAMC, setEditingAMC] = useState(null);
    const [selectedAMC, setSelectedAMC] = useState(null);
    const [viewingAMC, setViewingAMC] = useState(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [activeTab, setActiveTab] = useState('list');

    const tabs = [
        { id: 'list', label: 'All Contracts', icon: Shield },
        { id: 'expiring', label: 'Expiring Soon', icon: AlertTriangle },
        { id: 'service', label: 'Service History', icon: Wrench }
    ];

    // Calculate contract status
    const getContractStatus = (amc) => {
        const today = new Date();
        const endDate = new Date(amc.endDate);
        const daysToExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

        if (amc.status === 'Expired' || daysToExpiry < 0) return 'Expired';
        if (daysToExpiry <= 30) return 'Expiring';
        return 'Active';
    };

    // Filtered AMCs
    const filteredAMCs = useMemo(() => {
        return amcContracts.filter(amc => {
            const matchesSearch =
                amc.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                amc.deviceSerial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                amc.deviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                amc.id?.toLowerCase().includes(searchTerm.toLowerCase());

            if (statusFilter === 'All') return matchesSearch;

            const status = getContractStatus(amc);
            return matchesSearch && status === statusFilter;
        });
    }, [amcContracts, searchTerm, statusFilter]);

    // Stats
    const stats = useMemo(() => {
        const today = new Date();
        return {
            total: amcContracts.length,
            active: amcContracts.filter(a => getContractStatus(a) === 'Active').length,
            expiring: amcContracts.filter(a => getContractStatus(a) === 'Expiring').length,
            expired: amcContracts.filter(a => getContractStatus(a) === 'Expired').length
        };
    }, [amcContracts]);

    // Upcoming renewals
    const upcomingRenewals = getUpcomingRenewals(30);

    // All service entries across all AMCs
    const allServiceHistory = useMemo(() => {
        return amcContracts
            .flatMap(amc =>
                amc.serviceHistory?.map(entry => ({
                    ...entry,
                    amcId: amc.id,
                    customer: amc.customer,
                    deviceName: amc.deviceName
                })) || []
            )
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [amcContracts]);

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'Active': return 'success';
            case 'Expiring': return 'warning';
            case 'Expired': return 'danger';
            default: return 'default';
        }
    };

    const handleAddAMC = () => {
        setEditingAMC(null);
        setAmcModalOpen(true);
    };

    const handleEditAMC = (amc) => {
        setEditingAMC(amc);
        setAmcModalOpen(true);
    };

    const handleDeleteAMC = (amcId) => {
        if (window.confirm('Are you sure you want to delete this AMC contract?')) {
            deleteAMC(amcId);
        }
    };

    const handleViewQR = (amc) => {
        setSelectedAMC(amc);
        setQrModalOpen(true);
    };

    const handleQuickRenew = (amc) => {
        const currentEnd = new Date(amc.endDate);
        const newEnd = new Date(currentEnd);
        newEnd.setFullYear(newEnd.getFullYear() + 1);

        if (window.confirm(`Renew AMC for 1 year until ${newEnd.toLocaleDateString('en-IN')}?`)) {
            renewAMC(amc.id, newEnd.toISOString().split('T')[0], amc.amcAmount);
        }
    };

    const getDaysToExpiry = (endDate) => {
        const today = new Date();
        const end = new Date(endDate);
        return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AMC Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Annual Maintenance Contracts & QR Codes</p>
                </div>
                <Button onClick={handleAddAMC}>
                    <Plus className="w-4 h-4 mr-2" />
                    New AMC
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Contracts</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Active</p>
                            <h3 className="text-2xl font-bold text-green-600">{stats.active}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Expiring Soon</p>
                            <h3 className="text-2xl font-bold text-orange-600">{stats.expiring}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Expired</p>
                            <h3 className="text-2xl font-bold text-red-600">{stats.expired}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                            ? 'border-purple-600 text-purple-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {tab.id === 'expiring' && stats.expiring > 0 && (
                            <Badge variant="warning" className="ml-1">{stats.expiring}</Badge>
                        )}
                    </button>
                ))}
            </div>

            {/* List Tab */}
            {activeTab === 'list' && (
                <Card className="border-l-4 border-l-violet-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle>AMC Contracts</CardTitle>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search..."
                                    className="pl-9 w-48"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Expiring">Expiring</option>
                                <option value="Expired">Expired</option>
                            </select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredAMCs.length === 0 ? (
                            <div className="text-center py-12">
                                <Shield className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p className="text-slate-500">No AMC contracts found</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>AMC ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Device</TableHead>
                                        <TableHead>Period</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAMCs.map(amc => {
                                        const status = getContractStatus(amc);
                                        const daysLeft = getDaysToExpiry(amc.endDate);

                                        return (
                                            <TableRow key={amc.id}>
                                                <TableCell>
                                                    <span className="font-mono text-sm">{amc.id}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{amc.customer}</p>
                                                        <p className="text-xs text-slate-500">{amc.mobile}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{amc.deviceName}</p>
                                                        <p className="text-xs text-slate-500 font-mono">{amc.deviceSerial}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <p>{new Date(amc.startDate).toLocaleDateString('en-IN')}</p>
                                                        <p className="text-slate-500">to {new Date(amc.endDate).toLocaleDateString('en-IN')}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
                                                        {status !== 'Expired' && (
                                                            <p className="text-xs text-slate-500">
                                                                {daysLeft} days left
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-semibold">₹{amc.amcAmount?.toLocaleString()}</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleViewQR(amc)}
                                                            title="View QR"
                                                        >
                                                            <QrCode className="w-4 h-4" />
                                                        </Button>
                                                        {(status === 'Expiring' || status === 'Expired') && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-green-600 hover:text-green-700"
                                                                onClick={() => handleQuickRenew(amc)}
                                                                title="Renew"
                                                            >
                                                                <RefreshCw className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditAMC(amc)}
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600"
                                                            onClick={() => handleDeleteAMC(amc.id)}
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Expiring Tab */}
            {activeTab === 'expiring' && (
                <Card className="border-l-4 border-l-amber-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            Contracts Expiring in 30 Days
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {upcomingRenewals.length === 0 ? (
                            <div className="text-center py-12">
                                <Shield className="w-12 h-12 mx-auto mb-3 text-green-300" />
                                <p className="text-slate-500">No contracts expiring soon</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingRenewals.map(amc => {
                                    const daysLeft = getDaysToExpiry(amc.endDate);
                                    return (
                                        <div
                                            key={amc.id}
                                            className={`flex items-center justify-between p-4 rounded-lg border ${daysLeft <= 7 ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-lg ${daysLeft <= 7 ? 'bg-red-200 text-red-600' : 'bg-orange-200 text-orange-600'}`}>
                                                    <Clock className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{amc.customer}</p>
                                                    <p className="text-sm text-slate-600">{amc.deviceName} • {amc.deviceSerial}</p>
                                                    <p className="text-xs text-slate-500">Expires: {new Date(amc.endDate).toLocaleDateString('en-IN')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className={`text-2xl font-bold ${daysLeft <= 7 ? 'text-red-600' : 'text-orange-600'}`}>
                                                        {daysLeft}
                                                    </p>
                                                    <p className="text-xs text-slate-500">days left</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleQuickRenew(amc)}
                                                >
                                                    <RefreshCw className="w-4 h-4 mr-2" />
                                                    Renew
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Service History Tab */}
            {activeTab === 'service' && (
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                        <CardTitle>Service History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {allServiceHistory.length === 0 ? (
                            <div className="text-center py-12">
                                <Wrench className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p className="text-slate-500">No service records found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {allServiceHistory.map((entry, index) => (
                                    <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                            <Wrench className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-slate-900">{entry.type}</p>
                                                <span className="text-sm text-slate-500">
                                                    {new Date(entry.date).toLocaleDateString('en-IN')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 mt-1">{entry.description}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                                <span>Customer: {entry.customer}</span>
                                                <span>Device: {entry.deviceName}</span>
                                                <span>Technician: {entry.technician}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Modals */}
            <AMCModal
                isOpen={amcModalOpen}
                onClose={() => {
                    setAmcModalOpen(false);
                    setEditingAMC(null);
                }}
                editingAMC={editingAMC}
            />

            <QRDisplay
                amc={selectedAMC}
                isOpen={qrModalOpen}
                onClose={() => {
                    setQrModalOpen(false);
                    setSelectedAMC(null);
                }}
            />
        </div>
    );
}

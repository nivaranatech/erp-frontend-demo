import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, AlertCircle, Clock, CheckCircle, XCircle, Edit2, Trash2, Eye, Printer, ArrowRight, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useSessionData } from '../contexts/SessionDataContext';
import { ComplaintModal } from '../components/ComplaintModal';
import { JobCardPrint } from '../components/JobCardPrint';

const JOB_STATUSES = ['Open', 'In Progress', 'Pending Parts', 'Completed', 'Delivered'];
const STATUS_FLOW = {
    'Open': 'In Progress',
    'In Progress': 'Pending Parts',
    'Pending Parts': 'Completed',
    'Completed': 'Delivered',
    'Delivered': null
};

export default function Complaints() {
    const {
        complaints,
        deleteComplaint,
        updateComplaintStatus,
        departments
    } = useSessionData();

    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('kanban');
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');
    const [departmentFilter, setDepartmentFilter] = useState('All');

    // Modal states
    const [complaintModalOpen, setComplaintModalOpen] = useState(false);
    const [editingComplaint, setEditingComplaint] = useState(null);
    const [viewingComplaint, setViewingComplaint] = useState(null);
    const [printingComplaint, setPrintingComplaint] = useState(null);

    // Get unique departments from complaints
    const complaintDepartments = useMemo(() => {
        const depts = [...new Set(complaints.map(c => c.department).filter(Boolean))];
        return depts.sort();
    }, [complaints]);

    // Filter complaints
    const filteredComplaints = useMemo(() => {
        return complaints.filter(complaint => {
            // Search filter
            const matchesSearch =
                complaint.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                complaint.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                complaint.device?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                complaint.mobile?.includes(searchTerm);

            // Status filter
            const matchesStatus = statusFilter === 'All' || complaint.status === statusFilter;

            // Priority filter
            const matchesPriority = priorityFilter === 'All' || complaint.priority === priorityFilter;

            // Department filter
            const matchesDepartment = departmentFilter === 'All' || complaint.department === departmentFilter;

            return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
        });
    }, [complaints, searchTerm, statusFilter, priorityFilter, departmentFilter]);

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'Open': return 'default';
            case 'In Progress': return 'primary';
            case 'Pending Parts': return 'warning';
            case 'Completed': return 'success';
            case 'Delivered': return 'success';
            default: return 'default';
        }
    };

    const getPriorityBadgeVariant = (priority) => {
        switch (priority) {
            case 'High': return 'danger';
            case 'Medium': return 'warning';
            case 'Low': return 'default';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Open': return <AlertCircle className="w-4 h-4" />;
            case 'In Progress': return <Clock className="w-4 h-4" />;
            case 'Pending Parts': return <Package className="w-4 h-4" />;
            case 'Completed': return <CheckCircle className="w-4 h-4" />;
            case 'Delivered': return <CheckCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const groupByStatus = () => {
        const groups = {};
        JOB_STATUSES.forEach(status => {
            groups[status] = [];
        });
        filteredComplaints.forEach(complaint => {
            if (groups[complaint.status]) {
                groups[complaint.status].push(complaint);
            }
        });
        return groups;
    };

    // Handlers
    const handleAddNew = () => {
        setEditingComplaint(null);
        setComplaintModalOpen(true);
    };

    const handleEdit = (complaint) => {
        setEditingComplaint(complaint);
        setComplaintModalOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this job?')) {
            deleteComplaint(id);
        }
    };

    const handleStatusChange = (id, newStatus) => {
        updateComplaintStatus(id, newStatus);
    };

    const handleNextStatus = (complaint) => {
        const nextStatus = STATUS_FLOW[complaint.status];
        if (nextStatus) {
            updateComplaintStatus(complaint.id, nextStatus);
        }
    };

    const handlePrint = (complaint) => {
        setPrintingComplaint(complaint);
    };

    // Statistics
    const stats = useMemo(() => ({
        open: complaints.filter(c => c.status === 'Open').length,
        inProgress: complaints.filter(c => c.status === 'In Progress').length,
        pendingParts: complaints.filter(c => c.status === 'Pending Parts').length,
        completed: complaints.filter(c => c.status === 'Completed').length,
        delivered: complaints.filter(c => c.status === 'Delivered').length
    }), [complaints]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Complaints / Jobs</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage service tickets and repairs</p>
                </div>
                <div className="flex gap-2">
                    <Button variant={view === 'list' ? 'primary' : 'secondary'} onClick={() => setView('list')}>
                        List View
                    </Button>
                    <Button variant={view === 'kanban' ? 'primary' : 'secondary'} onClick={() => setView('kanban')}>
                        Kanban View
                    </Button>
                    <Button onClick={handleAddNew}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Job
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-slate-500" onClick={() => setStatusFilter('Open')}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-slate-100 text-slate-600 rounded-lg">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Open</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats.open}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500" onClick={() => setStatusFilter('In Progress')}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">In Progress</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats.inProgress}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-orange-500" onClick={() => setStatusFilter('Pending Parts')}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Pending Parts</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats.pendingParts}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-green-500" onClick={() => setStatusFilter('Completed')}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Completed</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats.completed}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-emerald-500" onClick={() => setStatusFilter('Delivered')}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Delivered</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats.delivered}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Search */}
            <Card className="border-l-4 border-l-indigo-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search jobs..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="All">All Status</option>
                            {JOB_STATUSES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="All">All Priority</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="All">All Departments</option>
                            {complaintDepartments.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                        {(statusFilter !== 'All' || priorityFilter !== 'All' || departmentFilter !== 'All') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setStatusFilter('All');
                                    setPriorityFilter('All');
                                    setDepartmentFilter('All');
                                }}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                    <div className="text-sm text-slate-500">
                        {filteredComplaints.length} job(s)
                    </div>
                </CardHeader>
                <CardContent>
                    {view === 'list' ? (
                        <div className="space-y-3">
                            {filteredComplaints.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                    <p>No jobs found</p>
                                </div>
                            ) : (
                                filteredComplaints.map((complaint) => {
                                    // Status-based border colors
                                    const getStatusBorderColor = (status) => {
                                        switch (status) {
                                            case 'Open': return 'border-l-slate-500';
                                            case 'In Progress': return 'border-l-blue-500';
                                            case 'Pending Parts': return 'border-l-orange-500';
                                            case 'Completed': return 'border-l-green-500';
                                            case 'Delivered': return 'border-l-emerald-500';
                                            default: return 'border-l-slate-400';
                                        }
                                    };
                                    return (
                                        <div key={complaint.id} className={`p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors border-l-4 ${getStatusBorderColor(complaint.status)}`}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                        <span className="font-mono text-sm font-medium text-slate-900">{complaint.id}</span>
                                                        <Badge variant={getStatusBadgeVariant(complaint.status)}>
                                                            {complaint.status}
                                                        </Badge>
                                                        <Badge variant={getPriorityBadgeVariant(complaint.priority)}>
                                                            {complaint.priority}
                                                        </Badge>
                                                        <Badge variant="default">{complaint.serviceType || complaint.type}</Badge>
                                                        {complaint.isAMCCovered && (
                                                            <Badge variant="success">AMC</Badge>
                                                        )}
                                                    </div>
                                                    <h4 className="font-medium text-slate-900 mb-1">{complaint.customer}</h4>
                                                    <p className="text-sm text-slate-600 mb-2">{complaint.device} • {complaint.serial || 'No Serial'}</p>
                                                    <p className="text-sm text-slate-500 line-clamp-1">{complaint.issue}</p>
                                                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 flex-wrap">
                                                        <span>Assigned: {complaint.assignedTo || 'Unassigned'}</span>
                                                        <span>Dept: {complaint.department}</span>
                                                        <span>Created: {new Date(complaint.createdDate).toLocaleDateString('en-GB')}</span>
                                                        {complaint.estimatedCompletion && (
                                                            <span>Est: {new Date(complaint.estimatedCompletion).toLocaleDateString('en-GB')}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {STATUS_FLOW[complaint.status] && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            title={`Move to ${STATUS_FLOW[complaint.status]}`}
                                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            onClick={() => handleNextStatus(complaint)}
                                                        >
                                                            <ArrowRight className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Print Job Card"
                                                        onClick={() => handlePrint(complaint)}
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Edit Job"
                                                        onClick={() => handleEdit(complaint)}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Delete Job"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDelete(complaint.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : (
                        /* Kanban View */
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {Object.entries(groupByStatus()).map(([status, items]) => (
                                <div key={status} className="space-y-3">
                                    <h3 className="font-semibold text-slate-700 flex items-center gap-2 sticky top-0 bg-white py-2">
                                        {getStatusIcon(status)}
                                        {status} ({items.length})
                                    </h3>
                                    <div className="space-y-2 min-h-[200px]">
                                        {items.map((complaint) => {
                                            // Status-based border colors for Kanban
                                            const getKanbanBorderColor = (status) => {
                                                switch (status) {
                                                    case 'Open': return 'border-l-slate-500';
                                                    case 'In Progress': return 'border-l-blue-500';
                                                    case 'Pending Parts': return 'border-l-orange-500';
                                                    case 'Completed': return 'border-l-green-500';
                                                    case 'Delivered': return 'border-l-emerald-500';
                                                    default: return 'border-l-slate-400';
                                                }
                                            };
                                            return (
                                                <Card
                                                    key={complaint.id}
                                                    className={`p-3 cursor-pointer hover:shadow-md transition-shadow border-l-4 ${getKanbanBorderColor(status)}`}
                                                    onClick={() => handleEdit(complaint)}
                                                >
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-mono text-xs text-slate-500">{complaint.id}</span>
                                                            <Badge variant={getPriorityBadgeVariant(complaint.priority)} className="text-xs">
                                                                {complaint.priority}
                                                            </Badge>
                                                        </div>
                                                        <h4 className="font-medium text-sm text-slate-900">{complaint.customer}</h4>
                                                        <p className="text-xs text-slate-600">{complaint.device}</p>
                                                        <p className="text-xs text-slate-500 line-clamp-2">{complaint.issue}</p>
                                                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                                            <p className="text-xs text-slate-500">{complaint.assignedTo || 'Unassigned'}</p>
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handlePrint(complaint);
                                                                    }}
                                                                    className="p-1 rounded hover:bg-slate-100 text-slate-600"
                                                                    title="Preview & Print"
                                                                >
                                                                    <Eye className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handlePrint(complaint);
                                                                    }}
                                                                    className="p-1 rounded hover:bg-slate-100 text-slate-600"
                                                                    title="Print Job Card"
                                                                >
                                                                    <Printer className="w-3 h-3" />
                                                                </button>
                                                                {STATUS_FLOW[status] && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleNextStatus(complaint);
                                                                        }}
                                                                        className="p-1 rounded hover:bg-blue-50 text-blue-600"
                                                                        title={`Move to ${STATUS_FLOW[status]}`}
                                                                    >
                                                                        <ArrowRight className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Complaint Modal */}
            <ComplaintModal
                isOpen={complaintModalOpen}
                onClose={() => {
                    setComplaintModalOpen(false);
                    setEditingComplaint(null);
                }}
                editingComplaint={editingComplaint}
            />

            {/* Job Card Print Modal */}
            <JobCardPrint
                complaint={printingComplaint}
                isOpen={!!printingComplaint}
                onClose={() => setPrintingComplaint(null)}
            />
        </div>
    );
}

import React, { useState, useMemo } from 'react';
import {
    Plus, Search, Calendar, Users, Filter, Edit2, Trash2,
    Eye, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight,
    Settings, Download, BarChart3
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
import { LeaveModal } from '../components/LeaveModal';
import { HolidayModal } from '../components/HolidayModal';
import { LeaveApprovalModal } from '../components/LeaveApprovalModal';
import { useSessionData } from '../contexts/SessionDataContext';

export default function HR() {
    const {
        leaves,
        holidays,
        users,
        leavePolicy,
        deleteLeaveRequest,
        deleteHoliday,
        approveLeave,
        rejectLeave
    } = useSessionData();

    // Tab state
    const [activeTab, setActiveTab] = useState('requests');

    // Modal states
    const [leaveModalOpen, setLeaveModalOpen] = useState(false);
    const [holidayModalOpen, setHolidayModalOpen] = useState(false);
    const [approvalModalOpen, setApprovalModalOpen] = useState(false);
    const [editingLeave, setEditingLeave] = useState(null);
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [selectedLeave, setSelectedLeave] = useState(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [departmentFilter, setDepartmentFilter] = useState('All');

    // Calendar state
    const [currentDate, setCurrentDate] = useState(new Date());

    const tabs = [
        { id: 'requests', label: 'Leave Requests', icon: Calendar },
        { id: 'holidays', label: 'Holidays', icon: Calendar },
        { id: 'calendar', label: 'Calendar', icon: Calendar },
        { id: 'balances', label: 'Leave Balances', icon: BarChart3 },
        { id: 'policy', label: 'Policy', icon: Settings }
    ];

    // Filtered leaves
    const filteredLeaves = useMemo(() => {
        return leaves.filter(leave => {
            const matchesSearch =
                leave.employee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                leave.reason?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || leave.status === statusFilter;

            if (departmentFilter !== 'All') {
                const user = users.find(u => u.id === leave.userId);
                if (user?.department !== departmentFilter) return false;
            }

            return matchesSearch && matchesStatus;
        });
    }, [leaves, searchTerm, statusFilter, departmentFilter, users]);

    // Sorted holidays (upcoming first)
    const sortedHolidays = useMemo(() => {
        return [...holidays].sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [holidays]);

    // Stats
    const stats = useMemo(() => ({
        total: leaves.length,
        pending: leaves.filter(l => l.status === 'Pending').length,
        approved: leaves.filter(l => l.status === 'Approved').length,
        onLeaveToday: leaves.filter(l => {
            const today = new Date().toISOString().split('T')[0];
            return l.status === 'Approved' && l.startDate <= today && l.endDate >= today;
        }).length
    }), [leaves]);

    // Unique departments
    const departments = useMemo(() => {
        return [...new Set(users.map(u => u.department))].filter(Boolean);
    }, [users]);

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Pending': return 'warning';
            case 'Rejected': return 'danger';
            default: return 'default';
        }
    };

    const getHolidayTypeBadge = (type) => {
        switch (type) {
            case 'Public': return 'bg-green-100 text-green-700';
            case 'Optional': return 'bg-blue-100 text-blue-700';
            case 'Restricted': return 'bg-orange-100 text-orange-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getLeaveTypeInfo = (typeId) => {
        return leavePolicy?.leaveTypes?.find(t => t.id === typeId);
    };

    // Leave Actions
    const handleAddLeave = () => {
        setEditingLeave(null);
        setLeaveModalOpen(true);
    };

    const handleEditLeave = (leave) => {
        if (leave.status !== 'Pending') {
            alert('Only pending leave requests can be edited.');
            return;
        }
        setEditingLeave(leave);
        setLeaveModalOpen(true);
    };

    const handleDeleteLeave = (leaveId) => {
        if (window.confirm('Are you sure you want to delete this leave request?')) {
            deleteLeaveRequest(leaveId);
        }
    };

    const handleViewLeave = (leave) => {
        setSelectedLeave(leave);
        setApprovalModalOpen(true);
    };

    // Holiday Actions
    const handleAddHoliday = () => {
        setEditingHoliday(null);
        setHolidayModalOpen(true);
    };

    const handleEditHoliday = (holiday) => {
        setEditingHoliday(holiday);
        setHolidayModalOpen(true);
    };

    const handleDeleteHoliday = (holidayId) => {
        if (window.confirm('Are you sure you want to delete this holiday?')) {
            deleteHoliday(holidayId);
        }
    };

    // Quick Approve/Reject
    const handleQuickApprove = (leave, e) => {
        e.stopPropagation();
        approveLeave(leave.id, 'Admin User', 'Admin', 'Quick approved');
    };

    const handleQuickReject = (leave, e) => {
        e.stopPropagation();
        const reason = window.prompt('Please provide a reason for rejection:');
        if (reason) {
            rejectLeave(leave.id, 'Admin User', 'Admin', reason);
        }
    };

    // Calendar helpers
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        return { daysInMonth, startingDay };
    };

    const getCalendarDays = () => {
        const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        return days;
    };

    const getEventsForDay = (day) => {
        if (!day) return { holidays: [], leaves: [] };

        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const dayHolidays = holidays.filter(h => h.date === dateStr);
        const dayLeaves = leaves.filter(l =>
            l.status === 'Approved' && l.startDate <= dateStr && l.endDate >= dateStr
        );

        return { holidays: dayHolidays, leaves: dayLeaves };
    };

    const navigateMonth = (direction) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">HR & Leave Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage employee leaves, holidays, and policies</p>
                </div>
                <div className="flex gap-2">
                    {activeTab === 'requests' && (
                        <Button onClick={handleAddLeave}>
                            <Plus className="w-4 h-4 mr-2" />
                            Apply Leave
                        </Button>
                    )}
                    {activeTab === 'holidays' && (
                        <Button onClick={handleAddHoliday}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Holiday
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Requests</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Pending Approval</p>
                            <h3 className="text-2xl font-bold text-orange-600">{stats.pending}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Approved</p>
                            <h3 className="text-2xl font-bold text-green-600">{stats.approved}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">On Leave Today</p>
                            <h3 className="text-2xl font-bold text-purple-600">{stats.onLeaveToday}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${activeTab === tab.id
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'requests' && (
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle>Leave Requests</CardTitle>
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
                                className="h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                            <select
                                className="h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                            >
                                <option value="All">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredLeaves.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                <p className="text-slate-500">No leave requests found</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Leave Type</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Days</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLeaves.map(leave => {
                                        const leaveType = getLeaveTypeInfo(leave.leaveType);
                                        return (
                                            <TableRow
                                                key={leave.id}
                                                className="cursor-pointer hover:bg-slate-50"
                                                onClick={() => handleViewLeave(leave)}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                            {leave.employee?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-900">{leave.employee}</p>
                                                            <p className="text-xs text-slate-500">
                                                                {users.find(u => u.id === leave.userId)?.department}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-2 h-2 rounded-full"
                                                            style={{ backgroundColor: leaveType?.color || '#6B7280' }}
                                                        />
                                                        <span>{leaveType?.shortName || leave.leaveType}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <p>{new Date(leave.startDate).toLocaleDateString()}</p>
                                                        <p className="text-slate-500">to {new Date(leave.endDate).toLocaleDateString()}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">{leave.days}</span>
                                                    {leave.halfDay && (
                                                        <span className="text-xs text-slate-500 ml-1">({leave.halfDay})</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="max-w-xs">
                                                    <p className="truncate text-slate-600">{leave.reason}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusBadgeVariant(leave.status)}>
                                                        {leave.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                                                        {leave.status === 'Pending' && (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                    onClick={(e) => handleQuickApprove(leave, e)}
                                                                    title="Approve"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={(e) => handleQuickReject(leave, e)}
                                                                    title="Reject"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditLeave(leave);
                                                                    }}
                                                                    title="Edit"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewLeave(leave);
                                                            }}
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteLeave(leave.id);
                                                            }}
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

            {activeTab === 'holidays' && (
                <Card className="border-l-4 border-l-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle>Holidays ({holidays.length})</CardTitle>
                        <Button variant="secondary" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3">
                            {sortedHolidays.map(holiday => {
                                const date = new Date(holiday.date);
                                const isPast = date < new Date();
                                return (
                                    <div
                                        key={holiday.id}
                                        className={`flex items-center justify-between p-4 rounded-lg border border-slate-200 transition-colors ${isPast ? 'bg-slate-50 opacity-60' : 'bg-white hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-lg ${isPast ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
                                                <Calendar className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{holiday.name}</p>
                                                <p className="text-sm text-slate-500">
                                                    {date.toLocaleDateString('en-IN', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                                {holiday.description && (
                                                    <p className="text-xs text-slate-400 mt-1">{holiday.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className={getHolidayTypeBadge(holiday.type)}>
                                                {holiday.type}
                                            </Badge>
                                            {holiday.isRecurring && (
                                                <Badge variant="default" className="text-xs">
                                                    Recurring
                                                </Badge>
                                            )}
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditHoliday(holiday)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDeleteHoliday(holiday.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'calendar' && (
                <Card className="border-l-4 border-l-indigo-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" onClick={() => navigateMonth(-1)}>
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <h2 className="text-lg font-semibold text-slate-900">
                                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h2>
                            <Button variant="ghost" size="sm" onClick={() => navigateMonth(1)}>
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => setCurrentDate(new Date())}>
                            Today
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {/* Day Headers */}
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="p-2 text-center text-sm font-medium text-slate-500">
                                    {day}
                                </div>
                            ))}

                            {/* Calendar Days */}
                            {getCalendarDays().map((day, index) => {
                                const { holidays: dayHolidays, leaves: dayLeaves } = getEventsForDay(day);
                                const isToday = day && new Date().getDate() === day &&
                                    new Date().getMonth() === currentDate.getMonth() &&
                                    new Date().getFullYear() === currentDate.getFullYear();
                                const isWeekend = index % 7 === 0 || index % 7 === 6;

                                return (
                                    <div
                                        key={index}
                                        className={`min-h-[100px] p-2 border border-slate-100 rounded-lg ${!day ? 'bg-slate-50' :
                                            dayHolidays.length > 0 ? 'bg-green-50' :
                                                isWeekend ? 'bg-slate-50' : 'bg-white'
                                            } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                                    >
                                        {day && (
                                            <>
                                                <span className={`text-sm font-medium ${isToday ? 'text-blue-600' :
                                                    isWeekend ? 'text-slate-400' : 'text-slate-700'
                                                    }`}>
                                                    {day}
                                                </span>
                                                <div className="mt-1 space-y-1">
                                                    {dayHolidays.map(h => (
                                                        <div key={h.id} className="text-xs bg-green-200 text-green-800 px-1 py-0.5 rounded truncate">
                                                            🎉 {h.name}
                                                        </div>
                                                    ))}
                                                    {dayLeaves.slice(0, 2).map(l => (
                                                        <div key={l.id} className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded truncate">
                                                            {l.employee}
                                                        </div>
                                                    ))}
                                                    {dayLeaves.length > 2 && (
                                                        <div className="text-xs text-slate-500">
                                                            +{dayLeaves.length - 2} more
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-200">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-200 rounded"></div>
                                <span className="text-sm text-slate-600">Holiday</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-100 rounded"></div>
                                <span className="text-sm text-slate-600">Approved Leave</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-slate-100 rounded"></div>
                                <span className="text-sm text-slate-600">Weekend</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'balances' && (
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle>Employee Leave Balances</CardTitle>
                        <select
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                        >
                            <option value="All">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Department</TableHead>
                                    {leavePolicy?.leaveTypes?.slice(0, 4).map(type => (
                                        <TableHead key={type.id} className="text-center">
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className="w-2 h-2 rounded-full mb-1"
                                                    style={{ backgroundColor: type.color }}
                                                />
                                                {type.shortName}
                                            </div>
                                        </TableHead>
                                    ))}
                                    <TableHead className="text-center">Total Used</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users
                                    .filter(u => departmentFilter === 'All' || u.department === departmentFilter)
                                    .map(user => {
                                        const userLeaves = leaves.filter(l => l.userId === user.id && l.status === 'Approved');
                                        const totalUsed = userLeaves.reduce((sum, l) => sum + l.days, 0);

                                        return (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                            {user.name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-900">{user.name}</p>
                                                            <p className="text-xs text-slate-500">{user.role}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-600">{user.department}</TableCell>
                                                {leavePolicy?.leaveTypes?.slice(0, 4).map(type => {
                                                    const balance = user.leaveBalance?.[type.id] ?? type.annualQuota;
                                                    const quota = type.annualQuota;
                                                    const percentage = (balance / quota) * 100;

                                                    return (
                                                        <TableCell key={type.id} className="text-center">
                                                            <div className="flex flex-col items-center">
                                                                <span className={`font-medium ${balance < 2 ? 'text-red-600' : 'text-slate-900'}`}>
                                                                    {balance}
                                                                </span>
                                                                <div className="w-12 h-1.5 bg-slate-200 rounded-full mt-1">
                                                                    <div
                                                                        className="h-full rounded-full transition-all"
                                                                        style={{
                                                                            width: `${Math.min(percentage, 100)}%`,
                                                                            backgroundColor: type.color
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    );
                                                })}
                                                <TableCell className="text-center">
                                                    <Badge variant={totalUsed > 10 ? 'warning' : 'default'}>
                                                        {totalUsed} days
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'policy' && (
                <div className="grid gap-6">
                    <Card className="border-l-4 border-l-orange-500">
                        <CardHeader>
                            <CardTitle>Leave Types & Quotas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                {leavePolicy?.leaveTypes?.map(type => (
                                    <div key={type.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: type.color }}
                                            />
                                            <div>
                                                <p className="font-medium text-slate-900">{type.name} ({type.shortName})</p>
                                                <p className="text-sm text-slate-500">{type.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="text-center">
                                                <p className="text-slate-500">Annual Quota</p>
                                                <p className="font-bold text-slate-900">{type.annualQuota}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-slate-500">Max Carry Forward</p>
                                                <p className="font-bold text-slate-900">{type.maxCarryForward}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-slate-500">Max/Request</p>
                                                <p className="font-bold text-slate-900">{type.maxDaysPerRequest}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-slate-500">Notice Days</p>
                                                <p className="font-bold text-slate-900">{type.advanceNoticeDays}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Approval Workflow</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                {leavePolicy?.approvalWorkflow?.levels?.map((level, index) => (
                                    <React.Fragment key={level.level}>
                                        <div className="flex-1 p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                                                {level.level}
                                            </div>
                                            <p className="font-medium text-slate-900">{level.approverRole}</p>
                                            {level.isFinal && (
                                                <Badge variant="success" className="mt-2">Final</Badge>
                                            )}
                                        </div>
                                        {index < leavePolicy.approvalWorkflow.levels.length - 1 && (
                                            <ChevronRight className="w-6 h-6 text-slate-400" />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                            <p className="text-sm text-slate-500 mt-4">
                                Auto-approve after {leavePolicy?.approvalWorkflow?.autoApproveAfterDays} days if no action taken.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-500">Financial Year Start</p>
                                    <p className="font-medium text-slate-900">{leavePolicy?.settings?.financialYearStart}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-500">Exclude Weekends</p>
                                    <p className="font-medium text-slate-900">
                                        {leavePolicy?.settings?.excludeWeekendsFromCount ? 'Yes' : 'No'}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-500">Exclude Holidays</p>
                                    <p className="font-medium text-slate-900">
                                        {leavePolicy?.settings?.excludeHolidaysFromCount ? 'Yes' : 'No'}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-500">Allow Half Day</p>
                                    <p className="font-medium text-slate-900">
                                        {leavePolicy?.settings?.allowHalfDay ? 'Yes' : 'No'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modals */}
            <LeaveModal
                isOpen={leaveModalOpen}
                onClose={() => {
                    setLeaveModalOpen(false);
                    setEditingLeave(null);
                }}
                editingLeave={editingLeave}
            />

            <HolidayModal
                isOpen={holidayModalOpen}
                onClose={() => {
                    setHolidayModalOpen(false);
                    setEditingHoliday(null);
                }}
                editingHoliday={editingHoliday}
            />

            <LeaveApprovalModal
                isOpen={approvalModalOpen}
                onClose={() => {
                    setApprovalModalOpen(false);
                    setSelectedLeave(null);
                }}
                leave={selectedLeave}
            />
        </div>
    );
}

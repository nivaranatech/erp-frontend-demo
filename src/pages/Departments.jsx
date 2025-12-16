import React, { useState } from 'react';
import {
    Plus, Search, Building2, Users, AlertCircle,
    Edit, Trash2, MoreHorizontal, MapPin, Phone,
    Clock, DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { DepartmentModal } from '../components/DepartmentModal';
import { useSessionData } from '../contexts/SessionDataContext';

export default function Departments() {
    const { departments, users, addDepartment, updateDepartment, deleteDepartment, setDepartments } = useSessionData();

    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    // Filter departments
    const filteredDepartments = departments.filter(dept => {
        const matchesSearch =
            dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.head?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'active' && dept.isActive) ||
            (filterStatus === 'inactive' && !dept.isActive);
        return matchesSearch && matchesStatus;
    });

    // Stats calculations
    const totalDepartments = departments.length;
    const activeDepartments = departments.filter(d => d.isActive).length;
    const totalUsers = departments.reduce((acc, d) => acc + (d.userCount || 0), 0);
    const totalOpenComplaints = departments.reduce((acc, d) => acc + (d.openComplaints || 0), 0);

    // Handlers
    const handleAddDepartment = () => {
        setSelectedDepartment(null);
        setIsModalOpen(true);
    };

    const handleEditDepartment = (dept) => {
        setSelectedDepartment(dept);
        setIsModalOpen(true);
    };

    const handleDeleteDepartment = (deptId, e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }

        const dept = departments.find(d => d.id === deptId);
        if (!dept) return;

        let confirmMessage = 'Are you sure you want to delete this department?';
        if (dept.userCount > 0) {
            confirmMessage = `WARNING: Department "${dept.name}" has ${dept.userCount} users assigned. Are you sure you want to delete it? This action cannot be undone.`;
        }

        if (window.confirm(confirmMessage)) {
            deleteDepartment(deptId);
        }
    };

    const handleSaveDepartment = (deptData) => {
        if (selectedDepartment) {
            updateDepartment(selectedDepartment.id, deptData);
        } else {
            addDepartment({
                ...deptData,
                userCount: 0,
                openComplaints: 0
            });
        }
        setIsModalOpen(false);
    };

    const handleToggleStatus = (deptId) => {
        const dept = departments.find(d => d.id === deptId);
        if (dept) {
            updateDepartment(deptId, { isActive: !dept.isActive });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Departments</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage shop departments and service areas</p>
                </div>
                <Button onClick={handleAddDepartment}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Department
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Departments</p>
                            <h3 className="text-2xl font-bold text-slate-900">{totalDepartments}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Active Departments</p>
                            <h3 className="text-2xl font-bold text-green-600">{activeDepartments}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Staff</p>
                            <h3 className="text-2xl font-bold text-slate-900">{totalUsers}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Open Complaints</p>
                            <h3 className="text-2xl font-bold text-orange-600">{totalOpenComplaints}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-l-4 border-l-indigo-500">
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search departments..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                            >
                                Grid
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                            >
                                List
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredDepartments.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p>No departments found.</p>
                            <p className="text-sm mt-1">Try adjusting your search or add a new department.</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        /* Grid View */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredDepartments.map((dept, index) => {
                                // Cycle through different colors for variety
                                const colors = ['border-l-purple-500', 'border-l-blue-500', 'border-l-emerald-500', 'border-l-amber-500', 'border-l-rose-500', 'border-l-cyan-500'];
                                const borderColor = dept.isActive ? colors[index % colors.length] : 'border-l-slate-400';
                                return (
                                    <div
                                        key={dept.id}
                                        className={`p-4 border rounded-xl hover:shadow-md transition-all cursor-pointer border-l-4 ${borderColor} ${dept.isActive
                                            ? 'border-t-slate-200 border-r-slate-200 border-b-slate-200 bg-white'
                                            : 'border-t-slate-200 border-r-slate-200 border-b-slate-200 bg-slate-50 opacity-75'
                                            }`}
                                        onClick={() => handleEditDepartment(dept)}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${dept.isActive
                                                    ? 'bg-purple-100 text-purple-600'
                                                    : 'bg-slate-200 text-slate-500'
                                                    }`}>
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">{dept.name}</h3>
                                                    <p className="text-xs text-slate-500 font-mono">{dept.code}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditDepartment(dept)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={(e) => handleDeleteDepartment(dept.id, e)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                            {dept.description || 'No description'}
                                        </p>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Users className="w-4 h-4" />
                                                <span>{dept.head || 'No head assigned'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <MapPin className="w-4 h-4" />
                                                <span>{dept.location || 'No location'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Clock className="w-4 h-4" />
                                                <span>{dept.workingHours || 'Not set'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="text-center">
                                                    <p className="text-lg font-bold text-slate-900">{dept.userCount || 0}</p>
                                                    <p className="text-xs text-slate-500">Users</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className={`text-lg font-bold ${(dept.openComplaints || 0) > 0 ? 'text-orange-600' : 'text-slate-900'}`}>
                                                        {dept.openComplaints || 0}
                                                    </p>
                                                    <p className="text-xs text-slate-500">Open Jobs</p>
                                                </div>
                                            </div>
                                            <Badge variant={dept.isActive ? 'success' : 'default'}>
                                                {dept.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* List View */
                        <div className="space-y-2">
                            {filteredDepartments.map((dept) => (
                                <div
                                    key={dept.id}
                                    className={`flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors ${dept.isActive ? 'border-slate-200' : 'border-slate-200 opacity-75'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`p-2 rounded-lg ${dept.isActive
                                            ? 'bg-purple-100 text-purple-600'
                                            : 'bg-slate-200 text-slate-500'
                                            }`}>
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-slate-900">{dept.name}</h3>
                                                <span className="text-xs text-slate-500 font-mono">{dept.code}</span>
                                                <Badge variant={dept.isActive ? 'success' : 'default'} className="text-xs">
                                                    {dept.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-0.5">{dept.head} • {dept.location}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-slate-900">{dept.userCount || 0}</p>
                                            <p className="text-xs text-slate-500">Users</p>
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-sm font-bold ${(dept.openComplaints || 0) > 0 ? 'text-orange-600' : 'text-slate-900'}`}>
                                                {dept.openComplaints || 0}
                                            </p>
                                            <p className="text-xs text-slate-500">Jobs</p>
                                        </div>
                                        <div className="text-center hidden md:block">
                                            <p className="text-sm font-bold text-slate-900">₹{dept.baseChargeInsite || 0}</p>
                                            <p className="text-xs text-slate-500">Insite</p>
                                        </div>
                                        <div className="text-center hidden md:block">
                                            <p className="text-sm font-bold text-slate-900">₹{dept.baseChargeOutsite || 0}</p>
                                            <p className="text-xs text-slate-500">Outsite</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditDepartment(dept)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={(e) => handleDeleteDepartment(dept.id, e)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Table Footer */}
                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
                        <span>Showing {filteredDepartments.length} of {departments.length} departments</span>
                    </div>
                </CardContent>
            </Card>

            {/* Department Modal */}
            <DepartmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                department={selectedDepartment}
                onSave={handleSaveDepartment}
                users={users}
            />
        </div>
    );
}

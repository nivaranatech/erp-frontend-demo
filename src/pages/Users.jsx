import React, { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
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
import { UserModal } from '../components/UserModal';
import { useSessionData } from '../contexts/SessionDataContext';

export default function Users() {
    const { users, roles, departments, addUser, updateUser, setUsers } = useSessionData();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('All');
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showActions, setShowActions] = useState(null);

    const filteredUsers = users.filter(user =>
        (selectedRole === 'All' || user.role === selectedRole) &&
        (selectedDepartment === 'All' || user.department === selectedDepartment) &&
        (selectedStatus === 'All' || user.status === selectedStatus) &&
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Combine departments from users AND from departments data for complete list
    const userDepartments = users.map(u => u.department);
    const dataDepartments = departments.filter(d => d.isActive).map(d => d.name);
    const allDepartments = ['All', ...new Set([...userDepartments, ...dataDepartments])];

    const statuses = ['All', ...new Set(users.map(u => u.status))];

    const getRoleBadgeVariant = (role) => {
        switch (role) {
            case 'Admin': return 'primary';
            case 'Manager': return 'warning';
            case 'Engineer': return 'default';
            case 'Cashier': return 'success';
            default: return 'default';
        }
    };

    const handleAddUser = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleSaveUser = (userData) => {
        if (selectedUser) {
            // Edit existing user
            updateUser(selectedUser.id, userData);
        } else {
            // Add new user
            addUser(userData);
        }
        setIsModalOpen(false);
    };

    const handleDeleteUser = (userId) => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            setUsers(prev => prev.filter(u => u.id !== userId));
            setShowActions(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage staff access and permissions</p>
                </div>
                <Button onClick={handleAddUser}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New User
                </Button>
            </div>

            <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-2 w-full max-w-sm">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search users..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            <option value="All">All Roles</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.name}>{role.name}</option>
                            ))}
                        </select>
                        <select
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                        >
                            {allDepartments.map(dept => (
                                <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
                            ))}
                        </select>
                        <select
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            {statuses.map(status => (
                                <option key={status} value={status}>{status === 'All' ? 'All Status' : status}</option>
                            ))}
                        </select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Login</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-slate-900">{user.name}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getRoleBadgeVariant(user.role)}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{user.department}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                            {user.status}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-500">
                                        {new Date(user.lastLogin).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="relative">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowActions(showActions === user.id ? null : user.id)}
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>

                                            {showActions === user.id && (
                                                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 animate-in fade-in slide-in-from-top-2 duration-150">
                                                    <button
                                                        onClick={() => { handleEditUser(user); setShowActions(null); }}
                                                        className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <hr className="my-1" />
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser}
                onSave={handleSaveUser}
            />
        </div>
    );
}

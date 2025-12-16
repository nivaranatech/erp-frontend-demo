import React, { useState, useEffect } from 'react';
import { X, Check, Shield, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import rolesData from '../data/roles.json';
import { useSessionData } from '../contexts/SessionDataContext';

// Simple Switch Component since we don't have it in UI lib
const Switch = ({ checked, onCheckedChange }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={`
      relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
      transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 
      focus-visible:ring-blue-600 focus-visible:ring-offset-2
      ${checked ? 'bg-blue-600' : 'bg-slate-200'}
    `}
    >
        <span
            className={`
        pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 
        transition-transform duration-200 ease-in-out
        ${checked ? 'translate-x-5' : 'translate-x-0'}
      `}
        />
    </button>
);

export function UserModal({ isOpen, onClose, user, onSave }) {
    const { roles, addRole, departments } = useSessionData();

    const [activeTab, setActiveTab] = useState('details');
    const [validationError, setValidationError] = useState('');
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        roleId: user?.roleId || '',
        department: user?.department || '',
        customRoleName: '',
        selectedPermissions: user?.permissions || []
    });

    const [isCreatingRole, setIsCreatingRole] = useState(false);
    const [permissions] = useState(rolesData.permissions);

    // Reset form when modal opens/closes or user changes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: user?.name || '',
                email: user?.email || '',
                roleId: user?.roleId || '',
                department: user?.department || '',
                customRoleName: '',
                selectedPermissions: user?.permissions || []
            });
            setIsCreatingRole(false);
            setValidationError('');
        }
    }, [isOpen, user]);

    // Group permissions for better display
    const groupedPermissions = permissions.reduce((acc, perm) => {
        if (!acc[perm.group]) acc[perm.group] = [];
        acc[perm.group].push(perm);
        return acc;
    }, {});

    if (!isOpen) return null;

    const handleRoleChange = (roleId) => {
        if (roleId === 'new_custom') {
            setIsCreatingRole(true);
            setFormData(prev => ({
                ...prev,
                roleId: 'new_custom',
                selectedPermissions: []
            }));
        } else {
            setIsCreatingRole(false);
            const selectedRole = roles.find(r => r.id === roleId);
            setFormData(prev => ({
                ...prev,
                roleId,
                selectedPermissions: selectedRole ? selectedRole.permissions : []
            }));
        }
    };

    const togglePermission = (permId) => {
        setFormData(prev => {
            const perms = prev.selectedPermissions.includes(permId)
                ? prev.selectedPermissions.filter(p => p !== permId)
                : [...prev.selectedPermissions, permId];
            return { ...prev, selectedPermissions: perms };
        });
    };

    const handleSave = () => {
        // Validation
        if (!formData.name.trim()) {
            setValidationError('Full Name is required');
            return;
        }
        if (!formData.email.trim() || !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setValidationError('Valid Email Address is required');
            return;
        }
        if (!formData.department) {
            setValidationError('Please select a Department');
            return;
        }
        if (!formData.roleId && !isCreatingRole) {
            setValidationError('Please select a Role');
            return;
        }
        if (isCreatingRole && !formData.customRoleName.trim()) {
            setValidationError('Please enter a name for the new role');
            return;
        }
        if (formData.selectedPermissions.length === 0) {
            setValidationError('Please select at least one Permission');
            return;
        }

        setValidationError('');
        let roleName = '';

        // If creating a new custom role, add it to session context
        if (isCreatingRole && formData.customRoleName.trim()) {
            const newRole = {
                id: `custom_${Date.now()}`,
                name: formData.customRoleName.trim(),
                permissions: formData.selectedPermissions
            };

            // Add new role to context (session only - resets on refresh)
            addRole(newRole);

            roleName = newRole.name;
        } else {
            roleName = roles.find(r => r.id === formData.roleId)?.name || 'Custom';
        }

        const finalData = {
            ...formData,
            role: roleName
        };
        onSave(finalData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transition-colors border dark:border-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {user ? 'Edit User' : 'Add New User'}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Configure access and permissions</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Basic Info Section */}
                        {!user && (
                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-blue-800">
                                        <p><strong>Staff Registration:</strong> The email you enter here will be used by the staff member to complete their registration.</p>
                                        <p className="mt-1 text-xs text-blue-600">They will visit Register → Staff Registration → Enter this email → Set their password.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. Rahul Verma"
                                    value={formData.name}
                                    onChange={e => { setFormData({ ...formData, name: e.target.value }); setValidationError(''); }}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-800 dark:text-slate-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    placeholder="rahul@example.com"
                                    value={formData.email}
                                    onChange={e => { setFormData({ ...formData, email: e.target.value }); setValidationError(''); }}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-800 dark:text-slate-100"
                                />
                                {!user && (
                                    <p className="text-xs text-amber-600 mt-1">⚠️ Staff will use this email to register</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Department <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.department}
                                    onChange={e => { setFormData({ ...formData, department: e.target.value }); setValidationError(''); }}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-800 dark:text-slate-100"
                                >
                                    <option value="">Select Department</option>
                                    {departments.filter(d => d.isActive).map(dept => (
                                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Validation Error */}
                        {validationError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {validationError}
                            </div>
                        )}

                        <div className="border-t border-slate-200 dark:border-slate-800 my-4" />

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">User Role</label>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {roles.map(role => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => handleRoleChange(role.id)}
                                        className={`
                      px-4 py-2 rounded-lg border text-sm font-medium transition-all
                      ${formData.roleId === role.id
                                                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-600 text-blue-700 dark:text-blue-300 ring-1 ring-blue-600'
                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}
                    `}
                                    >
                                        {role.name}
                                    </button>
                                ))}

                                {/* Custom Role Button */}
                                <button
                                    type="button"
                                    onClick={() => handleRoleChange('new_custom')}
                                    className={`
                    px-4 py-2 rounded-lg border border-dashed text-sm font-medium transition-all flex items-center gap-2
                    ${isCreatingRole
                                            ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-600 text-purple-700 dark:text-purple-300 ring-1 ring-purple-600'
                                            : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-300'}
                  `}
                                >
                                    <Plus className="w-4 h-4" />
                                    Create New Role
                                </button>
                            </div>

                            {/* New Role Input */}
                            {isCreatingRole && (
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-4 animate-in fade-in slide-in-from-top-2">
                                    <Input
                                        label="New Role Name"
                                        placeholder="e.g. Senior Supervisor"
                                        value={formData.customRoleName}
                                        onChange={e => setFormData({ ...formData, customRoleName: e.target.value })}
                                        className="bg-white dark:bg-slate-800"
                                    />
                                    <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                                        <Shield className="w-3 h-3" />
                                        Define custom permissions for this role below
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Permissions Matrix */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium text-slate-900 dark:text-slate-200 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    Permissions & Access Control
                                </h3>
                                <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full">
                                    {formData.selectedPermissions.length} selected
                                </span>
                            </div>

                            <div className="space-y-6">
                                {Object.entries(groupedPermissions).map(([group, perms]) => (
                                    <div key={group}>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                                            {group}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {perms.map(perm => (
                                                <div
                                                    key={perm.id}
                                                    className={`
                            flex items-center justify-between p-2 rounded border transition-colors
                            ${formData.selectedPermissions.includes(perm.id)
                                                            ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900/50 shadow-sm'
                                                            : 'bg-transparent border-transparent hover:bg-white dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}
                          `}
                                                >
                                                    <span className={`text-sm ${formData.selectedPermissions.includes(perm.id) ? 'text-slate-900 dark:text-slate-100 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                                        {perm.label}
                                                    </span>
                                                    <Switch
                                                        checked={formData.selectedPermissions.includes(perm.id)}
                                                        onCheckedChange={() => togglePermission(perm.id)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave}>
                        <Check className="w-4 h-4 mr-2" />
                        {user ? 'Save Changes' : 'Create User'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

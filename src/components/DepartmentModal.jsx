import React, { useState, useEffect } from 'react';
import { X, Check, Building2, Users, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';

// Simple Switch Component
const Switch = ({ checked, onCheckedChange, label }) => (
    <label className="flex items-center gap-3 cursor-pointer">
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
        {label && <span className="text-sm text-slate-700">{label}</span>}
    </label>
);

// TextArea Component
const TextArea = ({ label, value, onChange, placeholder, rows = 3, className = '' }) => (
    <div className={className}>
        {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
        />
    </div>
);

export function DepartmentModal({ isOpen, onClose, department, onSave, users = [] }) {
    const [activeTab, setActiveTab] = useState('details');
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        head: '',
        headEmail: '',
        location: '',
        contactPhone: '',
        workingHours: '9:00 AM - 6:00 PM',
        baseChargeInsite: 0,
        baseChargeOutsite: 0,
        baseChargeRemote: 0,
        isActive: true
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (department) {
            setFormData({
                code: department.code || '',
                name: department.name || '',
                description: department.description || '',
                head: department.head || '',
                headEmail: department.headEmail || '',
                location: department.location || '',
                contactPhone: department.contactPhone || '',
                workingHours: department.workingHours || '9:00 AM - 6:00 PM',
                baseChargeInsite: department.baseChargeInsite || 0,
                baseChargeOutsite: department.baseChargeOutsite || 0,
                baseChargeRemote: department.baseChargeRemote || 0,
                isActive: department.isActive ?? true
            });
            setActiveTab('details');
        } else {
            // Reset form for new department
            setFormData({
                code: `DEPT-${String(Date.now()).slice(-4)}`,
                name: '',
                description: '',
                head: '',
                headEmail: '',
                location: '',
                contactPhone: '',
                workingHours: '9:00 AM - 6:00 PM',
                baseChargeInsite: 0,
                baseChargeOutsite: 0,
                baseChargeRemote: 0,
                isActive: true
            });
            setActiveTab('details');
        }
        setErrors({});
    }, [department, isOpen]);

    if (!isOpen) return null;

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Department name is required';
        if (!formData.code.trim()) newErrors.code = 'Department code is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleSave = () => {
        if (!validateForm()) return;

        const savedData = {
            ...formData,
            baseChargeInsite: Number(formData.baseChargeInsite),
            baseChargeOutsite: Number(formData.baseChargeOutsite),
            baseChargeRemote: Number(formData.baseChargeRemote)
        };
        onSave(savedData);
    };

    // Get department users (for display)
    const departmentUsers = users.filter(u => u.department === (department?.name || formData.name));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border dark:border-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-900/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {department ? 'Edit Department' : 'Add New Department'}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {department ? `Editing: ${department.name}` : 'Configure department details and charges'}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'details'
                            ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-800'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        Department Details
                    </button>
                    <button
                        onClick={() => setActiveTab('charges')}
                        className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'charges'
                            ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-800'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        Service Charges
                    </button>
                    {department && (
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'users'
                                ? 'border-purple-600 text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-800'
                                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            Users ({department.userCount || 0})
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Input
                                        label="Department Code *"
                                        placeholder="e.g. DEPT-LS"
                                        value={formData.code}
                                        onChange={e => handleChange('code', e.target.value.toUpperCase())}
                                        disabled={!!department}
                                    />
                                    {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <Input
                                        label="Department Name *"
                                        placeholder="e.g. Laptop Service"
                                        value={formData.name}
                                        onChange={e => handleChange('name', e.target.value)}
                                    />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                </div>
                            </div>

                            <TextArea
                                label="Description"
                                placeholder="Brief description of department services and responsibilities..."
                                value={formData.description}
                                onChange={e => handleChange('description', e.target.value)}
                                rows={3}
                            />

                            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Department Head & Contact</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Department Head"
                                        placeholder="e.g. Amit Patel"
                                        value={formData.head}
                                        onChange={e => handleChange('head', e.target.value)}
                                    />
                                    <Input
                                        label="Head Email"
                                        type="email"
                                        placeholder="amit@techerp.com"
                                        value={formData.headEmail}
                                        onChange={e => handleChange('headEmail', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Location"
                                    placeholder="e.g. Ground Floor"
                                    value={formData.location}
                                    onChange={e => handleChange('location', e.target.value)}
                                />
                                <Input
                                    label="Contact Phone"
                                    placeholder="+91 98765 43210"
                                    value={formData.contactPhone}
                                    onChange={e => handleChange('contactPhone', e.target.value)}
                                />
                                <Input
                                    label="Working Hours"
                                    placeholder="9:00 AM - 6:00 PM"
                                    value={formData.workingHours}
                                    onChange={e => handleChange('workingHours', e.target.value)}
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                <Switch
                                    checked={formData.isActive}
                                    onCheckedChange={val => handleChange('isActive', val)}
                                    label="Department is Active"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'charges' && (
                        <div className="space-y-6">
                            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Base Service Charges</p>
                                        <p className="text-xs text-purple-600 dark:text-purple-300/80 mt-1">
                                            These are the default base charges for service tickets in this department.
                                            Charges can be overridden at the time of creating a complaint/job.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                            <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">IN</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">Insite Service</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Customer visits shop</p>
                                        </div>
                                    </div>
                                    <Input
                                        label="Base Charge (₹)"
                                        type="number"
                                        min="0"
                                        value={formData.baseChargeInsite}
                                        onChange={e => handleChange('baseChargeInsite', e.target.value)}
                                    />
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                            <span className="text-orange-600 dark:text-orange-400 text-xs font-bold">OUT</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">Outsite Service</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">On-site / home visit</p>
                                        </div>
                                    </div>
                                    <Input
                                        label="Base Charge (₹)"
                                        type="number"
                                        min="0"
                                        value={formData.baseChargeOutsite}
                                        onChange={e => handleChange('baseChargeOutsite', e.target.value)}
                                    />
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <span className="text-green-600 dark:text-green-400 text-xs font-bold">REM</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">Remote Service</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Online / phone support</p>
                                        </div>
                                    </div>
                                    <Input
                                        label="Base Charge (₹)"
                                        type="number"
                                        min="0"
                                        value={formData.baseChargeRemote}
                                        onChange={e => handleChange('baseChargeRemote', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                                <h4 className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">Charges Summary</h4>
                                <div className="flex flex-wrap gap-4">
                                    <div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">Insite:</span>
                                        <span className="ml-2 font-semibold text-slate-900 dark:text-white">₹ {Number(formData.baseChargeInsite).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">Outsite:</span>
                                        <span className="ml-2 font-semibold text-slate-900 dark:text-white">₹ {Number(formData.baseChargeOutsite).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">Remote:</span>
                                        <span className="ml-2 font-semibold text-slate-900 dark:text-white">₹ {Number(formData.baseChargeRemote).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && department && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Users assigned to this department</p>
                                <Badge variant="primary">{department.userCount || 0} users</Badge>
                            </div>

                            {departmentUsers.length > 0 ? (
                                <div className="space-y-2">
                                    {departmentUsers.map(user => (
                                        <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                    <span className="text-purple-600 dark:text-purple-400 font-medium text-sm">
                                                        {user.name.split(' ').map(n => n[0]).join('')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                            <Badge variant="default">{user.role}</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    <Users className="w-12 h-12 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                                    <p>No users assigned to this department yet.</p>
                                    <p className="text-xs mt-1">Assign users from the User Management page.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        {department ? `Created: ${new Date(department.createdAt).toLocaleDateString()}` : '* Required fields'}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" onClick={handleSave}>
                            <Check className="w-4 h-4 mr-2" />
                            {department ? 'Save Changes' : 'Create Department'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

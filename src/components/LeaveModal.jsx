import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { useSessionData } from '../contexts/SessionDataContext';

export function LeaveModal({ isOpen, onClose, editingLeave = null }) {
    const {
        users,
        leavePolicy,
        addLeaveRequest,
        updateLeaveRequest,
        calculateLeaveDays,
        getUserLeaveBalance
    } = useSessionData();

    const [formData, setFormData] = useState({
        userId: '',
        employee: '',
        leaveType: 'casual',
        startDate: '',
        endDate: '',
        halfDay: null,
        reason: '',
        appliedDate: new Date().toISOString().split('T')[0]
    });

    const [calculatedDays, setCalculatedDays] = useState(0);
    const [balance, setBalance] = useState(null);
    const [errors, setErrors] = useState({});

    // Get active users for dropdown
    const activeUsers = users.filter(u => u.status === 'Active');

    // Initialize form when editing or opening
    useEffect(() => {
        if (editingLeave) {
            setFormData({
                userId: editingLeave.userId,
                employee: editingLeave.employee,
                leaveType: editingLeave.leaveType,
                startDate: editingLeave.startDate,
                endDate: editingLeave.endDate,
                halfDay: editingLeave.halfDay,
                reason: editingLeave.reason,
                appliedDate: editingLeave.appliedDate
            });
        } else {
            // Reset form
            setFormData({
                userId: '',
                employee: '',
                leaveType: 'casual',
                startDate: '',
                endDate: '',
                halfDay: null,
                reason: '',
                appliedDate: new Date().toISOString().split('T')[0]
            });
        }
        setErrors({});
    }, [editingLeave, isOpen]);

    // Calculate days when dates change
    useEffect(() => {
        if (formData.startDate && formData.endDate) {
            const days = calculateLeaveDays(
                formData.startDate,
                formData.endDate,
                leavePolicy?.settings?.excludeWeekendsFromCount ?? true,
                formData.halfDay
            );
            setCalculatedDays(days);
        } else {
            setCalculatedDays(0);
        }
    }, [formData.startDate, formData.endDate, formData.halfDay, leavePolicy, calculateLeaveDays]);

    // Update balance when user or leave type changes
    useEffect(() => {
        if (formData.userId) {
            const userBalance = getUserLeaveBalance(formData.userId);
            setBalance(userBalance[formData.leaveType] ?? null);
        } else {
            setBalance(null);
        }
    }, [formData.userId, formData.leaveType, getUserLeaveBalance]);

    const handleUserChange = (e) => {
        const userId = parseInt(e.target.value);
        const user = users.find(u => u.id === userId);
        setFormData(prev => ({
            ...prev,
            userId: userId,
            employee: user?.name || ''
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when field is modified
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleHalfDayChange = (value) => {
        setFormData(prev => ({
            ...prev,
            halfDay: prev.halfDay === value ? null : value,
            // If half day selected, ensure start and end dates are same
            endDate: value ? prev.startDate : prev.endDate
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.userId) {
            newErrors.userId = 'Please select an employee';
        }
        if (!formData.leaveType) {
            newErrors.leaveType = 'Please select leave type';
        }
        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required';
        }
        if (!formData.endDate) {
            newErrors.endDate = 'End date is required';
        }
        if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
            newErrors.endDate = 'End date must be after start date';
        }
        if (!formData.reason || formData.reason.trim().length < 5) {
            newErrors.reason = 'Please provide a reason (min 5 characters)';
        }
        if (balance !== null && calculatedDays > balance && formData.leaveType !== 'unpaid') {
            newErrors.days = `Insufficient balance. Available: ${balance} days`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) return;

        const leaveData = {
            ...formData,
            days: calculatedDays
        };

        if (editingLeave) {
            updateLeaveRequest(editingLeave.id, leaveData);
        } else {
            addLeaveRequest(leaveData);
        }

        onClose();
    };

    const getLeaveTypeInfo = (typeId) => {
        return leavePolicy?.leaveTypes?.find(t => t.id === typeId);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border dark:border-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                {editingLeave ? 'Edit Leave Request' : 'Apply for Leave'}
                            </h2>
                            <p className="text-blue-100 text-sm">
                                {editingLeave ? 'Update leave request details' : 'Submit a new leave request'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Employee Selection */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <User className="w-4 h-4 inline mr-1" />
                                Employee *
                            </label>
                            <select
                                value={formData.userId}
                                onChange={handleUserChange}
                                className={`w-full h-10 rounded-lg border ${errors.userId ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-800 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                            >
                                <option value="">Select Employee</option>
                                {activeUsers.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} - {user.department} ({user.role})
                                    </option>
                                ))}
                            </select>
                            {errors.userId && (
                                <p className="text-red-500 text-xs mt-1">{errors.userId}</p>
                            )}
                        </div>

                        {/* Leave Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Leave Type *
                            </label>
                            <select
                                name="leaveType"
                                value={formData.leaveType}
                                onChange={handleChange}
                                className={`w-full h-10 rounded-lg border ${errors.leaveType ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-800 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                            >
                                {leavePolicy?.leaveTypes?.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.name} ({type.shortName})
                                    </option>
                                ))}
                            </select>
                            {errors.leaveType && (
                                <p className="text-red-500 text-xs mt-1">{errors.leaveType}</p>
                            )}
                        </div>

                        {/* Balance Display */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Available Balance
                            </label>
                            <div className={`h-10 rounded-lg border px-3 py-2 flex items-center ${balance !== null && balance < calculatedDays ? 'border-red-300 bg-red-50 dark:bg-red-900/10 dark:border-red-800' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'}`}>
                                {balance !== null ? (
                                    <span className={`font-medium ${balance < calculatedDays ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                        {balance} days available
                                    </span>
                                ) : (
                                    <span className="text-slate-400 dark:text-slate-500">Select employee to see balance</span>
                                )}
                            </div>
                            {errors.days && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.days}
                                </p>
                            )}
                        </div>

                        {/* Date Range */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Start Date *
                            </label>
                            <Input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                className={errors.startDate ? 'border-red-500' : ''}
                            />
                            {errors.startDate && (
                                <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                End Date *
                            </label>
                            <Input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                min={formData.startDate || new Date().toISOString().split('T')[0]}
                                disabled={formData.halfDay !== null}
                                className={errors.endDate ? 'border-red-500' : ''}
                            />
                            {errors.endDate && (
                                <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
                            )}
                        </div>

                        {/* Half Day Options */}
                        {leavePolicy?.settings?.allowHalfDay && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    Half Day (Optional)
                                </label>
                                <div className="flex gap-3">
                                    {leavePolicy?.settings?.halfDayTypes?.map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => handleHalfDayChange(type)}
                                            className={`px-4 py-2 rounded-lg border transition-all ${formData.halfDay === type
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-blue-400'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                    {formData.halfDay && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, halfDay: null }))}
                                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Calculated Days Display */}
                        <div className="md:col-span-2">
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-blue-300">Total Leave Days</p>
                                    <p className="text-xs text-slate-500 dark:text-blue-400">Excluding weekends & holidays</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{calculatedDays}</span>
                                    <span className="text-slate-500 dark:text-slate-400 ml-1">day(s)</span>
                                </div>
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Reason *
                            </label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Please provide a reason for your leave request..."
                                className={`w-full rounded-lg border ${errors.reason ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-800 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none dark:placeholder-slate-500`}
                            />
                            {errors.reason && (
                                <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
                            )}
                        </div>

                        {/* Leave Type Info */}
                        {formData.leaveType && (
                            <div className="md:col-span-2">
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full mt-1"
                                            style={{ backgroundColor: getLeaveTypeInfo(formData.leaveType)?.color }}
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                {getLeaveTypeInfo(formData.leaveType)?.name}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {getLeaveTypeInfo(formData.leaveType)?.description}
                                            </p>
                                            <div className="flex gap-4 mt-2 text-xs text-slate-600 dark:text-slate-500">
                                                <span>Max: {getLeaveTypeInfo(formData.leaveType)?.maxDaysPerRequest} days/request</span>
                                                <span>Notice: {getLeaveTypeInfo(formData.leaveType)?.advanceNoticeDays} day(s)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        {editingLeave ? 'Update Request' : 'Submit Request'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

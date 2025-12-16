import React, { useState } from 'react';
import { X, Calendar, Plus, Upload, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { useSessionData } from '../contexts/SessionDataContext';

export function HolidayModal({ isOpen, onClose, editingHoliday = null }) {
    const { addHoliday, addHolidaysBulk, updateHoliday } = useSessionData();

    const [mode, setMode] = useState('single'); // 'single' or 'bulk'

    // Single holiday form
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        type: 'Public',
        isRecurring: false,
        description: ''
    });

    // Bulk holidays list
    const [bulkHolidays, setBulkHolidays] = useState([
        { name: '', date: '', type: 'Public' }
    ]);

    const [errors, setErrors] = useState({});

    const holidayTypes = ['Public', 'Optional', 'Restricted'];

    // Initialize form when editing
    React.useEffect(() => {
        if (editingHoliday) {
            setFormData({
                name: editingHoliday.name,
                date: editingHoliday.date,
                type: editingHoliday.type,
                isRecurring: editingHoliday.isRecurring || false,
                description: editingHoliday.description || ''
            });
            setMode('single');
        } else {
            setFormData({
                name: '',
                date: '',
                type: 'Public',
                isRecurring: false,
                description: ''
            });
            setBulkHolidays([{ name: '', date: '', type: 'Public' }]);
        }
        setErrors({});
    }, [editingHoliday, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleBulkChange = (index, field, value) => {
        setBulkHolidays(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ));
    };

    const addBulkRow = () => {
        setBulkHolidays(prev => [...prev, { name: '', date: '', type: 'Public' }]);
    };

    const removeBulkRow = (index) => {
        if (bulkHolidays.length > 1) {
            setBulkHolidays(prev => prev.filter((_, i) => i !== index));
        }
    };

    const validateSingle = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Holiday name is required';
        if (!formData.date) newErrors.date = 'Date is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateBulk = () => {
        const newErrors = {};
        const hasInvalid = bulkHolidays.some((h, i) => {
            if (!h.name.trim() || !h.date) {
                newErrors[i] = 'Name and date are required';
                return true;
            }
            return false;
        });
        setErrors(newErrors);
        return !hasInvalid;
    };

    const handleSubmit = () => {
        if (mode === 'single') {
            if (!validateSingle()) return;

            if (editingHoliday) {
                updateHoliday(editingHoliday.id, formData);
            } else {
                addHoliday(formData);
            }
        } else {
            if (!validateBulk()) return;

            const validHolidays = bulkHolidays.filter(h => h.name.trim() && h.date);
            if (validHolidays.length > 0) {
                addHolidaysBulk(validHolidays);
            }
        }

        onClose();
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Public': return 'bg-green-100 text-green-700 border-green-200';
            case 'Optional': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Restricted': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border dark:border-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-600 to-teal-600">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                {editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
                            </h2>
                            <p className="text-emerald-100 text-sm">
                                {editingHoliday ? 'Update holiday details' : 'Add new holiday(s) to the calendar'}
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

                {/* Mode Tabs (only for new) */}
                {!editingHoliday && (
                    <div className="flex border-b border-slate-200 dark:border-slate-800">
                        <button
                            onClick={() => setMode('single')}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${mode === 'single'
                                ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <Plus className="w-4 h-4 inline mr-2" />
                            Single Holiday
                        </button>
                        <button
                            onClick={() => setMode('bulk')}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${mode === 'bulk'
                                ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <Upload className="w-4 h-4 inline mr-2" />
                            Bulk Add
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {mode === 'single' ? (
                        /* Single Holiday Form */
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Holiday Name *
                                </label>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Diwali, Christmas"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Date *
                                    </label>
                                    <Input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className={errors.date ? 'border-red-500' : ''}
                                    />
                                    {errors.date && (
                                        <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Type
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    >
                                        {holidayTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={2}
                                    placeholder="Optional description..."
                                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none dark:placeholder-slate-500"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isRecurring"
                                    name="isRecurring"
                                    checked={formData.isRecurring}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-slate-600 focus:ring-emerald-500 dark:bg-slate-700"
                                />
                                <label htmlFor="isRecurring" className="text-sm text-slate-700 dark:text-slate-300">
                                    Recurring yearly (e.g., Republic Day, Independence Day)
                                </label>
                            </div>

                            {/* Preview */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Preview:</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {formData.name || 'Holiday Name'}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {formData.date
                                                    ? new Date(formData.date).toLocaleDateString('en-IN', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })
                                                    : 'Select date'}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className={getTypeColor(formData.type)}>
                                        {formData.type}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Bulk Add Form */
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                Add multiple holidays at once. Fill in the details for each holiday.
                            </p>

                            {bulkHolidays.map((holiday, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <span className="flex items-center justify-center w-6 h-6 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-full mt-1">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1 grid grid-cols-3 gap-3">
                                        <Input
                                            placeholder="Holiday Name"
                                            value={holiday.name}
                                            onChange={(e) => handleBulkChange(index, 'name', e.target.value)}
                                            className={errors[index] ? 'border-red-500' : ''}
                                        />
                                        <Input
                                            type="date"
                                            value={holiday.date}
                                            onChange={(e) => handleBulkChange(index, 'date', e.target.value)}
                                            className={errors[index] ? 'border-red-500' : ''}
                                        />
                                        <select
                                            value={holiday.type}
                                            onChange={(e) => handleBulkChange(index, 'type', e.target.value)}
                                            className="h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        >
                                            {holidayTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeBulkRow(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        disabled={bulkHolidays.length === 1}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={addBulkRow}
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Another Holiday
                            </Button>

                            {Object.keys(errors).length > 0 && (
                                <p className="text-red-500 text-xs">
                                    Please fill in all required fields (name and date) for each holiday.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        {mode === 'bulk' && (
                            <span>{bulkHolidays.filter(h => h.name && h.date).length} holiday(s) ready to add</span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>
                            {editingHoliday ? 'Update Holiday' : mode === 'bulk' ? 'Add All Holidays' : 'Add Holiday'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

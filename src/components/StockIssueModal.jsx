import React, { useState, useEffect, useMemo } from 'react';
import {
    X, Save, Package, User, Search, Hash, FileText, AlertCircle
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { useSessionData } from '../contexts/SessionDataContext';

export function StockIssueModal({ isOpen, onClose }) {
    const { items, getEngineers, issueStock, getAvailableStock } = useSessionData();

    const [formData, setFormData] = useState({
        userId: '',
        itemId: '',
        quantity: 1,
        serialNumbers: '',
        batchNumber: '',
        jobId: '',
        notes: ''
    });
    const [errors, setErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [showItemDropdown, setShowItemDropdown] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const engineers = useMemo(() => getEngineers(), [getEngineers]);

    const filteredItems = useMemo(() => {
        if (!searchTerm) return items.slice(0, 10);
        return items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.partId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 10);
    }, [items, searchTerm]);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                userId: '',
                itemId: '',
                quantity: 1,
                serialNumbers: '',
                batchNumber: '',
                jobId: '',
                notes: ''
            });
            setErrors({});
            setSearchTerm('');
            setSelectedItem(null);
        }
    }, [isOpen]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleSelectItem = (item) => {
        setSelectedItem(item);
        setFormData(prev => ({ ...prev, itemId: item.id }));
        setSearchTerm(item.name);
        setShowItemDropdown(false);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.userId) newErrors.userId = 'Please select an engineer';
        if (!formData.itemId) newErrors.itemId = 'Please select an item';
        if (!formData.quantity || formData.quantity < 1) {
            newErrors.quantity = 'Quantity must be at least 1';
        }

        if (selectedItem) {
            const available = getAvailableStock(selectedItem.id);
            if (formData.quantity > available) {
                newErrors.quantity = `Only ${available} units available`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const serialNums = formData.serialNumbers
            ? formData.serialNumbers.split(',').map(s => s.trim()).filter(s => s)
            : null;

        const result = issueStock({
            itemId: parseInt(formData.itemId),
            userId: parseInt(formData.userId),
            quantity: parseInt(formData.quantity),
            serialNumbers: serialNums,
            batchNumber: formData.batchNumber || null,
            jobId: formData.jobId || null,
            notes: formData.notes
        });

        if (result.success) {
            onClose();
        } else {
            setErrors({ submit: result.message });
        }
    };

    if (!isOpen) return null;

    const availableQty = selectedItem ? getAvailableStock(selectedItem.id) : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border dark:border-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-emerald-600 to-teal-600">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Issue Stock</h2>
                            <p className="text-white/80 text-sm">Assign parts to engineer</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Engineer Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Issue To <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={formData.userId}
                                onChange={(e) => handleChange('userId', e.target.value)}
                                className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 dark:text-white ${errors.userId ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                                    }`}
                            >
                                <option value="">Select Engineer</option>
                                {engineers.map(eng => (
                                    <option key={eng.id} value={eng.id}>
                                        {eng.name} - {eng.department}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {errors.userId && <p className="text-red-500 text-xs mt-1">{errors.userId}</p>}
                    </div>

                    {/* Item Search */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Select Item <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search by name, SKU, or part ID..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowItemDropdown(true);
                                }}
                                onFocus={() => setShowItemDropdown(true)}
                                className={`pl-9 ${errors.itemId ? 'border-red-500' : ''}`}
                            />
                        </div>
                        {errors.itemId && <p className="text-red-500 text-xs mt-1">{errors.itemId}</p>}

                        {/* Dropdown */}
                        {showItemDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {filteredItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleSelectItem(item)}
                                        className="w-full text-left px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-medium text-sm text-slate-900 dark:text-white">{item.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.partId || item.sku}</p>
                                        </div>
                                        <Badge variant={getAvailableStock(item.id) > 5 ? 'success' : 'warning'}>
                                            {getAvailableStock(item.id)} in stock
                                        </Badge>
                                    </button>
                                ))}
                                {filteredItems.length === 0 && (
                                    <p className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">No items found</p>
                                )}
                            </div>
                        )}

                        {/* Selected Item Info */}
                        {selectedItem && (
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{selectedItem.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{selectedItem.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-600 dark:text-slate-300">Available</p>
                                        <p className="font-bold text-emerald-600 dark:text-emerald-400">{availableQty} units</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Quantity <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="number"
                                min="1"
                                max={availableQty || 999}
                                value={formData.quantity}
                                onChange={(e) => handleChange('quantity', e.target.value)}
                                className={errors.quantity ? 'border-red-500' : ''}
                            />
                            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                        </div>

                        {/* Serial Numbers (for serialized items) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Serial Numbers <span className="text-slate-400">(comma separated)</span>
                            </label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="SN001, SN002, SN003"
                                    value={formData.serialNumbers}
                                    onChange={(e) => handleChange('serialNumbers', e.target.value)}
                                    className="pl-9 font-mono text-sm"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Enter serial numbers for tracked items</p>
                        </div>

                        {/* Batch Number (for consumables) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Batch Number <span className="text-slate-400">(for consumables)</span>
                            </label>
                            <Input
                                placeholder="BATCH-2025-01"
                                value={formData.batchNumber}
                                onChange={(e) => handleChange('batchNumber', e.target.value)}
                            />
                        </div>

                        {/* Job Reference */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Job Reference <span className="text-slate-400">(optional)</span>
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="JOB-2025-0012"
                                    value={formData.jobId}
                                    onChange={(e) => handleChange('jobId', e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                            <textarea
                                placeholder="Any additional notes..."
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none bg-white dark:bg-slate-800 dark:text-white"
                            />
                        </div>

                        {errors.submit && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <p className="text-red-700 dark:text-red-300">{errors.submit}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <Button variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">
                            <Save className="w-4 h-4 mr-2" />
                            Issue Stock
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

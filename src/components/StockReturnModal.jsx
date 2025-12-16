import React, { useState, useEffect, useMemo } from 'react';
import {
    X, Save, Package, User, RotateCcw, AlertCircle
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { useSessionData } from '../contexts/SessionDataContext';

export function StockReturnModal({ isOpen, onClose }) {
    const { getEngineers, getUserStock, returnStock } = useSessionData();

    const [formData, setFormData] = useState({
        userId: '',
        itemId: '',
        quantity: 1,
        serialNumbers: '',
        condition: 'Good',
        notes: ''
    });
    const [errors, setErrors] = useState({});
    const [userItems, setUserItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    const engineers = useMemo(() => getEngineers(), [getEngineers]);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                userId: '',
                itemId: '',
                quantity: 1,
                serialNumbers: '',
                condition: 'Good',
                notes: ''
            });
            setErrors({});
            setUserItems([]);
            setSelectedItem(null);
        }
    }, [isOpen]);

    // Load user's stock when user changes
    useEffect(() => {
        if (formData.userId) {
            const stock = getUserStock(parseInt(formData.userId));
            setUserItems(stock);
        } else {
            setUserItems([]);
        }
    }, [formData.userId, getUserStock]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }

        if (field === 'userId') {
            setFormData(prev => ({ ...prev, itemId: '', quantity: 1 }));
            setSelectedItem(null);
        }

        if (field === 'itemId' && value) {
            const item = userItems.find(i => i.itemId === parseInt(value));
            setSelectedItem(item);
            setFormData(prev => ({ ...prev, quantity: 1 }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.userId) newErrors.userId = 'Please select an engineer';
        if (!formData.itemId) newErrors.itemId = 'Please select an item';
        if (!formData.quantity || formData.quantity < 1) {
            newErrors.quantity = 'Quantity must be at least 1';
        }

        if (selectedItem && formData.quantity > selectedItem.quantity) {
            newErrors.quantity = `User only has ${selectedItem.quantity} units`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const serialNums = formData.serialNumbers
            ? formData.serialNumbers.split(',').map(s => s.trim()).filter(s => s)
            : null;

        const result = returnStock({
            itemId: parseInt(formData.itemId),
            userId: parseInt(formData.userId),
            quantity: parseInt(formData.quantity),
            serialNumbers: serialNums,
            condition: formData.condition,
            notes: formData.notes
        });

        if (result.success) {
            onClose();
        } else {
            setErrors({ submit: result.message });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border dark:border-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <RotateCcw className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Return Stock</h2>
                            <p className="text-white/80 text-sm">Receive parts from engineer</p>
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
                            Return From <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={formData.userId}
                                onChange={(e) => handleChange('userId', e.target.value)}
                                className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white ${errors.userId ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
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

                    {/* Items held by user */}
                    {formData.userId && userItems.length === 0 && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center text-slate-500 dark:text-slate-400">
                            <Package className="w-8 h-8 mx-auto mb-2 text-slate-400 dark:text-slate-500" />
                            <p>This engineer has no stock to return</p>
                        </div>
                    )}

                    {userItems.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Select Item <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.itemId}
                                onChange={(e) => handleChange('itemId', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white ${errors.itemId ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                                    }`}
                            >
                                <option value="">Select item to return</option>
                                {userItems.map(item => (
                                    <option key={item.itemId} value={item.itemId}>
                                        {item.itemName} ({item.quantity} with user)
                                    </option>
                                ))}
                            </select>
                            {errors.itemId && <p className="text-red-500 text-xs mt-1">{errors.itemId}</p>}
                        </div>
                    )}

                    {/* Selected Item Info */}
                    {selectedItem && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{selectedItem.itemName}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{selectedItem.itemSku}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-slate-600 dark:text-slate-300">With User</p>
                                    <p className="font-bold text-blue-600 dark:text-blue-400">{selectedItem.quantity} units</p>
                                </div>
                            </div>
                            {selectedItem.serialNumbers?.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Serial Numbers:</p>
                                    <p className="font-mono text-xs text-blue-700 dark:text-blue-300">
                                        {selectedItem.serialNumbers.join(', ')}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quantity */}
                    {selectedItem && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Quantity to Return <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="number"
                                    min="1"
                                    max={selectedItem.quantity}
                                    value={formData.quantity}
                                    onChange={(e) => handleChange('quantity', e.target.value)}
                                    className={errors.quantity ? 'border-red-500' : ''}
                                />
                                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                            </div>

                            {/* Serial Numbers */}
                            {selectedItem.serialNumbers?.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Serial Numbers Returned
                                    </label>
                                    <Input
                                        placeholder="Enter serial numbers being returned"
                                        value={formData.serialNumbers}
                                        onChange={(e) => handleChange('serialNumbers', e.target.value)}
                                        className="font-mono text-sm"
                                    />
                                </div>
                            )}

                            {/* Condition */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Condition</label>
                                <select
                                    value={formData.condition}
                                    onChange={(e) => handleChange('condition', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                                >
                                    <option value="Good">Good - Usable</option>
                                    <option value="Damaged">Damaged - Needs repair</option>
                                    <option value="Defective">Defective - RMA required</option>
                                </select>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                                <textarea
                                    placeholder="Reason for return, condition notes..."
                                    value={formData.notes}
                                    onChange={(e) => handleChange('notes', e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                                />
                            </div>
                        </>
                    )}

                    {errors.submit && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <p className="text-red-700 dark:text-red-300">{errors.submit}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={!selectedItem}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Return Stock
                    </Button>
                </div>
            </div>
        </div>
    );
}

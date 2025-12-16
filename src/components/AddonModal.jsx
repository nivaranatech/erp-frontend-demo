import React, { useState, useEffect } from 'react';
import { X, Check, Wrench, IndianRupee, Percent, FileText, Tag } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

const UNIT_OPTIONS = [
    'Per Visit',
    'Per Hour',
    'Per Installation',
    'Fixed',
    'Per Device',
    'Per GB'
];

export function AddonModal({ isOpen, onClose, addon, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        unit: 'Per Visit',
        price: 0,
        gst: 18,
        description: '',
        isActive: true
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (addon) {
                setFormData({
                    name: addon.name || '',
                    unit: addon.unit || 'Per Visit',
                    price: addon.price || 0,
                    gst: addon.gst || 18,
                    description: addon.description || '',
                    isActive: addon.isActive !== false
                });
            } else {
                setFormData({
                    name: '',
                    unit: 'Per Visit',
                    price: 0,
                    gst: 18,
                    description: '',
                    isActive: true
                });
            }
            setErrors({});
        }
    }, [isOpen, addon]);

    if (!isOpen) return null;

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Service name is required';
        if (formData.price < 0) newErrors.price = 'Price cannot be negative';
        if (formData.gst < 0 || formData.gst > 40) newErrors.gst = 'GST must be 0-40%';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onSave({
                ...formData,
                price: parseFloat(formData.price) || 0,
                gst: parseFloat(formData.gst) || 0
            });
        }
    };

    const totalWithGst = formData.price * (1 + formData.gst / 100);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border dark:border-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {addon ? 'Edit Service Addon' : 'Add New Service Addon'}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {addon ? 'Update service details' : 'Create a new service or labor charge'}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Form */}
                <div className="p-5 space-y-4">
                    {/* Service Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            <Tag className="w-4 h-4 inline mr-1" />
                            Service Name *
                        </label>
                        <Input
                            placeholder="e.g. OS Installation, Data Recovery"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    {/* Unit */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Billing Unit
                        </label>
                        <select
                            className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={formData.unit}
                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                        >
                            {UNIT_OPTIONS.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                            ))}
                        </select>
                    </div>

                    {/* Price and GST */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                <IndianRupee className="w-4 h-4 inline mr-1" />
                                Price (Excl. Tax) *
                            </label>
                            <Input
                                type="number"
                                min="0"
                                step="10"
                                placeholder="0"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                className={errors.price ? 'border-red-500' : ''}
                            />
                            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                <Percent className="w-4 h-4 inline mr-1" />
                                GST %
                            </label>
                            <select
                                className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={formData.gst}
                                onChange={e => setFormData({ ...formData, gst: parseFloat(e.target.value) })}
                            >
                                <option value={0}>0%</option>
                                <option value={5}>5%</option>
                                <option value={18}>18%</option>
                                <option value={40}>40%</option>
                            </select>
                        </div>
                    </div>

                    {/* Total with GST Preview */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600 dark:text-blue-300">Price including GST:</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">₹ {totalWithGst.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            <FileText className="w-4 h-4 inline mr-1" />
                            Description
                        </label>
                        <textarea
                            rows={2}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:placeholder-slate-500"
                            placeholder="Brief description of the service..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-700"
                        />
                        <label htmlFor="isActive" className="text-sm text-slate-700 dark:text-slate-300">
                            Service is active and can be added to estimates
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>
                        <Check className="w-4 h-4 mr-2" />
                        {addon ? 'Update Service' : 'Add Service'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default AddonModal;

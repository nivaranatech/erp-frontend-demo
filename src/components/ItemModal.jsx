import React, { useState, useEffect } from 'react';
import { X, Check, Package, History, AlertTriangle } from 'lucide-react';
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

// Select Component
const Select = ({ label, value, onChange, options, placeholder, className = '' }) => (
    <div className={className}>
        {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
        <select
            value={value}
            onChange={onChange}
            className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        >
            {placeholder && <option value="" className="text-slate-500 dark:text-slate-400">{placeholder}</option>}
            {options.map(opt => (
                <option key={opt.value} value={opt.value} className="dark:bg-slate-800 dark:text-white">{opt.label}</option>
            ))}
        </select>
    </div>
);

const CATEGORIES = [
    { value: 'Laptops', label: 'Laptops' },
    { value: 'Accessories', label: 'Accessories' },
    { value: 'Storage', label: 'Storage' },
    { value: 'Memory', label: 'Memory' },
    { value: 'Processors', label: 'Processors' },
    { value: 'Motherboards', label: 'Motherboards' },
    { value: 'Power', label: 'Power Supplies & Chargers' },
    { value: 'Cooling', label: 'Cooling' },
    { value: 'Batteries', label: 'Batteries' },
    { value: 'Displays', label: 'Displays & Monitors' },
    { value: 'Consumables', label: 'Consumables' },
    { value: 'Cables', label: 'Cables & Connectors' },
    { value: 'Other', label: 'Other' }
];

const LOCATIONS = [
    { value: 'Warehouse A', label: 'Warehouse A' },
    { value: 'Warehouse B', label: 'Warehouse B' },
    { value: 'Store Front', label: 'Store Front' },
    { value: 'Service Center', label: 'Service Center' }
];

export function ItemModal({ isOpen, onClose, item, onSave }) {
    const [activeTab, setActiveTab] = useState('details');
    const [formData, setFormData] = useState({
        partId: '',
        name: '',
        sku: '',
        category: '',
        supplier: '',
        purchasePrice: '',
        sellingPrice: '',
        mrp: '',
        gstPercent: 18,
        warrantyMonths: 0,
        hsnSac: '',
        serviceStation: '',
        priceDate: new Date().toISOString().split('T')[0],
        isNew: true,
        powerConsumption: '',
        stockQty: 0,
        reorderLevel: 5,
        location: '',
        isActive: true
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (item) {
            setFormData({
                partId: item.partId || '',
                name: item.name || '',
                sku: item.sku || '',
                category: item.category || '',
                supplier: item.supplier || '',
                purchasePrice: item.purchasePrice || '',
                sellingPrice: item.sellingPrice || '',
                mrp: item.mrp || '',
                gstPercent: item.gstPercent || 18,
                warrantyMonths: item.warrantyMonths || 0,
                hsnSac: item.hsnSac || '',
                serviceStation: item.serviceStation || '',
                priceDate: item.priceDate || new Date().toISOString().split('T')[0],
                isNew: item.isNew ?? true,
                powerConsumption: item.powerConsumption || '',
                stockQty: item.stockQty || 0,
                reorderLevel: item.reorderLevel || 5,
                location: item.location || '',
                isActive: item.isActive ?? true
            });
            setActiveTab('details');
        } else {
            // Reset form for new item
            setFormData({
                partId: `PRT-${String(Date.now()).slice(-6)}`,
                name: '',
                sku: '',
                category: '',
                supplier: '',
                purchasePrice: '',
                sellingPrice: '',
                mrp: '',
                gstPercent: 18,
                warrantyMonths: 0,
                hsnSac: '',
                serviceStation: '',
                priceDate: new Date().toISOString().split('T')[0],
                isNew: true,
                powerConsumption: '',
                stockQty: 0,
                reorderLevel: 5,
                location: '',
                isActive: true
            });
            setActiveTab('details');
        }
        setErrors({});
    }, [item, isOpen]);

    if (!isOpen) return null;

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Item name is required';
        if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.purchasePrice || formData.purchasePrice <= 0) newErrors.purchasePrice = 'Valid purchase price required';
        if (!formData.sellingPrice || formData.sellingPrice <= 0) newErrors.sellingPrice = 'Valid selling price required';
        if (Number(formData.sellingPrice) < Number(formData.purchasePrice)) {
            newErrors.sellingPrice = 'Selling price should be >= purchase price';
        }
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
            purchasePrice: Number(formData.purchasePrice),
            sellingPrice: Number(formData.sellingPrice),
            mrp: Number(formData.mrp) || Number(formData.sellingPrice),
            gstPercent: Number(formData.gstPercent),
            warrantyMonths: Number(formData.warrantyMonths),
            stockQty: Number(formData.stockQty),
            reorderLevel: Number(formData.reorderLevel)
        };
        onSave(savedData);
    };

    const calculateMargin = () => {
        const purchase = Number(formData.purchasePrice) || 0;
        const selling = Number(formData.sellingPrice) || 0;
        if (purchase === 0) return 0;
        return (((selling - purchase) / purchase) * 100).toFixed(1);
    };

    const calculateGSTAmount = () => {
        const selling = Number(formData.sellingPrice) || 0;
        const gst = Number(formData.gstPercent) || 0;
        return ((selling * gst) / 100).toFixed(2);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border dark:border-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {item ? 'Edit Item' : 'Add New Item'}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {item ? `Editing: ${item.name}` : 'Fill in the item details below'}
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
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        Item Details
                    </button>
                    <button
                        onClick={() => setActiveTab('pricing')}
                        className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'pricing'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        Pricing & Tax
                    </button>
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'inventory'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        Inventory
                    </button>
                    {item && item.auditTrail && (
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'history'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                        >
                            <History className="w-4 h-4" />
                            History
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
                                        label="Part ID"
                                        value={formData.partId}
                                        onChange={e => handleChange('partId', e.target.value)}
                                        disabled={!!item}
                                        className="font-mono"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Input
                                        label="Item Name *"
                                        placeholder="e.g. Samsung 980 Pro 1TB SSD"
                                        value={formData.name}
                                        onChange={e => handleChange('name', e.target.value)}
                                        error={errors.name}
                                    />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Input
                                        label="SKU *"
                                        placeholder="e.g. STO-SAM-980PRO"
                                        value={formData.sku}
                                        onChange={e => handleChange('sku', e.target.value.toUpperCase())}
                                        error={errors.sku}
                                    />
                                    {errors.sku && <p className="text-xs text-red-500 mt-1">{errors.sku}</p>}
                                </div>
                                <Select
                                    label="Category *"
                                    value={formData.category}
                                    onChange={e => handleChange('category', e.target.value)}
                                    options={CATEGORIES}
                                    placeholder="Select category"
                                />
                                <div>
                                    <Input
                                        label="HSN/SAC Code"
                                        placeholder="e.g. 84717020"
                                        value={formData.hsnSac}
                                        onChange={e => handleChange('hsnSac', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Supplier & Warranty</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Supplier Name"
                                            placeholder="e.g. Samsung Electronics"
                                            value={formData.supplier}
                                            onChange={e => handleChange('supplier', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label="Warranty (Months)"
                                            type="number"
                                            min="0"
                                            value={formData.warrantyMonths}
                                            onChange={e => handleChange('warrantyMonths', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <Input
                                        label="Service Station"
                                        placeholder="e.g. Samsung Service Center"
                                        value={formData.serviceStation}
                                        onChange={e => handleChange('serviceStation', e.target.value)}
                                    />
                                    <Input
                                        label="Power Consumption"
                                        placeholder="e.g. 65W or N/A"
                                        value={formData.powerConsumption}
                                        onChange={e => handleChange('powerConsumption', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <Switch
                                    checked={formData.isNew}
                                    onCheckedChange={val => handleChange('isNew', val)}
                                    label="Mark as New Arrival"
                                />
                                <Switch
                                    checked={formData.isActive}
                                    onCheckedChange={val => handleChange('isActive', val)}
                                    label="Active (Available for sale)"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'pricing' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Input
                                        label="Purchase Price (Net Landing) *"
                                        type="number"
                                        min="0"
                                        placeholder="₹ 0.00"
                                        value={formData.purchasePrice}
                                        onChange={e => handleChange('purchasePrice', e.target.value)}
                                        error={errors.purchasePrice}
                                    />
                                    {errors.purchasePrice && <p className="text-xs text-red-500 mt-1">{errors.purchasePrice}</p>}
                                </div>
                                <div>
                                    <Input
                                        label="Selling Price *"
                                        type="number"
                                        min="0"
                                        placeholder="₹ 0.00"
                                        value={formData.sellingPrice}
                                        onChange={e => handleChange('sellingPrice', e.target.value)}
                                        error={errors.sellingPrice}
                                    />
                                    {errors.sellingPrice && <p className="text-xs text-red-500 mt-1">{errors.sellingPrice}</p>}
                                </div>
                                <div>
                                    <Input
                                        label="MRP"
                                        type="number"
                                        min="0"
                                        placeholder="₹ 0.00"
                                        value={formData.mrp}
                                        onChange={e => handleChange('mrp', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Margin Calculator */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                                <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-3">Profit Analysis</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Margin</p>
                                        <p className={`text-xl font-bold ${Number(calculateMargin()) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {calculateMargin()}%
                                        </p>
                                    </div>
                                    <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Profit per unit</p>
                                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                            ₹ {(Number(formData.sellingPrice) - Number(formData.purchasePrice)).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">GST Amount</p>
                                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                            ₹ {Number(calculateGSTAmount()).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Input
                                        label="GST %"
                                        type="number"
                                        min="0"
                                        max="40"
                                        value={formData.gstPercent}
                                        onChange={e => handleChange('gstPercent', e.target.value)}
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Common: 0%, 5%, 18%, 40%</p>
                                </div>
                                <div>
                                    <Input
                                        label="Price Last Updated"
                                        type="date"
                                        value={formData.priceDate}
                                        onChange={e => handleChange('priceDate', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'inventory' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Input
                                        label="Current Stock Qty"
                                        type="number"
                                        min="0"
                                        value={formData.stockQty}
                                        onChange={e => handleChange('stockQty', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="Reorder Level"
                                        type="number"
                                        min="0"
                                        value={formData.reorderLevel}
                                        onChange={e => handleChange('reorderLevel', e.target.value)}
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Alert when stock falls below this</p>
                                </div>
                                <Select
                                    label="Storage Location"
                                    value={formData.location}
                                    onChange={e => handleChange('location', e.target.value)}
                                    options={LOCATIONS}
                                    placeholder="Select location"
                                />
                            </div>

                            {/* Stock Alert */}
                            {Number(formData.stockQty) <= Number(formData.reorderLevel) && Number(formData.stockQty) > 0 && (
                                <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                                    <div>
                                        <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Low Stock Warning</p>
                                        <p className="text-xs text-orange-600 dark:text-orange-300">Current stock ({formData.stockQty}) is at or below reorder level ({formData.reorderLevel})</p>
                                    </div>
                                </div>
                            )}

                            {Number(formData.stockQty) === 0 && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
                                    <div>
                                        <p className="text-sm font-medium text-red-800 dark:text-red-200">Out of Stock</p>
                                        <p className="text-xs text-red-600 dark:text-red-300">This item has zero stock. Consider reordering.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && item?.auditTrail && (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Change history for this item</p>
                            <div className="space-y-3">
                                {item.auditTrail.map((entry, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                                        <div className="p-1.5 bg-slate-200 dark:bg-slate-700/50 rounded-full">
                                            <History className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-slate-900 dark:text-white">{entry.action}</span>
                                                {entry.field && (
                                                    <Badge variant="default">{entry.field}</Badge>
                                                )}
                                            </div>
                                            {entry.oldValue && (
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Changed from <span className="font-mono text-red-600">{entry.oldValue}</span> to <span className="font-mono text-green-600">{entry.newValue}</span>
                                                </p>
                                            )}
                                            <p className="text-xs text-slate-400 mt-1">
                                                {entry.user} • {new Date(entry.date).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        {item ? `Last updated: ${new Date(item.priceDate).toLocaleDateString()}` : '* Required fields'}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" onClick={handleSave}>
                            <Check className="w-4 h-4 mr-2" />
                            {item ? 'Save Changes' : 'Create Item'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

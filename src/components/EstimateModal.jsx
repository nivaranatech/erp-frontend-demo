import React, { useState, useEffect } from 'react';
import {
    X, Check, FileText, Plus, Trash2, Search,
    Package, Calculator, Save, AlertCircle,
    ChevronDown, Eye, Clock, User, Monitor, Wrench, Layers, ToggleLeft, ToggleRight
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { useSessionData } from '../contexts/SessionDataContext';
import { ComputerVisualizer } from './ComputerVisualizer';

export function EstimateModal({ isOpen, onClose, estimate, onSave }) {
    const { items, savedModels, saveModel, addons, getCompatibleParts, combinations } = useSessionData();

    const [activeTab, setActiveTab] = useState('customer');
    const [searchTerm, setSearchTerm] = useState('');
    const [showItemSearch, setShowItemSearch] = useState(false);
    const [showSaveModelModal, setShowSaveModelModal] = useState(false);
    const [modelName, setModelName] = useState('');
    const [selectedPartPreview, setSelectedPartPreview] = useState(null);
    const [showCompatibleOnly, setShowCompatibleOnly] = useState(true);

    const [formData, setFormData] = useState({
        customer: '',
        mobile: '',
        email: '',
        address: '',
        validityDays: 15,
        notes: '',
        status: 'Draft',
        lineItems: [],
        selectedAddons: []
    });

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (estimate) {
                setFormData({
                    customer: estimate.customer || '',
                    mobile: estimate.mobile || '',
                    email: estimate.email || '',
                    address: estimate.address || '',
                    validityDays: estimate.validityDays || 15,
                    notes: estimate.notes || '',
                    status: estimate.status || 'Draft',
                    lineItems: estimate.items?.map((item, idx) => ({
                        id: idx + 1,
                        itemId: item.itemId,
                        name: item.name,
                        sku: item.sku || '',
                        category: item.category || '',
                        price: item.price,
                        qty: item.qty,
                        gstPercent: item.gstPercent || 18,
                        discount: item.discount || 0
                    })) || [],
                    selectedAddons: estimate.addons?.map((addon, idx) => ({
                        id: idx + 1,
                        addonId: addon.addonId || addon.id,
                        name: addon.name,
                        unit: addon.unit,
                        price: addon.price,
                        qty: addon.qty || 1,
                        gstPercent: addon.gstPercent || addon.gst || 18
                    })) || []
                });
            } else {
                setFormData({
                    customer: '',
                    mobile: '',
                    email: '',
                    address: '',
                    validityDays: 15,
                    notes: '',
                    status: 'Draft',
                    lineItems: [],
                    selectedAddons: []
                });
            }
            setActiveTab('customer');
            setSearchTerm('');
            setSelectedPartPreview(null);
        }
    }, [isOpen, estimate]);

    if (!isOpen) return null;

    // Get selected part IDs for compatibility filtering
    const selectedPartIds = formData.lineItems.map(li => li.itemId);

    // Get compatible items based on selected parts
    const compatibleItems = getCompatibleParts(selectedPartIds);
    const hasCompatibilityFilter = combinations.some(c => c.isActive);

    // Filter available items by search and optionally by compatibility
    // Show all items when: no parts selected OR showCompatibleOnly is false
    const shouldFilterByCompatibility = showCompatibleOnly && hasCompatibilityFilter && selectedPartIds.length > 0;
    const baseItems = shouldFilterByCompatibility ? compatibleItems : items;
    const filteredItems = baseItems.filter(item =>
        (item.isActive !== false) &&
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.partId?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Group filtered items by category for display
    const itemsByCategory = filteredItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    // Add item to line items
    const handleAddItem = (item) => {
        const existing = formData.lineItems.find(li => li.itemId === item.id);
        if (existing) {
            // Increase quantity if already exists
            setFormData(prev => ({
                ...prev,
                lineItems: prev.lineItems.map(li =>
                    li.itemId === item.id ? { ...li, qty: li.qty + 1 } : li
                )
            }));
        } else {
            // Add new line item
            const newLineItem = {
                id: Date.now(),
                itemId: item.id,
                name: item.name,
                sku: item.sku || '',
                category: item.category || '',
                price: item.sellingPrice || item.price || 0,
                qty: 1,
                gstPercent: item.gstPercent || 18,
                discount: 0
            };
            setFormData(prev => ({
                ...prev,
                lineItems: [...prev.lineItems, newLineItem]
            }));
        }
        setShowItemSearch(false);
        setSearchTerm('');
    };

    // Remove item from line items
    const handleRemoveItem = (lineItemId) => {
        setFormData(prev => ({
            ...prev,
            lineItems: prev.lineItems.filter(li => li.id !== lineItemId)
        }));
    };

    // Update line item
    const updateLineItem = (lineItemId, field, value) => {
        setFormData(prev => ({
            ...prev,
            lineItems: prev.lineItems.map(li =>
                li.id === lineItemId ? { ...li, [field]: value } : li
            )
        }));
    };

    // Load a saved model
    const handleLoadModel = (model) => {
        setFormData(prev => ({
            ...prev,
            lineItems: [...prev.lineItems, ...model.items.map((item, idx) => ({
                ...item,
                id: Date.now() + idx
            }))]
        }));
    };

    // Save current configuration as model
    const handleSaveAsModel = () => {
        if (modelName.trim() && formData.lineItems.length > 0) {
            saveModel({
                name: modelName.trim(),
                items: formData.lineItems.map(li => ({
                    itemId: li.itemId,
                    name: li.name,
                    sku: li.sku,
                    category: li.category,
                    price: li.price,
                    qty: li.qty,
                    gstPercent: li.gstPercent,
                    discount: li.discount
                }))
            });
            setShowSaveModelModal(false);
            setModelName('');
            alert(`Model "${modelName}" saved successfully!`);
        }
    };

    // Calculate totals for parts
    const calculateLineTotal = (item) => {
        const baseTotal = item.price * item.qty;
        const discount = (item.discount / 100) * baseTotal;
        return baseTotal - discount;
    };

    const calculateLineGST = (item) => {
        const lineTotal = calculateLineTotal(item);
        return (item.gstPercent / 100) * lineTotal;
    };

    // Calculate totals for addons
    const calculateAddonTotal = (addon) => {
        return addon.price * (addon.qty || 1);
    };

    const calculateAddonGST = (addon) => {
        const addonTotal = calculateAddonTotal(addon);
        return (addon.gstPercent / 100) * addonTotal;
    };

    // Parts subtotals
    const partsSubtotal = formData.lineItems.reduce((acc, item) => acc + calculateLineTotal(item), 0);
    const partsGST = formData.lineItems.reduce((acc, item) => acc + calculateLineGST(item), 0);

    // Addons subtotals
    const addonsSubtotal = formData.selectedAddons.reduce((acc, addon) => acc + calculateAddonTotal(addon), 0);
    const addonsGST = formData.selectedAddons.reduce((acc, addon) => acc + calculateAddonGST(addon), 0);

    // Grand totals
    const subtotal = partsSubtotal + addonsSubtotal;
    const totalGST = partsGST + addonsGST;
    const grandTotal = subtotal + totalGST;

    // Add addon to selected addons
    const handleAddAddon = (addon) => {
        const existing = formData.selectedAddons.find(a => a.addonId === addon.id);
        if (existing) {
            setFormData(prev => ({
                ...prev,
                selectedAddons: prev.selectedAddons.map(a =>
                    a.addonId === addon.id ? { ...a, qty: (a.qty || 1) + 1 } : a
                )
            }));
        } else {
            const newAddon = {
                id: Date.now(),
                addonId: addon.id,
                name: addon.name,
                unit: addon.unit,
                price: addon.price,
                qty: 1,
                gstPercent: addon.gst || 18
            };
            setFormData(prev => ({
                ...prev,
                selectedAddons: [...prev.selectedAddons, newAddon]
            }));
        }
    };

    const handleRemoveAddon = (addonLineId) => {
        setFormData(prev => ({
            ...prev,
            selectedAddons: prev.selectedAddons.filter(a => a.id !== addonLineId)
        }));
    };

    const updateAddonQty = (addonLineId, qty) => {
        setFormData(prev => ({
            ...prev,
            selectedAddons: prev.selectedAddons.map(a =>
                a.id === addonLineId ? { ...a, qty: Math.max(1, qty) } : a
            )
        }));
    };

    // Handle save
    const handleSave = (status = formData.status) => {
        const estimateData = {
            customer: formData.customer,
            mobile: formData.mobile,
            email: formData.email,
            address: formData.address,
            validityDays: formData.validityDays,
            notes: formData.notes,
            status,
            items: formData.lineItems.map(li => ({
                itemId: li.itemId,
                name: li.name,
                sku: li.sku,
                category: li.category,
                price: li.price,
                qty: li.qty,
                gstPercent: li.gstPercent,
                discount: li.discount
            })),
            addons: formData.selectedAddons.map(a => ({
                addonId: a.addonId,
                name: a.name,
                unit: a.unit,
                price: a.price,
                qty: a.qty,
                gstPercent: a.gstPercent
            })),
            partsSubtotal,
            partsGST,
            addonsSubtotal,
            addonsGST,
            subtotal,
            gstAmount: totalGST,
            total: grandTotal
        };
        onSave(estimateData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col border dark:border-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {estimate ? 'Edit Estimate' : 'Create New Estimate'}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {estimate ? `Editing: ${estimate.id}` : 'Add customer details and select parts'}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <button
                        onClick={() => setActiveTab('customer')}
                        className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'customer'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        <User className="w-4 h-4 inline mr-2" />
                        Customer Details
                    </button>
                    <button
                        onClick={() => setActiveTab('items')}
                        className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'items'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        <Package className="w-4 h-4" />
                        Parts & Items
                        {formData.lineItems.length > 0 && (
                            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                                {formData.lineItems.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'preview'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        <Monitor className="w-4 h-4" />
                        3D Preview
                        {formData.lineItems.length > 0 && (
                            <span className="bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded-full animate-pulse">
                                Live
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('addons')}
                        className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'addons'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        <Wrench className="w-4 h-4" />
                        Add Ons
                        {formData.selectedAddons.length > 0 && (
                            <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">
                                {formData.selectedAddons.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('summary')}
                        className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'summary'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                    >
                        <Calculator className="w-4 h-4 inline mr-2" />
                        Summary & Total
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'customer' && (
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Customer Name *"
                                    placeholder="e.g. Ramesh Patel"
                                    value={formData.customer}
                                    onChange={e => setFormData({ ...formData, customer: e.target.value })}
                                />
                                <Input
                                    label="Mobile Number *"
                                    placeholder="e.g. 9876543210"
                                    value={formData.mobile}
                                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    placeholder="customer@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                                <Input
                                    label="Validity (Days)"
                                    type="number"
                                    min="1"
                                    value={formData.validityDays}
                                    onChange={e => setFormData({ ...formData, validityDays: parseInt(e.target.value) || 15 })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Address</label>
                                <textarea
                                    rows={3}
                                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white dark:placeholder-slate-500"
                                    placeholder="Customer address..."
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Notes</label>
                                <textarea
                                    rows={2}
                                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white dark:placeholder-slate-500"
                                    placeholder="Additional notes for this estimate..."
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'items' && (
                        <div className="p-6">
                            {/* Toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <Button onClick={() => setShowItemSearch(true)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Part
                                    </Button>
                                    {savedModels.length > 0 && (
                                        <div className="relative">
                                            <select
                                                className="h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none dark:text-white"
                                                onChange={(e) => {
                                                    const model = savedModels.find(m => m.id === e.target.value);
                                                    if (model) handleLoadModel(model);
                                                    e.target.value = '';
                                                }}
                                            >
                                                <option value="">Load Saved Model...</option>
                                                {savedModels.map(model => (
                                                    <option key={model.id} value={model.id}>{model.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                                {formData.lineItems.length > 0 && (
                                    <Button variant="secondary" onClick={() => setShowSaveModelModal(true)}>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save as Model
                                    </Button>
                                )}
                            </div>

                            {/* Item Search Modal */}
                            {showItemSearch && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col border dark:border-slate-800">
                                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                            <h3 className="font-semibold text-slate-900 dark:text-white">Select Part from Item Master</h3>
                                            <Button variant="ghost" size="sm" onClick={() => setShowItemSearch(false)} className="dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700">
                                                <X className="w-5 h-5" />
                                            </Button>
                                        </div>
                                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <Input
                                                    placeholder="Search by name, SKU, category..."
                                                    className="pl-9"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    autoFocus
                                                />
                                            </div>

                                            {/* Compatibility Filter Toggle */}
                                            {hasCompatibilityFilter && (
                                                <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800">
                                                    <div className="flex items-center gap-2">
                                                        <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                        <span className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                                                            {showCompatibleOnly ? 'Showing compatible parts only' : 'Showing all parts'}
                                                        </span>
                                                        <Badge variant="primary" className="text-xs">
                                                            {filteredItems.length} {showCompatibleOnly ? 'compatible' : 'total'}
                                                        </Badge>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowCompatibleOnly(!showCompatibleOnly)}
                                                        className="flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
                                                    >
                                                        {showCompatibleOnly ? (
                                                            <>
                                                                <ToggleRight className="w-5 h-5" />
                                                                Show All
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ToggleLeft className="w-5 h-5" />
                                                                Filter Compatible
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {filteredItems.map(item => (
                                                    <div
                                                        key={item.id}
                                                        className="p-3 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 cursor-pointer transition-all group"
                                                        onClick={() => handleAddItem(item)}
                                                        onMouseEnter={() => setSelectedPartPreview(item)}
                                                        onMouseLeave={() => setSelectedPartPreview(null)}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-medium text-slate-900 dark:text-white truncate">{item.name}</h4>
                                                                    {item.isNew && <Badge variant="primary" className="text-xs">New</Badge>}
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{item.sku}</span>
                                                                    <span className="text-xs text-slate-400">•</span>
                                                                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.category}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-bold text-blue-600 dark:text-blue-400">₹ {(item.sellingPrice || item.price || 0).toLocaleString()}</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">Stock: {item.stockQty || item.stock || 0}</p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                                            <span>GST: {item.gstPercent || 18}%</span>
                                                            <span>MRP: ₹ {(item.mrp || item.sellingPrice || item.price || 0).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {filteredItems.length === 0 && (
                                                <div className="text-center py-8 text-slate-500">
                                                    <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                                                    <p>No items found matching "{searchTerm}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Save Model Modal */}
                            {showSaveModelModal && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6 border dark:border-slate-800">
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Save Configuration as Model</h3>
                                        <Input
                                            label="Model Name"
                                            placeholder="e.g. Gaming PC Build, Office Setup"
                                            value={modelName}
                                            onChange={(e) => setModelName(e.target.value)}
                                            autoFocus
                                        />
                                        <p className="text-xs text-slate-500 mt-2">
                                            This will save {formData.lineItems.length} items as a reusable model.
                                        </p>
                                        <div className="flex justify-end gap-3 mt-6">
                                            <Button variant="ghost" onClick={() => setShowSaveModelModal(false)}>Cancel</Button>
                                            <Button onClick={handleSaveAsModel} disabled={!modelName.trim()}>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Model
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Line Items Table */}
                            {formData.lineItems.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                                    <Package className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                                    <p className="text-slate-500 dark:text-slate-400 mb-3">No items added yet</p>
                                    <Button onClick={() => setShowItemSearch(true)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add First Part
                                    </Button>
                                </div>
                            ) : (
                                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-800">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">Part Details</th>
                                                <th className="px-4 py-3 text-center font-medium text-slate-600 dark:text-slate-400 w-24">Qty</th>
                                                <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400 w-28">Price</th>
                                                <th className="px-4 py-3 text-center font-medium text-slate-600 dark:text-slate-400 w-24">GST %</th>
                                                <th className="px-4 py-3 text-center font-medium text-slate-600 dark:text-slate-400 w-24">Disc %</th>
                                                <th className="px-4 py-3 text-right font-medium text-slate-600 dark:text-slate-400 w-32">Total</th>
                                                <th className="px-4 py-3 w-16"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {formData.lineItems.map((item, index) => (
                                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.sku} • {item.category}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            className="w-full text-center border border-slate-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-800 dark:text-white"
                                                            value={item.qty}
                                                            onChange={(e) => updateLineItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            className="w-full text-right border border-slate-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-800 dark:text-white"
                                                            value={item.price}
                                                            onChange={(e) => updateLineItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="28"
                                                            className="w-full text-center border border-slate-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-800 dark:text-white"
                                                            value={item.gstPercent}
                                                            onChange={(e) => updateLineItem(item.id, 'gstPercent', parseFloat(e.target.value) || 0)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            className="w-full text-center border border-slate-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-800 dark:text-white"
                                                            value={item.discount}
                                                            onChange={(e) => updateLineItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                                                        ₹ {calculateLineTotal(item).toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => handleRemoveItem(item.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'preview' && (
                        <div className="p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Monitor className="w-5 h-5" />
                                        Live PC Configuration Preview
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        See your selected components visualized on a 3D computer model
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹ {grandTotal.toLocaleString()}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{formData.lineItems.length} components</p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 min-h-[500px]">
                                <ComputerVisualizer lineItems={formData.lineItems} />
                            </div>

                            <div className="mt-4 flex items-center justify-center gap-4">
                                <Button onClick={() => setShowItemSearch(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add More Parts
                                </Button>
                                {formData.lineItems.length > 0 && (
                                    <Button variant="secondary" onClick={() => setShowSaveModelModal(true)}>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save This Configuration
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'addons' && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Available Addons List */}
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                        <Wrench className="w-5 h-5" />
                                        Available Services
                                    </h3>
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                        {addons.filter(a => a.isActive !== false).map(addon => {
                                            const isAdded = formData.selectedAddons.some(a => a.addonId === addon.id);
                                            return (
                                                <div
                                                    key={addon.id}
                                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${isAdded
                                                        ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                        }`}
                                                    onClick={() => handleAddAddon(addon)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${isAdded ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                                                <Wrench className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-900 dark:text-white">{addon.name}</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">{addon.unit} • GST: {addon.gst}%</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-blue-600 dark:text-blue-400">₹ {addon.price.toLocaleString()}</p>
                                                            {isAdded && (
                                                                <span className="text-xs text-green-600 dark:text-green-400">✓ Added</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {addon.description && (
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 pl-11">{addon.description}</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {addons.filter(a => a.isActive !== false).length === 0 && (
                                            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                                <Wrench className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                                                <p>No services available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Selected Addons */}
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                        <Check className="w-5 h-5" />
                                        Selected Services ({formData.selectedAddons.length})
                                    </h3>
                                    {formData.selectedAddons.length > 0 ? (
                                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-50 dark:bg-slate-800">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-slate-600 dark:text-slate-400">Service</th>
                                                        <th className="px-3 py-2 text-center text-slate-600 dark:text-slate-400 w-20">Qty</th>
                                                        <th className="px-3 py-2 text-right text-slate-600 dark:text-slate-400 w-24">Total</th>
                                                        <th className="px-3 py-2 w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                                    {formData.selectedAddons.map(addon => (
                                                        <tr key={addon.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                            <td className="px-3 py-2">
                                                                <p className="font-medium text-slate-900 dark:text-white">{addon.name}</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">₹{addon.price} × {addon.unit}</p>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    className="w-full text-center border border-slate-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-800 dark:text-white"
                                                                    value={addon.qty || 1}
                                                                    onChange={(e) => updateAddonQty(addon.id, parseInt(e.target.value) || 1)}
                                                                />
                                                            </td>
                                                            <td className="px-3 py-2 text-right font-medium text-slate-900 dark:text-white">
                                                                ₹ {calculateAddonTotal(addon).toLocaleString()}
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                    onClick={() => handleRemoveAddon(addon.id)}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600 dark:text-slate-400">Services Subtotal:</span>
                                                    <span className="font-medium dark:text-white">₹ {addonsSubtotal.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm mt-1">
                                                    <span className="text-slate-600 dark:text-slate-400">GST:</span>
                                                    <span className="font-medium dark:text-white">₹ {addonsGST.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                                            <Wrench className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                                            <p className="text-slate-500 dark:text-slate-400">No services added yet</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click on a service from the list to add it</p>
                                        </div>
                                    )}

                                    {/* Running Total Preview */}
                                    <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600 dark:text-blue-300">Parts Total:</span>
                                            <span className="dark:text-white">₹ {(partsSubtotal + partsGST).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm mt-1">
                                            <span className="text-slate-600 dark:text-blue-300">Services Total:</span>
                                            <span className="dark:text-white">₹ {(addonsSubtotal + addonsGST).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold text-blue-900 dark:text-blue-400 mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                                            <span>Grand Total:</span>
                                            <span>₹ {grandTotal.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'summary' && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Items & Services Summary */}
                                <div className="space-y-4">
                                    {/* Parts Summary */}
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                                            <Package className="w-5 h-5" />
                                            Parts ({formData.lineItems.length})
                                        </h3>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {formData.lineItems.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.qty} × ₹{item.price.toLocaleString()}</p>
                                                    </div>
                                                    <p className="font-medium dark:text-white">₹ {calculateLineTotal(item).toLocaleString()}</p>
                                                </div>
                                            ))}
                                            {formData.lineItems.length === 0 && (
                                                <p className="text-sm text-slate-400 italic">No parts added</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Services Summary */}
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                                            <Wrench className="w-5 h-5" />
                                            Services ({formData.selectedAddons.length})
                                        </h3>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {formData.selectedAddons.map((addon) => (
                                                <div key={addon.id} className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-sm">
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{addon.name}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{addon.qty || 1} × ₹{addon.price.toLocaleString()}</p>
                                                    </div>
                                                    <p className="font-medium dark:text-white">₹ {calculateAddonTotal(addon).toLocaleString()}</p>
                                                </div>
                                            ))}
                                            {formData.selectedAddons.length === 0 && (
                                                <p className="text-sm text-slate-400 italic">No services added</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing Summary */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Calculator className="w-5 h-5" />
                                        Pricing Details
                                    </h3>
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                                        <div className="space-y-3">
                                            {/* Parts Breakdown */}
                                            <div className="pb-3 border-b border-blue-200/50 dark:border-blue-700/50">
                                                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-blue-300 mb-2">Parts</p>
                                                <div className="flex justify-between text-slate-600 dark:text-slate-300 text-sm">
                                                    <span>Subtotal</span>
                                                    <span>₹ {partsSubtotal.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-slate-600 dark:text-slate-300 text-sm">
                                                    <span>GST</span>
                                                    <span>₹ {partsGST.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            {/* Services Breakdown */}
                                            <div className="pb-3 border-b border-blue-200/50 dark:border-blue-700/50">
                                                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-blue-300 mb-2">Services</p>
                                                <div className="flex justify-between text-slate-600 dark:text-slate-300 text-sm">
                                                    <span>Subtotal</span>
                                                    <span>₹ {addonsSubtotal.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-slate-600 dark:text-slate-300 text-sm">
                                                    <span>GST</span>
                                                    <span>₹ {addonsGST.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            {/* Totals */}
                                            <div className="flex justify-between text-slate-700 dark:text-slate-200">
                                                <span className="font-medium">Combined Subtotal</span>
                                                <span className="font-medium">₹ {subtotal.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-700 dark:text-slate-200">
                                                <span className="font-medium">Total GST</span>
                                                <span className="font-medium">₹ {totalGST.toLocaleString()}</span>
                                            </div>
                                            <div className="border-t border-blue-200 dark:border-blue-800 pt-3 mt-3">
                                                <div className="flex justify-between text-xl font-bold text-blue-900 dark:text-blue-400">
                                                    <span>Grand Total</span>
                                                    <span>₹ {grandTotal.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Customer Info Summary */}
                                    {formData.customer && (
                                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Customer</h4>
                                            <p className="font-medium text-slate-900 dark:text-white">{formData.customer}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{formData.mobile}</p>
                                            {formData.email && <p className="text-sm text-slate-500 dark:text-slate-400">{formData.email}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            {formData.lineItems.length > 0 && (
                                <span className="font-medium text-slate-900 dark:text-white">
                                    Total: ₹ {grandTotal.toLocaleString()}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button
                                variant="secondary"
                                onClick={() => handleSave('Draft')}
                                disabled={!formData.customer || formData.lineItems.length === 0}
                            >
                                Save as Draft
                            </Button>
                            <Button
                                onClick={() => handleSave('Sent')}
                                disabled={!formData.customer || !formData.mobile || formData.lineItems.length === 0}
                            >
                                <Check className="w-4 h-4 mr-2" />
                                {estimate ? 'Update Estimate' : 'Create Estimate'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

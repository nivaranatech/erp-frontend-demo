import React, { useState, useEffect } from 'react';
import { X, Check, Layers, Package, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { useSessionData } from '../contexts/SessionDataContext';

export function CombinationModal({ isOpen, onClose, combination, onSave }) {
    const { items } = useSessionData();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parts: [],
        isActive: true
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCategories, setExpandedCategories] = useState({});

    // Group items by category
    const itemsByCategory = items.reduce((acc, item) => {
        if (item.isActive !== false) {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
        }
        return acc;
    }, {});

    const categories = Object.keys(itemsByCategory).sort();

    useEffect(() => {
        if (isOpen) {
            if (combination) {
                setFormData({
                    name: combination.name || '',
                    description: combination.description || '',
                    parts: combination.parts || [],
                    isActive: combination.isActive !== false
                });
            } else {
                setFormData({
                    name: '',
                    description: '',
                    parts: [],
                    isActive: true
                });
            }
            setSearchTerm('');
            // Expand all categories by default
            const expanded = {};
            categories.forEach(cat => expanded[cat] = true);
            setExpandedCategories(expanded);
        }
    }, [isOpen, combination]);

    if (!isOpen) return null;

    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const togglePart = (partId) => {
        setFormData(prev => ({
            ...prev,
            parts: prev.parts.includes(partId)
                ? prev.parts.filter(id => id !== partId)
                : [...prev.parts, partId]
        }));
    };

    const selectAllInCategory = (category) => {
        const categoryPartIds = itemsByCategory[category].map(item => item.id);
        const allSelected = categoryPartIds.every(id => formData.parts.includes(id));

        if (allSelected) {
            // Deselect all
            setFormData(prev => ({
                ...prev,
                parts: prev.parts.filter(id => !categoryPartIds.includes(id))
            }));
        } else {
            // Select all
            setFormData(prev => ({
                ...prev,
                parts: [...new Set([...prev.parts, ...categoryPartIds])]
            }));
        }
    };

    const handleSubmit = () => {
        if (!formData.name.trim()) {
            alert('Please enter a combination name');
            return;
        }
        if (formData.parts.length < 2) {
            alert('Please select at least 2 parts for the combination');
            return;
        }
        onSave(formData);
    };

    const filteredItemsByCategory = {};
    categories.forEach(cat => {
        const filtered = itemsByCategory[cat].filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.partId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filtered.length > 0) {
            filteredItemsByCategory[cat] = filtered;
        }
    });

    const selectedParts = items.filter(item => formData.parts.includes(item.id));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border dark:border-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {combination ? 'Edit Combination' : 'Create New Combination'}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {combination ? 'Update compatible parts' : 'Define a set of compatible PC parts'}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex">
                    {/* Left: Part Selection */}
                    <div className="w-2/3 border-r border-slate-200 dark:border-slate-800 flex flex-col">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search parts..."
                                    className="pl-9 bg-white dark:bg-slate-800 dark:text-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {Object.entries(filteredItemsByCategory).map(([category, categoryItems]) => {
                                const isExpanded = expandedCategories[category];
                                const selectedCount = categoryItems.filter(item =>
                                    formData.parts.includes(item.id)
                                ).length;
                                const allSelected = selectedCount === categoryItems.length;

                                return (
                                    <div key={category} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                        <div
                                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                                            onClick={() => toggleCategory(category)}
                                        >
                                            <div className="flex items-center gap-2">
                                                {isExpanded ? (
                                                    <ChevronDown className="w-4 h-4 text-slate-500" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-slate-500" />
                                                )}
                                                <span className="font-medium text-slate-900 dark:text-white">{category}</span>
                                                <Badge variant="default" className="text-xs">
                                                    {categoryItems.length}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {selectedCount > 0 && (
                                                    <span className="text-xs text-indigo-600 font-medium">
                                                        {selectedCount} selected
                                                    </span>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); selectAllInCategory(category); }}
                                                    className="text-xs"
                                                >
                                                    {allSelected ? 'Deselect All' : 'Select All'}
                                                </Button>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="p-2 space-y-1 bg-white dark:bg-slate-900">
                                                {categoryItems.map(item => {
                                                    const isSelected = formData.parts.includes(item.id);
                                                    return (
                                                        <div
                                                            key={item.id}
                                                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isSelected
                                                                ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800'
                                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                                                                }`}
                                                            onClick={() => togglePart(item.id)}
                                                        >
                                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected
                                                                ? 'bg-indigo-600 border-indigo-600'
                                                                : 'border-slate-300 dark:border-slate-600'
                                                                }`}>
                                                                {isSelected && <Check className="w-3 h-3 text-white" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-slate-900 dark:text-white truncate">{item.name}</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">{item.partId} • ₹{item.sellingPrice?.toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Combination Details */}
                    <div className="w-1/3 flex flex-col">
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Combination Name *
                                </label>
                                <Input
                                    placeholder="e.g. Intel 12th Gen Budget Build"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    rows={2}
                                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:placeholder-slate-500"
                                    placeholder="Brief description of this build..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-700"
                                />
                                <label htmlFor="isActive" className="text-sm text-slate-700 dark:text-slate-300">
                                    Active (used for compatibility filtering)
                                </label>
                            </div>
                        </div>

                        {/* Selected Parts Summary */}
                        <div className="flex-1 overflow-y-auto p-4 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    Selected Parts
                                </h3>
                                <Badge variant={formData.parts.length >= 2 ? 'success' : 'warning'}>
                                    {formData.parts.length} selected
                                </Badge>
                            </div>

                            {selectedParts.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedParts.map(part => (
                                        <div
                                            key={part.id}
                                            className="flex items-center justify-between p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-sm"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-slate-900 dark:text-white truncate">{part.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{part.category}</p>
                                            </div>
                                            <button
                                                onClick={() => togglePart(part.id)}
                                                className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded text-indigo-600 dark:text-indigo-400"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    <Package className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                                    <p className="text-sm">No parts selected</p>
                                    <p className="text-xs mt-1">Select at least 2 parts from the left panel</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        {formData.parts.length < 2 && (
                            <span className="text-amber-600">Select at least 2 parts</span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={formData.parts.length < 2}>
                            <Check className="w-4 h-4 mr-2" />
                            {combination ? 'Update Combination' : 'Create Combination'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CombinationModal;

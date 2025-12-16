import React, { useState, useRef } from 'react';
import {
    Plus, Search, Filter, MoreHorizontal, Package,
    Download, Upload, Trash2, Edit, Copy, Eye,
    ChevronDown, X, FileSpreadsheet, AlertTriangle,
    CheckSquare, Square
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '../components/ui/Table';
import { ItemModal } from '../components/ItemModal';
import { useSessionData } from '../contexts/SessionDataContext';

export default function Items() {
    // Use session data context (resets on page refresh)
    const { items, setItems, addItem, updateItem, deleteItem } = useSessionData();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedLocation, setSelectedLocation] = useState('All');
    const [showLowStock, setShowLowStock] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const fileInputRef = useRef(null);

    // Get unique categories and locations
    const categories = ['All', ...new Set(items.map(i => i.category))];
    const locations = ['All', ...new Set(items.map(i => i.location))];

    // Filter items
    const filteredItems = items.filter(item => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.partId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesLocation = selectedLocation === 'All' || item.location === selectedLocation;
        const matchesLowStock = !showLowStock || item.stockQty <= (item.reorderLevel || 5);
        return matchesSearch && matchesCategory && matchesLocation && matchesLowStock;
    });

    // Stats calculations
    const totalItems = items.length;
    const totalValue = items.reduce((acc, item) => acc + ((item.sellingPrice || item.price || 0) * (item.stockQty || item.stock || 0)), 0);
    const lowStockCount = items.filter(i => (i.stockQty || i.stock || 0) <= (i.reorderLevel || 5)).length;
    const outOfStockCount = items.filter(i => (i.stockQty || i.stock || 0) === 0).length;

    // Handlers
    const handleAddItem = () => {
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    const handleEditItem = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleDuplicateItem = (item) => {
        const newItem = {
            ...item,
            id: Math.max(...items.map(i => i.id)) + 1,
            partId: `PRT-${String(Date.now()).slice(-6)}`,
            sku: `${item.sku}-COPY`,
            name: `${item.name} (Copy)`,
            auditTrail: [
                {
                    date: new Date().toISOString(),
                    user: 'Admin User',
                    action: 'Created (Duplicated)',
                    field: null,
                    oldValue: null,
                    newValue: null
                }
            ]
        };
        setItems([...items, newItem]);
    };

    const handleDeleteItem = (itemId, e) => {
        // Stop event propagation
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }

        if (window.confirm('Are you sure you want to delete this item?')) {
            setItems(items.filter(i => i.id !== itemId));
            setSelectedItems(selectedItems.filter(id => id !== itemId));
        }
    };

    const handleSaveItem = (itemData) => {
        const currentUser = 'Admin User';
        const now = new Date().toISOString();

        if (selectedItem) {
            // Edit existing item
            const updatedItems = items.map(item => {
                if (item.id === selectedItem.id) {
                    // Track changes for audit
                    const changes = [];
                    Object.keys(itemData).forEach(key => {
                        if (item[key] !== itemData[key] && key !== 'auditTrail') {
                            changes.push({
                                date: now,
                                user: currentUser,
                                action: 'Updated',
                                field: key,
                                oldValue: String(item[key]),
                                newValue: String(itemData[key])
                            });
                        }
                    });

                    return {
                        ...item,
                        ...itemData,
                        auditTrail: [...(item.auditTrail || []), ...changes]
                    };
                }
                return item;
            });
            setItems(updatedItems);
        } else {
            // Add new item
            const newItem = {
                id: Math.max(...items.map(i => i.id), 0) + 1,
                ...itemData,
                auditTrail: [
                    { date: now, user: currentUser, action: 'Created', field: null, oldValue: null, newValue: null }
                ]
            };
            setItems([...items, newItem]);
        }
        setIsModalOpen(false);
    };

    // Bulk operations
    const handleSelectAll = () => {
        if (selectedItems.length === filteredItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(filteredItems.map(i => i.id));
        }
    };

    const handleSelectItem = (itemId) => {
        if (selectedItems.includes(itemId)) {
            setSelectedItems(selectedItems.filter(id => id !== itemId));
        } else {
            setSelectedItems([...selectedItems, itemId]);
        }
    };

    const handleBulkDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
            setItems(items.filter(i => !selectedItems.includes(i.id)));
            setSelectedItems([]);
        }
    };

    const handleBulkToggleActive = (active) => {
        setItems(items.map(item =>
            selectedItems.includes(item.id)
                ? { ...item, isActive: active }
                : item
        ));
        setSelectedItems([]);
    };

    // Export functions
    const exportToCSV = () => {
        const headers = [
            'Part ID', 'Name', 'SKU', 'Category', 'Supplier',
            'Purchase Price', 'Selling Price', 'MRP', 'GST %',
            'Warranty (Months)', 'HSN/SAC', 'Stock Qty', 'Reorder Level',
            'Location', 'Is Active'
        ];

        const rows = items.map(item => [
            item.partId || '',
            item.name,
            item.sku,
            item.category,
            item.supplier || '',
            item.purchasePrice || '',
            item.sellingPrice || item.price || '',
            item.mrp || '',
            item.gstPercent || '',
            item.warrantyMonths || '',
            item.hsnSac || '',
            item.stockQty || item.stock || '',
            item.reorderLevel || '',
            item.location || '',
            item.isActive !== false ? 'Yes' : 'No'
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
        downloadFile(csvContent, 'items_export.csv', 'text/csv');
        setShowExportMenu(false);
    };

    const exportToJSON = () => {
        const jsonContent = JSON.stringify(items, null, 2);
        downloadFile(jsonContent, 'items_export.json', 'application/json');
        setShowExportMenu(false);
    };

    const downloadFile = (content, filename, mimeType) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Import function
    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (file.name.endsWith('.json')) {
                    const importedItems = JSON.parse(e.target.result);
                    if (Array.isArray(importedItems)) {
                        const maxId = Math.max(...items.map(i => i.id), 0);
                        const newItems = importedItems.map((item, index) => ({
                            ...item,
                            id: maxId + index + 1,
                            auditTrail: [
                                { date: new Date().toISOString(), user: 'Admin User', action: 'Imported', field: null, oldValue: null, newValue: null }
                            ]
                        }));
                        setItems([...items, ...newItems]);
                        alert(`Successfully imported ${newItems.length} items`);
                    }
                } else if (file.name.endsWith('.csv')) {
                    // Basic CSV parsing
                    const lines = e.target.result.split('\n');
                    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
                    const maxId = Math.max(...items.map(i => i.id), 0);

                    const newItems = [];
                    for (let i = 1; i < lines.length; i++) {
                        if (!lines[i].trim()) continue;
                        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
                        const item = {
                            id: maxId + i,
                            partId: values[0] || `PRT-${Date.now() + i}`,
                            name: values[1] || 'Unnamed Item',
                            sku: values[2] || `SKU-${Date.now() + i}`,
                            category: values[3] || 'Other',
                            supplier: values[4] || '',
                            purchasePrice: Number(values[5]) || 0,
                            sellingPrice: Number(values[6]) || 0,
                            mrp: Number(values[7]) || 0,
                            gstPercent: Number(values[8]) || 18,
                            warrantyMonths: Number(values[9]) || 0,
                            hsnSac: values[10] || '',
                            stockQty: Number(values[11]) || 0,
                            reorderLevel: Number(values[12]) || 5,
                            location: values[13] || '',
                            isActive: values[14]?.toLowerCase() !== 'no',
                            auditTrail: [
                                { date: new Date().toISOString(), user: 'Admin User', action: 'Imported', field: null, oldValue: null, newValue: null }
                            ]
                        };
                        newItems.push(item);
                    }
                    setItems([...items, ...newItems]);
                    alert(`Successfully imported ${newItems.length} items`);
                }
            } catch (error) {
                alert('Error importing file. Please check the format.');
                console.error(error);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Item Master</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage inventory, spare parts & accessories</p>
                </div>
                <div className="flex gap-2">
                    {/* Import Button */}
                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.json"
                        className="hidden"
                        onChange={handleImport}
                    />

                    {/* Export Dropdown */}
                    <div className="relative">
                        <Button variant="secondary" onClick={() => setShowExportMenu(!showExportMenu)}>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                            <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                        {showExportMenu && (
                            <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                                <button
                                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                    onClick={exportToCSV}
                                >
                                    <FileSpreadsheet className="w-4 h-4" />
                                    Export as CSV
                                </button>
                                <button
                                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                    onClick={exportToJSON}
                                >
                                    <FileSpreadsheet className="w-4 h-4" />
                                    Export as JSON
                                </button>
                            </div>
                        )}
                    </div>

                    <Button onClick={handleAddItem}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Item
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Items</p>
                            <h3 className="text-2xl font-bold text-slate-900">{totalItems}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Stock Value</p>
                            <h3 className="text-2xl font-bold text-slate-900">
                                ₹ {totalValue.toLocaleString()}
                            </h3>
                        </div>
                    </CardContent>
                </Card>
                <Card
                    className={`hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-orange-500 ${showLowStock ? 'ring-2 ring-orange-500' : ''}`}
                    onClick={() => setShowLowStock(!showLowStock)}
                >
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Low Stock</p>
                            <h3 className="text-2xl font-bold text-orange-600">{lowStockCount}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-red-500">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Out of Stock</p>
                            <h3 className="text-2xl font-bold text-red-600">{outOfStockCount}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bulk Actions Bar */}
            {selectedItems.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <Badge variant="primary">{selectedItems.length} selected</Badge>
                        <span className="text-sm text-blue-700">Select items to perform bulk actions</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleBulkToggleActive(true)}>
                            Enable All
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleBulkToggleActive(false)}>
                            Disable All
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleBulkDelete}>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete Selected
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedItems([])}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Main Table Card */}
            <Card className="border-l-4 border-l-indigo-500">
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Search by name, SKU, part ID, supplier..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="secondary" size="md" onClick={() => setShowFilters(!showFilters)}>
                                <Filter className="w-4 h-4 mr-2" />
                                Filters
                                {(selectedCategory !== 'All' || selectedLocation !== 'All' || showLowStock) && (
                                    <Badge variant="primary" className="ml-2">Active</Badge>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 animate-in slide-in-from-top-2">
                            <div className="flex flex-wrap gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                                    <select
                                        className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Location</label>
                                    <select
                                        className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                    >
                                        {locations.map(loc => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        variant={showLowStock ? 'primary' : 'secondary'}
                                        size="sm"
                                        onClick={() => setShowLowStock(!showLowStock)}
                                    >
                                        <AlertTriangle className="w-4 h-4 mr-1" />
                                        Low Stock Only
                                    </Button>
                                </div>
                                <div className="flex items-end ml-auto">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedCategory('All');
                                            setSelectedLocation('All');
                                            setShowLowStock(false);
                                            setSearchTerm('');
                                        }}
                                    >
                                        Clear All
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10">
                                        <button onClick={handleSelectAll} className="p-1 hover:bg-slate-100 rounded">
                                            {selectedItems.length === filteredItems.length && filteredItems.length > 0 ? (
                                                <CheckSquare className="w-4 h-4 text-blue-600" />
                                            ) : (
                                                <Square className="w-4 h-4 text-slate-400" />
                                            )}
                                        </button>
                                    </TableHead>
                                    <TableHead>Part ID / SKU</TableHead>
                                    <TableHead>Item Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead className="text-right">Purchase</TableHead>
                                    <TableHead className="text-right">Selling</TableHead>
                                    <TableHead className="text-center">Stock</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                                            No items found. Try adjusting your filters or add a new item.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredItems.map((item) => {
                                        const stockQty = item.stockQty ?? item.stock ?? 0;
                                        const reorderLevel = item.reorderLevel ?? 5;
                                        const isLowStock = stockQty <= reorderLevel && stockQty > 0;
                                        const isOutOfStock = stockQty === 0;

                                        return (
                                            <TableRow
                                                key={item.id}
                                                className={`${selectedItems.includes(item.id) ? 'bg-blue-50' : ''} ${item.isActive === false ? 'opacity-50' : ''}`}
                                            >
                                                <TableCell>
                                                    <button
                                                        onClick={() => handleSelectItem(item.id)}
                                                        className="p-1 hover:bg-slate-100 rounded"
                                                    >
                                                        {selectedItems.includes(item.id) ? (
                                                            <CheckSquare className="w-4 h-4 text-blue-600" />
                                                        ) : (
                                                            <Square className="w-4 h-4 text-slate-400" />
                                                        )}
                                                    </button>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-mono text-xs text-slate-500">{item.partId}</p>
                                                        <p className="font-mono text-xs text-blue-600">{item.sku}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-slate-900">{item.name}</p>
                                                        {item.isNew && <Badge variant="success" className="text-xs">New</Badge>}
                                                        {item.isActive === false && <Badge variant="default" className="text-xs">Disabled</Badge>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="default">{item.category}</Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-600 max-w-[150px] truncate">
                                                    {item.supplier || '-'}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-sm">
                                                    ₹ {(item.purchasePrice || 0).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-sm font-medium">
                                                    ₹ {(item.sellingPrice || item.price || 0).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' :
                                                            isLowStock ? 'bg-orange-500' : 'bg-green-500'
                                                            }`} />
                                                        <span className={`font-medium ${isOutOfStock ? 'text-red-600' :
                                                            isLowStock ? 'text-orange-600' : 'text-slate-900'
                                                            }`}>
                                                            {stockQty}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-500">
                                                    {item.location || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditItem(item)}
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDuplicateItem(item)}
                                                            title="Duplicate"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => handleDeleteItem(item.id, e)}
                                                            title="Delete"
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Table Footer */}
                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
                        <span>Showing {filteredItems.length} of {items.length} items</span>
                        <span>Last updated: {new Date().toLocaleDateString()}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Item Modal */}
            <ItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                item={selectedItem}
                onSave={handleSaveItem}
            />
        </div>
    );
}

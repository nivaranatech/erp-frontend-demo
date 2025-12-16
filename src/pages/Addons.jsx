import React, { useState } from 'react';
import { Plus, Search, Wrench, MoreHorizontal, Edit2, Trash2, Copy, CheckSquare, Square, Download, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { AddonModal } from '../components/AddonModal';
import { useSessionData } from '../contexts/SessionDataContext';

export default function Addons() {
    const { addons, setAddons } = useSessionData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddon, setEditingAddon] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showActions, setShowActions] = useState(null);

    const filteredAddons = addons.filter(addon =>
        addon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        addon.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddNew = () => {
        setEditingAddon(null);
        setIsModalOpen(true);
    };

    const handleEdit = (addon) => {
        setEditingAddon(addon);
        setIsModalOpen(true);
        setShowActions(null);
    };

    const handleSave = (formData) => {
        if (editingAddon) {
            setAddons(prev => prev.map(a => a.id === editingAddon.id ? { ...a, ...formData } : a));
        } else {
            const newAddon = { ...formData, id: Date.now() };
            setAddons(prev => [...prev, newAddon]);
        }
        setIsModalOpen(false);
        setEditingAddon(null);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this service?')) {
            setAddons(prev => prev.filter(a => a.id !== id));
            setShowActions(null);
        }
    };

    const handleDuplicate = (addon) => {
        const duplicate = { ...addon, id: Date.now(), name: `${addon.name} (Copy)` };
        setAddons(prev => [...prev, duplicate]);
        setShowActions(null);
    };

    // Bulk operations
    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredAddons.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredAddons.map(a => a.id));
        }
    };

    const handleBulkDelete = () => {
        if (confirm(`Delete ${selectedIds.length} selected services?`)) {
            setAddons(prev => prev.filter(a => !selectedIds.includes(a.id)));
            setSelectedIds([]);
        }
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(addons, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'addons_export.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Service Addons</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage service charges, labor costs, and add-on services</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button onClick={handleAddNew}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Service
                    </Button>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
                    <span className="text-sm font-medium text-blue-700">
                        {selectedIds.length} service{selectedIds.length > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                            Clear Selection
                        </Button>
                        <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete Selected
                        </Button>
                    </div>
                </div>
            )}

            <Card className="border-l-4 border-l-teal-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-4 w-full">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search services..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="text-sm text-slate-500">
                            {filteredAddons.length} service{filteredAddons.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">
                                    <button onClick={toggleSelectAll} className="p-1 hover:bg-slate-100 rounded">
                                        {selectedIds.length === filteredAddons.length && filteredAddons.length > 0 ? (
                                            <CheckSquare className="w-4 h-4 text-blue-600" />
                                        ) : (
                                            <Square className="w-4 h-4 text-slate-400" />
                                        )}
                                    </button>
                                </TableHead>
                                <TableHead>Service Name</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead>Price (Excl. Tax)</TableHead>
                                <TableHead>GST</TableHead>
                                <TableHead>Price (Incl. Tax)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAddons.map((addon) => {
                                const totalPrice = addon.price * (1 + addon.gst / 100);
                                const isSelected = selectedIds.includes(addon.id);

                                return (
                                    <TableRow key={addon.id} className={isSelected ? 'bg-blue-50' : ''}>
                                        <TableCell>
                                            <button onClick={() => toggleSelect(addon.id)} className="p-1 hover:bg-slate-100 rounded">
                                                {isSelected ? (
                                                    <CheckSquare className="w-4 h-4 text-blue-600" />
                                                ) : (
                                                    <Square className="w-4 h-4 text-slate-400" />
                                                )}
                                            </button>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                    <Wrench className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="font-medium text-slate-900">{addon.name}</span>
                                                    {addon.description && (
                                                        <p className="text-xs text-slate-500 max-w-xs truncate">{addon.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="default">{addon.unit}</Badge>
                                        </TableCell>
                                        <TableCell>₹ {addon.price.toLocaleString()}</TableCell>
                                        <TableCell>{addon.gst}%</TableCell>
                                        <TableCell className="font-medium text-blue-600">
                                            ₹ {totalPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={addon.isActive !== false ? 'success' : 'default'}>
                                                {addon.isActive !== false ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="relative">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowActions(showActions === addon.id ? null : addon.id)}
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>

                                                {showActions === addon.id && (
                                                    <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 animate-in fade-in slide-in-from-top-2 duration-150">
                                                        <button
                                                            onClick={() => handleEdit(addon)}
                                                            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDuplicate(addon)}
                                                            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                            Duplicate
                                                        </button>
                                                        <hr className="my-1" />
                                                        <button
                                                            onClick={() => handleDelete(addon.id)}
                                                            className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    {filteredAddons.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            <Wrench className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p className="font-medium">No services found</p>
                            <p className="text-sm">Add your first service addon to get started</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Click outside handler */}
            {showActions && (
                <div className="fixed inset-0 z-0" onClick={() => setShowActions(null)} />
            )}

            {/* Modal */}
            <AddonModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingAddon(null); }}
                addon={editingAddon}
                onSave={handleSave}
            />
        </div>
    );
}

import React, { useState } from 'react';
import { Plus, Search, Layers, MoreHorizontal, Edit2, Trash2, Copy, Package, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { CombinationModal } from '../components/CombinationModal';
import { useSessionData } from '../contexts/SessionDataContext';

export default function Combinations() {
    const { combinations, setCombinations, items } = useSessionData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCombo, setEditingCombo] = useState(null);
    const [showActions, setShowActions] = useState(null);

    const filteredCombinations = combinations.filter(combo =>
        combo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        combo.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPartNames = (partIds) => {
        return partIds
            .map(id => items.find(item => item.id === id))
            .filter(Boolean)
            .map(item => item.name);
    };

    const getPartsByCategory = (partIds) => {
        const parts = partIds
            .map(id => items.find(item => item.id === id))
            .filter(Boolean);

        const grouped = {};
        parts.forEach(part => {
            if (!grouped[part.category]) {
                grouped[part.category] = [];
            }
            grouped[part.category].push(part);
        });
        return grouped;
    };

    const handleAddNew = () => {
        setEditingCombo(null);
        setIsModalOpen(true);
    };

    const handleEdit = (combo) => {
        setEditingCombo(combo);
        setIsModalOpen(true);
        setShowActions(null);
    };

    const handleSave = (formData) => {
        if (editingCombo) {
            setCombinations(prev => prev.map(c =>
                c.id === editingCombo.id ? { ...c, ...formData, updatedAt: new Date().toISOString() } : c
            ));
        } else {
            const newCombo = {
                ...formData,
                id: Date.now(),
                createdAt: new Date().toISOString()
            };
            setCombinations(prev => [...prev, newCombo]);
        }
        setIsModalOpen(false);
        setEditingCombo(null);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this combination?')) {
            setCombinations(prev => prev.filter(c => c.id !== id));
            setShowActions(null);
        }
    };

    const handleDuplicate = (combo) => {
        const duplicate = {
            ...combo,
            id: Date.now(),
            name: `${combo.name} (Copy)`,
            createdAt: new Date().toISOString()
        };
        setCombinations(prev => [...prev, duplicate]);
        setShowActions(null);
    };

    const toggleActive = (id) => {
        setCombinations(prev => prev.map(c =>
            c.id === id ? { ...c, isActive: !c.isActive } : c
        ));
        setShowActions(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Combination Master</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Define compatible part sets for PC builds</p>
                </div>
                <Button onClick={handleAddNew}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Combination
                </Button>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                    <Layers className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-blue-900">How Combinations Work</p>
                        <p className="text-sm text-blue-700 mt-1">
                            Create combinations of compatible parts. When creating estimates, selecting any part from a combination
                            will filter available options to show only compatible parts from the same combination(s).
                        </p>
                    </div>
                </div>
            </div>

            <Card className="border-l-4 border-l-indigo-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-4 w-full">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search combinations..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="text-sm text-slate-500">
                            {filteredCombinations.length} combination{filteredCombinations.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredCombinations.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Combination Name</TableHead>
                                    <TableHead>Parts</TableHead>
                                    <TableHead>Categories</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCombinations.map((combo) => {
                                    const partsByCategory = getPartsByCategory(combo.parts || []);
                                    const categories = Object.keys(partsByCategory);

                                    return (
                                        <TableRow key={combo.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                        <Layers className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{combo.name}</p>
                                                        {combo.description && (
                                                            <p className="text-xs text-slate-500 max-w-xs truncate">
                                                                {combo.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-4 h-4 text-slate-400" />
                                                    <span className="font-medium">{combo.parts?.length || 0} parts</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1 max-w-xs">
                                                    {categories.slice(0, 3).map(cat => (
                                                        <Badge key={cat} variant="default" className="text-xs">
                                                            {cat}
                                                        </Badge>
                                                    ))}
                                                    {categories.length > 3 && (
                                                        <Badge variant="default" className="text-xs">
                                                            +{categories.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={combo.isActive ? 'success' : 'default'}>
                                                    {combo.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="relative">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setShowActions(showActions === combo.id ? null : combo.id)}
                                                    >
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>

                                                    {showActions === combo.id && (
                                                        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 animate-in fade-in slide-in-from-top-2 duration-150">
                                                            <button
                                                                onClick={() => handleEdit(combo)}
                                                                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDuplicate(combo)}
                                                                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                                Duplicate
                                                            </button>
                                                            <button
                                                                onClick={() => toggleActive(combo.id)}
                                                                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                                                            >
                                                                {combo.isActive ? (
                                                                    <>
                                                                        <XCircle className="w-4 h-4" />
                                                                        Deactivate
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle className="w-4 h-4" />
                                                                        Activate
                                                                    </>
                                                                )}
                                                            </button>
                                                            <hr className="my-1" />
                                                            <button
                                                                onClick={() => handleDelete(combo.id)}
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
                    ) : (
                        <div className="text-center py-12">
                            <Layers className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p className="font-medium text-slate-900">No combinations found</p>
                            <p className="text-sm text-slate-500 mt-1">Create your first combination to define compatible parts</p>
                            <Button className="mt-4" onClick={handleAddNew}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create First Combination
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Click outside handler */}
            {showActions && (
                <div className="fixed inset-0 z-0" onClick={() => setShowActions(null)} />
            )}

            {/* Modal */}
            <CombinationModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingCombo(null); }}
                combination={editingCombo}
                onSave={handleSave}
            />
        </div>
    );
}

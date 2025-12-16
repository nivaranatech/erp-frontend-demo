import React, { useState, useEffect, useMemo } from 'react';
import {
    X, Save, Package, User, Phone, Mail, MapPin, Calendar, FileText,
    Building2, IndianRupee, AlertCircle, Clock, CheckCircle, Trash2
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { useSessionData } from '../contexts/SessionDataContext';

// Common service centers in India for computer parts
const SERVICE_CENTERS = [
    'Samsung Service Center',
    'Kingston RMA Center',
    'Logitech Service',
    'Dell Service Center',
    'HP Service Center',
    'Lenovo Service Center',
    'Asus Service Center',
    'Acer Service Center',
    'Western Digital RMA',
    'Seagate RMA Center',
    'Corsair Support',
    'Transcend Service',
    'SanDisk RMA',
    'ADATA Service',
    'Crucial/Micron RMA',
    'Intel Warranty Center',
    'AMD RMA',
    'NVIDIA Support',
    'MSI Service Center',
    'Gigabyte RMA',
    'Other'
];

// Warranty options
const WARRANTY_OPTIONS = [
    { value: 1, label: '1 Year' },
    { value: 2, label: '2 Years' },
    { value: 3, label: '3 Years' },
    { value: 5, label: '5 Years' }
];

// Source/Purchase locations
const PURCHASE_SOURCES = [
    'Premium IT Park',
    'Amazon',
    'Flipkart',
    'Local Dealer',
    'Other Shop',
    'Direct from Brand',
    'Other'
];

export function RMAModal({ isOpen, onClose, editingRMA = null }) {
    const { addRMA, updateRMA } = useSessionData();

    const initialFormState = {
        customer: '',
        mobile: '',
        email: '',
        address: '',
        partName: '',
        serial: '',
        purchaseDate: '',
        warrantyYears: 1,
        source: 'Premium IT Park',
        customSource: '',
        billNo: '',
        serviceCenter: '',
        customServiceCenter: '',
        defectDescription: '',
        replacementCharge: 0,
        notes: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});

    // Calculate warranty info
    const warrantyInfo = useMemo(() => {
        if (!formData.purchaseDate) return null;
        const purchaseDate = new Date(formData.purchaseDate);
        const warrantyEndDate = new Date(purchaseDate);
        warrantyEndDate.setFullYear(warrantyEndDate.getFullYear() + formData.warrantyYears);
        const today = new Date();
        const isUnderWarranty = warrantyEndDate >= today;
        const daysRemaining = Math.ceil((warrantyEndDate - today) / (1000 * 60 * 60 * 24));

        return {
            endDate: warrantyEndDate.toISOString().split('T')[0],
            isUnderWarranty,
            daysRemaining: isUnderWarranty ? daysRemaining : 0
        };
    }, [formData.purchaseDate, formData.warrantyYears]);

    // Reset form when modal opens/closes or editing changes
    useEffect(() => {
        if (isOpen) {
            if (editingRMA) {
                // Populate form with existing RMA data
                setFormData({
                    customer: editingRMA.customer || '',
                    mobile: editingRMA.mobile || '',
                    email: editingRMA.email || '',
                    address: editingRMA.address || '',
                    partName: editingRMA.partName || '',
                    serial: editingRMA.serial || '',
                    purchaseDate: editingRMA.purchaseDate || '',
                    warrantyYears: editingRMA.warrantyYears || 1,
                    source: SERVICE_CENTERS.includes(editingRMA.source) ? editingRMA.source : 'Other',
                    customSource: PURCHASE_SOURCES.includes(editingRMA.source) ? '' : editingRMA.source,
                    billNo: editingRMA.billNo || '',
                    serviceCenter: SERVICE_CENTERS.includes(editingRMA.serviceCenter) ? editingRMA.serviceCenter : 'Other',
                    customServiceCenter: SERVICE_CENTERS.includes(editingRMA.serviceCenter) ? '' : editingRMA.serviceCenter,
                    defectDescription: editingRMA.defectDescription || '',
                    replacementCharge: editingRMA.replacementCharge || 0,
                    notes: editingRMA.notes || ''
                });
            } else {
                setFormData(initialFormState);
            }
            setErrors({});
        }
    }, [isOpen, editingRMA]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.customer.trim()) newErrors.customer = 'Customer name is required';
        if (!formData.mobile.trim()) {
            newErrors.mobile = 'Mobile number is required';
        } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
            newErrors.mobile = 'Enter valid 10-digit mobile number';
        }
        if (!formData.partName.trim()) newErrors.partName = 'Part name is required';
        if (!formData.serial.trim()) newErrors.serial = 'Serial number is required';
        if (!formData.purchaseDate) newErrors.purchaseDate = 'Purchase date is required';
        if (!formData.serviceCenter) newErrors.serviceCenter = 'Service center is required';
        if (formData.serviceCenter === 'Other' && !formData.customServiceCenter.trim()) {
            newErrors.customServiceCenter = 'Please enter service center name';
        }
        if (!formData.defectDescription.trim()) newErrors.defectDescription = 'Defect description is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const rmaData = {
            customer: formData.customer.trim(),
            mobile: formData.mobile.trim(),
            email: formData.email.trim(),
            address: formData.address.trim(),
            partName: formData.partName.trim(),
            serial: formData.serial.trim(),
            purchaseDate: formData.purchaseDate,
            warrantyYears: formData.warrantyYears,
            warrantyEndDate: warrantyInfo?.endDate,
            isUnderWarranty: warrantyInfo?.isUnderWarranty,
            source: formData.source === 'Other' ? formData.customSource.trim() : formData.source,
            billNo: formData.billNo.trim(),
            serviceCenter: formData.serviceCenter === 'Other' ? formData.customServiceCenter.trim() : formData.serviceCenter,
            defectDescription: formData.defectDescription.trim(),
            replacementCharge: parseFloat(formData.replacementCharge) || 0,
            notes: formData.notes.trim()
        };

        if (editingRMA) {
            updateRMA(editingRMA.id, rmaData);
        } else {
            addRMA(rmaData);
        }

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border dark:border-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-purple-600 to-indigo-600">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                {editingRMA ? `Edit RMA - ${editingRMA.id}` : 'New RMA / Replacement'}
                            </h2>
                            <p className="text-white/80 text-sm">Register warranty replacement request</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Customer Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-white flex items-center gap-2">
                            <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            Customer Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Customer Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="Enter customer name"
                                    value={formData.customer}
                                    onChange={(e) => handleChange('customer', e.target.value)}
                                    className={errors.customer ? 'border-red-500' : ''}
                                />
                                {errors.customer && <p className="text-red-500 text-xs mt-1">{errors.customer}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Mobile Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="10-digit mobile"
                                        value={formData.mobile}
                                        onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        className={`pl-9 ${errors.mobile ? 'border-red-500' : ''}`}
                                    />
                                </div>
                                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="email"
                                        placeholder="customer@email.com"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="Customer address"
                                        value={formData.address}
                                        onChange={(e) => handleChange('address', e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Part Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-white flex items-center gap-2">
                            <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            Part Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Part Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="e.g., Samsung 500GB SSD"
                                    value={formData.partName}
                                    onChange={(e) => handleChange('partName', e.target.value)}
                                    className={errors.partName ? 'border-red-500' : ''}
                                />
                                {errors.partName && <p className="text-red-500 text-xs mt-1">{errors.partName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Serial Number <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="Part serial number"
                                    value={formData.serial}
                                    onChange={(e) => handleChange('serial', e.target.value.toUpperCase())}
                                    className={`font-mono ${errors.serial ? 'border-red-500' : ''}`}
                                />
                                {errors.serial && <p className="text-red-500 text-xs mt-1">{errors.serial}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Purchase Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="date"
                                        value={formData.purchaseDate}
                                        onChange={(e) => handleChange('purchaseDate', e.target.value)}
                                        className={`pl-9 ${errors.purchaseDate ? 'border-red-500' : ''}`}
                                    />
                                </div>
                                {errors.purchaseDate && <p className="text-red-500 text-xs mt-1">{errors.purchaseDate}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Warranty Period</label>
                                <select
                                    value={formData.warrantyYears}
                                    onChange={(e) => handleChange('warrantyYears', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    {WARRANTY_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Warranty Status Display */}
                        {warrantyInfo && (
                            <div className={`p-3 rounded-lg flex items-center gap-3 ${warrantyInfo.isUnderWarranty
                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                }`}>
                                {warrantyInfo.isUnderWarranty ? (
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
                                )}
                                <div>
                                    <p className={`font-medium ${warrantyInfo.isUnderWarranty ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
                                        {warrantyInfo.isUnderWarranty ? 'Under Warranty' : 'Warranty Expired'}
                                    </p>
                                    <p className={`text-sm ${warrantyInfo.isUnderWarranty ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`}>
                                        Warranty {warrantyInfo.isUnderWarranty ? 'valid' : 'expired'} on {new Date(warrantyInfo.endDate).toLocaleDateString('en-GB')}
                                        {warrantyInfo.isUnderWarranty && ` (${warrantyInfo.daysRemaining} days remaining)`}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Purchase Source</label>
                                <select
                                    value={formData.source}
                                    onChange={(e) => handleChange('source', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    {PURCHASE_SOURCES.map(src => (
                                        <option key={src} value={src}>{src}</option>
                                    ))}
                                </select>
                            </div>
                            {formData.source === 'Other' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Specify Source</label>
                                    <Input
                                        placeholder="Enter purchase location"
                                        value={formData.customSource}
                                        onChange={(e) => handleChange('customSource', e.target.value)}
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bill Number</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="Original bill/invoice no."
                                        value={formData.billNo}
                                        onChange={(e) => handleChange('billNo', e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Service Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-white flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            Service Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Service Center <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.serviceCenter}
                                    onChange={(e) => handleChange('serviceCenter', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-800 dark:text-white ${errors.serviceCenter ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                                        }`}
                                >
                                    <option value="">Select service center</option>
                                    {SERVICE_CENTERS.map(center => (
                                        <option key={center} value={center}>{center}</option>
                                    ))}
                                </select>
                                {errors.serviceCenter && <p className="text-red-500 text-xs mt-1">{errors.serviceCenter}</p>}
                            </div>
                            {formData.serviceCenter === 'Other' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Specify Service Center <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="Enter service center name"
                                        value={formData.customServiceCenter}
                                        onChange={(e) => handleChange('customServiceCenter', e.target.value)}
                                        className={errors.customServiceCenter ? 'border-red-500' : ''}
                                    />
                                    {errors.customServiceCenter && <p className="text-red-500 text-xs mt-1">{errors.customServiceCenter}</p>}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Replacement Charge
                                </label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="number"
                                        placeholder="0 for free replacement"
                                        value={formData.replacementCharge}
                                        onChange={(e) => handleChange('replacementCharge', e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Enter 0 if under warranty (free replacement)</p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Defect Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                placeholder="Describe the problem/defect with the part..."
                                value={formData.defectDescription}
                                onChange={(e) => handleChange('defectDescription', e.target.value)}
                                rows={3}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none bg-white dark:bg-slate-800 dark:text-white ${errors.defectDescription ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                                    }`}
                            />
                            {errors.defectDescription && <p className="text-red-500 text-xs mt-1">{errors.defectDescription}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes (Optional)</label>
                            <textarea
                                placeholder="Any additional notes..."
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none bg-white dark:bg-slate-800 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
                        <Save className="w-4 h-4 mr-2" />
                        {editingRMA ? 'Update RMA' : 'Create RMA'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

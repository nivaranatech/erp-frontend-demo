import React, { useState, useEffect, useMemo } from 'react';
import {
    X, Shield, Laptop, User, Phone, MapPin, Mail,
    QrCode, AlertTriangle, CheckCircle, Search, Plus, Minus, Trash2,
    Calendar, Wrench, Package, IndianRupee, FileText, AlertCircle,
    Layers, ToggleLeft, ToggleRight
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { useSessionData } from '../contexts/SessionDataContext';

const SERVICE_TYPES = ['Insite', 'Outsite', 'Remote'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const JOB_STATUSES = ['Open', 'In Progress', 'Pending Parts', 'Completed', 'Delivered'];

export function ComplaintModal({ isOpen, onClose, editingComplaint = null }) {
    const {
        addComplaint,
        updateComplaint,
        departments,
        users,
        items,
        addons,
        amcContracts,
        getAMCByQR,
        getAMCByMobile,
        isAMCActive,
        getCompatibleParts,
        combinations
    } = useSessionData();

    const [activeTab, setActiveTab] = useState('customer');
    const [searchTerm, setSearchTerm] = useState('');
    const [showItemSearch, setShowItemSearch] = useState(false);
    const [showCompatibleOnly, setShowCompatibleOnly] = useState(true);
    const [qrInput, setQrInput] = useState('');
    const [amcWarning, setAmcWarning] = useState(null);
    const [foundAMC, setFoundAMC] = useState(null);

    const [formData, setFormData] = useState({
        customer: '',
        mobile: '',
        email: '',
        address: '',
        device: '',
        serial: '',
        issue: '',
        serviceType: 'Insite',
        department: '',
        departmentId: null,
        priority: 'Medium',
        status: 'Open',
        assignedTo: '',
        assignedToId: null,
        assignedToCustom: '',
        useCustomAssignee: false,
        estimatedCompletion: '',
        amcId: null,
        isAMCCovered: false,
        partsUsed: [],
        servicesApplied: [],
        baseCharge: 0,
        notes: ''
    });

    const [errors, setErrors] = useState({});

    // Get service departments (exclude Sales, Accounts, Management)
    const serviceDepartments = useMemo(() => {
        return departments.filter(d =>
            d.isActive &&
            !['Sales & Selling', 'Accounts', 'Management'].includes(d.name)
        );
    }, [departments]);

    // Get technicians/engineers from users
    const technicians = useMemo(() => {
        return users.filter(u =>
            u.status === 'Active' &&
            ['Engineer', 'Technician', 'Manager'].includes(u.role)
        );
    }, [users]);

    // Get selected part IDs for compatibility filtering
    const selectedPartIds = formData.partsUsed.map(p => p.itemId);

    // Get compatible items based on selected parts
    const compatibleItems = getCompatibleParts(selectedPartIds);
    const hasCompatibilityFilter = combinations.some(c => c.isActive);

    // Filter available items by search and optionally by compatibility
    // Show all items when: no parts selected OR showCompatibleOnly is false
    const shouldFilterByCompatibility = showCompatibleOnly && hasCompatibilityFilter && selectedPartIds.length > 0;
    const baseItems = shouldFilterByCompatibility ? compatibleItems : items;
    const filteredItems = baseItems.filter(item =>
        (item.isActive !== false) &&
        (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.partId?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Calculate billing totals
    const billingTotals = useMemo(() => {
        // Parts total
        const partsSubtotal = formData.partsUsed.reduce((sum, part) =>
            sum + (part.price * part.qty), 0
        );
        const partsGst = formData.partsUsed.reduce((sum, part) =>
            sum + ((part.price * part.qty) * (part.gst || 18) / 100), 0
        );

        // Services total (considering AMC free services)
        const servicesSubtotal = formData.servicesApplied.reduce((sum, service) =>
            sum + (service.isChargeable ? service.price : 0), 0
        );
        const servicesGst = formData.servicesApplied.reduce((sum, service) =>
            sum + (service.isChargeable ? (service.price * 0.18) : 0), 0
        );

        // AMC discount (free services)
        const amcDiscount = formData.servicesApplied.reduce((sum, service) =>
            sum + (!service.isChargeable ? service.originalPrice || service.price : 0), 0
        );

        const baseCharge = formData.baseCharge || 0;
        const baseChargeGst = baseCharge * 0.18;

        const subtotal = partsSubtotal + servicesSubtotal + baseCharge;
        const totalGst = partsGst + servicesGst + baseChargeGst;
        const grandTotal = subtotal + totalGst;

        return {
            partsSubtotal,
            partsGst,
            servicesSubtotal,
            servicesGst,
            baseCharge,
            baseChargeGst,
            subtotal,
            totalGst,
            grandTotal,
            amcDiscount
        };
    }, [formData.partsUsed, formData.servicesApplied, formData.baseCharge]);

    // Initialize form
    useEffect(() => {
        if (editingComplaint) {
            setFormData({
                customer: editingComplaint.customer || '',
                mobile: editingComplaint.mobile || '',
                email: editingComplaint.email || '',
                address: editingComplaint.address || '',
                device: editingComplaint.device || '',
                serial: editingComplaint.serial || '',
                issue: editingComplaint.issue || '',
                serviceType: editingComplaint.serviceType || 'Insite',
                department: editingComplaint.department || '',
                departmentId: editingComplaint.departmentId || null,
                priority: editingComplaint.priority || 'Medium',
                status: editingComplaint.status || 'Open',
                assignedTo: editingComplaint.assignedTo || '',
                assignedToId: editingComplaint.assignedToId || null,
                assignedToCustom: '',
                useCustomAssignee: !editingComplaint.assignedToId && editingComplaint.assignedTo,
                estimatedCompletion: editingComplaint.estimatedCompletion || '',
                amcId: editingComplaint.amcId || null,
                isAMCCovered: editingComplaint.isAMCCovered || false,
                partsUsed: editingComplaint.partsUsed || [],
                servicesApplied: editingComplaint.servicesApplied || [],
                baseCharge: editingComplaint.baseCharge || 0,
                notes: editingComplaint.notes || ''
            });
            // Load AMC if exists
            if (editingComplaint.amcId) {
                const amc = amcContracts.find(a => a.id === editingComplaint.amcId);
                setFoundAMC(amc);
            }
        } else {
            // Reset form
            setFormData({
                customer: '',
                mobile: '',
                email: '',
                address: '',
                device: '',
                serial: '',
                issue: '',
                serviceType: 'Insite',
                department: '',
                departmentId: null,
                priority: 'Medium',
                status: 'Open',
                assignedTo: '',
                assignedToId: null,
                assignedToCustom: '',
                useCustomAssignee: false,
                estimatedCompletion: '',
                amcId: null,
                isAMCCovered: false,
                partsUsed: [],
                servicesApplied: [],
                baseCharge: 0,
                notes: ''
            });
            setFoundAMC(null);
            setAmcWarning(null);
        }
        setErrors({});
        setActiveTab('customer');
    }, [editingComplaint, isOpen, amcContracts]);

    // Update base charge when department or service type changes
    useEffect(() => {
        if (formData.departmentId) {
            const dept = departments.find(d => d.id === formData.departmentId);
            if (dept) {
                let charge = 0;
                switch (formData.serviceType) {
                    case 'Insite':
                        charge = dept.baseChargeInsite || 0;
                        break;
                    case 'Outsite':
                        charge = dept.baseChargeOutsite || 0;
                        break;
                    case 'Remote':
                        charge = dept.baseChargeRemote || 0;
                        break;
                }
                setFormData(prev => ({ ...prev, baseCharge: charge }));
            }
        }
    }, [formData.departmentId, formData.serviceType, departments]);

    // Handle QR/Mobile scan
    const handleQRScan = () => {
        if (!qrInput.trim()) return;

        // Try to find AMC by QR code ID first
        let amc = getAMCByQR(qrInput.trim());

        // If not found, try by mobile number
        if (!amc) {
            amc = getAMCByMobile(qrInput.trim());
        }

        if (amc) {
            const isActive = isAMCActive(amc);
            setFoundAMC(amc);

            // Auto-fill customer details from AMC
            setFormData(prev => ({
                ...prev,
                customer: amc.customer,
                mobile: amc.mobile,
                email: amc.email || '',
                address: amc.address || '',
                device: amc.deviceName || '',
                serial: amc.deviceSerial || '',
                amcId: amc.id,
                isAMCCovered: isActive
            }));

            if (!isActive) {
                setAmcWarning({
                    type: 'expired',
                    message: `AMC expired on ${new Date(amc.endDate).toLocaleDateString('en-GB')}. Services will be charged.`
                });
            } else {
                setAmcWarning({
                    type: 'active',
                    message: `Active AMC until ${new Date(amc.endDate).toLocaleDateString('en-GB')}. Covered services will be free.`
                });
            }
        } else {
            setAmcWarning({
                type: 'not_found',
                message: 'No AMC found for this QR code or mobile number. Walk-in customer.'
            });
            setFoundAMC(null);
            setFormData(prev => ({
                ...prev,
                amcId: null,
                isAMCCovered: false
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleDepartmentChange = (e) => {
        const deptId = parseInt(e.target.value);
        const dept = departments.find(d => d.id === deptId);
        setFormData(prev => ({
            ...prev,
            departmentId: deptId,
            department: dept?.name || ''
        }));
    };

    const handleAssigneeChange = (e) => {
        const userId = parseInt(e.target.value);
        if (userId === -1) {
            setFormData(prev => ({
                ...prev,
                useCustomAssignee: true,
                assignedToId: null,
                assignedTo: prev.assignedToCustom
            }));
        } else {
            const user = users.find(u => u.id === userId);
            setFormData(prev => ({
                ...prev,
                useCustomAssignee: false,
                assignedToId: userId,
                assignedTo: user?.name || ''
            }));
        }
    };

    // Add part from items
    const handleAddPart = (item) => {
        const existing = formData.partsUsed.find(p => p.itemId === item.id);
        if (existing) {
            setFormData(prev => ({
                ...prev,
                partsUsed: prev.partsUsed.map(p =>
                    p.itemId === item.id ? { ...p, qty: p.qty + 1 } : p
                )
            }));
        } else {
            const newPart = {
                itemId: item.id,
                name: item.name,
                sku: item.sku || '',
                category: item.category || '',
                qty: 1,
                price: item.sellingPrice || item.price || 0,
                gst: item.gstPercent || item.gst || 18
            };
            setFormData(prev => ({
                ...prev,
                partsUsed: [...prev.partsUsed, newPart]
            }));
        }
        setSearchTerm('');
        setShowItemSearch(false);
    };

    // Update part quantity
    const updatePartQty = (itemId, delta) => {
        setFormData(prev => ({
            ...prev,
            partsUsed: prev.partsUsed.map(p =>
                p.itemId === itemId ? { ...p, qty: Math.max(1, p.qty + delta) } : p
            )
        }));
    };

    // Update part price
    const updatePartPrice = (itemId, newPrice) => {
        setFormData(prev => ({
            ...prev,
            partsUsed: prev.partsUsed.map(p =>
                p.itemId === itemId ? { ...p, price: parseFloat(newPrice) || 0 } : p
            )
        }));
    };

    // Remove part
    const removePart = (itemId) => {
        setFormData(prev => ({
            ...prev,
            partsUsed: prev.partsUsed.filter(p => p.itemId !== itemId)
        }));
    };

    // Add service from addons
    const handleAddService = (addon) => {
        const existing = formData.servicesApplied.find(s => s.addonId === addon.id);
        if (existing) return;

        // For AMC customers, set isChargeable to false by default
        const isChargeable = !formData.isAMCCovered;

        const newService = {
            addonId: addon.id,
            name: addon.name,
            originalPrice: addon.price,
            price: addon.price,
            gst: addon.gst || 18,
            isChargeable: isChargeable
        };
        setFormData(prev => ({
            ...prev,
            servicesApplied: [...prev.servicesApplied, newService]
        }));
    };

    // Toggle service chargeable
    const toggleServiceChargeable = (addonId) => {
        setFormData(prev => ({
            ...prev,
            servicesApplied: prev.servicesApplied.map(s =>
                s.addonId === addonId ? { ...s, isChargeable: !s.isChargeable } : s
            )
        }));
    };

    // Update service price
    const updateServicePrice = (addonId, price) => {
        setFormData(prev => ({
            ...prev,
            servicesApplied: prev.servicesApplied.map(s =>
                s.addonId === addonId ? { ...s, price: parseFloat(price) || 0 } : s
            )
        }));
    };

    // Remove service
    const removeService = (addonId) => {
        setFormData(prev => ({
            ...prev,
            servicesApplied: prev.servicesApplied.filter(s => s.addonId !== addonId)
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.customer.trim()) newErrors.customer = 'Customer name required';
        if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number required';
        if (!formData.device.trim()) newErrors.device = 'Device name required';
        if (!formData.issue.trim()) newErrors.issue = 'Issue description required';
        if (!formData.departmentId) newErrors.department = 'Department required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) {
            setActiveTab('customer');
            return;
        }

        const complaintData = {
            ...formData,
            assignedTo: formData.useCustomAssignee ? formData.assignedToCustom : formData.assignedTo,
            ...billingTotals
        };

        if (editingComplaint) {
            updateComplaint(editingComplaint.id, complaintData);
        } else {
            addComplaint(complaintData);
        }

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border dark:border-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Wrench className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                {editingComplaint ? `Edit Job - ${editingComplaint.id}` : 'New Service Job'}
                            </h2>
                            <p className="text-sm text-blue-100 dark:text-blue-200">
                                {editingComplaint ? 'Update job details' : 'Register a new complaint/service request'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    {[
                        { id: 'customer', label: 'Customer & Device', icon: User },
                        { id: 'service', label: 'Service Info', icon: Wrench },
                        { id: 'parts', label: 'Parts Used', icon: Package },
                        { id: 'services', label: 'Services', icon: FileText },
                        { id: 'billing', label: 'Billing', icon: IndianRupee }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Customer & Device Tab */}
                    {activeTab === 'customer' && (
                        <div className="space-y-6">
                            {/* QR Scan Section */}
                            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                                    <QrCode className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    Quick AMC Lookup
                                </h3>
                                <div className="flex gap-3">
                                    <Input
                                        placeholder="Enter QR Code ID or Mobile Number"
                                        value={qrInput}
                                        onChange={(e) => setQrInput(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button onClick={handleQRScan} variant="primary">
                                        <Search className="w-4 h-4 mr-2" />
                                        Lookup
                                    </Button>
                                </div>
                                {amcWarning && (
                                    <div className={`mt-3 flex items-center gap-2 text-sm ${amcWarning.type === 'active' ? 'text-green-700 dark:text-green-400' :
                                        amcWarning.type === 'expired' ? 'text-orange-700 dark:text-orange-400' :
                                            'text-slate-600 dark:text-slate-400'
                                        }`}>
                                        {amcWarning.type === 'active' ? (
                                            <CheckCircle className="w-4 h-4" />
                                        ) : amcWarning.type === 'expired' ? (
                                            <AlertTriangle className="w-4 h-4" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4" />
                                        )}
                                        {amcWarning.message}
                                    </div>
                                )}
                                {foundAMC && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <Badge variant={formData.isAMCCovered ? 'success' : 'warning'}>
                                            <Shield className="w-3 h-3 mr-1" />
                                            {formData.isAMCCovered ? 'AMC Active' : 'AMC Expired'}
                                        </Badge>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            AMC ID: {foundAMC.id}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Customer Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        <User className="w-3 h-3 inline mr-1" />
                                        Customer Name *
                                    </label>
                                    <Input
                                        name="customer"
                                        value={formData.customer}
                                        onChange={handleChange}
                                        placeholder="Customer name"
                                        className={errors.customer ? 'border-red-500' : ''}
                                    />
                                    {errors.customer && <p className="text-red-500 text-xs mt-1">{errors.customer}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        <Phone className="w-3 h-3 inline mr-1" />
                                        Mobile Number *
                                    </label>
                                    <Input
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        placeholder="10-digit mobile"
                                        className={errors.mobile ? 'border-red-500' : ''}
                                    />
                                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        <Mail className="w-3 h-3 inline mr-1" />
                                        Email
                                    </label>
                                    <Input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Email address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        <MapPin className="w-3 h-3 inline mr-1" />
                                        Address
                                    </label>
                                    <Input
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Customer address"
                                    />
                                </div>
                            </div>

                            {/* Device Info */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                                <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                    <Laptop className="w-4 h-4" />
                                    Device Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Device Name *</label>
                                        <Input
                                            name="device"
                                            value={formData.device}
                                            onChange={handleChange}
                                            placeholder="e.g., Dell Inspiron 15"
                                            className={errors.device ? 'border-red-500' : ''}
                                        />
                                        {errors.device && <p className="text-red-500 text-xs mt-1">{errors.device}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Serial Number</label>
                                        <Input
                                            name="serial"
                                            value={formData.serial}
                                            onChange={handleChange}
                                            placeholder="Device serial number"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Issue Description */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Problem Description *
                                </label>
                                <textarea
                                    name="issue"
                                    value={formData.issue}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Describe the issue in detail..."
                                    className={`w-full rounded-lg border ${errors.issue ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-800 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none`}
                                />
                                {errors.issue && <p className="text-red-500 text-xs mt-1">{errors.issue}</p>}
                            </div>
                        </div>
                    )}

                    {/* Service Info Tab */}
                    {activeTab === 'service' && (
                        <div className="space-y-6">
                            {/* Service Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Service Type</label>
                                <div className="flex gap-4">
                                    {SERVICE_TYPES.map(type => (
                                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="serviceType"
                                                value={type}
                                                checked={formData.serviceType === type}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Department */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department *</label>
                                    <select
                                        value={formData.departmentId || ''}
                                        onChange={handleDepartmentChange}
                                        className={`w-full h-10 rounded-lg border ${errors.department ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-800 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                                    >
                                        <option value="">Select Department</option>
                                        {serviceDepartments.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                    {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        {PRIORITIES.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Assignment */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                                <h3 className="font-medium text-slate-900 dark:text-white mb-4">Assignment</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assign To</label>
                                        <select
                                            value={formData.useCustomAssignee ? -1 : (formData.assignedToId || '')}
                                            onChange={handleAssigneeChange}
                                            className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        >
                                            <option value="">Unassigned</option>
                                            {technicians.map(tech => (
                                                <option key={tech.id} value={tech.id}>
                                                    {tech.name} ({tech.role})
                                                </option>
                                            ))}
                                            <option value={-1}>+ Enter Custom Name</option>
                                        </select>
                                    </div>
                                    {formData.useCustomAssignee && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Custom Assignee Name</label>
                                            <Input
                                                value={formData.assignedToCustom}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    assignedToCustom: e.target.value,
                                                    assignedTo: e.target.value
                                                }))}
                                                placeholder="Enter name"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status & Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        {JOB_STATUSES.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        <Calendar className="w-3 h-3 inline mr-1" />
                                        Estimated Completion
                                    </label>
                                    <Input
                                        type="date"
                                        name="estimatedCompletion"
                                        value={formData.estimatedCompletion}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Base Charge Display */}
                            {formData.baseCharge > 0 && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Base Charge ({formData.serviceType})
                                        </span>
                                        <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                            ₹{formData.baseCharge.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Parts Tab */}
                    {activeTab === 'parts' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium text-slate-900">Parts Used</h3>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setShowItemSearch(true)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Part
                                </Button>
                            </div>

                            {/* Item Search Modal - Full Screen like EstimateModal */}
                            {showItemSearch && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                                        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                                            <h3 className="font-semibold text-slate-900">Select Part from Item Master</h3>
                                            <Button variant="ghost" size="sm" onClick={() => setShowItemSearch(false)}>
                                                <X className="w-5 h-5" />
                                            </Button>
                                        </div>
                                        <div className="p-4 border-b border-slate-200 space-y-3">
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
                                                <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-200">
                                                    <div className="flex items-center gap-2">
                                                        <Layers className="w-4 h-4 text-indigo-600" />
                                                        <span className="text-sm font-medium text-indigo-900">
                                                            {showCompatibleOnly ? 'Showing compatible parts only' : 'Showing all parts'}
                                                        </span>
                                                        <Badge variant="primary" className="text-xs">
                                                            {filteredItems.length} {showCompatibleOnly ? 'compatible' : 'total'}
                                                        </Badge>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowCompatibleOnly(!showCompatibleOnly)}
                                                        className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
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

                                            <div className="text-sm text-slate-500">
                                                {filteredItems.length} items found
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {filteredItems.map(item => (
                                                    <div
                                                        key={item.id}
                                                        className="p-3 border border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-all group"
                                                        onClick={() => handleAddPart(item)}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-medium text-slate-900 truncate">{item.name}</h4>
                                                                    {item.isNew && <Badge variant="primary" className="text-xs">New</Badge>}
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs text-slate-500 font-mono">{item.sku || '-'}</span>
                                                                    <span className="text-xs text-slate-400">•</span>
                                                                    <span className="text-xs text-slate-500">{item.category}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-bold text-blue-600">₹ {(item.sellingPrice || item.price || 0).toLocaleString()}</p>
                                                                <p className="text-xs text-slate-500">Stock: {item.stockQty || item.stock || 0}</p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                                            <span>GST: {item.gstPercent || item.gst || 18}%</span>
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

                            {/* Parts List */}
                            {formData.partsUsed.length > 0 ? (
                                <div className="border border-slate-200 rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Part Name</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-slate-500">Qty</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-slate-500">Free</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">Price</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">Amount</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-slate-500"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.partsUsed.map(part => (
                                                <tr key={part.itemId} className="border-t border-slate-100">
                                                    <td className="px-4 py-3 text-sm text-slate-900">{part.name}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => updatePartQty(part.itemId, -1)}
                                                                className="p-1 rounded hover:bg-slate-100"
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <span className="w-8 text-center text-sm font-medium">{part.qty}</span>
                                                            <button
                                                                onClick={() => updatePartQty(part.itemId, 1)}
                                                                className="p-1 rounded hover:bg-slate-100"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={part.price === 0}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    // Store original price and set to 0
                                                                    updatePartPrice(part.itemId, 0);
                                                                } else {
                                                                    // Restore original price (use stored or default to item price)
                                                                    const item = items.find(i => i.id === part.itemId);
                                                                    updatePartPrice(part.itemId, item?.sellingPrice || item?.price || 0);
                                                                }
                                                            }}
                                                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                                            title="Mark as free (set price to ₹0)"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <span className="text-sm text-slate-500">₹</span>
                                                            <input
                                                                type="number"
                                                                value={part.price}
                                                                onChange={(e) => updatePartPrice(part.itemId, e.target.value)}
                                                                className={`w-20 text-right text-sm border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${part.price === 0 ? 'bg-green-50 text-green-600' : ''}`}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">
                                                        ₹{(part.price * part.qty).toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => removePart(part.itemId)}
                                                            className="p-1 rounded text-red-500 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                                    <p>No parts added yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Services Tab */}
                    {activeTab === 'services' && (
                        <div className="space-y-4">
                            {formData.isAMCCovered && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
                                    <Shield className="w-4 h-4" />
                                    This customer has an active AMC. Services will be free unless marked as "Chargeable".
                                </div>
                            )}

                            <h3 className="font-medium text-slate-900">Available Services</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {addons.map(addon => {
                                    const isAdded = formData.servicesApplied.some(s => s.addonId === addon.id);
                                    return (
                                        <button
                                            key={addon.id}
                                            onClick={() => !isAdded && handleAddService(addon)}
                                            disabled={isAdded}
                                            className={`p-3 rounded-lg text-left transition-colors ${isAdded
                                                ? 'bg-blue-100 border-2 border-blue-500'
                                                : 'bg-slate-50 border border-slate-200 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className="font-medium text-sm text-slate-900">{addon.name}</div>
                                            <div className="text-xs text-slate-500">₹{addon.price}</div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Applied Services */}
                            {formData.servicesApplied.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="font-medium text-slate-900 mb-3">Applied Services</h3>
                                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Service</th>
                                                    <th className="px-4 py-2 text-center text-xs font-medium text-slate-500">Chargeable</th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">Price</th>
                                                    <th className="px-4 py-2 text-center text-xs font-medium text-slate-500"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formData.servicesApplied.map(service => (
                                                    <tr key={service.addonId} className="border-t border-slate-100">
                                                        <td className="px-4 py-3 text-sm text-slate-900">{service.name}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={service.isChargeable}
                                                                onChange={() => toggleServiceChargeable(service.addonId)}
                                                                className="w-4 h-4 text-blue-600 rounded"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            {service.isChargeable ? (
                                                                <Input
                                                                    type="number"
                                                                    value={service.price}
                                                                    onChange={(e) => updateServicePrice(service.addonId, e.target.value)}
                                                                    className="w-24 text-right"
                                                                />
                                                            ) : (
                                                                <span className="text-green-600 font-medium">₹0 (AMC)</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <button
                                                                onClick={() => removeService(service.addonId)}
                                                                className="p-1 rounded text-red-500 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Billing Tab */}
                    {activeTab === 'billing' && (
                        <div className="space-y-6">
                            <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                                <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                                    <IndianRupee className="w-4 h-4" />
                                    Billing Summary
                                </h3>
                                <div className="space-y-3">
                                    {formData.baseCharge > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Base Charge ({formData.serviceType})</span>
                                            <span className="font-medium">₹{formData.baseCharge.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {billingTotals.partsSubtotal > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Parts ({formData.partsUsed.length} items)</span>
                                            <span className="font-medium">₹{billingTotals.partsSubtotal.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {billingTotals.servicesSubtotal > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Services</span>
                                            <span className="font-medium">₹{billingTotals.servicesSubtotal.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-slate-200 pt-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Subtotal</span>
                                            <span className="font-medium">₹{billingTotals.subtotal.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">GST (18%)</span>
                                        <span className="font-medium">₹{Math.round(billingTotals.totalGst).toLocaleString()}</span>
                                    </div>
                                    {billingTotals.amcDiscount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>AMC Discount</span>
                                            <span className="font-medium">- ₹{billingTotals.amcDiscount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="border-t-2 border-slate-300 pt-3 flex justify-between">
                                        <span className="text-lg font-semibold text-slate-900">Grand Total</span>
                                        <span className="text-xl font-bold text-blue-600">
                                            ₹{Math.round(billingTotals.grandTotal).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Additional Notes
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Any additional notes..."
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
                    <div className="text-sm text-slate-500">
                        {formData.partsUsed.length} parts, {formData.servicesApplied.length} services
                        {formData.isAMCCovered && (
                            <Badge variant="success" className="ml-2">
                                <Shield className="w-3 h-3 mr-1" />
                                AMC Customer
                            </Badge>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSubmit}>
                            {editingComplaint ? 'Update Job' : 'Create Job'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

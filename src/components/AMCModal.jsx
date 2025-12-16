import React, { useState, useEffect, useMemo } from 'react';
import { X, Shield, Laptop, Calendar, FileText, CheckSquare } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { useSessionData } from '../contexts/SessionDataContext';

const DEVICE_TYPES = ['Laptop', 'Desktop', 'Printer', 'Monitor', 'Server', 'Other'];
const AMC_PERIODS = [
    { months: 6, label: '6 Months' },
    { months: 12, label: '1 Year' },
    { months: 24, label: '2 Years' },
    { months: 36, label: '3 Years' }
];

export function AMCModal({ isOpen, onClose, editingAMC = null, orderToConvert = null }) {
    const { addAMC, updateAMC, convertOrderToAMC, addons } = useSessionData();

    // Get service names from addons master list
    const availableServices = useMemo(() => {
        return addons.map(addon => addon.name);
    }, [addons]);

    const [formData, setFormData] = useState({
        customer: '',
        mobile: '',
        email: '',
        address: '',
        deviceSerial: '',
        deviceName: '',
        deviceType: 'Laptop',
        startDate: new Date().toISOString().split('T')[0],
        period: 12,
        amcAmount: 5000,
        terms: 'Standard AMC covering hardware support, software troubleshooting, and preventive maintenance.',
        servicesIncluded: []
    });

    const [errors, setErrors] = useState({});

    // Calculate end date based on start date and period
    const calculateEndDate = (startDate, periodMonths) => {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + parseInt(periodMonths));
        date.setDate(date.getDate() - 1);
        return date.toISOString().split('T')[0];
    };

    // Initialize form
    useEffect(() => {
        if (editingAMC) {
            setFormData({
                customer: editingAMC.customer || '',
                mobile: editingAMC.mobile || '',
                email: editingAMC.email || '',
                address: editingAMC.address || '',
                deviceSerial: editingAMC.deviceSerial || '',
                deviceName: editingAMC.deviceName || '',
                deviceType: editingAMC.deviceType || 'Laptop',
                startDate: editingAMC.startDate || new Date().toISOString().split('T')[0],
                period: editingAMC.period || 12,
                amcAmount: editingAMC.amcAmount || 5000,
                terms: editingAMC.terms || '',
                servicesIncluded: editingAMC.servicesIncluded || []
            });
        } else if (orderToConvert) {
            setFormData(prev => ({
                ...prev,
                customer: orderToConvert.customer || '',
                mobile: orderToConvert.mobile || '',
                email: orderToConvert.email || '',
                address: orderToConvert.address || '',
                deviceName: orderToConvert.items?.[0]?.name || ''
            }));
        } else {
            // Default: pre-select first 3 services from addons if available
            const defaultServices = addons.slice(0, 3).map(a => a.name);
            setFormData({
                customer: '',
                mobile: '',
                email: '',
                address: '',
                deviceSerial: '',
                deviceName: '',
                deviceType: 'Laptop',
                startDate: new Date().toISOString().split('T')[0],
                period: 12,
                amcAmount: 5000,
                terms: 'Standard AMC covering hardware support, software troubleshooting, and preventive maintenance.',
                servicesIncluded: defaultServices
            });
        }
        setErrors({});
    }, [editingAMC, orderToConvert, isOpen, addons]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Parse numeric fields
        let parsedValue = value;
        if (name === 'period' || name === 'amcAmount') {
            parsedValue = parseInt(value) || 0;
        }
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleServiceToggle = (service) => {
        setFormData(prev => ({
            ...prev,
            servicesIncluded: prev.servicesIncluded.includes(service)
                ? prev.servicesIncluded.filter(s => s !== service)
                : [...prev.servicesIncluded, service]
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.customer.trim()) newErrors.customer = 'Customer name required';
        if (!formData.mobile.trim()) newErrors.mobile = 'Mobile required';
        if (!formData.deviceSerial.trim()) newErrors.deviceSerial = 'Device serial required';
        if (!formData.deviceName.trim()) newErrors.deviceName = 'Device name required';
        if (formData.servicesIncluded.length === 0) newErrors.services = 'Select at least one service';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        const amcData = {
            ...formData,
            endDate: calculateEndDate(formData.startDate, formData.period)
        };

        if (editingAMC) {
            updateAMC(editingAMC.id, amcData);
        } else if (orderToConvert) {
            convertOrderToAMC(orderToConvert.id, amcData);
        } else {
            addAMC(amcData);
        }

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border dark:border-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-purple-600 to-indigo-600">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                {editingAMC ? 'Edit AMC Contract' : orderToConvert ? 'Convert to AMC' : 'New AMC Contract'}
                            </h2>
                            <p className="text-purple-100 text-sm">
                                Annual Maintenance Contract
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer Name *</label>
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
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile *</label>
                                <Input
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    placeholder="Mobile number"
                                    className={errors.mobile ? 'border-red-500' : ''}
                                />
                                {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                <Input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                                <Input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Address"
                                />
                            </div>
                        </div>

                        {/* Device Info */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                <Laptop className="w-4 h-4" />
                                Device Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Device Serial *</label>
                                    <Input
                                        name="deviceSerial"
                                        value={formData.deviceSerial}
                                        onChange={handleChange}
                                        placeholder="Serial number"
                                        className={errors.deviceSerial ? 'border-red-500' : ''}
                                    />
                                    {errors.deviceSerial && <p className="text-red-500 text-xs mt-1">{errors.deviceSerial}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Device Name *</label>
                                    <Input
                                        name="deviceName"
                                        value={formData.deviceName}
                                        onChange={handleChange}
                                        placeholder="e.g., HP Pavilion Laptop"
                                        className={errors.deviceName ? 'border-red-500' : ''}
                                    />
                                    {errors.deviceName && <p className="text-red-500 text-xs mt-1">{errors.deviceName}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Device Type</label>
                                    <select
                                        name="deviceType"
                                        value={formData.deviceType}
                                        onChange={handleChange}
                                        className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                                    >
                                        {DEVICE_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Contract Details */}
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                            <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                <Calendar className="w-4 h-4" />
                                Contract Period
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                                    <Input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Period</label>
                                    <select
                                        name="period"
                                        value={formData.period}
                                        onChange={handleChange}
                                        className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:text-white"
                                    >
                                        {AMC_PERIODS.map(p => (
                                            <option key={p.months} value={p.months}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                                    <Input
                                        type="date"
                                        value={calculateEndDate(formData.startDate, formData.period)}
                                        disabled
                                        className="bg-slate-100 dark:bg-slate-800 dark:text-slate-400"
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">AMC Amount (₹)</label>
                                <Input
                                    type="number"
                                    name="amcAmount"
                                    value={formData.amcAmount}
                                    onChange={handleChange}
                                    min="0"
                                    className="max-w-xs"
                                />
                            </div>
                        </div>

                        {/* Services */}
                        <div>
                            <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                                <CheckSquare className="w-4 h-4" />
                                Services Included
                            </h3>
                            {errors.services && <p className="text-red-500 text-xs mb-2">{errors.services}</p>}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {availableServices.length > 0 ? (
                                    availableServices.map(service => (
                                        <button
                                            key={service}
                                            type="button"
                                            onClick={() => handleServiceToggle(service)}
                                            className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${formData.servicesIncluded.includes(service)
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {service}
                                        </button>
                                    ))
                                ) : (
                                    <p className="col-span-full text-sm text-slate-500 dark:text-slate-400 italic">
                                        No services available. Add services in the Service Addons section.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Terms */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                <FileText className="w-3 h-3 inline mr-1" />
                                Terms & Conditions
                            </label>
                            <textarea
                                name="terms"
                                value={formData.terms}
                                onChange={handleChange}
                                rows={3}
                                placeholder="AMC terms and conditions..."
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none dark:placeholder-slate-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        {formData.servicesIncluded.length} service(s) selected
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSubmit}>
                            {editingAMC ? 'Update AMC' : orderToConvert ? 'Create AMC' : 'Create AMC'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

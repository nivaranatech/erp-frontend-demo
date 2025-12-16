import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon,
    Building2,
    Palette,
    Bell,
    Shield,
    Database,
    Save,
    RefreshCw,
    Sun,
    Moon,
    Mail,
    Phone,
    MapPin,
    Globe,
    FileText,
    IndianRupee,
    Percent,
    Clock,
    User,
    Lock,
    Eye,
    EyeOff,
    Check,
    AlertCircle,
    Download,
    Upload,
    Trash2,
    LogOut
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useSessionData } from '../contexts/SessionDataContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const navigate = useNavigate();
    const { currentUser, logoutUser, users, items, orders, estimates, amcContracts, complaints, rmaItems } = useSessionData();
    const { isDarkMode, toggleDarkMode } = useTheme();

    // Company Settings State (persisted to localStorage)
    const [companySettings, setCompanySettings] = useState(() => {
        const saved = localStorage.getItem('erp_company_settings');
        return saved ? JSON.parse(saved) : {
            name: 'Premium IT Park',
            tagline: 'Your IT Solutions Partner',
            email: 'info@premiumit.com',
            phone: '+91 9876543210',
            altPhone: '+91 9876543211',
            address: 'Shop No. 5, IT Park Complex, Ring Road, Surat, Gujarat 395007',
            gstNo: '24AAAAA0000A1Z5',
            panNo: 'AAAAA0000A',
            website: 'www.premiumit.com'
        };
    });

    // Tax Settings State
    const [taxSettings, setTaxSettings] = useState(() => {
        const saved = localStorage.getItem('erp_tax_settings');
        return saved ? JSON.parse(saved) : {
            gstRate: 18,
            cgstRate: 9,
            sgstRate: 9,
            igstRate: 18,
            enableGST: true,
            roundOffTotal: true,
            showTaxBreakdown: true
        };
    });

    // Notification Settings State
    const [notifSettings, setNotifSettings] = useState(() => {
        const saved = localStorage.getItem('erp_notif_settings');
        return saved ? JSON.parse(saved) : {
            lowStockAlert: true,
            lowStockThreshold: 5,
            orderNotifications: true,
            amcExpiryAlert: true,
            amcExpiryDays: 30,
            emailNotifications: false,
            smsNotifications: false
        };
    });

    // Invoice Settings State
    const [invoiceSettings, setInvoiceSettings] = useState(() => {
        const saved = localStorage.getItem('erp_invoice_settings');
        return saved ? JSON.parse(saved) : {
            prefix: 'INV',
            startNumber: 1001,
            termsAndConditions: '1. Payment due within 30 days.\n2. Warranty as per manufacturer terms.\n3. Goods once sold will not be taken back.',
            showLogo: true,
            showBankDetails: true,
            bankName: 'HDFC Bank',
            accountNo: 'XXXX1234',
            ifscCode: 'HDFC0001234',
            upiId: 'premiumit@upi'
        };
    });

    // Password Change State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // UI State
    const [activeTab, setActiveTab] = useState('company');
    const [saveStatus, setSaveStatus] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Save settings to localStorage
    const saveAllSettings = () => {
        setIsSaving(true);
        setSaveStatus('');

        setTimeout(() => {
            localStorage.setItem('erp_company_settings', JSON.stringify(companySettings));
            localStorage.setItem('erp_tax_settings', JSON.stringify(taxSettings));
            localStorage.setItem('erp_notif_settings', JSON.stringify(notifSettings));
            localStorage.setItem('erp_invoice_settings', JSON.stringify(invoiceSettings));

            setSaveStatus('success');
            setIsSaving(false);

            setTimeout(() => setSaveStatus(''), 3000);
        }, 500);
    };

    // Reset to defaults
    const resetToDefaults = () => {
        if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            localStorage.removeItem('erp_company_settings');
            localStorage.removeItem('erp_tax_settings');
            localStorage.removeItem('erp_notif_settings');
            localStorage.removeItem('erp_invoice_settings');
            window.location.reload();
        }
    };

    // Handle logout
    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            logoutUser();
            navigate('/login');
        }
    };

    // Stats for data management
    const dataStats = {
        users: users?.length || 0,
        items: items?.length || 0,
        orders: orders?.length || 0,
        estimates: estimates?.length || 0,
        amcContracts: amcContracts?.length || 0,
        complaints: complaints?.length || 0,
        rmaItems: rmaItems?.length || 0
    };

    const tabs = [
        { id: 'company', label: 'Company Info', icon: Building2 },
        { id: 'tax', label: 'Tax & Invoice', icon: Percent },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'data', label: 'Data & Backup', icon: Database }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <SettingsIcon className="w-7 h-7" />
                        Settings
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your ERP system preferences and configuration</p>
                </div>
                <div className="flex items-center gap-3">
                    {saveStatus === 'success' && (
                        <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Saved
                        </Badge>
                    )}
                    <Button
                        onClick={saveAllSettings}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save All Settings
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Tabs */}
                <div className="w-full lg:w-56 flex-shrink-0">
                    <Card className="sticky top-24">
                        <CardContent className="p-2">
                            <nav className="space-y-1">
                                {tabs.map(tab => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-900/50'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </CardContent>
                    </Card>
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-6">
                    {/* Company Info Tab */}
                    {activeTab === 'company' && (

                        <Card className="border-0 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-xl">
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <Building2 className="w-5 h-5 text-blue-100" />
                                    Company Information
                                </CardTitle>
                                <CardDescription className="text-blue-100">Your business details that appear on invoices and documents</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                            Company Name
                                        </label>
                                        <input
                                            type="text"
                                            value={companySettings.name}
                                            onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                            Tagline
                                        </label>
                                        <input
                                            type="text"
                                            value={companySettings.tagline}
                                            onChange={(e) => setCompanySettings({ ...companySettings, tagline: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                            <Mail className="w-4 h-4 inline mr-1" /> Email
                                        </label>
                                        <input
                                            type="email"
                                            value={companySettings.email}
                                            onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                            <Globe className="w-4 h-4 inline mr-1" /> Website
                                        </label>
                                        <input
                                            type="text"
                                            value={companySettings.website}
                                            onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                            <Phone className="w-4 h-4 inline mr-1" /> Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={companySettings.phone}
                                            onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                            <Phone className="w-4 h-4 inline mr-1" /> Alternate Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={companySettings.altPhone}
                                            onChange={(e) => setCompanySettings({ ...companySettings, altPhone: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                        <MapPin className="w-4 h-4 inline mr-1" /> Business Address
                                    </label>
                                    <textarea
                                        value={companySettings.address}
                                        onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                            GST Number
                                        </label>
                                        <input
                                            type="text"
                                            value={companySettings.gstNo}
                                            onChange={(e) => setCompanySettings({ ...companySettings, gstNo: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                                            placeholder="24AAAAA0000A1Z5"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                            PAN Number
                                        </label>
                                        <input
                                            type="text"
                                            value={companySettings.panNo}
                                            onChange={(e) => setCompanySettings({ ...companySettings, panNo: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                                            placeholder="AAAAA0000A"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Tax & Invoice Tab */}
                    {activeTab === 'tax' && (
                        <div className="space-y-6">
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-t-xl">
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <Percent className="w-5 h-5 text-emerald-100" />
                                        Tax Configuration
                                    </CardTitle>
                                    <CardDescription className="text-emerald-100">GST and tax settings for billing</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 mt-6">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-slate-100">Enable GST</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Apply GST to all invoices</p>
                                        </div>
                                        <button
                                            onClick={() => setTaxSettings({ ...taxSettings, enableGST: !taxSettings.enableGST })}
                                            className={`w-12 h-6 rounded-full transition-colors ${taxSettings.enableGST ? 'bg-blue-600' : 'bg-slate-300'}`}
                                        >
                                            <div className={`w-5 h-5 bg-white dark:bg-slate-900 rounded-full shadow transition-transform ${taxSettings.enableGST ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                                CGST Rate (%)
                                            </label>
                                            <input
                                                type="number"
                                                value={taxSettings.cgstRate}
                                                onChange={(e) => setTaxSettings({ ...taxSettings, cgstRate: parseFloat(e.target.value) || 0 })}
                                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                                SGST Rate (%)
                                            </label>
                                            <input
                                                type="number"
                                                value={taxSettings.sgstRate}
                                                onChange={(e) => setTaxSettings({ ...taxSettings, sgstRate: parseFloat(e.target.value) || 0 })}
                                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                                IGST Rate (%)
                                            </label>
                                            <input
                                                type="number"
                                                value={taxSettings.igstRate}
                                                onChange={(e) => setTaxSettings({ ...taxSettings, igstRate: parseFloat(e.target.value) || 0 })}
                                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={taxSettings.roundOffTotal}
                                                onChange={(e) => setTaxSettings({ ...taxSettings, roundOffTotal: e.target.checked })}
                                                className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700"
                                            />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">Round off totals</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={taxSettings.showTaxBreakdown}
                                                onChange={(e) => setTaxSettings({ ...taxSettings, showTaxBreakdown: e.target.checked })}
                                                className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-700"
                                            />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">Show tax breakdown on invoices</span>
                                        </label>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-t-xl">
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <FileText className="w-5 h-5 text-violet-100" />
                                        Invoice Settings
                                    </CardTitle>
                                    <CardDescription className="text-violet-100">Configure invoice numbering and payment details</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 mt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                                Invoice Prefix
                                            </label>
                                            <input
                                                type="text"
                                                value={invoiceSettings.prefix}
                                                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, prefix: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                                Starting Number
                                            </label>
                                            <input
                                                type="number"
                                                value={invoiceSettings.startNumber}
                                                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, startNumber: parseInt(e.target.value) || 1 })}
                                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <p className="font-medium text-slate-900 dark:text-slate-100 mb-3">Bank Details (for invoices)</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bank Name</label>
                                                <input
                                                    type="text"
                                                    value={invoiceSettings.bankName}
                                                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, bankName: e.target.value })}
                                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Account Number</label>
                                                <input
                                                    type="text"
                                                    value={invoiceSettings.accountNo}
                                                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, accountNo: e.target.value })}
                                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">IFSC Code</label>
                                                <input
                                                    type="text"
                                                    value={invoiceSettings.ifscCode}
                                                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, ifscCode: e.target.value })}
                                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">UPI ID</label>
                                                <input
                                                    type="text"
                                                    value={invoiceSettings.upiId}
                                                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, upiId: e.target.value })}
                                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                            Terms & Conditions
                                        </label>
                                        <textarea
                                            value={invoiceSettings.termsAndConditions}
                                            onChange={(e) => setInvoiceSettings({ ...invoiceSettings, termsAndConditions: e.target.value })}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Appearance Tab */}
                    {activeTab === 'appearance' && (
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 text-white rounded-t-xl">
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <Palette className="w-5 h-5 text-fuchsia-100" />
                                    Appearance
                                </CardTitle>
                                <CardDescription className="text-fuchsia-100">Customize the look and feel of your ERP</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 mt-6">
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-amber-100'}`}>
                                            {isDarkMode ? <Moon className="w-6 h-6 text-slate-300" /> : <Sun className="w-6 h-6 text-amber-600" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-slate-100">Theme Mode</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {isDarkMode ? 'Dark mode enabled' : 'Light mode enabled'}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={toggleDarkMode}
                                        className="gap-2"
                                    >
                                        {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                        {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
                                    </Button>
                                </div>


                            </CardContent>
                        </Card>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-t-xl">
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <Bell className="w-5 h-5 text-amber-100" />
                                    Notification Preferences
                                </CardTitle>
                                <CardDescription className="text-amber-100">Configure alerts and notification triggers</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 mt-6">
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-slate-100">Low Stock Alerts</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Get notified when items are running low</p>
                                    </div>
                                    <button
                                        onClick={() => setNotifSettings({ ...notifSettings, lowStockAlert: !notifSettings.lowStockAlert })}
                                        className={`w-12 h-6 rounded-full transition-colors ${notifSettings.lowStockAlert ? 'bg-blue-600' : 'bg-slate-300'}`}
                                    >
                                        <div className={`w-5 h-5 bg-white dark:bg-slate-900 rounded-full shadow transition-transform ${notifSettings.lowStockAlert ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>

                                {notifSettings.lowStockAlert && (
                                    <div className="ml-4 flex items-center gap-3">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Alert when stock falls below:</span>
                                        <input
                                            type="number"
                                            value={notifSettings.lowStockThreshold}
                                            onChange={(e) => setNotifSettings({ ...notifSettings, lowStockThreshold: parseInt(e.target.value) || 0 })}
                                            className="w-20 px-3 py-1.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg text-sm"
                                            min="1"
                                        />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">units</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-slate-100">Order Notifications</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Alerts for new orders and status changes</p>
                                    </div>
                                    <button
                                        onClick={() => setNotifSettings({ ...notifSettings, orderNotifications: !notifSettings.orderNotifications })}
                                        className={`w-12 h-6 rounded-full transition-colors ${notifSettings.orderNotifications ? 'bg-blue-600' : 'bg-slate-300'}`}
                                    >
                                        <div className={`w-5 h-5 bg-white dark:bg-slate-900 rounded-full shadow transition-transform ${notifSettings.orderNotifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-slate-100">AMC Expiry Reminders</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Get notified before AMC contracts expire</p>
                                    </div>
                                    <button
                                        onClick={() => setNotifSettings({ ...notifSettings, amcExpiryAlert: !notifSettings.amcExpiryAlert })}
                                        className={`w-12 h-6 rounded-full transition-colors ${notifSettings.amcExpiryAlert ? 'bg-blue-600' : 'bg-slate-300'}`}
                                    >
                                        <div className={`w-5 h-5 bg-white dark:bg-slate-900 rounded-full shadow transition-transform ${notifSettings.amcExpiryAlert ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>

                                {notifSettings.amcExpiryAlert && (
                                    <div className="ml-4 flex items-center gap-3">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">Remind me:</span>
                                        <input
                                            type="number"
                                            value={notifSettings.amcExpiryDays}
                                            onChange={(e) => setNotifSettings({ ...notifSettings, amcExpiryDays: parseInt(e.target.value) || 0 })}
                                            className="w-20 px-3 py-1.5 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg text-sm"
                                            min="1"
                                        />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">days before expiry</span>
                                    </div>
                                )}


                            </CardContent>
                        </Card>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-t-xl">
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <User className="w-5 h-5 text-indigo-100" />
                                        Account Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="mt-6">
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                                            {currentUser?.name?.charAt(0) || 'A'}
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{currentUser?.name || 'Admin User'}</p>
                                            <p className="text-slate-500 dark:text-slate-400">{currentUser?.email || 'admin@example.com'}</p>
                                            <Badge className="mt-1">{currentUser?.isAdmin ? 'Administrator' : 'Staff'}</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-t-xl">
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <Lock className="w-5 h-5 text-rose-100" />
                                        Change Password
                                    </CardTitle>
                                    <CardDescription className="text-rose-100">Update your account password</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 mt-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Current Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.current ? 'text' : 'password'}
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            >
                                                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.new ? 'text' : 'password'}
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                >
                                                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.confirm ? 'text' : 'password'}
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                >
                                                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        Update Password
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="border-red-200">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                                <LogOut className="w-5 h-5 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-slate-100">Sign Out</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Log out of your account</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={handleLogout}>
                                            Logout
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Data & Backup Tab */}
                    {activeTab === 'data' && (
                        <div className="space-y-6">
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-t-xl">
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <Database className="w-5 h-5 text-cyan-100" />
                                        Data Statistics
                                    </CardTitle>
                                    <CardDescription className="text-cyan-100">Overview of your ERP data</CardDescription>
                                </CardHeader>
                                <CardContent className="mt-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {Object.entries(dataStats).map(([key, value]) => (
                                            <div key={key} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-center">
                                                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-xl">
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <Download className="w-5 h-5 text-blue-100" />
                                        Backup & Restore
                                    </CardTitle>
                                    <CardDescription className="text-blue-100">Export your data or restore from backup</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 mt-6">
                                    <div className="flex items-center justify-between p-4 border border-dashed rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Download className="w-8 h-8 text-blue-600" />
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-slate-100">Export Data</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Download all your data as JSON</p>
                                            </div>
                                        </div>
                                        <Button variant="outline">Export</Button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-dashed rounded-xl opacity-60">
                                        <div className="flex items-center gap-3">
                                            <Upload className="w-8 h-8 text-green-600" />
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-slate-100">Import Data</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Restore from a backup file</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" disabled>Import</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-xl">
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Trash2 className="w-5 h-5 text-red-100" />
                                        Danger Zone
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="mt-6">
                                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-red-700">Reset All Settings</p>
                                                <p className="text-sm text-red-600">This will reset all settings to their default values. This cannot be undone.</p>
                                            </div>
                                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-100" onClick={resetToDefaults}>
                                                Reset to Defaults
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

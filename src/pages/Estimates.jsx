import React, { useState } from 'react';
import {
    Plus, Search, FileText, MoreHorizontal, Printer, Send,
    Edit, Trash2, Eye, ShoppingCart, Download, Clock,
    CheckCircle, AlertCircle, XCircle, Filter, ChevronDown
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
import { EstimateModal } from '../components/EstimateModal';
import { useSessionData } from '../contexts/SessionDataContext';

export default function Estimates() {
    const { estimates, addEstimate, updateEstimate, deleteEstimate, convertToOrder, savedModels } = useSessionData();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEstimate, setSelectedEstimate] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [viewingEstimate, setViewingEstimate] = useState(null);
    const [showExportMenu, setShowExportMenu] = useState(null);

    const statuses = ['All', 'Draft', 'Sent', 'Accepted', 'Converted', 'Expired'];

    const filteredEstimates = estimates.filter(est => {
        const matchesSearch =
            est.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            est.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            est.mobile?.includes(searchTerm);
        const matchesStatus = statusFilter === 'All' || est.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Stats
    const totalEstimates = estimates.length;
    const draftCount = estimates.filter(e => e.status === 'Draft').length;
    const sentCount = estimates.filter(e => e.status === 'Sent').length;
    const acceptedCount = estimates.filter(e => e.status === 'Accepted').length;
    const totalValue = estimates.reduce((acc, e) => acc + (e.total || 0), 0);

    const getStatusBadge = (status) => {
        const config = {
            'Draft': { variant: 'default', icon: Clock },
            'Sent': { variant: 'primary', icon: Send },
            'Accepted': { variant: 'success', icon: CheckCircle },
            'Converted': { variant: 'success', icon: ShoppingCart },
            'Expired': { variant: 'danger', icon: XCircle }
        };
        const { variant, icon: Icon } = config[status] || { variant: 'default', icon: Clock };
        return (
            <Badge variant={variant} className="flex items-center gap-1">
                <Icon className="w-3 h-3" />
                {status}
            </Badge>
        );
    };

    const handleAddEstimate = () => {
        setSelectedEstimate(null);
        setIsModalOpen(true);
    };

    const handleEditEstimate = (est) => {
        setSelectedEstimate(est);
        setIsModalOpen(true);
    };

    const handleViewEstimate = (est) => {
        setViewingEstimate(est);
        setShowDetailsModal(true);
    };

    const handleDeleteEstimate = (estId, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this estimate?')) {
            deleteEstimate(estId);
        }
    };

    const handleConvertToOrder = (estId, e) => {
        e.stopPropagation();
        if (window.confirm('Convert this estimate to an order?')) {
            convertToOrder(estId);
        }
    };

    const handleSaveEstimate = (estimateData) => {
        if (selectedEstimate) {
            updateEstimate(selectedEstimate.id, estimateData, 'Updated');
        } else {
            addEstimate(estimateData);
        }
        setIsModalOpen(false);
    };

    const handleUpdateStatus = (estId, newStatus) => {
        updateEstimate(estId, { status: newStatus }, `Status changed to ${newStatus}`);
    };

    // Generate printable content (professional PDF matching Invoice style)
    const handlePrint = (est) => {
        const printContent = `
            <html>
            <head>
                <title>Estimate ${est.id}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: 'Segoe UI', Arial, sans-serif;
                        padding: 40px;
                        color: #333;
                        font-size: 14px;
                    }
                    .invoice {
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #4F46E5;
                    }
                    .company-name {
                        font-size: 24px;
                        font-weight: bold;
                        color: #4F46E5;
                    }
                    .company-details {
                        font-size: 12px;
                        color: #666;
                        margin-top: 5px;
                    }
                    .estimate-title {
                        text-align: right;
                    }
                    .estimate-title h2 {
                        font-size: 28px;
                        color: #4F46E5;
                    }
                    .estimate-number {
                        font-size: 14px;
                        color: #666;
                        margin-top: 5px;
                    }
                    .info-section {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 30px;
                    }
                    .info-box {
                        width: 48%;
                    }
                    .info-box h4 {
                        font-size: 12px;
                        text-transform: uppercase;
                        color: #666;
                        margin-bottom: 8px;
                        border-bottom: 1px solid #eee;
                        padding-bottom: 5px;
                    }
                    .info-box p {
                        margin: 4px 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    th {
                        background: #4F46E5;
                        color: white;
                        padding: 12px;
                        text-align: left;
                        font-weight: 600;
                    }
                    th.addons {
                        background: #7C3AED;
                    }
                    td {
                        padding: 12px;
                        border-bottom: 1px solid #eee;
                    }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .totals {
                        margin-left: auto;
                        width: 300px;
                    }
                    .totals-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px solid #eee;
                    }
                    .totals-row.total {
                        border-bottom: none;
                        border-top: 2px solid #4F46E5;
                        font-size: 18px;
                        font-weight: bold;
                        color: #4F46E5;
                        padding-top: 12px;
                    }
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #eee;
                        display: flex;
                        justify-content: space-between;
                    }
                    .bank-details {
                        font-size: 12px;
                    }
                    .bank-details h4 {
                        margin-bottom: 8px;
                        color: #333;
                    }
                    .signature {
                        text-align: right;
                    }
                    .signature-line {
                        width: 150px;
                        border-top: 1px solid #333;
                        margin-top: 50px;
                        padding-top: 5px;
                        font-size: 12px;
                    }
                    .terms {
                        margin-top: 30px;
                        padding: 15px;
                        background: #f8f9fa;
                        font-size: 11px;
                        color: #666;
                    }
                    .terms h4 {
                        margin-bottom: 8px;
                        color: #333;
                    }
                    .validity-badge {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                        background: #E0E7FF;
                        color: #4338CA;
                    }
                    .status-badge {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                    }
                    .status-pending { background: #FEF3C7; color: #92400E; }
                    .status-sent { background: #DBEAFE; color: #1E40AF; }
                    .status-accepted { background: #D1FAE5; color: #065F46; }
                    .status-rejected { background: #FEE2E2; color: #991B1B; }
                    @media print {
                        body { padding: 20px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="invoice">
                    <!-- Header -->
                    <div class="header">
                        <div>
                            <div class="company-name">Premium IT Park</div>
                            <div class="company-details">
                                123 Tech Hub, Ring Road<br/>
                                Surat, Gujarat - 395002<br/>
                                Phone: +91 98765 43210<br/>
                                Email: sales@premiumitpark.com<br/>
                                GSTIN: 24ABCDE1234F1Z5
                            </div>
                        </div>
                        <div class="estimate-title">
                            <h2>ESTIMATE</h2>
                            <div class="estimate-number">
                                <strong>Estimate No:</strong> ${est.id}<br/>
                                <strong>Date:</strong> ${new Date(est.date).toLocaleDateString('en-IN')}
                            </div>
                            <span class="status-badge status-${(est.status || 'pending').toLowerCase()}" style="margin-top: 10px;">
                                ${est.status || 'Pending'}
                            </span>
                        </div>
                    </div>

                    <!-- Customer Info -->
                    <div class="info-section">
                        <div class="info-box">
                            <h4>Estimate For</h4>
                            <p><strong>${est.customer}</strong></p>
                            <p>Mobile: ${est.mobile}</p>
                            ${est.email ? `<p>Email: ${est.email}</p>` : ''}
                            ${est.address ? `<p>Address: ${est.address}</p>` : ''}
                        </div>
                        <div class="info-box">
                            <h4>Estimate Details</h4>
                            <p><strong>Valid For:</strong> ${est.validityDays || 15} days</p>
                            <p><strong>Created:</strong> ${new Date(est.createdAt || est.date).toLocaleString('en-IN')}</p>
                            ${est.notes ? `<p><strong>Notes:</strong> ${est.notes}</p>` : ''}
                        </div>
                    </div>

                    <!-- Items Table -->
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Item Description</th>
                                <th class="text-center">Qty</th>
                                <th class="text-right">Unit Price</th>
                                <th class="text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${est.items?.map((item, idx) => `
                                <tr>
                                    <td>${idx + 1}</td>
                                    <td><strong>${item.name}</strong>${item.sku ? `<br/><small style="color: #666;">${item.sku}</small>` : ''}</td>
                                    <td class="text-center">${item.qty}</td>
                                    <td class="text-right">₹ ${item.price.toLocaleString()}</td>
                                    <td class="text-right"><strong>₹ ${(item.price * item.qty).toLocaleString()}</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    ${est.addons && est.addons.length > 0 ? `
                        <!-- Service Add-ons -->
                        <h4 style="margin: 20px 0 10px; color: #7C3AED;">Service Add-ons</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th class="addons">#</th>
                                    <th class="addons">Service</th>
                                    <th class="addons text-center">Qty</th>
                                    <th class="addons text-right">Price</th>
                                    <th class="addons text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${est.addons?.map((addon, idx) => `
                                    <tr>
                                        <td>${idx + 1}</td>
                                        <td><strong>${addon.name}</strong></td>
                                        <td class="text-center">${addon.qty || 1}</td>
                                        <td class="text-right">₹ ${(addon.price || 0).toLocaleString()}</td>
                                        <td class="text-right"><strong>₹ ${((addon.price || 0) * (addon.qty || 1)).toLocaleString()}</strong></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : ''}

                    <!-- Totals -->
                    <div style="display: flex; justify-content: flex-end; margin: 20px 0;">
                        <div class="totals">
                            <div class="totals-row">
                                <span>Parts Subtotal</span>
                                <span>₹ ${(est.items?.reduce((sum, item) => sum + (item.price * item.qty), 0) || 0).toLocaleString()}</span>
                            </div>
                            ${est.addons && est.addons.length > 0 ? `
                                <div class="totals-row">
                                    <span>Add-ons Subtotal</span>
                                    <span>₹ ${(est.addons?.reduce((sum, addon) => sum + ((addon.price || 0) * (addon.qty || 1)), 0) || 0).toLocaleString()}</span>
                                </div>
                            ` : ''}
                            <div class="totals-row">
                                <span>Subtotal</span>
                                <span>₹ ${(est.subtotal || 0).toLocaleString()}</span>
                            </div>
                            <div class="totals-row">
                                <span>CGST (9%)</span>
                                <span>₹ ${Math.round((est.gstAmount || 0) / 2).toLocaleString()}</span>
                            </div>
                            <div class="totals-row">
                                <span>SGST (9%)</span>
                                <span>₹ ${Math.round((est.gstAmount || 0) / 2).toLocaleString()}</span>
                            </div>
                            <div class="totals-row total">
                                <span>Grand Total</span>
                                <span>₹ ${(est.total || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <div class="bank-details">
                            <h4>Bank Details</h4>
                            <p>Bank: State Bank of India</p>
                            <p>A/C No: 1234567890</p>
                            <p>IFSC: SBIN0001234</p>
                            <p>Branch: Surat Main</p>
                        </div>
                        <div class="signature">
                            <div class="signature-line">
                                Authorized Signature
                            </div>
                        </div>
                    </div>

                    <!-- Terms -->
                    <div class="terms">
                        <h4>Terms & Conditions</h4>
                        <ol style="padding-left: 15px;">
                            <li>This estimate is valid for ${est.validityDays || 15} days from the date of issue.</li>
                            <li>Prices are subject to change without prior notice.</li>
                            <li>Payment terms: 50% advance, 50% on delivery.</li>
                            <li>Warranty as per manufacturer's policy.</li>
                            <li>All disputes are subject to Surat jurisdiction.</li>
                        </ol>
                    </div>

                    <p style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
                        Thank you for considering Premium IT Park!
                    </p>
                </div>
            </body>
            </html>
        `;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Estimates</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Create and manage quotations</p>
                </div>
                <Button onClick={handleAddEstimate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Estimate
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Total Estimates</p>
                            <h3 className="text-xl font-bold text-slate-900">{totalEstimates}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-slate-500">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Drafts</p>
                            <h3 className="text-xl font-bold text-slate-900">{draftCount}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Send className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Sent</p>
                            <h3 className="text-xl font-bold text-purple-600">{sentCount}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Accepted</p>
                            <h3 className="text-xl font-bold text-green-600">{acceptedCount}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500">Total Value</p>
                            <h3 className="text-lg font-bold text-emerald-600">₹ {(totalValue / 1000).toFixed(0)}K</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Saved Models Info */}
            {savedModels.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-700">
                        <FileText className="w-5 h-5" />
                        <span className="font-medium">{savedModels.length} Saved Model(s)</span>
                        <span className="text-purple-600 text-sm">available for quick estimate creation</span>
                    </div>
                    <Button variant="secondary" size="sm" onClick={handleAddEstimate}>
                        Use Model
                    </Button>
                </div>
            )}

            {/* Main Card */}
            <Card className="border-l-4 border-l-cyan-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-3 w-full">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search estimates..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            {statuses.map(status => (
                                <option key={status} value={status}>
                                    {status === 'All' ? 'All Status' : status}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredEstimates.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p className="text-slate-500">No estimates found</p>
                            <Button className="mt-4" onClick={handleAddEstimate}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create First Estimate
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Estimate ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead className="text-center">Items</TableHead>
                                    <TableHead className="text-right">Total Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEstimates.map((est) => (
                                    <TableRow
                                        key={est.id}
                                        className="cursor-pointer hover:bg-slate-50"
                                        onClick={() => handleViewEstimate(est)}
                                    >
                                        <TableCell className="font-mono text-xs text-blue-600 font-medium">
                                            {est.id}
                                        </TableCell>
                                        <TableCell className="text-slate-500">
                                            {new Date(est.date).toLocaleDateString('en-GB')}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-slate-900">{est.customer}</p>
                                                <p className="text-xs text-slate-500">{est.mobile}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">
                                                {est.items?.length || 0} items
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-slate-900">
                                            ₹ {(est.total || 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(est.status)}
                                        </TableCell>
                                        <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="View"
                                                    onClick={() => handleViewEstimate(est)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Print"
                                                    onClick={() => handlePrint(est)}
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Edit"
                                                    onClick={() => handleEditEstimate(est)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                {(est.status === 'Accepted' || est.status === 'Sent') && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Convert to Order"
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={(e) => handleConvertToOrder(est.id, e)}
                                                    >
                                                        <ShoppingCart className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Delete"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={(e) => handleDeleteEstimate(est.id, e)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Estimate Details Modal */}
            {showDetailsModal && viewingEstimate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Estimate Details</h2>
                                <p className="text-sm text-slate-500 font-mono">{viewingEstimate.id}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {getStatusBadge(viewingEstimate.status)}
                                <Button variant="ghost" size="sm" onClick={() => setShowDetailsModal(false)}>
                                    <XCircle className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Customer Info */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Customer Information</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg space-y-1">
                                        <p className="font-medium text-slate-900">{viewingEstimate.customer}</p>
                                        <p className="text-sm text-slate-600">{viewingEstimate.mobile}</p>
                                        {viewingEstimate.email && <p className="text-sm text-slate-600">{viewingEstimate.email}</p>}
                                        {viewingEstimate.address && <p className="text-sm text-slate-600">{viewingEstimate.address}</p>}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Estimate Details</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg space-y-1">
                                        <p className="text-sm"><span className="text-slate-600">Date:</span> <span className="font-medium">{new Date(viewingEstimate.date).toLocaleDateString('en-GB')}</span></p>
                                        <p className="text-sm"><span className="text-slate-600">Valid for:</span> <span className="font-medium">{viewingEstimate.validityDays || 15} days</span></p>
                                        <p className="text-sm"><span className="text-slate-600">Version:</span> <span className="font-medium">{viewingEstimate.version || 1}</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Items Table */}
                            <h3 className="font-semibold text-slate-900 mb-2">Line Items</h3>
                            <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium text-slate-600">#</th>
                                            <th className="px-4 py-2 text-left font-medium text-slate-600">Item</th>
                                            <th className="px-4 py-2 text-center font-medium text-slate-600">Qty</th>
                                            <th className="px-4 py-2 text-right font-medium text-slate-600">Rate</th>
                                            <th className="px-4 py-2 text-right font-medium text-slate-600">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {viewingEstimate.items?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-2 text-slate-500">{idx + 1}</td>
                                                <td className="px-4 py-2 font-medium text-slate-900">{item.name}</td>
                                                <td className="px-4 py-2 text-center">{item.qty}</td>
                                                <td className="px-4 py-2 text-right">₹ {item.price.toLocaleString()}</td>
                                                <td className="px-4 py-2 text-right font-medium">₹ {(item.price * item.qty).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="flex justify-end">
                                <div className="w-64 space-y-2">
                                    {viewingEstimate.subtotal && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Subtotal</span>
                                            <span>₹ {viewingEstimate.subtotal.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {viewingEstimate.gstAmount && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">GST</span>
                                            <span>₹ {viewingEstimate.gstAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                                        <span>Total</span>
                                        <span className="text-blue-600">₹ {(viewingEstimate.total || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Audit Trail */}
                            {viewingEstimate.auditTrail && viewingEstimate.auditTrail.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="font-semibold text-slate-900 mb-2">History</h3>
                                    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                                        {viewingEstimate.auditTrail.map((entry, idx) => (
                                            <div key={idx} className="flex items-center gap-3 text-sm">
                                                <span className="text-slate-500">{new Date(entry.date).toLocaleString()}</span>
                                                <span className="font-medium text-slate-700">{entry.action}</span>
                                                <span className="text-slate-500">by {entry.user}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between">
                            <div className="flex gap-2">
                                {viewingEstimate.status === 'Draft' && (
                                    <Button variant="secondary" onClick={() => {
                                        handleUpdateStatus(viewingEstimate.id, 'Sent');
                                        setViewingEstimate({ ...viewingEstimate, status: 'Sent' });
                                    }}>
                                        <Send className="w-4 h-4 mr-2" />
                                        Mark as Sent
                                    </Button>
                                )}
                                {viewingEstimate.status === 'Sent' && (
                                    <Button variant="secondary" onClick={() => {
                                        handleUpdateStatus(viewingEstimate.id, 'Accepted');
                                        setViewingEstimate({ ...viewingEstimate, status: 'Accepted' });
                                    }}>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Mark as Accepted
                                    </Button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => handlePrint(viewingEstimate)}>
                                    <Printer className="w-4 h-4 mr-2" />
                                    Print
                                </Button>
                                <Button onClick={() => {
                                    setShowDetailsModal(false);
                                    handleEditEstimate(viewingEstimate);
                                }}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            <EstimateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                estimate={selectedEstimate}
                onSave={handleSaveEstimate}
            />
        </div>
    );
}

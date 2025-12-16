import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Button } from './ui/Button';

export function InvoicePrint({ order, isOpen, onClose }) {
    if (!isOpen || !order) return null;

    const handlePrint = () => {
        const printContent = document.getElementById('invoice-print-area');
        const printWindow = window.open('', '', 'width=800,height=900');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice - ${order.id}</title>
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
                        .invoice-title {
                            text-align: right;
                        }
                        .invoice-title h2 {
                            font-size: 28px;
                            color: #4F46E5;
                        }
                        .invoice-number {
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
                        .status-badge {
                            display: inline-block;
                            padding: 4px 12px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: 600;
                        }
                        .status-paid { background: #D1FAE5; color: #065F46; }
                        .status-partial { background: #FEF3C7; color: #92400E; }
                        .status-pending { background: #FEE2E2; color: #991B1B; }
                        @media print {
                            body { padding: 20px; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    const getPaymentStatusClass = (status) => {
        switch (status) {
            case 'Paid': return 'status-paid';
            case 'Partial': return 'status-partial';
            default: return 'status-pending';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <h2 className="text-lg font-semibold text-white">Invoice Preview</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Invoice Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
                    <div id="invoice-print-area" className="bg-white p-8 shadow-lg max-w-3xl mx-auto">
                        {/* Invoice Header */}
                        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-indigo-600">
                            <div>
                                <h1 className="text-2xl font-bold text-indigo-600">Premium IT Park</h1>
                                <p className="text-sm text-slate-500 mt-1">
                                    123 Tech Hub, Ring Road<br />
                                    Surat, Gujarat - 395002<br />
                                    Phone: +91 98765 43210<br />
                                    Email: sales@premiumitpark.com<br />
                                    GSTIN: 24ABCDE1234F1Z5
                                </p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-3xl font-bold text-indigo-600">INVOICE</h2>
                                <p className="text-slate-600 mt-2">
                                    <strong>Invoice No:</strong> {order.id}<br />
                                    <strong>Date:</strong> {new Date(order.date).toLocaleDateString('en-IN')}
                                </p>
                                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                                    order.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <h4 className="text-xs uppercase text-slate-500 mb-2 pb-1 border-b">Bill To</h4>
                                <p className="font-semibold text-slate-900">{order.customer}</p>
                                <p className="text-sm text-slate-600 mt-1">
                                    {order.address && <>{order.address}<br /></>}
                                    Phone: {order.mobile}<br />
                                    {order.email && <>Email: {order.email}</>}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-xs uppercase text-slate-500 mb-2 pb-1 border-b">Order Details</h4>
                                <p className="text-sm text-slate-600">
                                    <strong>Order Status:</strong> {order.status}<br />
                                    <strong>Created:</strong> {new Date(order.createdAt).toLocaleString('en-IN')}
                                </p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <table className="w-full mb-6">
                            <thead>
                                <tr className="bg-indigo-600 text-white">
                                    <th className="p-3 text-left">#</th>
                                    <th className="p-3 text-left">Item Description</th>
                                    <th className="p-3 text-center">Qty</th>
                                    <th className="p-3 text-right">Unit Price</th>
                                    <th className="p-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items?.map((item, index) => (
                                    <tr key={index} className="border-b border-slate-100">
                                        <td className="p-3">{index + 1}</td>
                                        <td className="p-3 font-medium">{item.name}</td>
                                        <td className="p-3 text-center">{item.qty}</td>
                                        <td className="p-3 text-right">₹{item.price?.toLocaleString()}</td>
                                        <td className="p-3 text-right font-medium">₹{(item.price * item.qty).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Service Add-ons Table */}
                        {order.addons && order.addons.length > 0 && (
                            <>
                                <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <span className="inline-block w-4 h-4 bg-indigo-100 rounded-full flex-shrink-0"></span>
                                    Service Add-ons
                                </h4>
                                <table className="w-full mb-6">
                                    <thead>
                                        <tr className="bg-purple-600 text-white">
                                            <th className="p-3 text-left">#</th>
                                            <th className="p-3 text-left">Service</th>
                                            <th className="p-3 text-center">Qty</th>
                                            <th className="p-3 text-right">Price</th>
                                            <th className="p-3 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.addons?.map((addon, index) => (
                                            <tr key={index} className="border-b border-slate-100">
                                                <td className="p-3">{index + 1}</td>
                                                <td className="p-3 font-medium">{addon.name}</td>
                                                <td className="p-3 text-center">{addon.qty || 1}</td>
                                                <td className="p-3 text-right">₹{addon.price?.toLocaleString()}</td>
                                                <td className="p-3 text-right font-medium">₹{((addon.price || 0) * (addon.qty || 1)).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}

                        {/* Totals */}
                        <div className="flex justify-end mb-8">
                            <div className="w-72">
                                {/* Parts Subtotal */}
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-600">Parts Subtotal</span>
                                    <span>₹{(order.items?.reduce((sum, item) => sum + (item.price * item.qty), 0) || 0).toLocaleString()}</span>
                                </div>
                                {/* Add-ons Subtotal */}
                                {order.addons && order.addons.length > 0 && (
                                    <div className="flex justify-between py-2 border-b border-slate-100">
                                        <span className="text-slate-600">Add-ons Subtotal</span>
                                        <span>₹{(order.addons?.reduce((sum, addon) => sum + ((addon.price || 0) * (addon.qty || 1)), 0) || 0).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-600">Subtotal</span>
                                    <span>₹{order.subtotal?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-600">CGST (9%)</span>
                                    <span>₹{Math.round(order.gstAmount / 2).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-600">SGST (9%)</span>
                                    <span>₹{Math.round(order.gstAmount / 2).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between py-3 border-t-2 border-indigo-600 mt-2">
                                    <span className="text-lg font-bold text-indigo-600">Grand Total</span>
                                    <span className="text-lg font-bold text-indigo-600">₹{order.total?.toLocaleString()}</span>
                                </div>
                                {order.paymentStatus === 'Partial' && order.paidAmount && (
                                    <>
                                        <div className="flex justify-between py-2 text-sm text-green-600">
                                            <span>Amount Paid</span>
                                            <span>₹{order.paidAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between py-2 text-sm text-red-600 font-medium">
                                            <span>Balance Due</span>
                                            <span>₹{(order.total - order.paidAmount).toLocaleString()}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200">
                            <div className="text-sm">
                                <h4 className="font-semibold mb-2">Bank Details</h4>
                                <p className="text-slate-600">
                                    Bank: State Bank of India<br />
                                    A/C No: 1234567890<br />
                                    IFSC: SBIN0001234<br />
                                    Branch: Surat Main
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="inline-block">
                                    <div className="h-16"></div>
                                    <div className="border-t border-slate-400 pt-2 text-sm text-slate-600">
                                        Authorized Signature
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="mt-6 p-4 bg-slate-50 rounded-lg text-xs text-slate-500">
                            <h4 className="font-semibold text-slate-700 mb-2">Terms & Conditions</h4>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Goods once sold will not be taken back or exchanged.</li>
                                <li>All disputes are subject to Surat jurisdiction.</li>
                                <li>Payment terms: 100% advance or as per agreement.</li>
                                <li>Warranty as per manufacturer's policy.</li>
                            </ol>
                        </div>

                        <p className="text-center text-sm text-slate-400 mt-6">
                            Thank you for your business!
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-3 p-4 border-t border-slate-200 bg-slate-50">
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                    <Button onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print Invoice
                    </Button>
                </div>
            </div>
        </div>
    );
}

import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { Button } from './ui/Button';

export function RMAPrint({ rma, isOpen, onClose, printType = 'token' }) {
    if (!isOpen || !rma) return null;

    const handlePrint = () => {
        const printWindow = window.open('', '', 'width=800,height=900');

        // Generate complete HTML with inline styles matching the preview
        const printContent = `
            <html>
                <head>
                    <title>${printType === 'token' ? 'RMA Token' : 'RMA Delivery Receipt'} - ${rma.id}</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            font-family: 'Segoe UI', Arial, sans-serif;
                            padding: 30px;
                            color: #333;
                            font-size: 13px;
                            background: #f1f5f9;
                        }
                        .receipt {
                            max-width: 550px;
                            margin: 0 auto;
                            border: 2px solid #7C3AED;
                            border-radius: 8px;
                            padding: 24px;
                            background: white;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 16px;
                            padding-bottom: 16px;
                            border-bottom: 2px solid #7C3AED;
                        }
                        .company-name {
                            font-size: 20px;
                            font-weight: bold;
                            color: #7C3AED;
                        }
                        .company-details {
                            font-size: 11px;
                            color: #64748b;
                            margin-top: 4px;
                        }
                        .receipt-title {
                            background: #7C3AED;
                            color: white;
                            text-align: center;
                            padding: 8px;
                            font-weight: bold;
                            font-size: 14px;
                            margin-bottom: 16px;
                            border-radius: 4px;
                        }
                        .rma-id {
                            text-align: center;
                            margin-bottom: 16px;
                        }
                        .rma-id-number {
                            font-size: 24px;
                            font-weight: bold;
                            color: #7C3AED;
                            letter-spacing: 3px;
                        }
                        .rma-date {
                            font-size: 11px;
                            color: #64748b;
                            margin-top: 4px;
                        }
                        .section {
                            margin-bottom: 16px;
                        }
                        .section-title {
                            font-size: 11px;
                            font-weight: bold;
                            color: #7C3AED;
                            text-transform: uppercase;
                            margin-bottom: 8px;
                        }
                        .info-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 8px;
                            font-size: 13px;
                        }
                        .info-label {
                            color: #64748b;
                        }
                        .info-value {
                            font-weight: 500;
                        }
                        .part-box {
                            background: #faf5ff;
                            padding: 12px;
                            border-radius: 8px;
                            margin-bottom: 16px;
                        }
                        .part-name {
                            font-weight: bold;
                            font-size: 14px;
                            color: #1e293b;
                        }
                        .serial {
                            font-family: monospace;
                            color: #7C3AED;
                            font-size: 13px;
                            margin-top: 4px;
                        }
                        .part-details {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 8px;
                            margin-top: 8px;
                            font-size: 11px;
                        }
                        .warranty-badge {
                            display: inline-block;
                            padding: 4px 10px;
                            border-radius: 20px;
                            font-size: 11px;
                            font-weight: 600;
                            margin-top: 8px;
                        }
                        .warranty-valid {
                            background: #dcfce7;
                            color: #166534;
                        }
                        .warranty-expired {
                            background: #fee2e2;
                            color: #991b1b;
                        }
                        .defect-box {
                            background: #fffbeb;
                            border: 1px solid #fcd34d;
                            padding: 12px;
                            border-radius: 8px;
                            margin-bottom: 16px;
                        }
                        .defect-title {
                            font-size: 11px;
                            font-weight: bold;
                            color: #b45309;
                            text-transform: uppercase;
                            margin-bottom: 4px;
                        }
                        .defect-text {
                            font-size: 13px;
                            color: #92400e;
                        }
                        .service-info {
                            font-size: 13px;
                            margin-bottom: 16px;
                        }
                        .status-badge {
                            display: inline-block;
                            padding: 4px 10px;
                            border-radius: 20px;
                            font-size: 11px;
                            font-weight: 600;
                        }
                        .status-inbox { background: #dbeafe; color: #1e40af; }
                        .status-in-company { background: #fef3c7; color: #92400e; }
                        .status-outbox { background: #e0e7ff; color: #4338ca; }
                        .status-delivered { background: #dcfce7; color: #166534; }
                        .charge-box {
                            padding: 12px;
                            border-radius: 8px;
                            text-align: center;
                            margin-bottom: 16px;
                        }
                        .charge-free {
                            background: #dcfce7;
                        }
                        .charge-paid {
                            background: #fee2e2;
                        }
                        .charge-label {
                            font-size: 11px;
                            color: #64748b;
                        }
                        .charge-amount-free {
                            font-size: 20px;
                            font-weight: bold;
                            color: #16a34a;
                        }
                        .charge-amount-paid {
                            font-size: 20px;
                            font-weight: bold;
                            color: #dc2626;
                        }
                        .delivery-box {
                            background: #dcfce7;
                            padding: 12px;
                            border-radius: 8px;
                            margin-bottom: 16px;
                        }
                        .delivery-title {
                            font-size: 11px;
                            font-weight: bold;
                            color: #166534;
                            text-transform: uppercase;
                            margin-bottom: 8px;
                        }
                        .signatures {
                            display: flex;
                            justify-content: space-between;
                            margin-top: 32px;
                            padding-top: 16px;
                            border-top: 1px dashed #cbd5e1;
                        }
                        .signature-box {
                            text-align: center;
                        }
                        .signature-space {
                            height: 40px;
                        }
                        .signature-line {
                            width: 120px;
                            border-top: 1px solid #64748b;
                            padding-top: 4px;
                            font-size: 11px;
                            color: #64748b;
                        }
                        .terms {
                            margin-top: 24px;
                            font-size: 10px;
                            color: #64748b;
                        }
                        .terms-title {
                            font-weight: 600;
                            margin-bottom: 4px;
                        }
                        .terms ol {
                            padding-left: 16px;
                            margin: 0;
                        }
                        .terms li {
                            margin: 2px 0;
                        }
                        .footer {
                            text-align: center;
                            font-size: 11px;
                            color: #94a3b8;
                            margin-top: 16px;
                        }
                        @media print {
                            body { 
                                padding: 10px; 
                                background: white;
                            }
                            .receipt { 
                                border-width: 1px;
                                box-shadow: none;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt">
                        <!-- Header -->
                        <div class="header">
                            <div class="company-name">Premium IT Park</div>
                            <div class="company-details">
                                123 Tech Hub, Ring Road, Surat, Gujarat - 395002<br>
                                Phone: +91 98765 43210 | GSTIN: 24ABCDE1234F1Z5
                            </div>
                        </div>

                        <!-- Receipt Title -->
                        <div class="receipt-title">
                            ${printType === 'token' ? 'RMA TOKEN / ACKNOWLEDGMENT' : 'REPLACEMENT DELIVERY RECEIPT'}
                        </div>

                        <!-- RMA ID -->
                        <div class="rma-id">
                            <div class="rma-id-number">${rma.id}</div>
                            <div class="rma-date">Date: ${new Date(rma.createdDate).toLocaleDateString('en-GB')}</div>
                        </div>

                        <!-- Customer Details -->
                        <div class="section">
                            <div class="section-title">Customer Details</div>
                            <div class="info-grid">
                                <div>
                                    <span class="info-label">Name: </span>
                                    <span class="info-value">${rma.customer}</span>
                                </div>
                                <div>
                                    <span class="info-label">Mobile: </span>
                                    <span class="info-value">${rma.mobile}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Part Details -->
                        <div class="part-box">
                            <div class="section-title">Part Details</div>
                            <div class="part-name">${rma.partName}</div>
                            <div class="serial">Serial: ${rma.serial}</div>
                            <div class="part-details">
                                <div>
                                    <span class="info-label">Purchase Date: </span>
                                    <span>${new Date(rma.purchaseDate).toLocaleDateString('en-GB')}</span>
                                </div>
                                <div>
                                    <span class="info-label">Bill No: </span>
                                    <span>${rma.billNo || 'N/A'}</span>
                                </div>
                            </div>
                            <span class="warranty-badge ${rma.isUnderWarranty ? 'warranty-valid' : 'warranty-expired'}">
                                ${rma.isUnderWarranty ? '✓ Under Warranty' : '✗ Warranty Expired'}
                            </span>
                        </div>

                        ${printType === 'token' && rma.defectDescription ? `
                        <!-- Defect Description -->
                        <div class="defect-box">
                            <div class="defect-title">Problem/Defect</div>
                            <div class="defect-text">${rma.defectDescription}</div>
                        </div>
                        ` : ''}

                        <!-- Service Center -->
                        <div class="service-info">
                            <span class="info-label">Service Center: </span>
                            <span class="info-value">${rma.serviceCenter}</span>
                        </div>

                        <!-- Status -->
                        <div class="service-info">
                            <span class="info-label">Status: </span>
                            <span class="status-badge status-${rma.status.toLowerCase().replace(' ', '-')}">${rma.status}</span>
                        </div>

                        <!-- Replacement Charge -->
                        <div class="charge-box ${rma.replacementCharge > 0 ? 'charge-paid' : 'charge-free'}">
                            <div class="charge-label">Replacement Charge</div>
                            <div class="${rma.replacementCharge > 0 ? 'charge-amount-paid' : 'charge-amount-free'}">
                                ${rma.replacementCharge > 0 ? '₹ ' + rma.replacementCharge.toLocaleString() : 'FREE'}
                            </div>
                        </div>

                        ${printType === 'delivery' && rma.deliveredDate ? `
                        <!-- Delivery Details -->
                        <div class="delivery-box">
                            <div class="delivery-title">Delivery Details</div>
                            <div>
                                <span class="info-label">Delivered On: </span>
                                <span class="info-value">${new Date(rma.deliveredDate).toLocaleDateString('en-GB')}</span>
                            </div>
                            ${rma.replacementCharge > 0 ? `
                            <div style="margin-top: 4px;">
                                <span class="info-label">Charge Collected: </span>
                                <span class="info-value" style="color: #166534;">₹ ${rma.replacementCharge.toLocaleString()}</span>
                            </div>
                            ` : ''}
                        </div>
                        ` : ''}

                        <!-- Signatures -->
                        <div class="signatures">
                            <div class="signature-box">
                                <div class="signature-space"></div>
                                <div class="signature-line">Customer Signature</div>
                            </div>
                            <div class="signature-box">
                                <div class="signature-space"></div>
                                <div class="signature-line">Shop Signature</div>
                            </div>
                        </div>

                        <!-- Terms & Conditions -->
                        <div class="terms">
                            <div class="terms-title">Terms & Conditions:</div>
                            <ol>
                                <li>Please keep this token safe for collecting your replacement.</li>
                                <li>Replacement time depends on manufacturer/service center.</li>
                                <li>OTP verification required at the time of delivery.</li>
                                <li>Parts not collected within 30 days may attract storage charges.</li>
                            </ol>
                        </div>

                        <!-- Footer -->
                        <div class="footer">
                            Thank you for choosing Premium IT Park!
                        </div>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-purple-600 to-indigo-600">
                    <h2 className="text-lg font-semibold text-white">
                        {printType === 'token' ? 'RMA Token Receipt' : 'Delivery Receipt'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Receipt Content - Preview */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
                    <div className="bg-white p-6 shadow-lg max-w-xl mx-auto border-2 border-purple-600 rounded-lg">
                        {/* Company Header */}
                        <div className="text-center mb-4 pb-4 border-b-2 border-purple-600">
                            <h1 className="text-xl font-bold text-purple-600">Premium IT Park</h1>
                            <p className="text-xs text-slate-500 mt-1">
                                123 Tech Hub, Ring Road, Surat, Gujarat - 395002<br />
                                Phone: +91 98765 43210 | GSTIN: 24ABCDE1234F1Z5
                            </p>
                        </div>

                        {/* Receipt Title */}
                        <div className="bg-purple-600 text-white text-center py-2 font-bold text-sm mb-4 rounded">
                            {printType === 'token' ? 'RMA TOKEN / ACKNOWLEDGMENT' : 'REPLACEMENT DELIVERY RECEIPT'}
                        </div>

                        {/* RMA ID */}
                        <div className="text-center mb-4">
                            <p className="text-2xl font-bold text-purple-600 tracking-widest">{rma.id}</p>
                            <p className="text-xs text-slate-500 mt-1">
                                Date: {new Date(rma.createdDate).toLocaleDateString('en-GB')}
                            </p>
                        </div>

                        {/* Customer Info */}
                        <div className="mb-4">
                            <h4 className="text-xs font-bold text-purple-600 uppercase mb-2">Customer Details</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-slate-500">Name: </span>
                                    <span className="font-medium">{rma.customer}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500">Mobile: </span>
                                    <span className="font-medium">{rma.mobile}</span>
                                </div>
                            </div>
                        </div>

                        {/* Part Info */}
                        <div className="bg-purple-50 p-3 rounded-lg mb-4">
                            <h4 className="text-xs font-bold text-purple-600 uppercase mb-2">Part Details</h4>
                            <p className="font-bold text-slate-900">{rma.partName}</p>
                            <p className="font-mono text-purple-600 text-sm mt-1">Serial: {rma.serial}</p>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                <div>
                                    <span className="text-slate-500">Purchase Date: </span>
                                    <span>{new Date(rma.purchaseDate).toLocaleDateString('en-GB')}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500">Bill No: </span>
                                    <span>{rma.billNo || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="mt-2">
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${rma.isUnderWarranty ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {rma.isUnderWarranty ? '✓ Under Warranty' : '✗ Warranty Expired'}
                                </span>
                            </div>
                        </div>

                        {/* Defect Description (Token only) */}
                        {printType === 'token' && rma.defectDescription && (
                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mb-4">
                                <h4 className="text-xs font-bold text-amber-700 uppercase mb-1">Problem/Defect</h4>
                                <p className="text-sm text-amber-800">{rma.defectDescription}</p>
                            </div>
                        )}

                        {/* Service Center */}
                        <div className="text-sm mb-4">
                            <span className="text-slate-500">Service Center: </span>
                            <span className="font-medium">{rma.serviceCenter}</span>
                        </div>

                        {/* Status */}
                        <div className="text-sm mb-4 flex items-center gap-2">
                            <span className="text-slate-500">Status: </span>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${rma.status === 'Inbox' ? 'bg-blue-100 text-blue-700' :
                                rma.status === 'In-Company' ? 'bg-amber-100 text-amber-700' :
                                    rma.status === 'Outbox' ? 'bg-indigo-100 text-indigo-700' :
                                        'bg-green-100 text-green-700'
                                }`}>
                                {rma.status}
                            </span>
                        </div>

                        {/* Replacement Charge */}
                        <div className={`p-3 rounded-lg text-center mb-4 ${rma.replacementCharge > 0 ? 'bg-red-50' : 'bg-green-50'
                            }`}>
                            <p className="text-xs text-slate-500">Replacement Charge</p>
                            <p className={`text-xl font-bold ${rma.replacementCharge > 0 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                {rma.replacementCharge > 0 ? `₹ ${rma.replacementCharge.toLocaleString()}` : 'FREE'}
                            </p>
                        </div>

                        {/* Delivery Info (Delivery receipt only) */}
                        {printType === 'delivery' && rma.deliveredDate && (
                            <div className="bg-green-50 p-3 rounded-lg mb-4">
                                <h4 className="text-xs font-bold text-green-700 uppercase mb-2">Delivery Details</h4>
                                <div className="text-sm">
                                    <span className="text-slate-500">Delivered On: </span>
                                    <span className="font-medium">{new Date(rma.deliveredDate).toLocaleDateString('en-GB')}</span>
                                </div>
                                {rma.replacementCharge > 0 && (
                                    <div className="text-sm mt-1">
                                        <span className="text-slate-500">Charge Collected: </span>
                                        <span className="font-medium text-green-700">₹ {rma.replacementCharge.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Signatures */}
                        <div className="flex justify-between mt-8 pt-4 border-t border-dashed border-slate-300">
                            <div className="text-center">
                                <div className="h-10"></div>
                                <div className="border-t border-slate-400 pt-1 text-xs text-slate-500 w-32">
                                    Customer Signature
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="h-10"></div>
                                <div className="border-t border-slate-400 pt-1 text-xs text-slate-500 w-32">
                                    Shop Signature
                                </div>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="mt-6 text-xs text-slate-500">
                            <p className="font-semibold mb-1">Terms & Conditions:</p>
                            <ol className="list-decimal list-inside space-y-0.5">
                                <li>Please keep this token safe for collecting your replacement.</li>
                                <li>Replacement time depends on manufacturer/service center.</li>
                                <li>OTP verification required at the time of delivery.</li>
                                <li>Parts not collected within 30 days may attract storage charges.</li>
                            </ol>
                        </div>

                        {/* Footer */}
                        <p className="text-center text-xs text-slate-400 mt-4">
                            Thank you for choosing Premium IT Park!
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-3 p-4 border-t border-slate-200 bg-slate-50">
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                    <Button onClick={handlePrint} className="bg-purple-600 hover:bg-purple-700">
                        <Printer className="w-4 h-4 mr-2" />
                        Print {printType === 'token' ? 'Token' : 'Receipt'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

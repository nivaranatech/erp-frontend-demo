import React from 'react';
import { X, Printer } from 'lucide-react';
import { Button } from './ui/Button';

export function JobCardPrint({ complaint, isOpen, onClose }) {
    if (!isOpen || !complaint) return null;

    const handlePrint = () => {
        const printContent = document.getElementById('job-card-print-area');
        const printWindow = window.open('', '', 'width=800,height=900');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Job Card - ${complaint.id}</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            font-family: 'Segoe UI', Arial, sans-serif;
                            padding: 20px;
                            color: #333;
                        }
                        .header {
                            text-align: center;
                            border-bottom: 2px solid #333;
                            padding-bottom: 15px;
                            margin-bottom: 20px;
                        }
                        .company-name {
                            font-size: 24px;
                            font-weight: bold;
                            color: #1e3a8a;
                        }
                        .company-tagline {
                            font-size: 12px;
                            color: #666;
                        }
                        .job-title {
                            font-size: 18px;
                            font-weight: bold;
                            margin-top: 10px;
                            padding: 5px 10px;
                            background: #f0f9ff;
                            display: inline-block;
                            border-radius: 4px;
                        }
                        .section {
                            margin-bottom: 20px;
                        }
                        .section-title {
                            font-size: 14px;
                            font-weight: bold;
                            background: #f1f5f9;
                            padding: 8px 12px;
                            margin-bottom: 10px;
                            border-left: 3px solid #3b82f6;
                        }
                        .info-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 10px;
                        }
                        .info-item {
                            font-size: 12px;
                        }
                        .info-label {
                            color: #666;
                            display: block;
                        }
                        .info-value {
                            font-weight: 500;
                        }
                        .issue-box {
                            background: #fef3c7;
                            padding: 10px;
                            border-radius: 4px;
                            font-size: 12px;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            font-size: 12px;
                        }
                        th, td {
                            border: 1px solid #e2e8f0;
                            padding: 8px;
                            text-align: left;
                        }
                        th {
                            background: #f1f5f9;
                            font-weight: 600;
                        }
                        .text-right {
                            text-align: right;
                        }
                        .text-center {
                            text-align: center;
                        }
                        .total-row {
                            font-weight: bold;
                            background: #f8fafc;
                        }
                        .grand-total {
                            font-size: 16px;
                            color: #1e3a8a;
                        }
                        .amc-badge {
                            background: #22c55e;
                            color: white;
                            padding: 2px 8px;
                            border-radius: 4px;
                            font-size: 10px;
                            font-weight: bold;
                        }
                        .free-label {
                            color: #22c55e;
                            font-weight: bold;
                        }
                        .footer {
                            margin-top: 30px;
                            padding-top: 15px;
                            border-top: 1px solid #e2e8f0;
                            font-size: 11px;
                            color: #666;
                        }
                        .signature-area {
                            margin-top: 40px;
                            display: flex;
                            justify-content: space-between;
                        }
                        .signature-box {
                            text-align: center;
                            width: 200px;
                        }
                        .signature-line {
                            border-top: 1px solid #333;
                            margin-top: 50px;
                            padding-top: 5px;
                            font-size: 12px;
                        }
                        @media print {
                            body { padding: 10px; }
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
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    // Calculate totals if not present
    const partsTotal = complaint.partsUsed?.reduce((sum, p) => sum + (p.price * p.qty), 0) || 0;
    const partsGst = complaint.partsUsed?.reduce((sum, p) => sum + ((p.price * p.qty) * (p.gst || 18) / 100), 0) || 0;
    const servicesTotal = complaint.servicesApplied?.reduce((sum, s) => sum + (s.isChargeable ? s.price : 0), 0) || 0;
    const servicesGst = servicesTotal * 0.18;
    const baseCharge = complaint.baseCharge || 0;
    const baseChargeGst = baseCharge * 0.18;
    const subtotal = partsTotal + servicesTotal + baseCharge;
    const totalGst = partsGst + servicesGst + baseChargeGst;
    const grandTotal = subtotal + totalGst;
    const amcDiscount = complaint.servicesApplied?.reduce((sum, s) => sum + (!s.isChargeable ? s.originalPrice || s.price : 0), 0) || 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Job Card - {complaint.id}</h2>
                    <div className="flex items-center gap-2">
                        <Button onClick={handlePrint}>
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                        </Button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* Printable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div id="job-card-print-area">
                        {/* Company Header */}
                        <div className="header">
                            <div className="company-name">Premium IT Park</div>
                            <div className="company-tagline">Computer Sales & Service Center</div>
                            <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                                Ring Road, Surat - 395002 | Tel: +91 98765 43210 | GST: 24XXXXX1234X1ZX
                            </div>
                            <div className="job-title">
                                JOB CARD #{complaint.id}
                                {complaint.isAMCCovered && (
                                    <span className="amc-badge" style={{ marginLeft: '10px' }}>AMC</span>
                                )}
                            </div>
                        </div>

                        {/* Customer & Device Info */}
                        <div className="section">
                            <div className="section-title">Customer & Device Details</div>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Customer Name</span>
                                    <span className="info-value">{complaint.customer}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Mobile</span>
                                    <span className="info-value">{complaint.mobile}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Device</span>
                                    <span className="info-value">{complaint.device}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Serial No.</span>
                                    <span className="info-value">{complaint.serial || '-'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Service Type</span>
                                    <span className="info-value">{complaint.serviceType}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Department</span>
                                    <span className="info-value">{complaint.department}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Job Date</span>
                                    <span className="info-value">{new Date(complaint.createdDate).toLocaleDateString('en-GB')}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Est. Completion</span>
                                    <span className="info-value">
                                        {complaint.estimatedCompletion
                                            ? new Date(complaint.estimatedCompletion).toLocaleDateString('en-GB')
                                            : '-'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Problem Description */}
                        <div className="section">
                            <div className="section-title">Problem Description</div>
                            <div className="issue-box">
                                {complaint.issue}
                            </div>
                        </div>

                        {/* Parts Used */}
                        {complaint.partsUsed && complaint.partsUsed.length > 0 && (
                            <div className="section">
                                <div className="section-title">Parts Used</div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '50%' }}>Part Name</th>
                                            <th className="text-center">Qty</th>
                                            <th className="text-right">Rate</th>
                                            <th className="text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {complaint.partsUsed.map((part, idx) => (
                                            <tr key={idx}>
                                                <td>{part.name}</td>
                                                <td className="text-center">{part.qty}</td>
                                                <td className="text-right">₹{part.price.toLocaleString()}</td>
                                                <td className="text-right">₹{(part.price * part.qty).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                        <tr className="total-row">
                                            <td colSpan="3" className="text-right">Parts Subtotal</td>
                                            <td className="text-right">₹{partsTotal.toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Services Applied */}
                        {complaint.servicesApplied && complaint.servicesApplied.length > 0 && (
                            <div className="section">
                                <div className="section-title">Services Applied</div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '60%' }}>Service</th>
                                            <th className="text-center">AMC Covered</th>
                                            <th className="text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {complaint.servicesApplied.map((service, idx) => (
                                            <tr key={idx}>
                                                <td>{service.name}</td>
                                                <td className="text-center">
                                                    {!service.isChargeable ? (
                                                        <span className="free-label">YES</span>
                                                    ) : 'No'}
                                                </td>
                                                <td className="text-right">
                                                    {service.isChargeable
                                                        ? `₹${service.price.toLocaleString()}`
                                                        : <span className="free-label">FREE</span>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="total-row">
                                            <td colSpan="2" className="text-right">Services Subtotal</td>
                                            <td className="text-right">₹{servicesTotal.toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Billing Summary */}
                        <div className="section">
                            <div className="section-title">Billing Summary</div>
                            <table>
                                <tbody>
                                    {baseCharge > 0 && (
                                        <tr>
                                            <td style={{ width: '70%' }}>Base Service Charge ({complaint.serviceType})</td>
                                            <td className="text-right">₹{baseCharge.toLocaleString()}</td>
                                        </tr>
                                    )}
                                    {partsTotal > 0 && (
                                        <tr>
                                            <td>Parts Total</td>
                                            <td className="text-right">₹{partsTotal.toLocaleString()}</td>
                                        </tr>
                                    )}
                                    {servicesTotal > 0 && (
                                        <tr>
                                            <td>Services Total</td>
                                            <td className="text-right">₹{servicesTotal.toLocaleString()}</td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td><strong>Subtotal</strong></td>
                                        <td className="text-right"><strong>₹{subtotal.toLocaleString()}</strong></td>
                                    </tr>
                                    <tr>
                                        <td>CGST (9%)</td>
                                        <td className="text-right">₹{Math.round(totalGst / 2).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td>SGST (9%)</td>
                                        <td className="text-right">₹{Math.round(totalGst / 2).toLocaleString()}</td>
                                    </tr>
                                    {amcDiscount > 0 && (
                                        <tr>
                                            <td style={{ color: '#22c55e' }}>AMC Discount</td>
                                            <td className="text-right" style={{ color: '#22c55e' }}>- ₹{amcDiscount.toLocaleString()}</td>
                                        </tr>
                                    )}
                                    <tr className="total-row grand-total">
                                        <td><strong>GRAND TOTAL</strong></td>
                                        <td className="text-right"><strong>₹{Math.round(grandTotal).toLocaleString()}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Terms */}
                        <div className="footer">
                            <strong>Terms & Conditions:</strong>
                            <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                                <li>Device must be collected within 15 days of completion.</li>
                                <li>Warranty on replaced parts as per manufacturer policy.</li>
                                <li>Labour charges are non-refundable once service is performed.</li>
                                <li>Data backup is customer's responsibility.</li>
                            </ul>
                        </div>

                        {/* Signature */}
                        <div className="signature-area">
                            <div className="signature-box">
                                <div className="signature-line">Customer Signature</div>
                            </div>
                            <div className="signature-box">
                                <div className="signature-line">For Premium IT Park</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

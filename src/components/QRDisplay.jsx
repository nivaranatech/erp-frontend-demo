import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, X } from 'lucide-react';
import { Button } from './ui/Button';

export function QRDisplay({ amc, isOpen, onClose }) {
    if (!isOpen || !amc) return null;

    const qrData = JSON.stringify({
        id: amc.id,
        qrCodeId: amc.qrCodeId,
        deviceSerial: amc.deviceSerial,
        customer: amc.customer,
        expiry: amc.endDate
    });

    const handleDownload = () => {
        const svg = document.getElementById('amc-qr-code');
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = `QR-${amc.qrCodeId}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    const handlePrint = () => {
        const printContent = document.getElementById('qr-print-area');
        const printWindow = window.open('', '', 'width=400,height=600');

        printWindow.document.write(`
            <html>
                <head>
                    <title>AMC QR Code - ${amc.qrCodeId}</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                            text-align: center;
                        }
                        .qr-sticker {
                            border: 2px dashed #ccc;
                            padding: 20px;
                            max-width: 300px;
                            margin: 0 auto;
                        }
                        .device-info {
                            margin-top: 15px;
                            font-size: 12px;
                            text-align: left;
                        }
                        .device-info p {
                            margin: 5px 0;
                        }
                        .company {
                            font-weight: bold;
                            font-size: 14px;
                            margin-bottom: 10px;
                        }
                        .qr-id {
                            font-family: monospace;
                            font-size: 10px;
                            color: #666;
                            margin-top: 10px;
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-purple-600 to-indigo-600">
                    <h2 className="text-lg font-semibold text-white">AMC QR Code</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* QR Display */}
                <div className="p-6">
                    <div id="qr-print-area" className="text-center">
                        <div className="qr-sticker inline-block p-6 border-2 border-dashed border-slate-300 rounded-lg bg-white">
                            <p className="company font-bold text-slate-900 mb-3">Premium IT Park</p>

                            <QRCodeSVG
                                id="amc-qr-code"
                                value={qrData}
                                size={180}
                                level="H"
                                includeMargin={true}
                            />

                            <div className="device-info mt-4 text-left text-sm">
                                <p className="text-slate-600">
                                    <strong>Device:</strong> {amc.deviceName}
                                </p>
                                <p className="text-slate-600">
                                    <strong>Serial:</strong> {amc.deviceSerial}
                                </p>
                                <p className="text-slate-600">
                                    <strong>Customer:</strong> {amc.customer}
                                </p>
                                <p className="text-slate-600">
                                    <strong>Valid Till:</strong> {new Date(amc.endDate).toLocaleDateString('en-IN')}
                                </p>
                            </div>

                            <p className="qr-id text-xs text-slate-400 mt-3 font-mono">
                                {amc.qrCodeId}
                            </p>
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 mt-4 text-center">
                        Scan this QR code to quickly book a service complaint
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-3 p-4 border-t border-slate-200 bg-slate-50">
                    <Button variant="secondary" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                    <Button onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print Sticker
                    </Button>
                </div>
            </div>
        </div>
    );
}

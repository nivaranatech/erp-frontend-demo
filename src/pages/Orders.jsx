import React, { useState } from 'react';
import { Plus, Search, ShoppingCart, Printer, QrCode, Eye, Edit2, Trash2, CheckCircle, IndianRupee } from 'lucide-react';
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
import { OrderModal } from '../components/OrderModal';
import { AMCModal } from '../components/AMCModal';
import { InvoicePrint } from '../components/InvoicePrint';
import { useSessionData } from '../contexts/SessionDataContext';

export default function Orders() {
    const { orders, deleteOrder, updateOrder } = useSessionData();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Modal states
    const [orderModalOpen, setOrderModalOpen] = useState(false);
    const [amcModalOpen, setAmcModalOpen] = useState(false);
    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [viewingOrder, setViewingOrder] = useState(null);
    const [orderForAMC, setOrderForAMC] = useState(null);
    const [orderForInvoice, setOrderForInvoice] = useState(null);

    const statuses = ['All', 'Pending', 'Completed', 'AMC Converted', 'Cancelled'];

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.mobile?.includes(searchTerm);
        const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'Pending': return 'warning';
            case 'Completed': return 'success';
            case 'AMC Converted': return 'primary';
            case 'Cancelled': return 'danger';
            default: return 'default';
        }
    };

    const getPaymentBadgeVariant = (status) => {
        switch (status) {
            case 'Paid': return 'success';
            case 'Partial': return 'warning';
            default: return 'danger';
        }
    };

    // Calculate stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);
    const amcConverted = orders.filter(o => o.status === 'AMC Converted').length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;

    // Handlers
    const handleAddOrder = () => {
        setEditingOrder(null);
        setOrderModalOpen(true);
    };

    const handleEditOrder = (order) => {
        setEditingOrder(order);
        setOrderModalOpen(true);
    };

    const handleDeleteOrder = (orderId) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            deleteOrder(orderId);
        }
    };

    const handleViewOrder = (order) => {
        setViewingOrder(order);
    };

    const handlePrintInvoice = (order) => {
        setOrderForInvoice(order);
        setInvoiceModalOpen(true);
    };

    const handleConvertToAMC = (order) => {
        setOrderForAMC(order);
        setAmcModalOpen(true);
    };

    const handleMarkCompleted = (order) => {
        if (window.confirm(`Mark order ${order.id} as Completed?`)) {
            updateOrder(order.id, { status: 'Completed' });
        }
    };

    const handleMarkPaid = (order) => {
        if (window.confirm(`Mark order ${order.id} as Paid?`)) {
            updateOrder(order.id, { paymentStatus: 'Paid', paidAmount: order.total });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Orders</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage sales orders and invoices</p>
                </div>
                <Button onClick={handleAddOrder}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Order
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Orders</p>
                            <h3 className="text-2xl font-bold text-slate-900">{totalOrders}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Pending</p>
                            <h3 className="text-2xl font-bold text-orange-600">{pendingOrders}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                            <h3 className="text-xl font-bold text-green-600">
                                ₹ {(totalRevenue / 1000).toFixed(0)}K
                            </h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                            <QrCode className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">AMC Converted</p>
                            <h3 className="text-2xl font-bold text-slate-900">{amcConverted}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-l-4 border-l-indigo-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle>Order List</CardTitle>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search orders..."
                                className="pl-9 w-48"
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
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p className="text-slate-500">No orders found</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead className="text-center">Items</TableHead>
                                    <TableHead className="text-right">Total Amount</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-slate-50">
                                        <TableCell className="font-mono text-xs text-blue-600 font-medium">
                                            {order.id}
                                            {order.estimateId && (
                                                <span className="block text-slate-400 text-[10px]">
                                                    from {order.estimateId}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-slate-500">
                                            {new Date(order.date).toLocaleDateString('en-IN')}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-slate-900">{order.customer}</p>
                                                <p className="text-xs text-slate-500">{order.mobile}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">
                                                {order.items?.length || 0} items
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-slate-900">
                                            ₹ {(order.total || 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getPaymentBadgeVariant(order.paymentStatus)}>
                                                {order.paymentStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(order.status)}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="View Details"
                                                    onClick={() => handleViewOrder(order)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Print Invoice"
                                                    onClick={() => handlePrintInvoice(order)}
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </Button>
                                                {/* Edit button - available for Pending and Completed (not yet AMC) orders */}
                                                {(order.status === 'Pending' || (order.status === 'Completed' && !order.amcId)) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Edit Order"
                                                        onClick={() => handleEditOrder(order)}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                {/* Mark as Completed - for Pending orders */}
                                                {order.status === 'Pending' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Mark as Completed"
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => handleMarkCompleted(order)}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                {/* Mark as Paid - for Completed orders with non-Paid payment */}
                                                {order.status === 'Completed' && order.paymentStatus !== 'Paid' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Mark as Paid"
                                                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                        onClick={() => handleMarkPaid(order)}
                                                    >
                                                        <IndianRupee className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                {/* Convert to AMC - for Completed + Paid orders */}
                                                {order.status === 'Completed' && order.paymentStatus === 'Paid' && !order.amcId && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Convert to AMC"
                                                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                                        onClick={() => handleConvertToAMC(order)}
                                                    >
                                                        <QrCode className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                {/* Delete - for non-AMC converted orders */}
                                                {order.status !== 'AMC Converted' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Delete Order"
                                                        className="text-red-600 hover:text-red-700"
                                                        onClick={() => handleDeleteOrder(order.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Order Details Modal */}
            {viewingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Order Details</h2>
                                <p className="text-sm text-slate-500 font-mono">{viewingOrder.id}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={getStatusBadgeVariant(viewingOrder.status)}>
                                    {viewingOrder.status}
                                </Badge>
                                <Button variant="ghost" size="sm" onClick={() => setViewingOrder(null)}>
                                    ×
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            {/* Customer Info */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Customer</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg space-y-1">
                                        <p className="font-medium text-slate-900">{viewingOrder.customer}</p>
                                        <p className="text-sm text-slate-600">{viewingOrder.mobile}</p>
                                        {viewingOrder.email && <p className="text-sm text-slate-600">{viewingOrder.email}</p>}
                                        {viewingOrder.address && <p className="text-sm text-slate-600">{viewingOrder.address}</p>}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Order Info</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg space-y-1">
                                        <p className="text-sm"><span className="text-slate-600">Date:</span> <span className="font-medium">{new Date(viewingOrder.date).toLocaleDateString('en-IN')}</span></p>
                                        <p className="text-sm"><span className="text-slate-600">Payment:</span> <span className="font-medium">{viewingOrder.paymentStatus}</span></p>
                                        {viewingOrder.amcId && (
                                            <p className="text-sm"><span className="text-slate-600">AMC:</span> <span className="font-medium text-purple-600">{viewingOrder.amcId}</span></p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            {viewingOrder.items && viewingOrder.items.length > 0 && (
                                <>
                                    <h3 className="font-semibold text-slate-900 mb-2">Order Items</h3>
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
                                                {viewingOrder.items.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-2 text-slate-500">{idx + 1}</td>
                                                        <td className="px-4 py-2 font-medium text-slate-900">{item.name}</td>
                                                        <td className="px-4 py-2 text-center">{item.qty}</td>
                                                        <td className="px-4 py-2 text-right">₹ {item.price?.toLocaleString()}</td>
                                                        <td className="px-4 py-2 text-right font-medium">₹ {((item.price || 0) * (item.qty || 1)).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                            {/* Totals */}
                            <div className="flex justify-end">
                                <div className="w-64 space-y-2">
                                    {viewingOrder.subtotal && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Subtotal</span>
                                            <span>₹ {viewingOrder.subtotal.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {viewingOrder.gstAmount && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">GST (18%)</span>
                                            <span>₹ {viewingOrder.gstAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                                        <span>Total</span>
                                        <span className="text-blue-600">₹ {(viewingOrder.total || 0).toLocaleString()}</span>
                                    </div>
                                    {viewingOrder.paymentStatus === 'Partial' && viewingOrder.paidAmount && (
                                        <>
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>Paid</span>
                                                <span>₹ {viewingOrder.paidAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-red-600 font-medium">
                                                <span>Balance</span>
                                                <span>₹ {(viewingOrder.total - viewingOrder.paidAmount).toLocaleString()}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setViewingOrder(null)}>Close</Button>
                            <Button onClick={() => { setViewingOrder(null); handlePrintInvoice(viewingOrder); }}>
                                <Printer className="w-4 h-4 mr-2" />
                                Print Invoice
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Modal */}
            <OrderModal
                isOpen={orderModalOpen}
                onClose={() => {
                    setOrderModalOpen(false);
                    setEditingOrder(null);
                }}
                editingOrder={editingOrder}
            />

            {/* AMC Modal */}
            <AMCModal
                isOpen={amcModalOpen}
                onClose={() => {
                    setAmcModalOpen(false);
                    setOrderForAMC(null);
                }}
                orderToConvert={orderForAMC}
            />

            {/* Invoice Print Modal */}
            <InvoicePrint
                order={orderForInvoice}
                isOpen={invoiceModalOpen}
                onClose={() => {
                    setInvoiceModalOpen(false);
                    setOrderForInvoice(null);
                }}
            />
        </div>
    );
}

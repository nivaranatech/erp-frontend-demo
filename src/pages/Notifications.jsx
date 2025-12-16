import React, { useState } from 'react';
import { Bell, CheckCircle, XCircle, Clock, User, Mail, Phone, Shield, Trash2, Info, Package, ShoppingCart, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useSessionData } from '../contexts/SessionDataContext';

export default function Notifications() {
    const {
        notifications,
        adminRequests,
        currentUser,
        approveAdminRequest,
        rejectAdminRequest,
        markNotificationRead,
        deleteNotification
    } = useSessionData();

    const [activeTab, setActiveTab] = useState('notifications');

    const handleApprove = (requestId) => {
        const result = approveAdminRequest(requestId);
        if (result.success) {
            alert('Admin request approved successfully! The user can now complete their registration.');
        }
    };

    const handleReject = (requestId) => {
        const reason = prompt('Please provide a reason for rejection (optional):');
        rejectAdminRequest(requestId, reason || 'No reason provided');
        alert('Admin request rejected.');
    };

    const pendingRequests = adminRequests.filter(req => req.status === 'pending');
    const approvedRequests = adminRequests.filter(req => req.status === 'approved');
    const rejectedRequests = adminRequests.filter(req => req.status === 'rejected');

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Get notification styling based on type
    const getNotificationStyle = (type) => {
        switch (type) {
            case 'admin_request':
                return { borderColor: 'border-l-orange-500', bgColor: 'bg-orange-100', iconColor: 'text-orange-600', Icon: Shield };
            case 'admin_approved':
                return { borderColor: 'border-l-green-500', bgColor: 'bg-green-100', iconColor: 'text-green-600', Icon: CheckCircle };
            case 'low_stock':
                return { borderColor: 'border-l-red-500', bgColor: 'bg-red-100', iconColor: 'text-red-600', Icon: AlertTriangle };
            case 'new_order':
                return { borderColor: 'border-l-blue-500', bgColor: 'bg-blue-100', iconColor: 'text-blue-600', Icon: ShoppingCart };
            case 'amc_expiry':
                return { borderColor: 'border-l-purple-500', bgColor: 'bg-purple-100', iconColor: 'text-purple-600', Icon: Clock };
            default:
                return { borderColor: 'border-l-slate-500', bgColor: 'bg-slate-100', iconColor: 'text-slate-600', Icon: Bell };
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage admin requests and system notifications</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {notifications.filter(n => !n.isRead).length} unread
                    </span>
                </div>
            </div>

            {/* Demo Info Banner */}
            <Card className="p-4 bg-blue-50 border-l-4 border-l-blue-500">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-2">How Admin Approval Works (Demo)</p>
                        <ol className="list-decimal list-inside space-y-1 text-blue-700">
                            <li><strong>First Admin:</strong> Registers directly without approval</li>
                            <li><strong>New Admin Request:</strong> When someone tries to register as admin (and admin already exists), a request is created</li>
                            <li><strong>Approval:</strong> Existing admin sees the request here and can Approve or Reject</li>
                            <li><strong>Complete Registration:</strong> Once approved, the new admin can complete registration from the Register page</li>
                        </ol>
                        <p className="mt-2 text-xs text-blue-600">Note: Data is session-based and resets on page refresh.</p>
                    </div>
                </div>
            </Card>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'notifications'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                >
                    Notifications ({notifications.length})
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'requests'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                        }`}
                >
                    Admin Requests
                    {pendingRequests.length > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                            {pendingRequests.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <Card className="p-12 text-center border-l-4 border-l-slate-300">
                            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-600 mb-2">No notifications yet</h3>
                            <p className="text-slate-500">When someone requests admin access, you'll see it here.</p>
                        </Card>
                    ) : (
                        notifications.map(notif => {
                            const style = getNotificationStyle(notif.type);
                            const NotifIcon = style.Icon;
                            return (
                                <Card
                                    key={notif.id}
                                    className={`p-4 border-l-4 ${style.borderColor} ${!notif.isRead ? 'bg-gradient-to-r from-blue-50/70 to-transparent ring-1 ring-blue-100' : 'hover:bg-slate-50'} transition-all`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-11 h-11 rounded-xl ${style.bgColor} flex items-center justify-center flex-shrink-0`}>
                                                <NotifIcon className={`w-5 h-5 ${style.iconColor}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold text-slate-900">{notif.title}</h4>
                                                    {!notif.isRead && (
                                                        <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded-full uppercase">New</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-600 leading-relaxed">{notif.message}</p>
                                                <p className="text-xs text-slate-400 mt-2">{formatDate(notif.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {!notif.isRead && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => markNotificationRead(notif.id)}
                                                    className="text-xs"
                                                >
                                                    Mark Read
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteNotification(notif.id)}
                                                className="hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>
            )}

            {/* Admin Requests Tab */}
            {activeTab === 'requests' && (
                <div className="space-y-6">
                    {/* Pending Requests */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-orange-500" />
                            Pending Requests ({pendingRequests.length})
                        </h3>
                        {pendingRequests.length === 0 ? (
                            <Card className="p-8 text-center border-l-4 border-l-slate-300">
                                <p className="text-slate-500">No pending admin requests</p>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {pendingRequests.map(request => (
                                    <Card key={request.id} className="p-5 border-l-4 border-l-orange-500">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                        {request.name?.charAt(0).toUpperCase() || 'A'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-lg text-slate-900">{request.name}</h4>
                                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                                            Wants to be Admin
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-slate-400" />
                                                        {request.email}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-4 h-4 text-slate-400" />
                                                        {request.mobile}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-400">
                                                    Requested: {formatDate(request.requestedAt)}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleApprove(request.id)}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleReject(request.id)}
                                                    className="text-red-600 hover:bg-red-50"
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Approved Requests */}
                    {approvedRequests.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                Approved ({approvedRequests.length})
                            </h3>
                            <div className="space-y-3">
                                {approvedRequests.map(request => (
                                    <Card key={request.id} className="p-4 border-l-4 border-l-green-500 bg-green-50/30">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <User className="w-5 h-5 text-green-600" />
                                                <div>
                                                    <span className="font-medium text-slate-900">{request.name}</span>
                                                    <span className="text-slate-500 mx-2">•</span>
                                                    <span className="text-sm text-slate-600">{request.email}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                                Awaiting Registration
                                            </span>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Rejected Requests */}
                    {rejectedRequests.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-red-500" />
                                Rejected ({rejectedRequests.length})
                            </h3>
                            <div className="space-y-3">
                                {rejectedRequests.map(request => (
                                    <Card key={request.id} className="p-4 border-l-4 border-l-red-500 bg-red-50/30">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <User className="w-5 h-5 text-red-600" />
                                                <div>
                                                    <span className="font-medium text-slate-900">{request.name}</span>
                                                    <span className="text-slate-500 mx-2">•</span>
                                                    <span className="text-sm text-slate-600">{request.email}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                                                Rejected
                                            </span>
                                        </div>
                                        {request.rejectionReason && (
                                            <p className="text-xs text-slate-500 mt-2 pl-8">
                                                Reason: {request.rejectionReason}
                                            </p>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

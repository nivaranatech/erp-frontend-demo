import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Clock, User, Calendar, FileText } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useSessionData } from '../contexts/SessionDataContext';

export function LeaveApprovalModal({ isOpen, onClose, leave }) {
    const { approveLeave, rejectLeave, leavePolicy, users } = useSessionData();
    const [rejectReason, setRejectReason] = useState('');
    const [approveComments, setApproveComments] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [error, setError] = useState('');

    // Current approver (demo: Admin User)
    const currentApprover = { name: 'Admin User', role: 'Admin' };

    const getLeaveTypeInfo = (typeId) => {
        return leavePolicy?.leaveTypes?.find(t => t.id === typeId);
    };

    const getUser = (userId) => {
        return users.find(u => u.id === userId);
    };

    const handleApprove = () => {
        approveLeave(leave.id, currentApprover.name, currentApprover.role, approveComments);
        onClose();
    };

    const handleReject = () => {
        if (!rejectReason.trim()) {
            setError('Please provide a reason for rejection');
            return;
        }
        rejectLeave(leave.id, currentApprover.name, currentApprover.role, rejectReason);
        onClose();
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Pending': return 'warning';
            case 'Rejected': return 'danger';
            default: return 'default';
        }
    };

    if (!isOpen || !leave) return null;

    const leaveType = getLeaveTypeInfo(leave.leaveType);
    const user = getUser(leave.userId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border dark:border-slate-800">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-purple-600 to-indigo-600">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Leave Request Approval
                            </h2>
                            <p className="text-purple-100 text-sm">
                                Review and take action on this request
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Employee Info */}
                    <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {leave.employee?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white">{leave.employee}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {user?.department} • {user?.role}
                            </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(leave.status)}>
                            {leave.status}
                        </Badge>
                    </div>

                    {/* Leave Details */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm">Leave Type</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: leaveType?.color || '#6B7280' }}
                                />
                                <span className="font-medium text-slate-900 dark:text-white">
                                    {leaveType?.name || leave.leaveType}
                                </span>
                            </div>
                        </div>

                        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">Duration</span>
                            </div>
                            <span className="font-medium text-slate-900 dark:text-white text-lg">
                                {leave.days} day(s)
                            </span>
                            {leave.halfDay && (
                                <Badge variant="default" className="ml-2 text-xs">
                                    {leave.halfDay}
                                </Badge>
                            )}
                        </div>

                        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">From</div>
                            <span className="font-medium text-slate-900 dark:text-white">
                                {new Date(leave.startDate).toLocaleDateString('en-IN', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>

                        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">To</div>
                            <span className="font-medium text-slate-900 dark:text-white">
                                {new Date(leave.endDate).toLocaleDateString('en-IN', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg mb-6">
                        <div className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Reason</div>
                        <p className="text-slate-700 dark:text-slate-300">{leave.reason}</p>
                    </div>

                    {/* Approval History */}
                    {leave.approvalHistory && leave.approvalHistory.length > 0 && (
                        <div className="mb-6">
                            <h4 className="font-medium text-slate-900 dark:text-white mb-3">Approval History</h4>
                            <div className="space-y-3">
                                {leave.approvalHistory.map((entry, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-lg border ${entry.action === 'Approved'
                                            ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                                            : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                {entry.action === 'Approved' ? (
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                )}
                                                <span className="font-medium text-slate-900 dark:text-white">
                                                    {entry.approverName}
                                                </span>
                                                <Badge variant="default" className="text-xs">
                                                    {entry.approverRole}
                                                </Badge>
                                            </div>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {new Date(entry.date).toLocaleString()}
                                            </span>
                                        </div>
                                        {entry.comments && (
                                            <p className="text-sm text-slate-600 dark:text-slate-300 ml-6">
                                                {entry.comments}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Forms (only for Pending) */}
                    {leave.status === 'Pending' && (
                        <>
                            {!showRejectForm ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Approval Comments (Optional)
                                        </label>
                                        <textarea
                                            value={approveComments}
                                            onChange={(e) => setApproveComments(e.target.value)}
                                            placeholder="Add any comments..."
                                            rows={2}
                                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none dark:placeholder-slate-500"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                                            Rejection Reason *
                                        </label>
                                        <textarea
                                            value={rejectReason}
                                            onChange={(e) => {
                                                setRejectReason(e.target.value);
                                                setError('');
                                            }}
                                            placeholder="Please provide a reason for rejection..."
                                            rows={3}
                                            className={`w-full rounded-lg border ${error ? 'border-red-500' : 'border-red-300 dark:border-red-800'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none bg-white dark:bg-slate-900 dark:text-white dark:placeholder-slate-500`}
                                        />
                                        {error && (
                                            <p className="text-red-500 text-xs mt-1">{error}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        Applied on {new Date(leave.appliedDate).toLocaleDateString()}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose}>
                            Close
                        </Button>

                        {leave.status === 'Pending' && (
                            <>
                                {!showRejectForm ? (
                                    <>
                                        <Button
                                            variant="secondary"
                                            onClick={() => setShowRejectForm(true)}
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Reject
                                        </Button>
                                        <Button onClick={handleApprove}>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Approve
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                setShowRejectForm(false);
                                                setRejectReason('');
                                                setError('');
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleReject}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Confirm Rejection
                                        </Button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

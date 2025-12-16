import React, { createContext, useContext, useState } from 'react';
import rolesData from '../data/roles.json';
import departmentsData from '../data/departments.json';
import itemsData from '../data/items.json';
import usersData from '../data/users.json';
import estimatesData from '../data/estimates.json';
import ordersData from '../data/orders.json';
import addonsData from '../data/addons.json';
import combinationsData from '../data/combinations.json';
import leavesData from '../data/leaves.json';
import holidaysData from '../data/holidays.json';
import leavePolicyData from '../data/leavePolicy.json';
import amcData from '../data/amc.json';
import complaintsData from '../data/complaints.json';
import rmaData from '../data/rma.json';
import stockTransactionsData from '../data/stock-transactions.json';

// Create context for session data
const SessionDataContext = createContext();

export function SessionDataProvider({ children }) {
    // These states will reset on page refresh (no localStorage)
    const [roles, setRoles] = useState(rolesData.roles);
    const [departments, setDepartments] = useState(departmentsData);
    const [items, setItems] = useState(itemsData);
    const [users, setUsers] = useState(usersData);
    const [estimates, setEstimates] = useState(estimatesData);
    const [orders, setOrders] = useState(ordersData);
    const [addons, setAddons] = useState(addonsData);
    const [combinations, setCombinations] = useState(combinationsData);
    const [savedModels, setSavedModels] = useState([]); // For saved part configurations

    // HR & Leave Management states
    const [leaves, setLeaves] = useState(leavesData);
    const [holidays, setHolidays] = useState(holidaysData);
    const [leavePolicy, setLeavePolicy] = useState(leavePolicyData);

    // AMC (Annual Maintenance Contract) states
    const [amcContracts, setAmcContracts] = useState(amcData);

    // Complaints/Jobs states
    const [complaints, setComplaints] = useState(complaintsData);

    // RMA (Replacements) states
    const [rmaItems, setRmaItems] = useState(rmaData);

    // Stock Inventory states
    const [stockTransactions, setStockTransactions] = useState(stockTransactionsData);
    const [stockSettings] = useState({ valuationMethod: 'FIFO' }); // FIFO or LIFO

    // Authentication states (session-based, cleared on refresh)
    const [registeredUsers, setRegisteredUsers] = useState([]); // Users who have completed registration
    const [currentUser, setCurrentUser] = useState(null); // Currently logged-in user
    const [adminRequests, setAdminRequests] = useState([]); // Pending admin registration requests

    // Demo notifications for initial display
    const [notifications, setNotifications] = useState([
        {
            id: 'NOTIF-DEMO-1',
            type: 'admin_request',
            title: 'New Admin Registration Request',
            message: 'Rahul Sharma (rahul.sharma@example.com) wants to register as Admin',
            data: { name: 'Rahul Sharma', email: 'rahul.sharma@example.com', mobile: '9876543210' },
            isRead: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
            id: 'NOTIF-DEMO-2',
            type: 'low_stock',
            title: 'Low Stock Alert',
            message: '5 items are running low on stock. HP Laptop Battery (2 left), Dell Charger (3 left)',
            isRead: false,
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
        },
        {
            id: 'NOTIF-DEMO-3',
            type: 'new_order',
            title: 'New Order Received',
            message: 'Order #ORD-2024-0156 worth ₹45,000 received from ABC Technologies',
            isRead: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        },
        {
            id: 'NOTIF-DEMO-4',
            type: 'amc_expiry',
            title: 'AMC Contract Expiring Soon',
            message: '3 AMC contracts are expiring in the next 7 days. Review and contact customers for renewal.',
            isRead: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        }
    ]);

    // ==================== AUTHENTICATION FUNCTIONS ====================

    // Check if this is the first user (to make them admin)
    const isFirstUser = () => {
        return registeredUsers.length === 0;
    };

    // Check if any admin exists
    const hasAdmin = () => {
        return registeredUsers.some(user => user.isAdmin);
    };

    // Check if email exists in pre-created users (created by admin from Add New User)
    const isEmailPreCreated = (email) => {
        return users.some(user => user.email?.toLowerCase() === email.toLowerCase() && !user.isRegistered);
    };

    // Check if email is already registered
    const isEmailRegistered = (email) => {
        return registeredUsers.some(user => user.email?.toLowerCase() === email.toLowerCase());
    };

    // Check if there's a pending admin request for this email
    const hasPendingAdminRequest = (email) => {
        return adminRequests.some(req => req.email?.toLowerCase() === email.toLowerCase() && req.status === 'pending');
    };

    // Check if admin request is approved
    const isAdminRequestApproved = (email) => {
        return adminRequests.some(req => req.email?.toLowerCase() === email.toLowerCase() && req.status === 'approved');
    };

    // Get pre-created user by email
    const getPreCreatedUser = (email) => {
        return users.find(user => user.email?.toLowerCase() === email.toLowerCase() && !user.isRegistered);
    };

    // Register Admin (first user - direct registration)
    const registerAdmin = (userData) => {
        if (isEmailRegistered(userData.email)) {
            return { success: false, message: 'Email already registered.' };
        }

        // First user becomes admin directly
        if (isFirstUser()) {
            const newAdmin = {
                id: `USER-ADMIN-${Date.now()}`,
                name: userData.name,
                email: userData.email,
                mobile: userData.mobile,
                password: userData.password,
                role: 'Admin',
                isAdmin: true,
                isRegistered: true,
                registeredAt: new Date().toISOString()
            };
            setRegisteredUsers(prev => [...prev, newAdmin]);
            return { success: true, message: 'Admin registered successfully!' };
        }

        // If admin exists and this request is approved, allow registration
        if (isAdminRequestApproved(userData.email)) {
            const newAdmin = {
                id: `USER-ADMIN-${Date.now()}`,
                name: userData.name,
                email: userData.email,
                mobile: userData.mobile,
                password: userData.password,
                role: 'Admin',
                isAdmin: true,
                isRegistered: true,
                registeredAt: new Date().toISOString()
            };
            setRegisteredUsers(prev => [...prev, newAdmin]);
            // Remove the approved request
            setAdminRequests(prev => prev.filter(req => req.email?.toLowerCase() !== userData.email.toLowerCase()));
            return { success: true, message: 'Admin registered successfully!' };
        }

        return { success: false, message: 'Admin registration requires approval from existing admin.' };
    };

    // Request Admin Registration (when admin already exists)
    const requestAdminRegistration = (userData) => {
        if (isEmailRegistered(userData.email)) {
            return { success: false, message: 'Email already registered.' };
        }

        if (hasPendingAdminRequest(userData.email)) {
            return { success: false, message: 'You already have a pending admin request. Please wait for approval.' };
        }

        const newRequest = {
            id: `ADMIN-REQ-${Date.now()}`,
            ...userData,
            status: 'pending',
            requestedAt: new Date().toISOString()
        };

        setAdminRequests(prev => [...prev, newRequest]);

        // Create notification for existing admins
        const notification = {
            id: `NOTIF-${Date.now()}`,
            type: 'admin_request',
            title: 'New Admin Registration Request',
            message: `${userData.name} (${userData.email}) wants to register as Admin`,
            data: newRequest,
            isRead: false,
            createdAt: new Date().toISOString()
        };
        setNotifications(prev => [...prev, notification]);

        return { success: true, message: 'Admin registration request submitted. Please wait for approval from existing admin.' };
    };

    // Approve admin request
    const approveAdminRequest = (requestId) => {
        const request = adminRequests.find(req => req.id === requestId);
        if (!request) return { success: false, message: 'Request not found.' };

        setAdminRequests(prev => prev.map(req =>
            req.id === requestId ? { ...req, status: 'approved', approvedAt: new Date().toISOString() } : req
        ));

        // Add notification for the requestor (in a real app, this would be sent via email/push)
        const notification = {
            id: `NOTIF-${Date.now()}`,
            type: 'admin_approved',
            title: 'Admin Request Approved',
            message: `Your admin registration request has been approved. You can now complete your registration.`,
            data: request,
            isRead: false,
            createdAt: new Date().toISOString()
        };
        setNotifications(prev => [...prev, notification]);

        return { success: true, message: 'Admin request approved.' };
    };

    // Reject admin request
    const rejectAdminRequest = (requestId, reason) => {
        setAdminRequests(prev => prev.map(req =>
            req.id === requestId ? { ...req, status: 'rejected', rejectedAt: new Date().toISOString(), rejectionReason: reason } : req
        ));
        return { success: true, message: 'Admin request rejected.' };
    };

    // Mark notification as read
    const markNotificationRead = (notificationId) => {
        setNotifications(prev => prev.map(notif =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
        ));
    };

    // Delete notification
    const deleteNotification = (notificationId) => {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    };

    // Get unread notification count
    const getUnreadNotificationCount = () => {
        return notifications.filter(n => !n.isRead).length;
    };

    // Register Staff (from pre-created user)
    const registerStaff = (email, password) => {
        const preCreatedUser = getPreCreatedUser(email);

        if (!preCreatedUser) {
            return { success: false, message: 'Email not found. Please ask admin to add you first.' };
        }

        if (isEmailRegistered(email)) {
            return { success: false, message: 'You have already registered. Please login.' };
        }

        const registeredStaff = {
            ...preCreatedUser,
            password: password,
            isRegistered: true,
            registeredAt: new Date().toISOString()
        };

        setUsers(prev => prev.map(user =>
            user.email?.toLowerCase() === email.toLowerCase()
                ? { ...user, isRegistered: true }
                : user
        ));

        setRegisteredUsers(prev => [...prev, registeredStaff]);
        return { success: true, message: 'Registration successful! You can now login.' };
    };

    // Login user
    const loginUser = (email, password) => {
        const user = registeredUsers.find(
            u => u.email?.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!user) {
            return { success: false, message: 'Invalid email or password.' };
        }

        setCurrentUser(user);
        return { success: true, message: 'Login successful!', user };
    };

    // Logout user
    const logoutUser = () => {
        setCurrentUser(null);
    };

    // Check if user is authenticated
    const isAuthenticated = () => {
        return currentUser !== null;
    };


    // Get compatible parts based on selected part IDs
    // Returns all items if no parts selected, or filtered items from matching combinations
    const getCompatibleParts = (selectedPartIds) => {
        if (!selectedPartIds || selectedPartIds.length === 0) {
            return items; // Return all items if nothing selected
        }

        // Find all active combinations containing any of the selected parts
        const matchingCombinations = combinations.filter(combo =>
            combo.isActive && combo.parts.some(partId => selectedPartIds.includes(partId))
        );

        if (matchingCombinations.length === 0) {
            return items; // No matching combinations, return all items
        }

        // Get all part IDs from matching combinations
        const compatiblePartIds = new Set();
        matchingCombinations.forEach(combo => {
            combo.parts.forEach(partId => compatiblePartIds.add(partId));
        });

        // Add the currently selected parts to ensure they always show
        selectedPartIds.forEach(id => compatiblePartIds.add(id));

        return items.filter(item => compatiblePartIds.has(item.id));
    };

    // Add a new role
    const addRole = (newRole) => {
        const roleWithId = {
            ...newRole,
            id: newRole.id || `custom_${Date.now()}`
        };
        setRoles(prev => [...prev, roleWithId]);
        return roleWithId;
    };

    // Add a new department
    const addDepartment = (newDept) => {
        const deptWithId = {
            ...newDept,
            id: newDept.id || Math.max(...departments.map(d => d.id), 0) + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setDepartments(prev => [...prev, deptWithId]);
        return deptWithId;
    };

    // Update a department
    const updateDepartment = (id, data) => {
        setDepartments(prev => prev.map(d =>
            d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d
        ));
    };

    // Delete a department
    const deleteDepartment = (id) => {
        setDepartments(prev => prev.filter(d => d.id !== id));
    };

    // Add a new item
    const addItem = (newItem) => {
        const itemWithId = {
            ...newItem,
            id: newItem.id || Math.max(...items.map(i => i.id), 0) + 1,
            auditTrail: [{ date: new Date().toISOString(), user: 'Admin User', action: 'Created', field: null, oldValue: null, newValue: null }]
        };
        setItems(prev => [...prev, itemWithId]);
        return itemWithId;
    };

    // Update an item
    const updateItem = (id, data, changes = []) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...data, auditTrail: [...(item.auditTrail || []), ...changes] } : item
        ));
    };

    // Delete an item
    const deleteItem = (id) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    // Add a new user
    const addUser = (newUser) => {
        const userWithId = {
            ...newUser,
            id: newUser.id || Math.max(...users.map(u => u.id), 0) + 1,
            status: 'Active',
            lastLogin: new Date().toISOString()
        };
        setUsers(prev => [...prev, userWithId]);
        return userWithId;
    };

    // Update a user
    const updateUser = (id, data) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    };

    // Generate estimate ID
    const generateEstimateId = () => {
        const year = new Date().getFullYear();
        const existingIds = estimates.filter(e => e.id.startsWith(`EST-${year}`));
        const nextNum = existingIds.length + 1;
        return `EST-${year}-${String(nextNum).padStart(3, '0')}`;
    };

    // Add a new estimate
    const addEstimate = (newEstimate) => {
        const estimateWithId = {
            ...newEstimate,
            id: newEstimate.id || generateEstimateId(),
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            version: 1,
            auditTrail: [{
                date: new Date().toISOString(),
                user: 'Admin User',
                action: 'Created',
                details: `Estimate created for ${newEstimate.customer}`
            }]
        };
        setEstimates(prev => [...prev, estimateWithId]);
        return estimateWithId;
    };

    // Update an estimate
    const updateEstimate = (id, data, action = 'Updated') => {
        setEstimates(prev => prev.map(est => {
            if (est.id === id) {
                return {
                    ...est,
                    ...data,
                    version: (est.version || 1) + 1,
                    updatedAt: new Date().toISOString(),
                    auditTrail: [
                        ...(est.auditTrail || []),
                        {
                            date: new Date().toISOString(),
                            user: 'Admin User',
                            action,
                            details: `Estimate ${action.toLowerCase()}`
                        }
                    ]
                };
            }
            return est;
        }));
    };

    // Delete an estimate
    const deleteEstimate = (id) => {
        setEstimates(prev => prev.filter(e => e.id !== id));
    };

    // Convert estimate to order
    const convertToOrder = (estimateId) => {
        const estimate = estimates.find(e => e.id === estimateId);
        if (estimate) {
            // Create new order from estimate
            const year = new Date().getFullYear();
            const orderNum = orders.length + 1;
            const newOrder = {
                id: `ORD-${year}-${String(orderNum).padStart(3, '0')}`,
                customer: estimate.customer,
                mobile: estimate.mobile,
                email: estimate.email,
                date: new Date().toISOString().split('T')[0],
                items: estimate.items,
                subtotal: estimate.subtotal,
                gstAmount: estimate.gstAmount,
                total: estimate.total,
                paymentStatus: 'Pending',
                status: 'Pending',
                estimateId: estimate.id,
                createdAt: new Date().toISOString()
            };
            setOrders(prev => [...prev, newOrder]);

            // Update estimate status
            updateEstimate(estimateId, { status: 'Converted' }, 'Converted to Order');
        }
    };

    // Save a model (part configuration with custom name)
    const saveModel = (model) => {
        const modelWithId = {
            ...model,
            id: `MODEL-${Date.now()}`,
            createdAt: new Date().toISOString()
        };
        setSavedModels(prev => [...prev, modelWithId]);
        return modelWithId;
    };

    // Delete a saved model
    const deleteModel = (id) => {
        setSavedModels(prev => prev.filter(m => m.id !== id));
    };

    // ====== HR & Leave Management Functions ======

    // Add a new leave request
    const addLeaveRequest = (leaveRequest) => {
        const newId = Math.max(...leaves.map(l => l.id), 0) + 1;
        const newLeave = {
            ...leaveRequest,
            id: newId,
            status: 'Pending',
            approvalHistory: [],
            createdAt: new Date().toISOString()
        };
        setLeaves(prev => [...prev, newLeave]);
        return newLeave;
    };

    // Update a leave request
    const updateLeaveRequest = (id, data) => {
        setLeaves(prev => prev.map(leave =>
            leave.id === id ? { ...leave, ...data, updatedAt: new Date().toISOString() } : leave
        ));
    };

    // Delete a leave request
    const deleteLeaveRequest = (id) => {
        setLeaves(prev => prev.filter(l => l.id !== id));
    };

    // Approve a leave request
    const approveLeave = (leaveId, approverName, approverRole, comments = '') => {
        setLeaves(prev => prev.map(leave => {
            if (leave.id === leaveId) {
                const newApprovalEntry = {
                    level: (leave.approvalHistory?.length || 0) + 1,
                    approverRole,
                    approverName,
                    action: 'Approved',
                    date: new Date().toISOString(),
                    comments: comments || 'Approved'
                };

                // Check if this is final approval (Admin or second level)
                const isFinalApproval = approverRole === 'Admin' ||
                    (leave.approvalHistory?.length >= 1);

                const newStatus = isFinalApproval ? 'Approved' : 'Pending';

                return {
                    ...leave,
                    status: newStatus,
                    approvalHistory: [...(leave.approvalHistory || []), newApprovalEntry],
                    updatedAt: new Date().toISOString()
                };
            }
            return leave;
        }));

        // If approved, deduct from user's leave balance
        const leave = leaves.find(l => l.id === leaveId);
        if (leave) {
            const user = users.find(u => u.id === leave.userId);
            if (user && user.leaveBalance && user.leaveBalance[leave.leaveType] !== undefined) {
                const newBalance = Math.max(0, user.leaveBalance[leave.leaveType] - leave.days);
                setUsers(prev => prev.map(u => {
                    if (u.id === leave.userId) {
                        return {
                            ...u,
                            leaveBalance: {
                                ...u.leaveBalance,
                                [leave.leaveType]: newBalance
                            }
                        };
                    }
                    return u;
                }));
            }
        }
    };

    // Reject a leave request
    const rejectLeave = (leaveId, approverName, approverRole, reason) => {
        setLeaves(prev => prev.map(leave => {
            if (leave.id === leaveId) {
                const newApprovalEntry = {
                    level: (leave.approvalHistory?.length || 0) + 1,
                    approverRole,
                    approverName,
                    action: 'Rejected',
                    date: new Date().toISOString(),
                    comments: reason || 'Rejected'
                };

                return {
                    ...leave,
                    status: 'Rejected',
                    approvalHistory: [...(leave.approvalHistory || []), newApprovalEntry],
                    updatedAt: new Date().toISOString()
                };
            }
            return leave;
        }));
    };

    // Add a single holiday
    const addHoliday = (holiday) => {
        const newId = Math.max(...holidays.map(h => h.id), 0) + 1;
        const newHoliday = {
            ...holiday,
            id: newId
        };
        setHolidays(prev => [...prev, newHoliday]);
        return newHoliday;
    };

    // Bulk add holidays
    const addHolidaysBulk = (holidaysList) => {
        const maxId = Math.max(...holidays.map(h => h.id), 0);
        const newHolidays = holidaysList.map((holiday, index) => ({
            ...holiday,
            id: maxId + index + 1
        }));
        setHolidays(prev => [...prev, ...newHolidays]);
        return newHolidays;
    };

    // Update a holiday
    const updateHoliday = (id, data) => {
        setHolidays(prev => prev.map(h =>
            h.id === id ? { ...h, ...data } : h
        ));
    };

    // Delete a holiday
    const deleteHoliday = (id) => {
        setHolidays(prev => prev.filter(h => h.id !== id));
    };

    // Update user leave balance (admin function)
    const updateUserLeaveBalance = (userId, leaveType, newBalance) => {
        setUsers(prev => prev.map(user => {
            if (user.id === userId) {
                return {
                    ...user,
                    leaveBalance: {
                        ...user.leaveBalance,
                        [leaveType]: newBalance
                    }
                };
            }
            return user;
        }));
    };

    // Get leave balance for a user
    const getUserLeaveBalance = (userId) => {
        const user = users.find(u => u.id === userId);
        return user?.leaveBalance || {};
    };

    // Calculate days between dates excluding weekends and holidays
    const calculateLeaveDays = (startDate, endDate, excludeWeekends = true, halfDay = null) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        let days = 0;

        const holidayDates = holidays.map(h => h.date);
        const current = new Date(start);

        while (current <= end) {
            const dayOfWeek = current.getDay();
            const dateStr = current.toISOString().split('T')[0];

            // Skip weekends if configured
            const isWeekend = excludeWeekends && (dayOfWeek === 0 || dayOfWeek === 6);
            const isHoliday = holidayDates.includes(dateStr);

            if (!isWeekend && !isHoliday) {
                days++;
            }

            current.setDate(current.getDate() + 1);
        }

        // Handle half day
        if (halfDay && days > 0) {
            days = days - 0.5;
        }

        return Math.max(0.5, days);
    };

    // ====== Order Management Functions ======

    // Generate unique order ID
    const generateOrderId = () => {
        const year = new Date().getFullYear();
        const maxNum = Math.max(
            ...orders
                .filter(o => o.id.includes(`ORD-${year}`))
                .map(o => parseInt(o.id.split('-')[2]) || 0),
            0
        );
        return `ORD-${year}-${String(maxNum + 1).padStart(3, '0')}`;
    };

    // Add new order
    const addOrder = (orderData) => {
        const newOrder = {
            ...orderData,
            id: generateOrderId(),
            createdAt: new Date().toISOString()
        };
        setOrders(prev => [...prev, newOrder]);
        return newOrder;
    };

    // Update order
    const updateOrder = (orderId, data) => {
        setOrders(prev => prev.map(order =>
            order.id === orderId ? { ...order, ...data, updatedAt: new Date().toISOString() } : order
        ));
    };

    // Delete order
    const deleteOrder = (orderId) => {
        setOrders(prev => prev.filter(o => o.id !== orderId));
    };

    // ====== AMC Management Functions ======

    // Generate unique AMC ID
    const generateAMCId = () => {
        const year = new Date().getFullYear();
        const maxNum = Math.max(
            ...amcContracts
                .filter(a => a.id.includes(`AMC-${year}`))
                .map(a => parseInt(a.id.split('-')[2]) || 0),
            0
        );
        return `AMC-${year}-${String(maxNum + 1).padStart(3, '0')}`;
    };

    // Generate QR code ID
    const generateQRCodeId = (amcId, deviceSerial) => {
        return `${amcId}-${deviceSerial}`;
    };

    // Add new AMC
    const addAMC = (amcData) => {
        const amcId = generateAMCId();
        const newAMC = {
            ...amcData,
            id: amcId,
            qrCodeId: generateQRCodeId(amcId, amcData.deviceSerial),
            status: 'Active',
            renewalReminders: [
                { daysBeforeExpiry: 30, sent: false },
                { daysBeforeExpiry: 7, sent: false }
            ],
            serviceHistory: [],
            createdAt: new Date().toISOString()
        };
        setAmcContracts(prev => [...prev, newAMC]);
        return newAMC;
    };

    // Update AMC
    const updateAMC = (amcId, data) => {
        setAmcContracts(prev => prev.map(amc =>
            amc.id === amcId ? { ...amc, ...data, updatedAt: new Date().toISOString() } : amc
        ));
    };

    // Delete AMC
    const deleteAMC = (amcId) => {
        setAmcContracts(prev => prev.filter(a => a.id !== amcId));
    };

    // Renew AMC
    const renewAMC = (amcId, newEndDate, newAmount) => {
        setAmcContracts(prev => prev.map(amc => {
            if (amc.id === amcId) {
                return {
                    ...amc,
                    startDate: amc.endDate, // New start = old end
                    endDate: newEndDate,
                    amcAmount: newAmount || amc.amcAmount,
                    status: 'Active',
                    renewalReminders: [
                        { daysBeforeExpiry: 30, sent: false },
                        { daysBeforeExpiry: 7, sent: false }
                    ],
                    updatedAt: new Date().toISOString()
                };
            }
            return amc;
        }));
    };

    // Get AMC by QR code ID
    const getAMCByQR = (qrCodeId) => {
        return amcContracts.find(amc => amc.qrCodeId === qrCodeId);
    };

    // Get upcoming renewals (expiring within days)
    const getUpcomingRenewals = (withinDays = 30) => {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + withinDays);

        return amcContracts.filter(amc => {
            if (amc.status !== 'Active') return false;
            const endDate = new Date(amc.endDate);
            return endDate >= today && endDate <= futureDate;
        });
    };

    // Add service entry to AMC
    const addServiceEntry = (amcId, serviceEntry) => {
        setAmcContracts(prev => prev.map(amc => {
            if (amc.id === amcId) {
                return {
                    ...amc,
                    serviceHistory: [
                        ...amc.serviceHistory,
                        { ...serviceEntry, date: new Date().toISOString().split('T')[0] }
                    ]
                };
            }
            return amc;
        }));
    };

    // Convert order to AMC
    const convertOrderToAMC = (orderId, amcData) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return null;

        // Create AMC with order data
        const newAMC = addAMC({
            ...amcData,
            orderId: orderId,
            customer: order.customer,
            mobile: order.mobile,
            email: order.email,
            address: order.address
        });

        // Update order status
        updateOrder(orderId, {
            status: 'AMC Converted',
            amcId: newAMC.id
        });

        return newAMC;
    };

    // ==========================================
    // COMPLAINTS/JOBS FUNCTIONS
    // ==========================================

    // Generate unique Job ID
    const generateJobId = () => {
        const year = new Date().getFullYear();
        const maxNum = Math.max(
            ...complaints
                .filter(c => c.id.includes(`JOB-${year}`))
                .map(c => parseInt(c.id.split('-')[2]) || 0),
            0
        );
        return `JOB-${year}-${String(maxNum + 1).padStart(3, '0')}`;
    };

    // Add new complaint/job
    const addComplaint = (complaintData) => {
        const jobId = generateJobId();
        const newComplaint = {
            ...complaintData,
            id: jobId,
            status: complaintData.status || 'Open',
            createdDate: new Date().toISOString().split('T')[0],
            completedDate: null,
            deliveredDate: null,
            notes: complaintData.notes || []
        };
        setComplaints(prev => [...prev, newComplaint]);
        return newComplaint;
    };

    // Update complaint/job
    const updateComplaint = (jobId, data) => {
        setComplaints(prev => prev.map(complaint =>
            complaint.id === jobId
                ? { ...complaint, ...data, updatedAt: new Date().toISOString() }
                : complaint
        ));
    };

    // Delete complaint/job
    const deleteComplaint = (jobId) => {
        setComplaints(prev => prev.filter(c => c.id !== jobId));
    };

    // Update complaint status with workflow tracking
    const updateComplaintStatus = (jobId, newStatus) => {
        setComplaints(prev => prev.map(complaint => {
            if (complaint.id === jobId) {
                const updates = {
                    ...complaint,
                    status: newStatus,
                    updatedAt: new Date().toISOString()
                };
                // Track completion and delivery dates
                if (newStatus === 'Completed' && !complaint.completedDate) {
                    updates.completedDate = new Date().toISOString().split('T')[0];
                }
                if (newStatus === 'Delivered' && !complaint.deliveredDate) {
                    updates.deliveredDate = new Date().toISOString().split('T')[0];
                }
                return updates;
            }
            return complaint;
        }));
    };

    // Get AMC by customer mobile (for QR-less lookup)
    const getAMCByMobile = (mobile) => {
        return amcContracts.find(amc => amc.mobile === mobile);
    };

    // Check if AMC is active (not expired)
    const isAMCActive = (amc) => {
        if (!amc) return false;
        const today = new Date();
        const endDate = new Date(amc.endDate);
        return endDate >= today && amc.status === 'Active';
    };

    // ==================== RMA (Replacements) Functions ====================

    // Generate RMA ID
    const generateRMAId = () => {
        const year = new Date().getFullYear();
        const existingIds = rmaItems
            .filter(r => r.id.startsWith(`RMA-${year}`))
            .map(r => parseInt(r.id.split('-')[2]) || 0);
        const nextNumber = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
        return `RMA-${year}-${String(nextNumber).padStart(3, '0')}`;
    };

    // Add new RMA
    const addRMA = (rmaData) => {
        const newRMA = {
            ...rmaData,
            id: rmaData.id || generateRMAId(),
            status: 'Inbox',
            inboxDate: new Date().toISOString().split('T')[0],
            inCompanyDate: null,
            outboxDate: null,
            deliveredDate: null,
            otp: '',
            otpGeneratedAt: null,
            history: [
                { date: new Date().toISOString(), action: 'RMA Created - Part received from customer', status: 'Inbox' }
            ],
            createdDate: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString()
        };
        setRmaItems(prev => [newRMA, ...prev]);
        return newRMA;
    };

    // Update RMA
    const updateRMA = (rmaId, data) => {
        setRmaItems(prev => prev.map(rma =>
            rma.id === rmaId
                ? {
                    ...rma,
                    ...data,
                    updatedAt: new Date().toISOString(),
                    history: [
                        ...(rma.history || []),
                        { date: new Date().toISOString(), action: 'RMA details updated', status: rma.status }
                    ]
                }
                : rma
        ));
    };

    // Delete RMA
    const deleteRMA = (rmaId) => {
        setRmaItems(prev => prev.filter(r => r.id !== rmaId));
    };

    // RMA Status workflow: Inbox -> In-Company -> Outbox -> Delivered
    const RMA_STATUS_FLOW = {
        'Inbox': 'In-Company',
        'In-Company': 'Outbox',
        'Outbox': 'Delivered',
        'Delivered': null
    };

    // Update RMA status with workflow tracking
    const updateRMAStatus = (rmaId, newStatus) => {
        setRmaItems(prev => prev.map(rma => {
            if (rma.id === rmaId) {
                const updates = {
                    ...rma,
                    status: newStatus,
                    updatedAt: new Date().toISOString()
                };

                // Track dates for each status
                const today = new Date().toISOString().split('T')[0];
                if (newStatus === 'In-Company' && !rma.inCompanyDate) {
                    updates.inCompanyDate = today;
                    updates.history = [...(rma.history || []), { date: new Date().toISOString(), action: 'Sent to company/service center', status: newStatus }];
                }
                if (newStatus === 'Outbox' && !rma.outboxDate) {
                    updates.outboxDate = today;
                    updates.history = [...(rma.history || []), { date: new Date().toISOString(), action: 'Replacement received from company', status: newStatus }];
                }
                if (newStatus === 'Delivered' && !rma.deliveredDate) {
                    updates.deliveredDate = today;
                    updates.otp = ''; // Clear OTP after delivery
                    updates.history = [...(rma.history || []), { date: new Date().toISOString(), action: 'Delivered to customer with OTP verification', status: newStatus }];
                }

                return updates;
            }
            return rma;
        }));
    };

    // Get next status in workflow
    const getNextRMAStatus = (currentStatus) => {
        return RMA_STATUS_FLOW[currentStatus] || null;
    };

    // Generate OTP for delivery verification (simulated - 4 digit)
    const generateRMAOTP = (rmaId) => {
        const otp = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit OTP
        setRmaItems(prev => prev.map(rma =>
            rma.id === rmaId
                ? {
                    ...rma,
                    otp: otp,
                    otpGeneratedAt: new Date().toISOString(),
                    history: [...(rma.history || []), { date: new Date().toISOString(), action: 'OTP generated for delivery', status: rma.status }]
                }
                : rma
        ));
        return otp;
    };

    // Verify OTP for delivery
    const verifyRMAOTP = (rmaId, enteredOTP) => {
        const rma = rmaItems.find(r => r.id === rmaId);
        if (!rma) return { success: false, message: 'RMA not found' };
        if (!rma.otp) return { success: false, message: 'OTP not generated' };
        if (rma.otp !== enteredOTP) return { success: false, message: 'Invalid OTP' };

        // Check if OTP is expired (24 hours)
        const otpTime = new Date(rma.otpGeneratedAt);
        const now = new Date();
        const hoursDiff = (now - otpTime) / (1000 * 60 * 60);
        if (hoursDiff > 24) return { success: false, message: 'OTP expired' };

        return { success: true, message: 'OTP verified successfully' };
    };

    // ==================== Stock Inventory Functions ====================

    // Generate Stock Transaction ID
    const generateStockTransactionId = () => {
        const year = new Date().getFullYear();
        const existingIds = stockTransactions
            .filter(t => t.id.startsWith(`STK-${year}`))
            .map(t => parseInt(t.id.split('-')[2]) || 0);
        const nextNumber = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
        return `STK-${year}-${String(nextNumber).padStart(3, '0')}`;
    };

    // Issue stock to a user
    const issueStock = (issueData) => {
        const item = items.find(i => i.id === issueData.itemId);
        const user = users.find(u => u.id === issueData.userId);
        const issuedByUser = users.find(u => u.id === issueData.issuedBy);

        if (!item || !user) return { success: false, message: 'Invalid item or user' };

        const availableQty = item.stockQty - (item.issuedQty || 0);
        if (issueData.quantity > availableQty) {
            return { success: false, message: `Only ${availableQty} units available` };
        }

        const transaction = {
            id: generateStockTransactionId(),
            type: 'issue',
            itemId: item.id,
            itemName: item.name,
            itemSku: item.sku || item.partId,
            quantity: issueData.quantity,
            userId: user.id,
            userName: user.name,
            issuedBy: issueData.issuedBy || 1,
            issuedByName: issuedByUser?.name || 'Admin',
            date: new Date().toISOString(),
            serialNumbers: issueData.serialNumbers || null,
            batchNumber: issueData.batchNumber || null,
            jobId: issueData.jobId || null,
            notes: issueData.notes || '',
            condition: 'Good',
            status: 'issued'
        };

        setStockTransactions(prev => [transaction, ...prev]);

        // Update item's issued quantity
        setItems(prev => prev.map(i =>
            i.id === item.id
                ? { ...i, issuedQty: (i.issuedQty || 0) + issueData.quantity }
                : i
        ));

        return { success: true, message: 'Stock issued successfully', transaction };
    };

    // Return stock from user
    const returnStock = (returnData) => {
        const item = items.find(i => i.id === returnData.itemId);
        const user = users.find(u => u.id === returnData.userId);
        const issuedByUser = users.find(u => u.id === returnData.issuedBy);

        if (!item || !user) return { success: false, message: 'Invalid item or user' };

        // Get user's current stock for this item
        const userStock = getUserStockForItem(returnData.userId, returnData.itemId);
        if (returnData.quantity > userStock) {
            return { success: false, message: `User only has ${userStock} units` };
        }

        const transaction = {
            id: generateStockTransactionId(),
            type: 'return',
            itemId: item.id,
            itemName: item.name,
            itemSku: item.sku || item.partId,
            quantity: returnData.quantity,
            userId: user.id,
            userName: user.name,
            issuedBy: returnData.issuedBy || 1,
            issuedByName: issuedByUser?.name || 'Admin',
            date: new Date().toISOString(),
            serialNumbers: returnData.serialNumbers || null,
            batchNumber: returnData.batchNumber || null,
            jobId: null,
            notes: returnData.notes || '',
            condition: returnData.condition || 'Good',
            status: 'returned'
        };

        setStockTransactions(prev => [transaction, ...prev]);

        // Update item's issued quantity (reduce)
        setItems(prev => prev.map(i =>
            i.id === item.id
                ? { ...i, issuedQty: Math.max(0, (i.issuedQty || 0) - returnData.quantity) }
                : i
        ));

        return { success: true, message: 'Stock returned successfully', transaction };
    };

    // Mark stock as used (consumed in a job)
    const markStockUsed = (transactionId, jobId) => {
        setStockTransactions(prev => prev.map(t =>
            t.id === transactionId
                ? { ...t, status: 'used', jobId: jobId }
                : t
        ));
    };

    // Get available stock for an item (total - issued)
    const getAvailableStock = (itemId) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return 0;
        return item.stockQty - (item.issuedQty || 0);
    };

    // Get stock held by a specific user for a specific item
    const getUserStockForItem = (userId, itemId) => {
        const userTransactions = stockTransactions.filter(t =>
            t.userId === userId && t.itemId === itemId
        );

        const issued = userTransactions
            .filter(t => t.type === 'issue' && t.status === 'issued')
            .reduce((sum, t) => sum + t.quantity, 0);

        const returned = userTransactions
            .filter(t => t.type === 'return')
            .reduce((sum, t) => sum + t.quantity, 0);

        const used = userTransactions
            .filter(t => t.status === 'used')
            .reduce((sum, t) => sum + t.quantity, 0);

        return issued - returned - used;
    };

    // Get all stock held by a user
    const getUserStock = (userId) => {
        const userItems = {};

        stockTransactions
            .filter(t => t.userId === userId)
            .forEach(t => {
                if (!userItems[t.itemId]) {
                    userItems[t.itemId] = {
                        itemId: t.itemId,
                        itemName: t.itemName,
                        itemSku: t.itemSku,
                        quantity: 0,
                        serialNumbers: []
                    };
                }

                if (t.type === 'issue' && t.status === 'issued') {
                    userItems[t.itemId].quantity += t.quantity;
                    if (t.serialNumbers) {
                        userItems[t.itemId].serialNumbers.push(...t.serialNumbers);
                    }
                } else if (t.type === 'return') {
                    userItems[t.itemId].quantity -= t.quantity;
                    if (t.serialNumbers) {
                        userItems[t.itemId].serialNumbers = userItems[t.itemId].serialNumbers
                            .filter(sn => !t.serialNumbers.includes(sn));
                    }
                } else if (t.status === 'used') {
                    userItems[t.itemId].quantity -= t.quantity;
                    if (t.serialNumbers) {
                        userItems[t.itemId].serialNumbers = userItems[t.itemId].serialNumbers
                            .filter(sn => !t.serialNumbers.includes(sn));
                    }
                }
            });

        return Object.values(userItems).filter(item => item.quantity > 0);
    };

    // Get items below reorder level
    const getLowStockItems = () => {
        return items.filter(item => {
            const available = getAvailableStock(item.id);
            const reorderLevel = item.reorderLevel || 5; // Default reorder level
            return available <= reorderLevel;
        });
    };

    // Get engineers (users who can receive stock)
    const getEngineers = () => {
        return users.filter(u =>
            u.role === 'Engineer' ||
            u.department?.toLowerCase().includes('service') ||
            u.department?.toLowerCase().includes('field')
        );
    };

    // Calculate stock valuation (FIFO/LIFO)
    const getStockValuation = (method = 'FIFO') => {
        let totalValue = 0;
        const itemValuations = [];

        items.forEach(item => {
            const available = getAvailableStock(item.id);
            if (available > 0) {
                // For demo, using purchase price
                // In real FIFO/LIFO, would track purchase batches with dates
                const unitValue = item.purchasePrice || 0;
                const itemValue = available * unitValue;
                totalValue += itemValue;

                itemValuations.push({
                    itemId: item.id,
                    itemName: item.name,
                    category: item.category,
                    availableQty: available,
                    unitValue: unitValue,
                    totalValue: itemValue,
                    method: method
                });
            }
        });

        return {
            method,
            totalValue,
            items: itemValuations,
            calculatedAt: new Date().toISOString()
        };
    };

    // Get stock summary by category
    const getStockSummaryByCategory = () => {
        const categories = {};

        items.forEach(item => {
            const cat = item.category || 'Uncategorized';
            if (!categories[cat]) {
                categories[cat] = {
                    category: cat,
                    totalItems: 0,
                    totalStock: 0,
                    totalIssued: 0,
                    totalValue: 0
                };
            }

            categories[cat].totalItems += 1;
            categories[cat].totalStock += item.stockQty || 0;
            categories[cat].totalIssued += item.issuedQty || 0;
            categories[cat].totalValue += (item.stockQty || 0) * (item.purchasePrice || 0);
        });

        return Object.values(categories);
    };

    const value = {
        // Data
        roles,
        departments,
        items,
        users,
        estimates,
        orders,
        addons,
        combinations,
        savedModels,
        leaves,
        holidays,
        leavePolicy,
        amcContracts,
        // Role actions
        addRole,
        setRoles,
        // Department actions
        addDepartment,
        updateDepartment,
        deleteDepartment,
        setDepartments,
        // Item actions
        addItem,
        updateItem,
        deleteItem,
        setItems,
        // User actions
        addUser,
        updateUser,
        setUsers,
        // Estimate actions
        addEstimate,
        updateEstimate,
        deleteEstimate,
        convertToOrder,
        setEstimates,
        // Order actions
        setOrders,
        addOrder,
        updateOrder,
        deleteOrder,
        // Addon actions
        setAddons,
        // Saved models
        saveModel,
        deleteModel,
        setSavedModels,
        // Combination actions
        setCombinations,
        getCompatibleParts,
        // HR & Leave actions
        setLeaves,
        addLeaveRequest,
        updateLeaveRequest,
        deleteLeaveRequest,
        approveLeave,
        rejectLeave,
        setHolidays,
        addHoliday,
        addHolidaysBulk,
        updateHoliday,
        deleteHoliday,
        setLeavePolicy,
        updateUserLeaveBalance,
        getUserLeaveBalance,
        calculateLeaveDays,
        // AMC actions
        setAmcContracts,
        addAMC,
        updateAMC,
        deleteAMC,
        renewAMC,
        getAMCByQR,
        getUpcomingRenewals,
        addServiceEntry,
        convertOrderToAMC,
        // Complaints/Jobs actions
        complaints,
        setComplaints,
        addComplaint,
        updateComplaint,
        deleteComplaint,
        updateComplaintStatus,
        generateJobId,
        getAMCByMobile,
        isAMCActive,
        // RMA (Replacements) actions
        rmaItems,
        setRmaItems,
        addRMA,
        updateRMA,
        deleteRMA,
        updateRMAStatus,
        getNextRMAStatus,
        generateRMAId,
        generateRMAOTP,
        verifyRMAOTP,
        // Stock Inventory actions
        stockTransactions,
        stockSettings,
        setStockTransactions,
        issueStock,
        returnStock,
        markStockUsed,
        getAvailableStock,
        getUserStock,
        getUserStockForItem,
        getLowStockItems,
        getEngineers,
        getStockValuation,
        getStockSummaryByCategory,
        // Authentication actions
        registeredUsers,
        currentUser,
        isFirstUser,
        hasAdmin,
        isEmailPreCreated,
        isEmailRegistered,
        hasPendingAdminRequest,
        isAdminRequestApproved,
        getPreCreatedUser,
        registerAdmin,
        requestAdminRegistration,
        approveAdminRequest,
        rejectAdminRequest,
        registerStaff,
        loginUser,
        logoutUser,
        isAuthenticated,
        // Notifications
        notifications,
        adminRequests,
        markNotificationRead,
        deleteNotification,
        getUnreadNotificationCount
    };

    return (
        <SessionDataContext.Provider value={value}>
            {children}
        </SessionDataContext.Provider>
    );
}

// Hook to use session data
export function useSessionData() {
    const context = useContext(SessionDataContext);
    if (!context) {
        throw new Error('useSessionData must be used within a SessionDataProvider');
    }
    return context;
}


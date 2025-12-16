import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, CheckCircle, Info, UserPlus, Shield, Clock } from 'lucide-react';
import { useSessionData } from '../../contexts/SessionDataContext';

export default function Register() {
    const navigate = useNavigate();
    const {
        isFirstUser,
        hasAdmin,
        isEmailPreCreated,
        isEmailRegistered,
        hasPendingAdminRequest,
        isAdminRequestApproved,
        getPreCreatedUser,
        registerAdmin,
        requestAdminRegistration,
        registerStaff
    } = useSessionData();

    // Registration type: 'admin' or 'staff'
    const [registrationType, setRegistrationType] = useState(isFirstUser() ? 'admin' : 'staff');
    const [requestSubmitted, setRequestSubmitted] = useState(false);

    // Admin form data
    const [adminData, setAdminData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: ''
    });

    // Staff form data
    const [staffEmail, setStaffEmail] = useState('');
    const [staffEmailVerified, setStaffEmailVerified] = useState(false);
    const [preCreatedUserInfo, setPreCreatedUserInfo] = useState(null);
    const [staffPassword, setStaffPassword] = useState('');
    const [staffConfirmPassword, setStaffConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleAdminChange = (e) => {
        const { name, value } = e.target;
        setAdminData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const validateAdminForm = () => {
        if (!adminData.name.trim()) {
            setError('Full name is required');
            return false;
        }
        if (!adminData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setError('Please enter a valid email address');
            return false;
        }
        if (!adminData.mobile.match(/^[0-9]{10}$/)) {
            setError('Please enter a valid 10-digit mobile number');
            return false;
        }
        if (adminData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        if (adminData.password !== adminData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleAdminSubmit = (e) => {
        e.preventDefault();
        if (!validateAdminForm()) return;

        setIsLoading(true);
        setTimeout(() => {
            // If first user, register directly
            if (isFirstUser()) {
                const result = registerAdmin(adminData);
                if (result.success) {
                    setSuccess(true);
                    setTimeout(() => navigate('/login'), 2000);
                } else {
                    setError(result.message);
                }
            }
            // If admin request is approved, complete registration
            else if (isAdminRequestApproved(adminData.email)) {
                const result = registerAdmin(adminData);
                if (result.success) {
                    setSuccess(true);
                    setTimeout(() => navigate('/login'), 2000);
                } else {
                    setError(result.message);
                }
            }
            // Otherwise, submit a request for approval
            else {
                const result = requestAdminRegistration(adminData);
                if (result.success) {
                    setRequestSubmitted(true);
                } else {
                    setError(result.message);
                }
            }
            setIsLoading(false);
        }, 1000);
    };

    const handleVerifyStaffEmail = () => {
        if (!staffEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setError('Please enter a valid email address');
            return;
        }

        if (isEmailRegistered(staffEmail)) {
            setError('This email is already registered. Please login instead.');
            return;
        }

        if (!isEmailPreCreated(staffEmail)) {
            setError('Email not found. Please ask admin to add you from Users → Add New User first.');
            return;
        }

        const userData = getPreCreatedUser(staffEmail);
        setPreCreatedUserInfo(userData);
        setStaffEmailVerified(true);
        setError('');
    };

    const handleStaffSubmit = (e) => {
        e.preventDefault();

        if (staffPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (staffPassword !== staffConfirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const result = registerStaff(staffEmail, staffPassword);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(result.message);
            }
            setIsLoading(false);
        }, 1000);
    };

    // Password strength indicator
    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 2) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
        if (strength <= 3) return { strength: 2, label: 'Medium', color: 'bg-yellow-500' };
        return { strength: 3, label: 'Strong', color: 'bg-green-500' };
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Registration Successful!</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                        Your account has been created. Redirecting to login...
                    </p>
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        );
    }

    // Show request submitted screen
    if (requestSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
                    <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Request Submitted!</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                        Your admin registration request has been sent to the existing admin for approval.
                    </p>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-left text-sm text-blue-800 dark:text-blue-200 mb-6">
                        <p className="font-semibold mb-2">What happens next?</p>
                        <ol className="list-decimal list-inside space-y-1 text-blue-700">
                            <li>Existing admin will see your request in Notifications</li>
                            <li>Once approved, return here and register with same email</li>
                            <li>You'll be able to set your password and complete registration</li>
                        </ol>
                    </div>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700"
                    >
                        Go to Login
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    const firstUser = isFirstUser();

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
                </div>

                <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <img src="/logo.jpg" alt="Premium IT Park" className="w-10 h-10 rounded-lg object-cover" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Premium IT Park</h1>
                            <p className="text-blue-200 text-sm">ERP System</p>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-28 h-28 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-4">
                                <img src="/logo.jpg" alt="Premium IT Park" className="w-20 h-20 rounded-2xl object-cover" />
                            </div>
                            <h2 className="text-2xl font-bold mb-1">Premium IT Park</h2>
                            <p className="text-blue-200 text-sm">ERP System</p>
                        </div>
                    </div>

                    <div className="text-blue-200 text-sm">
                        © 2024 Premium IT Park
                    </div>
                </div>
            </div>

            {/* Right Panel - Registration Form */}
            <div className="w-full lg:w-3/5 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
                <div className="w-full max-w-lg">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                            <img src="/logo.jpg" alt="Premium IT Park" className="w-10 h-10 rounded-lg object-cover" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Premium IT Park</h1>
                            <p className="text-slate-500 dark:text-slate-400 text-xs">ERP System</p>
                        </div>
                    </div>

                    {/* Form Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
                        <p className="text-slate-500 dark:text-slate-400">Register to access the ERP system</p>
                    </div>

                    {/* Info Banner */}
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800 dark:text-blue-200">
                                {firstUser ? (
                                    <p><strong>First User Registration:</strong> You will be registered as Admin. After registration, you can add staff members from the Users page.</p>
                                ) : registrationType === 'admin' ? (
                                    <div>
                                        <p><strong>Admin Registration:</strong> Your request will be sent to the existing admin for approval.</p>
                                        {isAdminRequestApproved(adminData.email) && (
                                            <p className="mt-2 text-green-700 dark:text-green-400 font-medium">✓ Your request was approved! Complete your registration below.</p>
                                        )}
                                    </div>
                                ) : (
                                    <p><strong>Staff Registration:</strong> Enter the email that your admin used to create your account.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Fill Demo Credentials for Admin Registration */}
                    {(firstUser || registrationType === 'admin') && (
                        <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                            <p className="text-xs text-green-700 dark:text-green-400 mb-2 font-medium">🚀 Quick Demo Fill (Click to auto-fill):</p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAdminData({
                                        name: 'Raj Patel',
                                        email: 'raj.patel@premiumit.com',
                                        mobile: '9876543210',
                                        password: 'demo123',
                                        confirmPassword: 'demo123'
                                    })}
                                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    👑 Demo Admin
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAdminData({
                                        name: 'Priya Shah',
                                        email: 'priya.shah@premiumit.com',
                                        mobile: '9988776655',
                                        password: 'demo123',
                                        confirmPassword: 'demo123'
                                    })}
                                    className="px-3 py-1.5 text-xs bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                                >
                                    👩‍💼 Demo Admin 2
                                </button>
                            </div>
                            <p className="text-[10px] text-green-600 mt-2">All fields will be filled • Password: <code className="bg-green-100 px-1 rounded">demo123</code></p>
                        </div>
                    )}

                    {/* Registration Type Toggle (only show if not first user) */}
                    {!firstUser && (
                        <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
                            <button
                                onClick={() => { setRegistrationType('admin'); setError(''); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${registrationType === 'admin'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                <Shield className="w-4 h-4" />
                                Admin
                            </button>
                            <button
                                onClick={() => { setRegistrationType('staff'); setError(''); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${registrationType === 'staff'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                <UserPlus className="w-4 h-4" />
                                Staff
                            </button>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Admin Registration Form */}
                    {(registrationType === 'admin' || firstUser) && (
                        <form onSubmit={handleAdminSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={adminData.name}
                                        onChange={handleAdminChange}
                                        placeholder="Enter your full name"
                                        className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={adminData.email}
                                            onChange={handleAdminChange}
                                            placeholder="admin@example.com"
                                            className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mobile</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="tel"
                                            name="mobile"
                                            value={adminData.mobile}
                                            onChange={handleAdminChange}
                                            placeholder="9876543210"
                                            className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={adminData.password}
                                            onChange={handleAdminChange}
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-12 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {adminData.password && (
                                        <div className="mt-2">
                                            <div className="flex gap-1 mb-1">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className={`h-1 flex-1 rounded-full ${i <= getPasswordStrength(adminData.password).strength ? getPasswordStrength(adminData.password).color : 'bg-slate-200'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={adminData.confirmPassword}
                                            onChange={handleAdminChange}
                                            placeholder="••••••••"
                                            className="w-full pl-12 pr-12 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {adminData.confirmPassword && (
                                        <p className={`text-xs mt-2 ${adminData.password === adminData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                                            {adminData.password === adminData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : firstUser ? (
                                    <>
                                        Register as Admin
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                ) : isAdminRequestApproved(adminData.email) ? (
                                    <>
                                        Complete Registration
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                ) : (
                                    <>
                                        Request Admin Access
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Staff Registration Form */}
                    {registrationType === 'staff' && !firstUser && (
                        <div className="space-y-4">
                            {!staffEmailVerified ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                            Enter your email (as provided by admin)
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="email"
                                                value={staffEmail}
                                                onChange={(e) => { setStaffEmail(e.target.value); setError(''); }}
                                                placeholder="your.email@example.com"
                                                className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleVerifyStaffEmail}
                                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                                    >
                                        Verify Email
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                <form onSubmit={handleStaffSubmit} className="space-y-4">
                                    {/* Show pre-created user info */}
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <span className="font-medium text-green-800">Email Verified!</span>
                                        </div>
                                        <div className="text-sm text-green-700">
                                            <p><strong>Name:</strong> {preCreatedUserInfo?.name}</p>
                                            <p><strong>Email:</strong> {staffEmail}</p>
                                            <p><strong>Role:</strong> {preCreatedUserInfo?.role}</p>
                                            <p><strong>Department:</strong> {preCreatedUserInfo?.department}</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-600">Now set your password to complete registration:</p>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={staffPassword}
                                                onChange={(e) => { setStaffPassword(e.target.value); setError(''); }}
                                                placeholder="Create a password"
                                                className="w-full pl-12 pr-12 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                                                required
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={staffConfirmPassword}
                                                onChange={(e) => { setStaffConfirmPassword(e.target.value); setError(''); }}
                                                placeholder="Confirm password"
                                                className="w-full pl-12 pr-12 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-800 dark:text-white"
                                                required
                                            />
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {staffConfirmPassword && (
                                            <p className={`text-xs mt-2 ${staffPassword === staffConfirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                                                {staffPassword === staffConfirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                Complete Registration
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => { setStaffEmailVerified(false); setPreCreatedUserInfo(null); }}
                                        className="w-full py-2 text-slate-600 dark:text-slate-400 text-sm hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        ← Use different email
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Login Link */}
                    <p className="text-center text-slate-600 dark:text-slate-400 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

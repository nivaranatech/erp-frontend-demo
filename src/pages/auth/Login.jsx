import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Info, AlertCircle } from 'lucide-react';
import { useSessionData } from '../../contexts/SessionDataContext';

export default function Login() {
    const navigate = useNavigate();
    const { loginUser, isFirstUser, registeredUsers } = useSessionData();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        setTimeout(() => {
            const result = loginUser(formData.email, formData.password);
            if (result.success) {
                navigate('/app');
            } else {
                setError(result.message);
            }
            setIsLoading(false);
        }, 800);
    };

    const firstUser = isFirstUser();

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                </div>

                <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
                    <div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <img src="/logo.jpg" alt="Premium IT Park" className="w-12 h-12 rounded-lg object-cover" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Premium IT Park</h1>
                                <p className="text-blue-200 text-sm">Enterprise Resource Planning</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <img src="/logo.jpg" alt="Premium IT Park" className="w-24 h-24 rounded-2xl object-cover" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2">Premium IT Park</h2>
                            <p className="text-blue-200">ERP System</p>
                        </div>
                    </div>

                    <div className="text-blue-200 text-sm">
                        © 2024 Premium IT Park. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
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
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h2>
                        <p className="text-slate-500 dark:text-slate-400">Enter your credentials to access your account</p>
                    </div>

                    {/* Info Banner - Show appropriate message */}
                    {firstUser ? (
                        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-800 dark:text-amber-200">
                                    <p><strong>No users registered yet!</strong></p>
                                    <p className="mt-1">Please <Link to="/register" className="text-blue-600 dark:text-blue-400 font-medium underline">register as Admin</Link> first to create your account.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                            <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800 dark:text-blue-200">
                                    <p><strong>Demo System:</strong> Login with your registered email and password.</p>
                                    <p className="mt-1 text-xs text-blue-600 dark:text-blue-300">Note: All data is session-based and will be cleared on page refresh.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Registered Users Count */}
                    {registeredUsers.length > 0 && (
                        <div className="mb-4 text-center text-sm text-slate-500 dark:text-slate-400">
                            {registeredUsers.length} user(s) registered in this session
                        </div>
                    )}

                    {/* Quick Fill Demo Credentials */}
                    {registeredUsers.length > 0 && (
                        <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                            <p className="text-xs text-green-700 dark:text-green-400 mb-2 font-medium">🚀 Quick Demo Fill:</p>
                            <div className="flex flex-wrap gap-2">
                                {registeredUsers.slice(0, 3).map((user, idx) => (
                                    <button
                                        key={user.email}
                                        type="button"
                                        onClick={() => setFormData({
                                            email: user.email,
                                            password: 'demo123',
                                            rememberMe: false
                                        })}
                                        className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        {user.isAdmin ? '👑 Admin' : `👤 ${user.name?.split(' ')[0] || 'User'}`}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-green-600 dark:text-green-300 mt-2">Password for all: <code className="bg-green-100 dark:bg-green-900/50 dark:text-green-200 px-1 rounded">demo123</code></p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className="w-full pl-12 pr-4 py-3.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white dark:bg-slate-800 dark:text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white dark:bg-slate-800 dark:text-white"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-800 dark:border-slate-600"
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                        <span className="text-sm text-slate-400 dark:text-slate-500">or</span>
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                    </div>

                    <p className="text-center text-slate-600 dark:text-slate-400">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

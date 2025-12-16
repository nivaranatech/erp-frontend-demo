import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle, Shield, KeyRound } from 'lucide-react';

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Success
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');

    const handleEmailSubmit = async (e) => {
        e.preventDefault();

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setError('');

        // Simulate API call
        setTimeout(() => {
            // For demo, generate a random OTP
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(newOtp);
            setStep(2);
            setIsLoading(false);
        }, 1500);
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();

        const enteredOtp = otp.join('');
        if (enteredOtp.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }

        setIsLoading(true);
        setError('');

        // Simulate verification
        setTimeout(() => {
            if (enteredOtp === generatedOtp) {
                setStep(3);
            } else {
                setError('Invalid OTP. Please try again.');
            }
            setIsLoading(false);
        }, 1000);
    };

    const handleResendOtp = () => {
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(newOtp);
        setOtp(['', '', '', '', '', '']);
        setError('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
            {/* Background Decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <img src="/logo.jpg" alt="Premium IT Park" className="w-10 h-10 rounded-lg object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Premium IT Park</h1>
                        <p className="text-slate-500 text-sm">ERP System</p>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">

                    {/* Step 1: Enter Email */}
                    {step === 1 && (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <KeyRound className="w-8 h-8 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Forgot Password?</h2>
                                <p className="text-slate-500">
                                    No worries! Enter your email and we'll send you reset instructions.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleEmailSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                            placeholder="Enter your registered email"
                                            className="w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            required
                                        />
                                    </div>
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
                                            Send Reset Code
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Sign In
                                </Link>
                            </div>
                        </>
                    )}

                    {/* Step 2: Enter OTP */}
                    {step === 2 && (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Shield className="w-8 h-8 text-indigo-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify OTP</h2>
                                <p className="text-slate-500">
                                    We've sent a 6-digit code to<br />
                                    <span className="font-medium text-slate-700">{email}</span>
                                </p>
                            </div>

                            {/* Demo OTP Display */}
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                                <p className="text-sm text-green-700 mb-1">📱 Demo OTP (displayed for testing):</p>
                                <p className="text-2xl font-bold text-green-600 tracking-widest text-center">{generatedOtp}</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleOtpSubmit} className="space-y-5">
                                {/* OTP Input Boxes */}
                                <div className="flex justify-center gap-3">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-12 h-14 text-center text-xl font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                    ))}
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
                                            Verify & Reset Password
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center space-y-3">
                                <p className="text-slate-500 text-sm">
                                    Didn't receive the code?{' '}
                                    <button
                                        onClick={handleResendOtp}
                                        className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        Resend OTP
                                    </button>
                                </p>
                                <button
                                    onClick={() => setStep(1)}
                                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Change Email
                                </button>
                            </div>
                        </>
                    )}

                    {/* Step 3: Success */}
                    {step === 3 && (
                        <div className="text-center py-4">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-3">Password Reset!</h2>
                            <p className="text-slate-500 mb-8">
                                Your password has been successfully reset.<br />
                                You can now sign in with your new password.
                            </p>

                            {/* Demo: New Password Info */}
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-left">
                                <p className="text-sm text-blue-700 mb-1">📝 Demo: New password set to:</p>
                                <p className="font-mono font-bold text-blue-600">newpassword123</p>
                            </div>

                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none transition-all justify-center shadow-lg shadow-blue-500/25"
                            >
                                Go to Sign In
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-slate-400 text-sm mt-6">
                    © 2024 Premium IT Park. All rights reserved.
                </p>
            </div>
        </div>
    );
}

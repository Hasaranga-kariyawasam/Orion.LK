import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Zap, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { loginWithEmail, loginWithGoogle, resetPassword } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Forgot password state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/';

  const isAdminEmail = (e?: string | null) => {
    if (!e) return false;
    const n = e.trim().toLowerCase();
    return n === 'orian@admin.lk' || n === 'orion@admin.lk';
  };

  // Redirect if already logged in
  if (user) {
    const dest = isAdminEmail(user.email) && from === '/' ? '/admin' : from;
    return <Navigate to={dest} replace />;
  }

  const getErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      const dest = isAdminEmail(email) && from === '/' ? '/admin' : from;
      navigate(dest, { replace: true });
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(getErrorMessage(err.code));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess(false);
    setResetLoading(true);
    
    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
      setResetEmail('');
    } catch (err: any) {
      setResetError(getErrorMessage(err.code));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0D1117] px-4">
      {/* Animated background blobs - Adjusted to green/dark theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#2ee661]/10 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#2ee661]/5 blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-md z-10">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-[#2ee661]/10 border border-[#2ee661]/20 flex items-center justify-center group-hover:bg-[#2ee661]/20 transition-all duration-300">
              <Zap size={20} className="text-[#2ee661]" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Orion<span className="text-[#2ee661]">.LK</span>
            </span>
          </Link>
          <p className="text-[#8B949E] mt-3 text-sm">Welcome back — sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-8 shadow-2xl shadow-black/40">
          {isForgotPassword ? (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-sm text-[#8B949E]">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {resetSuccess ? (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#2ee661]/20 flex items-center justify-center">
                      <CheckCircle size={24} className="text-[#2ee661]" />
                    </div>
                  </div>
                  <p className="text-sm text-white">
                    Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
                  </p>
                  <button
                    onClick={() => {
                      setIsForgotPassword(false);
                      setResetSuccess(false);
                    }}
                    className="w-full bg-[#0D1117] hover:bg-[#30363D]/50 border border-[#30363D] hover:border-[#8B949E]/30 text-white rounded-xl py-3 px-4 font-bold text-sm transition-all duration-200 mt-4"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {resetError && (
                    <div className="flex items-center gap-2 bg-[#f0364c]/10 border border-[#f0364c]/20 text-[#f0364c] rounded-xl p-3 text-sm mb-4">
                      <AlertCircle size={16} className="flex-shrink-0" />
                      <span>{resetError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label htmlFor="reset-email" className="text-sm font-medium text-white">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                      <input
                        id="reset-email"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full bg-[#0D1117] border border-[#30363D] focus:border-[#2ee661] focus:ring-1 focus:ring-[#2ee661] rounded-xl py-3 pl-10 pr-4 text-white placeholder-[#8B949E] text-sm outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading || !resetEmail}
                    className="w-full bg-[#2ee661] hover:bg-[#24c24e] text-black rounded-xl py-3 px-4 font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setResetError('');
                    }}
                    className="w-full bg-transparent hover:bg-white/5 text-white rounded-xl py-3 px-4 font-medium text-sm transition-all duration-200"
                  >
                    Back to Sign In
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              {/* Google Sign In */}
              <button
                id="google-signin-btn"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 bg-[#0D1117] hover:bg-[#30363D]/50 border border-[#30363D] hover:border-[#8B949E]/30 text-white rounded-xl py-3 px-4 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
              >
                {googleLoading ? (
                  <Loader2 size={18} className="animate-spin text-[#2ee661]" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-[#30363D]" />
                <span className="text-xs text-[#8B949E] font-medium">or sign in with email</span>
                <div className="flex-1 h-px bg-[#30363D]" />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-[#f0364c]/10 border border-[#f0364c]/20 text-[#f0364c] rounded-xl p-3 mb-5 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="login-email" className="text-sm font-medium text-white">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full bg-[#0D1117] border border-[#30363D] focus:border-[#2ee661] focus:ring-1 focus:ring-[#2ee661] rounded-xl py-3 pl-10 pr-4 text-white placeholder-[#8B949E] text-sm outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="text-sm font-medium text-white">Password</label>
                    <button 
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs text-[#2ee661] hover:text-[#24c24e] transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-[#0D1117] border border-[#30363D] focus:border-[#2ee661] focus:ring-1 focus:ring-[#2ee661] rounded-xl py-3 pl-10 pr-11 text-white placeholder-[#8B949E] text-sm outline-none transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8B949E] hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full bg-[#2ee661] hover:bg-[#24c24e] text-black rounded-xl py-3 px-4 font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Register link */}
              <p className="text-center text-sm text-[#8B949E] mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-[#2ee661] hover:text-[#24c24e] font-bold transition-colors">
                  Create one
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

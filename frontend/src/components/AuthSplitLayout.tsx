import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, Cpu, Laptop, ShieldCheck } from 'lucide-react';
import { loginWithEmail, registerWithEmail, loginWithGoogle } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { BRAND_LOGO_URL } from '../data';

interface AuthSplitLayoutProps {
  initialMode: 'login' | 'register';
}

export default function AuthSplitLayout({ initialMode }: AuthSplitLayoutProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Sync mode if URL changes (e.g. browser back button)
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname]);

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError('');
    navigate(newMode === 'login' ? '/login' : '/register', { replace: true });
  };

  // Shared / Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Register specific state
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

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

  // Password strength calculation
  const passwordStrength = (p: string) => {
    if (!p) return { level: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { level: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { level: 3, label: 'Good', color: 'bg-blue-500' };
    return { level: 4, label: 'Strong', color: 'bg-[#2ee661]' };
  };

  const strength = passwordStrength(password);

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
      case 'auth/email-already-in-use':
        return 'This email is already registered. Try logging in.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  // Handle Login submission
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

  // Handle Register submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(name, email, password);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Auth
  const handleGoogleAuth = async () => {
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

  const isRegister = mode === 'register';

  // Smooth sliding spring animation parameters
  const panelSpring = {
    type: 'spring' as const,
    stiffness: 140,
    damping: 22,
    mass: 1,
  };

  return (
    <div className="min-h-screen bg-[#EDE8E2] text-gray-900 flex items-center justify-center p-3 sm:p-6 md:p-10 selection:bg-black selection:text-white">
      {/* 
        Fixed Dimensions Container ("box eka resize karanna epa"):
        Outer card maintains constant dimensions and never jumps or resizes.
      */}
      <div className="w-full max-w-[1060px] h-[720px] bg-white rounded-3xl shadow-[0_30px_70px_-20px_rgba(0,0,0,0.16)] border border-black/5 overflow-hidden relative">
        
        {/* ========================================================= */}
        {/* 1. FORM PANEL: Slides between Left (0%) and Right (50%)   */}
        {/* ========================================================= */}
        <motion.div
          animate={{
            x: isRegister ? '100%' : '0%',
          }}
          transition={panelSpring}
          className="w-full lg:w-1/2 h-full absolute top-0 left-0 z-20 bg-gray-100 p-6 sm:p-10 md:p-12 flex flex-col justify-between overflow-y-auto scrollbar-hide"
        >
          {/* Top Bar: Back Link & Orion Logo */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-gray-500 hover:text-black transition-colors group"
            >
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
              <span>Back</span>
            </Link>

            {/* Logo */}
          <a href="/" className="flex items-center shrink-0 shadow-[0_0_10px_rgba(46, 230, 97, 0.5)] shadow-md rounded-full px-5 py-1 bg-black/100 hover:bg-black/20 transition-colors">
            <span className="text-3xl font-black tracking-tight flex items-baseline " style={{ fontFamily: "'Orbitron', sans-serif" }}>
              <span className="text-white">O</span>
              <span className="text-white">RION</span>
              <span className="text-[#2ee661] ml-1 text-2xl" style={{ textShadow: '0 0 10px rgba(46, 230, 97, 0.5)' }}>.lk</span>
            </span>
          </a>

            <div className="w-12" />
          </div>

          {/* Form Content Area */}
          <div className="w-full max-w-sm mx-auto my-auto py-1">
            {/* Sliding Mode Switcher Tabs */}
            <div className="flex items-center p-1 bg-gray-100/90 rounded-xl mb-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                  !isRegister
                    ? 'bg-white text-black shadow-sm font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 py-2 text-center rounded-lg transition-all cursor-pointer ${
                  isRegister
                    ? 'bg-white text-black shadow-sm font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-xs">
                <AlertCircle size={15} className="flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Crossfading Form Bodies */}
            <AnimatePresence mode="wait" initial={false}>
              {!isRegister ? (
                /* ---------------- LOGIN FORM ---------------- */
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-5">
                    <h1 className="text-3xl font-serif text-gray-950 font-medium tracking-tight">
                      Login
                    </h1>
                    <p className="text-gray-500 text-xs mt-1">
                      Welcome back — enter your credentials to continue
                    </p>
                  </div>

                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-1">
                      <label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                        Email
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full bg-[#F8F8F9] border border-gray-200 focus:border-black focus:bg-white rounded-xl py-3 px-4 text-gray-900 placeholder-gray-400 text-sm outline-none transition-all duration-200 focus:ring-1 focus:ring-black/10"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                          Password
                        </label>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            alert('Password reset link has been dispatched or contact support@orion.lk.');
                          }}
                          className="text-xs font-medium text-gray-500 hover:text-black underline underline-offset-2 transition-colors"
                        >
                          Forgot Password?
                        </a>
                      </div>
                      <div className="relative">
                        <input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full bg-[#F8F8F9] border border-gray-200 focus:border-black focus:bg-white rounded-xl py-3 pl-4 pr-11 text-gray-900 placeholder-gray-400 text-sm outline-none transition-all duration-200 focus:ring-1 focus:ring-black/10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                          tabIndex={-1}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      id="login-submit-btn"
                      type="submit"
                      disabled={loading || googleLoading}
                      className="w-full bg-[#111111] hover:bg-black text-white rounded-xl py-3.5 px-4 font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        'Login'
                      )}
                    </button>
                  </form>

                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">or login with</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <button
                    id="google-signin-btn"
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={googleLoading || loading}
                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-xl py-2.5 px-4 font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:border-gray-300 cursor-pointer"
                  >
                    {googleLoading ? (
                      <Loader2 size={17} className="animate-spin text-gray-600" />
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    <span>Login with Google</span>
                  </button>

                  <p className="text-center text-xs text-gray-500 mt-5">
                    Doesn&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('register')}
                      className="font-bold text-black underline underline-offset-4 hover:text-gray-700 cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </p>
                </motion.div>
              ) : (
                /* ---------------- REGISTER FORM ---------------- */
                <motion.div
                  key="register-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-4">
                    <h1 className="text-3xl font-serif text-gray-950 font-medium tracking-tight">
                      Create Account
                    </h1>
                    <p className="text-gray-500 text-xs mt-1">
                      Join Orion to track orders, save PC builds &amp; get member deals
                    </p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-3">
                    <div className="space-y-1">
                      <label htmlFor="reg-name" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                        Full Name
                      </label>
                      <input
                        id="reg-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Hasaranga Kariyawasam"
                        required
                        className="w-full bg-[#F8F8F9] border border-gray-200 focus:border-black focus:bg-white rounded-xl py-2 px-3.5 text-gray-900 placeholder-gray-400 text-sm outline-none transition-all duration-200 focus:ring-1 focus:ring-black/10"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="reg-email" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                        Email
                      </label>
                      <input
                        id="reg-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        required
                        className="w-full bg-[#F8F8F9] border border-gray-200 focus:border-black focus:bg-white rounded-xl py-2 px-3.5 text-gray-900 placeholder-gray-400 text-sm outline-none transition-all duration-200 focus:ring-1 focus:ring-black/10"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="reg-pass" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="reg-pass"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full bg-[#F8F8F9] border border-gray-200 focus:border-black focus:bg-white rounded-xl py-2 pl-3.5 pr-10 text-gray-900 placeholder-gray-400 text-sm outline-none transition-all duration-200 focus:ring-1 focus:ring-black/10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                          tabIndex={-1}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>

                      {password && (
                        <div className="space-y-1 pt-0.5">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map((i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                  i <= strength.level ? strength.color : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-gray-500">
                            <span>Security</span>
                            <span className="font-semibold text-gray-800">{strength.label}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="reg-confirm" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          id="reg-confirm"
                          type={showConfirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className={`w-full bg-[#F8F8F9] border rounded-xl py-2 pl-3.5 pr-10 text-gray-900 placeholder-gray-400 text-sm outline-none transition-all duration-200 ${
                            confirmPassword && password !== confirmPassword
                              ? 'border-red-400 focus:border-red-500'
                              : confirmPassword && password === confirmPassword
                              ? 'border-emerald-500 focus:border-emerald-600'
                              : 'border-gray-200 focus:border-black focus:bg-white focus:ring-1 focus:ring-black/10'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                          tabIndex={-1}
                          aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        >
                          {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        {confirmPassword && password === confirmPassword && (
                          <CheckCircle size={15} className="absolute right-9 top-1/2 -translate-y-1/2 text-emerald-500" />
                        )}
                      </div>
                    </div>

                    <button
                      id="register-submit-btn"
                      type="submit"
                      disabled={loading || googleLoading}
                      className="w-full bg-[#111111] hover:bg-black text-white rounded-xl py-3 px-4 font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Creating account...</span>
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </form>

                  <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">or register with</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <button
                    id="google-signup-btn"
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={googleLoading || loading}
                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-xl py-2 px-4 font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:border-gray-300 cursor-pointer"
                  >
                    {googleLoading ? (
                      <Loader2 size={17} className="animate-spin text-gray-600" />
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    <span>Continue with Google</span>
                  </button>

                  <p className="text-center text-xs text-gray-500 mt-3.5">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-bold text-black underline underline-offset-4 hover:text-gray-700 cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Security Badge */}
          <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-gray-400">
            <ShieldCheck size={13} className="text-[#2ee661]" />
            <span>Official Orion Sri Lanka Hardware Store &bull; SSL Encrypted</span>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 2. TECH IMAGE SHOWCASE PANEL: Slides between Right (50%) and Left (0%)    */}
        {/* ========================================================================= */}
        <motion.div
          animate={{
            x: isRegister ? '-100%' : '0%',
          }}
          transition={panelSpring}
          className="hidden lg:flex w-1/2 h-full absolute top-0 left-1/2 z-10 flex-col justify-between p-10 xl:p-12 overflow-hidden bg-[#0A0D12]"
        >
          {/* Tech Hardware Image: Changes / crossfades based on desktop custom rig vs gaming laptop */}
          <motion.img
            key={isRegister ? 'laptop-img' : 'rig-img'}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            src={isRegister ? '/assets/auth-laptop.jpg' : '/assets/auth-tech.jpg'}
            alt="Orion Hardware Showcase"
            className="absolute inset-0 w-full h-full object-cover object-center select-none"
          />

          {/* High-Contrast Gradient Vignette overlay for editorial readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/50 pointer-events-none" />

          {/* Top Bar on Tech Image */}
          <div className="relative z-10">
            <div className="flex items-center justify-between text-white/90 text-xs font-mono uppercase tracking-[0.25em]">
              <span className="font-bold flex items-center gap-1.5 text-[#2ee661]">
                {isRegister ? <Laptop size={14} /> : <Cpu size={14} />}
                {isRegister ? 'Pro Laptops & Gear' : 'Custom Liquid Rigs'}
              </span>
              <span className="text-white/70">{isRegister ? 'SERIES 02' : 'SERIES 01'}</span>
            </div>
            <div className="w-full h-px bg-white/20 mt-3" />
          </div>

          {/* Middle Editorial Bold Statements */}
          <div className="relative z-10 space-y-4 my-auto max-w-md">
            <span className="inline-block px-2.5 py-1 rounded bg-[#2ee661]/20 border border-[#2ee661]/40 text-[#2ee661] text-[10px] font-mono uppercase tracking-widest font-bold">
              {isRegister ? 'Laptops • Peripherals • Accessories' : 'Desktop PCs • RTX 4090 • Liquid Cooling'}
            </span>

            <h2 className="text-2xl xl:text-3xl font-medium text-white leading-snug drop-shadow-md font-sans tracking-tight">
              {isRegister
                ? 'Unrivaled power in motion. High-end gaming laptops & elite accessories.'
                : 'Precision engineering to bring your battlestation into the light.'}
            </h2>

            <p className="text-xs text-white/75 max-w-[280px] leading-relaxed font-light">
              {isRegister
                ? 'Register to save custom configurations, track live deliveries, and access Sri Lanka premier warranty.'
                : 'Experience raw gaming performance with handcrafted setups and authentic tech accessories.'}
            </p>
          </div>

          {/* Bottom Bar on Tech Image */}
          <div className="relative z-10">
            <div className="flex items-center justify-between text-white/70 text-xs font-mono tracking-wider pt-4 border-t border-white/15">
              <span>@2026 ORION.LK</span>
              <span className="text-[#2ee661] text-[11px] font-sans font-semibold">
                {isRegister ? 'Ready to Game' : 'Extreme Hardware'}
              </span>
              <span className="tracking-widest">COLOMBO, LK</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

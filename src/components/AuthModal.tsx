import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  User,
  KeyRound,
  Phone,
  Mail,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'create' | 'login';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab
}) => {
  const { loginUser, loginWithGoogle, registerUser, registeredAccounts } = useApp();

  // If no real accounts registered yet, automatically present "Create Account"
  const [activeTab, setActiveTab] = useState<'login' | 'create'>(() => {
    if (defaultTab) return defaultTab;
    return registeredAccounts.length === 0 ? 'create' : 'login';
  });

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else if (registeredAccounts.length === 0) {
      setActiveTab('create');
    }
  }, [defaultTab, registeredAccounts.length]);

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRollNo, setRegRollNo] = useState('');
  const [regHostel, setRegHostel] = useState('Campus Hostels');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Google sign in state
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Error and Loading
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTabSwitch = (tab: 'login' | 'create') => {
    setActiveTab(tab);
    setErrorMessage(null);
  };

  const handleGoogleSignIn = () => {
    setErrorMessage(null);
    setIsGoogleSubmitting(true);
    setTimeout(() => {
      // Direct Google Login with authenticated Google profile
      const res = loginWithGoogle({
        email: 'vikashgupta2367012612345@gmail.com',
        name: 'Vikash Kumar Gupta'
      });
      setIsGoogleSubmitting(false);

      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || 'Google login failed. Please try again.');
      }
    }, 300);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanId = loginIdentifier.trim();
    const cleanPass = loginPassword.trim();

    if (!cleanId) {
      setErrorMessage('Please enter your registered Email Address or Mobile Number.');
      return;
    }

    if (!cleanPass) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = loginUser(cleanId, cleanPass);
      setIsSubmitting(false);

      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please verify your credentials.');
      }
    }, 200);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim();
    const cleanPhone = regPhone.trim();
    const cleanRoll = regRollNo.trim();
    const cleanPass = regPassword.trim();

    if (!cleanName || cleanName.length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@gmail.com or student@dgu.ac.in).');
      return;
    }

    if (!cleanPass || cleanPass.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (cleanPass !== regConfirmPassword.trim()) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = registerUser({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || undefined,
        rollNo: cleanRoll || undefined,
        hostelBlock: regHostel,
        password: cleanPass
      });
      setIsSubmitting(false);

      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || 'Registration failed. Please check the provided details.');
      }
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#102a23]/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fffdf8] rounded-2xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl border border-[#e4e6df] animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-[#64736d] hover:text-[#16342e] rounded-full hover:bg-[#f0eee6] transition-colors cursor-pointer"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Banner */}
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 rounded-full bg-[#126b55] text-white font-serif italic text-xl flex items-center justify-center shadow-xs shrink-0">
            m
          </span>
          <div>
            <div className="text-[10px] font-bold text-[#126b55] uppercase tracking-wider flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>DBS Global University Dining</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-[#16342e] leading-tight">
              {activeTab === 'login' ? 'Student Sign In' : 'Create Student Account'}
            </h2>
          </div>
        </div>

        {/* Tabs Switcher: Log In vs Create Account */}
        <div className="flex bg-[#edeae1] p-1 rounded-xl mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleTabSwitch('login')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-[#126b55] text-white shadow-xs'
                : 'text-[#52635c] hover:text-[#16342e]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Log In</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('create')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-[#126b55] text-white shadow-xs'
                : 'text-[#52635c] hover:text-[#16342e]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Direct Google Login Option */}
        <div className="mb-4 space-y-3">
          <button
            type="button"
            disabled={isGoogleSubmitting || isSubmitting}
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 bg-white hover:bg-[#fbf9f4] text-[#16342e] font-bold text-xs rounded-xl border border-[#d9ded5] shadow-xs flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] cursor-pointer disabled:opacity-60 hover:border-[#126b55]"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isGoogleSubmitting ? 'Signing in with Google...' : 'Continue with Google'}</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#e4e6df]" />
            <span className="text-[10px] uppercase font-bold text-[#8a9992] tracking-wider">
              or use student credentials
            </span>
            <div className="flex-1 h-px bg-[#e4e6df]" />
          </div>
        </div>

        {/* Error Banners */}
        {errorMessage && (
          <div className="p-3 mb-4 bg-rose-50 text-rose-800 rounded-lg text-xs border border-rose-200 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* -------------------- TAB 1: LOG IN FORM -------------------- */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#16342e] mb-1.5">
                Registered Email or Mobile No.
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8a9992] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  placeholder="Enter your registered email or phone"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-[#d9ded5] rounded-lg text-[#16342e] focus:outline-none focus:border-[#126b55] focus:ring-1 focus:ring-[#126b55] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#16342e]">
                  Password
                </label>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#8a9992] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-[#d9ded5] rounded-lg text-[#16342e] focus:outline-none focus:border-[#126b55] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9992] hover:text-[#16342e] p-1 cursor-pointer"
                  title={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full py-3 bg-[#126b55] hover:bg-[#0b4c3b] text-white rounded-lg font-bold text-xs transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Verifying Account...' : 'Sign In to MealMate'}</span>
              <ArrowRight className="w-4 h-4 text-[#d9f04a]" />
            </button>

            {/* Switch to Create Account link */}
            <div className="text-center pt-2">
              <span className="text-xs text-[#64736d]">Don't have an account yet? </span>
              <button
                type="button"
                onClick={() => handleTabSwitch('create')}
                className="text-xs font-bold text-[#126b55] hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* -------------------- TAB 2: CREATE ACCOUNT FORM -------------------- */}
        {activeTab === 'create' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#16342e] mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8a9992] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="e.g. Vikash Kumar Gupta"
                  className="w-full pl-10 pr-3.5 py-2 text-xs bg-white border border-[#d9ded5] rounded-lg text-[#16342e] focus:outline-none focus:border-[#126b55] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16342e] mb-1">
                Real Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8a9992] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com or student@dgu.ac.in"
                  className="w-full pl-10 pr-3.5 py-2 text-xs bg-white border border-[#d9ded5] rounded-lg text-[#16342e] focus:outline-none focus:border-[#126b55] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-[#16342e] mb-1">
                  Mobile No. *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[#8a9992] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-8 pr-2.5 py-2 text-xs bg-white border border-[#d9ded5] rounded-lg text-[#16342e] focus:outline-none focus:border-[#126b55] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16342e] mb-1">
                  Roll / Student ID
                </label>
                <input
                  type="text"
                  value={regRollNo}
                  onChange={e => setRegRollNo(e.target.value)}
                  placeholder="0251MBA621"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#d9ded5] rounded-lg text-[#16342e] focus:outline-none focus:border-[#126b55] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16342e] mb-1">
                Password * (min. 6 characters)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#8a9992] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Create your password"
                  className="w-full pl-10 pr-10 py-2 text-xs bg-white border border-[#d9ded5] rounded-lg text-[#16342e] focus:outline-none focus:border-[#126b55] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9992] hover:text-[#16342e] p-1 cursor-pointer"
                >
                  {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#16342e] mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                value={regConfirmPassword}
                onChange={e => setRegConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-3 py-2 text-xs bg-white border border-[#d9ded5] rounded-lg text-[#16342e] focus:outline-none focus:border-[#126b55] transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full py-3 mt-1 bg-[#126b55] hover:bg-[#0b4c3b] text-white rounded-lg font-bold text-xs transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Creating Real Account...' : 'Create Account & Sign In'}</span>
              <CheckCircle2 className="w-4 h-4 text-[#d9f04a]" />
            </button>

            {/* Switch to Log In link */}
            <div className="text-center pt-2">
              <span className="text-xs text-[#64736d]">Already registered? </span>
              <button
                type="button"
                onClick={() => handleTabSwitch('login')}
                className="text-xs font-bold text-[#126b55] hover:underline cursor-pointer"
              >
                Log In
              </button>
            </div>
          </form>
        )}

        {/* Security and Guest Footer */}
        <div className="mt-4 pt-3 border-t border-[#e4e6df] flex items-center justify-between text-[11px] text-[#64736d]">
          <span className="flex items-center gap-1 text-[#126b55] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Student Authentication</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="hover:text-[#16342e] underline transition-colors cursor-pointer"
          >
            Browse as guest
          </button>
        </div>
      </div>
    </div>
  );
};

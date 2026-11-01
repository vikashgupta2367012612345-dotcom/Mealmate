import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  User,
  KeyRound,
  Sparkles,
  Phone,
  Mail,
  Eye,
  EyeOff
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'create' | 'login';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose
}) => {
  const { loginUser, showToast } = useApp();

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const identifier = loginIdentifier.trim();
    if (!identifier) {
      setError('Please enter your Student Email, Mobile Number, or Roll Number.');
      return;
    }

    const success = loginUser(identifier, loginPassword);
    if (success) {
      onClose();
    } else {
      setError('Could not verify credentials. Please try again.');
    }
  };

  const handleQuickDemoStudent = () => {
    loginUser('0251MBA621');
    onClose();
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
        <div className="flex items-center gap-3 mb-5">
          <span className="w-10 h-10 rounded-full bg-[#126b55] text-white font-serif italic text-xl flex items-center justify-center shadow-xs shrink-0">
            m
          </span>
          <div>
            <div className="text-[10px] font-bold text-[#126b55] uppercase tracking-wider flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>DBS Global University Dining</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-[#16342e] leading-tight">
              Student Sign In
            </h2>
          </div>
        </div>

        <p className="text-xs text-[#52635c] mb-5 leading-relaxed">
          Log in with your university credentials or mobile number to pre-order meals from <strong>DGU Central Canteen</strong> and skip pickup lines.
        </p>

        {error && (
          <div className="p-3 mb-4 bg-rose-50 text-rose-800 rounded-lg text-xs border border-rose-200 flex items-center gap-2">
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#16342e] mb-1.5">
              Email / Mobile No. / Roll Number
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8a9992] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={e => setLoginIdentifier(e.target.value)}
                placeholder="e.g. 0251MBA621, 9876543210, or student@dgu.ac.in"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-[#d9ded5] rounded-lg text-[#16342e] focus:outline-none focus:border-[#126b55] focus:ring-1 focus:ring-[#126b55] transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#16342e]">
                Password
              </label>
              <span className="text-[10px] text-[#64736d]">PIN or University Password</span>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#8a9992] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="Enter password or passcode"
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-[#d9ded5] rounded-lg text-[#16342e] focus:outline-none focus:border-[#126b55] focus:ring-1 focus:ring-[#126b55] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9992] hover:text-[#16342e] p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Trust badge */}
          <div className="p-3 bg-[#f2f7f4] rounded-lg border border-[#cbe0d6] text-[11px] text-[#344e43] space-y-1">
            <div className="font-bold text-[#16342e] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#126b55]" />
              <span>Verified DGU Campus Access</span>
            </div>
            <p className="leading-snug text-[#4a6358]">
              Your student token is generated instantly upon ordering. Pay at pickup with UPI, QR, or cash.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-[#126b55] hover:bg-[#0b4c3b] text-white rounded-lg font-bold text-xs transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In to MealMate</span>
            <ArrowRight className="w-4 h-4 text-[#d9f04a]" />
          </button>

          {/* Quick Demo Student Button */}
          <div className="pt-3 border-t border-[#e4e6df] text-center">
            <span className="text-[11px] text-[#64736d] block mb-2 font-medium">Or instant 1-tap student sign in:</span>
            <button
              type="button"
              onClick={handleQuickDemoStudent}
              className="w-full py-2.5 bg-[#f7f4eb] hover:bg-[#ece8dc] text-[#16342e] rounded-lg text-xs font-semibold border border-[#d9ded5] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#126b55]" />
              <span>Sign in as Vikash (0251MBA621)</span>
            </button>
          </div>
        </form>

        {/* Guest Browse Option */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-[#64736d] hover:text-[#16342e] underline transition-colors cursor-pointer"
          >
            Continue as guest to browse today's menu
          </button>
        </div>
      </div>
    </div>
  );
};

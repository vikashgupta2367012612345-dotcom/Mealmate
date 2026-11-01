import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, GraduationCap, ChefHat, Check, UserCheck, Shield } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, switchUserRole, showToast } = useApp();
  const [customName, setCustomName] = useState('');
  const [customRoll, setCustomRoll] = useState('');
  const [customRole, setCustomRole] = useState<'student' | 'vendor'>('student');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    if (customRole === 'student') {
      switchUserRole('student');
    } else {
      switchUserRole('vendor', 'Green Leaf Canteen');
    }
    showToast(`Logged in as ${customName} (${customRole})`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#102a23]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fffdf8] rounded-xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl border border-[#e4e6df]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-[#64736d] hover:text-[#16342e] rounded-full hover:bg-[#f0eee6]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1 mb-5">
          <div className="text-[11px] font-bold text-[#126b55] uppercase tracking-wider">
            MealMate Identity & Access
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#16342e]">
            Select Demo Account
          </h2>
          <p className="text-xs text-[#64736d]">
            Quickly switch between Student and Kitchen roles to test live pre-orders without password friction.
          </p>
        </div>

        {/* Quick Demo Personas */}
        <div className="space-y-2 mb-6">
          <label className="text-[11px] font-bold text-[#64736d] uppercase tracking-wider block">
            Instant Persona Switcher
          </label>

          {/* Student Persona 1: Founder Vikash */}
          <button
            onClick={() => {
              switchUserRole('student');
              onClose();
            }}
            className="w-full p-3 rounded-lg border text-left flex items-center justify-between gap-3 transition-all hover:border-[#126b55] bg-[#f7f4eb]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#126b55] text-white flex items-center justify-center font-bold text-xs">
                VG
              </div>
              <div>
                <strong className="text-sm font-bold text-[#16342e] block leading-tight">
                  Vikash Kumar Gupta
                </strong>
                <span className="text-[11px] text-[#64736d]">
                  0251MBA621 · DGU MBA 1st Year (Founder)
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#e2ead1] text-[#16342e]">
              Student
            </span>
          </button>

          {/* Vendor Persona: Green Leaf Canteen */}
          <button
            onClick={() => {
              switchUserRole('vendor', 'Green Leaf Canteen');
              onClose();
            }}
            className="w-full p-3 rounded-lg border text-left flex items-center justify-between gap-3 transition-all hover:border-[#126b55] bg-[#f7f4eb]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#16342e] text-[#d9f04a] flex items-center justify-center font-bold text-xs">
                GL
              </div>
              <div>
                <strong className="text-sm font-bold text-[#16342e] block leading-tight">
                  Green Leaf Canteen Chef
                </strong>
                <span className="text-[11px] text-[#64736d]">
                  Head Kitchen Operator · Main Dining Hall
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#fef3c7] text-[#92400e]">
              Vendor
            </span>
          </button>

          {/* Vendor Persona: North Block Café */}
          <button
            onClick={() => {
              switchUserRole('vendor', 'North Block Café');
              onClose();
            }}
            className="w-full p-3 rounded-lg border text-left flex items-center justify-between gap-3 transition-all hover:border-[#126b55] bg-[#f7f4eb]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#16342e] text-[#d9f04a] flex items-center justify-center font-bold text-xs">
                NB
              </div>
              <div>
                <strong className="text-sm font-bold text-[#16342e] block leading-tight">
                  North Block Café
                </strong>
                <span className="text-[11px] text-[#64736d]">
                  Academic Block Coffee & Snack Counter
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#fef3c7] text-[#92400e]">
              Vendor
            </span>
          </button>
        </div>

        {/* Custom Input Option */}
        <div className="pt-4 border-t border-[#e4e6df]">
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <label className="text-[11px] font-bold text-[#64736d] uppercase tracking-wider block">
              Or Enter Custom Details
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                placeholder="Full Name"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                className="p-2 bg-white border border-[#d9ded5] rounded-md text-[#16342e]"
              />
              <select
                value={customRole}
                onChange={e => setCustomRole(e.target.value as any)}
                className="p-2 bg-white border border-[#d9ded5] rounded-md text-[#16342e]"
              >
                <option value="student">Student Account</option>
                <option value="vendor">Vendor Account</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={!customName.trim()}
              className="w-full py-2 bg-[#126b55] hover:bg-[#0b4c3b] disabled:bg-[#d9ded5] text-white text-xs font-bold rounded-md transition-colors"
            >
              Sign In Custom Persona
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

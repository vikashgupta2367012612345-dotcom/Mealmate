import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingBag,
  Clock,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  TrendingUp,
  ReceiptText,
  Heart,
  ChefHat,
  Building2,
  GraduationCap,
  Store
} from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenOrders: (tab?: 'active' | 'past' | 'all') => void;
  onOpenAuth: () => void;
  onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenOrders,
  onOpenAuth,
  onOpenProfile
}) => {
  const {
    cart,
    orders,
    favorites,
    currentUser,
    isLoggedIn,
    logoutUser,
    activeRole,
    switchUserRole,
    canteenSchedule,
    setScheduleMode
  } = useApp();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const activeOrdersCount = orders.filter(
    o => o.id !== 'ord-101' && o.id !== 'ord-102' && o.id !== 'ord-103' &&
    o.status !== 'Picked up' && o.status !== 'Collected' && o.status !== 'Completed' && o.status !== 'Cancelled'
  ).length;

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-30 bg-[#FFFDF9] border-b border-[#F2ECE4] px-3 sm:px-6 py-2.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3 sm:gap-4">
          <a href="#top" className="flex items-center gap-2 text-lg sm:text-xl font-bold tracking-tight text-[#1C1917] group">
            <span className="w-8 h-8 rounded-xl bg-[#E23744] text-[#FFFDF9] font-heading font-extrabold text-sm flex items-center justify-center shadow-xs group-hover:bg-[#CB202D] transition-colors">
              MM
            </span>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold tracking-tight leading-none text-[#E23744]">MealMate</span>
              <span className="text-[9px] font-sans text-[#78716C] font-medium tracking-normal mt-0.5 hidden xs:block">
                Skip the queue, not the meal
              </span>
            </div>
          </a>

          {/* Real-Time Operating Hours Pill */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsScheduleModalOpen(!isScheduleModalOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all cursor-pointer shadow-2xs ${
                canteenSchedule.isOpen
                  ? 'bg-[#27864B]/10 border-[#27864B]/30 text-[#27864B] hover:bg-[#27864B]/15'
                  : 'bg-[#D94848]/10 border-[#D94848]/30 text-[#D94848] hover:bg-[#D94848]/15'
              }`}
              title="Click to view live canteen operating hours (10:00 AM – 11:00 PM)"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  canteenSchedule.isOpen ? 'bg-[#27864B] animate-pulse' : 'bg-[#D94848]'
                }`}
              />
              <span className="font-bold">DGU Central:</span>
              <span>{canteenSchedule.statusText}</span>
            </button>

            {/* Schedule Details Popover */}
            {isScheduleModalOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsScheduleModalOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#E7E9E3] p-4 z-50 text-xs text-[#252D28] animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-start justify-between pb-2.5 border-b border-[#E7E9E3]">
                    <div>
                      <div className="font-bold text-sm text-[#174D36]">DGU Central Canteen</div>
                      <div className="text-[11px] text-[#737B74]">DBS Global University, Dehradun</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        canteenSchedule.isOpen
                          ? 'bg-[#27864B]/10 text-[#27864B]'
                          : 'bg-[#D94848]/10 text-[#D94848]'
                      }`}
                    >
                      {canteenSchedule.statusText}
                    </span>
                  </div>

                  <div className="py-2.5 space-y-1.5 border-b border-[#E7E9E3] text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#737B74]">Hours:</span>
                      <strong className="text-[#174D36]">10:00 AM – 11:00 PM (Daily)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#737B74]">Current Clock:</span>
                      <span className="font-mono">{canteenSchedule.currentTimeFormatted}</span>
                    </div>
                  </div>

                  <div className="pt-2 text-[10px] space-y-1.5">
                    <span className="font-bold text-[#737B74] block uppercase">Simulation Toggle</span>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => setScheduleMode('realtime')}
                        className={`py-1 px-1 rounded border text-center font-medium ${
                          canteenSchedule.mode === 'realtime'
                            ? 'bg-[#174D36] text-white border-[#174D36]'
                            : 'bg-[#FFF8E9] text-[#252D28] border-[#E7E9E3]'
                        }`}
                      >
                        Real-Time
                      </button>
                      <button
                        onClick={() => setScheduleMode('simulate_open')}
                        className={`py-1 px-1 rounded border text-center font-medium ${
                          canteenSchedule.mode === 'simulate_open'
                            ? 'bg-[#27864B] text-white border-[#27864B]'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        Force Open
                      </button>
                      <button
                        onClick={() => setScheduleMode('simulate_closed')}
                        className={`py-1 px-1 rounded border text-center font-medium ${
                          canteenSchedule.mode === 'simulate_closed'
                            ? 'bg-[#D94848] text-white border-[#D94848]'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        Force Closed
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-[#1C1917]">
          <a href="#top" className="hover:text-[#E23744] transition-colors">
            Home
          </a>
          <a href="#menu" className="hover:text-[#E23744] transition-colors">
            Explore Food
          </a>
          <a href="#combos" className="hover:text-[#E23744] transition-colors">
            Smart Combos
          </a>
          <a href="#vendors" className="hover:text-[#E23744] transition-colors">
            Campus Outlets
          </a>
          <a href="#reviews" className="hover:text-[#E23744] transition-colors">
            Student Reviews
          </a>
        </nav>

        {/* Right Section: Multi-Role Switcher & Student Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Multi-Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#F2ECE4] bg-white text-xs font-bold text-[#1C1917] hover:bg-[#FAF6F0] transition-all cursor-pointer shadow-2xs"
              title="Switch user perspective"
            >
              {activeRole === 'student' && <GraduationCap className="w-3.5 h-3.5 text-[#E23744]" />}
              {activeRole === 'vendor' && <ChefHat className="w-3.5 h-3.5 text-[#F59E0B]" />}
              {activeRole === 'admin' && <Building2 className="w-3.5 h-3.5 text-[#E23744]" />}

              <span className="capitalize hidden sm:inline">
                {activeRole === 'student' ? 'Student' : activeRole === 'vendor' ? 'Vendor Hub' : 'Admin'}
              </span>
              <ChevronDown className="w-3 h-3 text-[#78716C]" />
            </button>

            {isRoleMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsRoleMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#F2ECE4] p-2 z-50 text-xs space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-[#78716C] uppercase tracking-wider">
                    Switch Campus Portal
                  </div>

                  <button
                    onClick={() => {
                      setIsRoleMenuOpen(false);
                      switchUserRole('student');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-colors ${
                      activeRole === 'student' ? 'bg-[#E23744] text-white' : 'hover:bg-[#FAF6F0] text-[#1C1917]'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-[#F59E0B]" />
                    <div>
                      <div className="font-bold">Student Portal</div>
                      <div className="text-[10px] opacity-80">Pre-order, pickup tokens & rewards</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsRoleMenuOpen(false);
                      switchUserRole('vendor', 'DGU Central Canteen');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-colors ${
                      activeRole === 'vendor' ? 'bg-[#E23744] text-white' : 'hover:bg-[#FAF6F0] text-[#1C1917]'
                    }`}
                  >
                    <ChefHat className="w-4 h-4 text-[#F59E0B]" />
                    <div>
                      <div className="font-bold">Vendor Dashboard</div>
                      <div className="text-[10px] opacity-80">Live queue, cook & token validation</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsRoleMenuOpen(false);
                      switchUserRole('admin');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-colors ${
                      activeRole === 'admin' ? 'bg-[#E23744] text-white' : 'hover:bg-[#FAF6F0] text-[#1C1917]'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-[#F59E0B]" />
                    <div>
                      <div className="font-bold">Administrator Console</div>
                      <div className="text-[10px] opacity-80">Outlets, ledger, audit & grievance desk</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* My Orders Button */}
          <button
            onClick={() => onOpenOrders(activeOrdersCount > 0 ? 'active' : 'past')}
            className="relative flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#1C1917] bg-white hover:bg-[#FAF6F0] rounded-xl border border-[#F2ECE4] transition-colors cursor-pointer shadow-2xs"
            title="View pickup tokens and orders"
          >
            <Clock className="w-3.5 h-3.5 text-[#E23744]" />
            <span className="hidden sm:inline">Orders</span>
            {activeOrdersCount > 0 && (
              <span className="w-4.5 h-4.5 rounded-full bg-[#E23744] text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse px-1">
                {activeOrdersCount}
              </span>
            )}
          </button>

          {/* Student Account / Profile Button */}
          {isLoggedIn ? (
            <>
              <button
                onClick={onOpenProfile || onOpenAuth}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-[#1C1917] bg-white hover:bg-[#FAF6F0] rounded-xl border border-[#F2ECE4] transition-colors cursor-pointer shadow-2xs"
                title="Open Student Profile"
              >
                <div className="w-5 h-5 rounded-full bg-[#E23744] text-[#FFFDF9] text-[10px] font-bold flex items-center justify-center">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'V'}
                </div>
                <span className="hidden md:inline max-w-[80px] truncate">{currentUser.name.split(' ')[0]}</span>
              </button>

              <button
                onClick={() => logoutUser()}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#DC2626] bg-white hover:bg-red-50 rounded-xl border border-[#F2ECE4] transition-colors cursor-pointer shadow-2xs"
                title="Sign out of MealMate"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#E23744] bg-[#E23744]/10 hover:bg-[#E23744]/20 rounded-xl border border-[#E23744]/30 transition-colors cursor-pointer shadow-2xs"
            >
              <User className="w-3.5 h-3.5 text-[#E23744]" />
              <span>Login</span>
            </button>
          )}

          {/* Cart / Basket Button */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-1.5 bg-[#E23744] hover:bg-[#CB202D] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
            aria-label="Open basket"
          >
            <ShoppingBag className="w-4 h-4 text-white" />
            <span className="hidden xs:inline">Basket</span>
            <span className="w-5 h-5 rounded-full bg-white text-[#E23744] text-[11px] font-extrabold flex items-center justify-center shadow-xs">
              {totalCartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

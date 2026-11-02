import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Clock, User, LogOut, ChevronDown, Sparkles, TrendingUp, ReceiptText } from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenOrders: (tab?: 'active' | 'past' | 'all') => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenOrders,
  onOpenAuth
}) => {
  const { cart, orders, currentUser, isLoggedIn, logoutUser, canteenSchedule, setScheduleMode } = useApp();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const activeOrdersCount = orders.filter(
    o => o.status !== 'Picked up' && o.status !== 'Cancelled'
  ).length;

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-30 h-18 bg-[#fffdf8] border-b border-[#e4e6df] px-4 md:px-8 flex items-center justify-between shadow-xs">
      {/* Brand & Canteen Location */}
      <div className="flex items-center gap-3 sm:gap-5">
        <a href="#top" className="flex items-center gap-2.5 text-xl md:text-2xl font-bold tracking-tight text-[#16342e]">
          <span className="w-8 h-8 rounded-full bg-[#126b55] text-[#fffdf8] font-serif italic text-base flex items-center justify-center font-normal shadow-xs">
            m
          </span>
          <span className="font-serif">MealMate</span>
        </a>

        {/* Real-Time Canteen Status Pill */}
        <div className="relative">
          <button
            onClick={() => setIsScheduleModalOpen(!isScheduleModalOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1 rounded-full border text-[11px] sm:text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
              canteenSchedule.isOpen
                ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46] hover:bg-[#d1fae5]'
                : 'bg-[#fff1f2] border-[#fecdd3] text-[#9f1239] hover:bg-[#ffe4e6]'
            }`}
            title="Click to view live operating hours (10:00 AM – 11:00 PM)"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                canteenSchedule.isOpen ? 'bg-[#10b981] animate-pulse' : 'bg-[#e11d48]'
              }`}
            />
            <span className="hidden md:inline font-bold">DGU Central:</span>
            <span>{canteenSchedule.statusText}</span>
            <span className="hidden lg:inline text-[10px] opacity-75 font-normal">
              ({canteenSchedule.isOpen ? 'Closes 11 PM' : 'Opens 10 AM'})
            </span>
          </button>

          {/* Schedule Popover */}
          {isScheduleModalOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsScheduleModalOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-[#d9ded5] p-4 z-50 text-xs text-[#16342e] animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-start justify-between pb-3 border-b border-[#f0eee6]">
                  <div>
                    <div className="font-bold text-sm text-[#16342e]">DGU Central Canteen</div>
                    <div className="text-[11px] text-[#64736d]">Main Campus Dining Hall</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      canteenSchedule.isOpen
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {canteenSchedule.statusText}
                  </span>
                </div>

                {/* Operating Hours Details */}
                <div className="py-3 space-y-2 border-b border-[#f0eee6]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64736d]">Operating Hours:</span>
                    <strong className="text-[#16342e] font-semibold">10:00 AM – 11:00 PM</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64736d]">Schedule:</span>
                    <strong className="text-[#126b55]">Open Everyday (Mon - Sun)</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64736d]">Current Clock:</span>
                    <span className="font-mono text-[#16342e]">{canteenSchedule.currentTimeFormatted}</span>
                  </div>
                  <div className="p-2 bg-[#f7f4eb] rounded-lg border border-[#e4e6df] text-[11px] leading-relaxed text-[#4b6259]">
                    <div className="font-semibold text-[#16342e] mb-0.5">
                      {canteenSchedule.isOpen ? '🟢 Counter Active' : '🔴 Canteen Closed'}
                    </div>
                    {canteenSchedule.timeRemainingText}
                  </div>
                </div>

                {/* Live simulation testing tools */}
                <div className="pt-2.5">
                  <div className="text-[10px] uppercase font-bold text-[#8a9992] mb-1.5 flex items-center justify-between">
                    <span>Preview & Test Modes</span>
                    {canteenSchedule.mode !== 'realtime' && (
                      <span className="text-amber-600 font-bold text-[9px]">(SIMULATION ACTIVE)</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setScheduleMode('realtime')}
                      className={`py-1 px-1.5 rounded text-[10px] font-medium border text-center transition-all ${
                        canteenSchedule.mode === 'realtime'
                          ? 'bg-[#126b55] text-white border-[#126b55] font-bold'
                          : 'bg-[#f7f4eb] hover:bg-[#e4e1d7] text-[#16342e] border-[#d9ded5]'
                      }`}
                      title="Follow real-time system clock"
                    >
                      Real-Time
                    </button>
                    <button
                      onClick={() => setScheduleMode('simulate_open')}
                      className={`py-1 px-1.5 rounded text-[10px] font-medium border text-center transition-all ${
                        canteenSchedule.mode === 'simulate_open'
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                      title="Force canteen state to OPEN for testing"
                    >
                      Force Open
                    </button>
                    <button
                      onClick={() => setScheduleMode('simulate_closed')}
                      className={`py-1 px-1.5 rounded text-[10px] font-medium border text-center transition-all ${
                        canteenSchedule.mode === 'simulate_closed'
                          ? 'bg-rose-600 text-white border-rose-600 font-bold'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200'
                      }`}
                      title="Force canteen state to CLOSED for testing"
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

      {/* Navigation & Student Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium mr-2">
          <a href="#menu" className="text-[#16342e] hover:text-[#126b55] transition-colors">
            Today's Menu
          </a>
          <a href="#how" className="text-[#16342e] hover:text-[#126b55] transition-colors">
            How It Works
          </a>
        </nav>

        {/* My Orders / Order History Button */}
        <button
          onClick={() => onOpenOrders(activeOrdersCount > 0 ? 'active' : 'past')}
          className="relative flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-[#16342e] bg-[#f7f4eb] hover:bg-[#eae6d8] rounded-full border border-[#d9ded5] transition-colors cursor-pointer"
          title="View active meals and past order history"
        >
          {activeOrdersCount > 0 ? (
            <Clock className="w-3.5 h-3.5 text-[#126b55]" />
          ) : (
            <ReceiptText className="w-3.5 h-3.5 text-[#126b55]" />
          )}
          <span className="hidden sm:inline">
            {activeOrdersCount > 0 ? 'My Orders' : 'Order History'}
          </span>
          {activeOrdersCount > 0 && (
            <span className="w-4.5 h-4.5 rounded-full bg-[#126b55] text-[#d9f04a] text-[10px] font-bold flex items-center justify-center animate-pulse">
              {activeOrdersCount}
            </span>
          )}
        </button>

        {/* User Account / Profile button */}
        {isLoggedIn ? (
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-[#16342e] bg-[#f0eee6] hover:bg-[#e4e1d7] rounded-full border border-[#d9ded5] transition-colors cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-[#126b55] text-white text-[10px] font-bold flex items-center justify-center">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <span className="max-w-[100px] truncate">{currentUser.name.split(' ')[0]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#64736d]" />
            </button>

            {/* Profile Dropdown */}
            {isProfileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-[#e4e6df] p-3 z-50 text-xs text-[#16342e] space-y-2">
                  <div className="pb-2 border-b border-[#f0eee6]">
                    <div className="font-bold text-sm text-[#16342e] truncate">{currentUser.name}</div>
                    <div className="text-[11px] text-[#64736d]">{currentUser.rollNo || 'DGU Student'}</div>
                    <div className="text-[10px] text-[#126b55] truncate">{currentUser.email}</div>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenOrders('active');
                    }}
                    className="w-full text-left py-1.5 px-2 hover:bg-[#f7f4eb] rounded text-[#16342e] font-medium flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#126b55]" />
                      <span>Live Active Orders</span>
                    </span>
                    {activeOrdersCount > 0 && (
                      <span className="text-[10px] font-bold bg-[#126b55] text-white px-1.5 py-0.2 rounded-full">
                        {activeOrdersCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenOrders('past');
                    }}
                    className="w-full text-left py-1.5 px-2 hover:bg-[#f7f4eb] rounded text-[#16342e] font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-[#126b55]" />
                    <span>Order History & Spending</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenOrders('all');
                    }}
                    className="w-full text-left py-1.5 px-2 hover:bg-[#f7f4eb] rounded text-[#16342e] font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <ReceiptText className="w-3.5 h-3.5 text-[#126b55]" />
                    <span>All Orders & Receipts</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logoutUser();
                    }}
                    className="w-full text-left py-1.5 px-2 hover:bg-rose-50 text-rose-700 rounded font-semibold flex items-center gap-2 pt-2 border-t border-[#f0eee6] cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-[#126b55] bg-[#eef5f1] hover:bg-[#dfeee5] rounded-full border border-[#b8dcce] transition-colors shadow-2xs cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

        {/* Basket Button */}
        <button
          onClick={onOpenCart}
          className="flex items-center gap-2 bg-[#16342e] hover:bg-[#0e241f] text-white px-3.5 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all shadow-xs"
          aria-label="Open basket"
        >
          <ShoppingBag className="w-4 h-4 text-[#d9f04a]" />
          <span>Basket</span>
          <span className="w-5 h-5 rounded-full bg-[#d9f04a] text-[#16342e] text-xs font-bold flex items-center justify-center">
            {totalCartCount}
          </span>
        </button>
      </div>
    </header>
  );
};

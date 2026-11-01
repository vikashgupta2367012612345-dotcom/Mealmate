import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, ChefHat, GraduationCap, FileSpreadsheet, Clock, Bell } from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenOrders: () => void;
  onOpenVenture: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenOrders,
  onOpenVenture,
  onOpenAuth
}) => {
  const { cart, orders, currentUser, activeRole, switchUserRole } = useApp();

  const activeOrdersCount = orders.filter(
    o => o.status !== 'Picked up' && o.status !== 'Cancelled'
  ).length;

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-30 h-18 bg-[#fffdf8] border-b border-[#e4e6df] px-4 md:px-8 flex items-center justify-between shadow-xs">
      {/* Brand */}
      <div className="flex items-center gap-6">
        <a href="#top" className="flex items-center gap-2 text-xl md:text-2xl font-bold tracking-tight text-[#16342e]">
          <span className="w-8 h-8 rounded-full bg-[#126b55] text-[#fffdf8] font-serif italic text-base flex items-center justify-center font-normal">
            m
          </span>
          <span>MealMate</span>
        </a>

        {/* Role Switcher Pill */}
        <div className="hidden lg:flex items-center bg-[#f0eee6] p-1 rounded-full text-xs font-medium">
          <button
            onClick={() => switchUserRole('student')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
              activeRole === 'student'
                ? 'bg-[#16342e] text-white shadow-xs font-semibold'
                : 'text-[#64736d] hover:text-[#16342e]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Mode</span>
          </button>
          <button
            onClick={() => switchUserRole('vendor', 'Green Leaf Canteen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
              activeRole === 'vendor'
                ? 'bg-[#126b55] text-white shadow-xs font-semibold'
                : 'text-[#64736d] hover:text-[#16342e]'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Kitchen Portal</span>
          </button>
          <button
            onClick={() => onOpenVenture()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[#64736d] hover:text-[#16342e] transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#126b55]" />
            <span>Venture Quest Hub</span>
          </button>
        </div>
      </div>

      {/* Nav & Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium mr-2">
          <a href="#menu" className="text-[#16342e] hover:text-[#126b55] transition-colors">
            Today's Menu
          </a>
          <a href="#how" className="text-[#16342e] hover:text-[#126b55] transition-colors">
            How It Works
          </a>
        </nav>

        {/* My Orders Button */}
        <button
          onClick={onOpenOrders}
          className="relative flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-semibold text-[#16342e] bg-[#f7f4eb] hover:bg-[#eae6d8] rounded-full border border-[#d9ded5] transition-colors"
          title="View active pre-orders"
        >
          <Clock className="w-3.5 h-3.5 text-[#126b55]" />
          <span className="hidden sm:inline">My Orders</span>
          {activeOrdersCount > 0 && (
            <span className="w-4.5 h-4.5 rounded-full bg-[#126b55] text-[#d9f04a] text-[10px] font-bold flex items-center justify-center animate-pulse">
              {activeOrdersCount}
            </span>
          )}
        </button>

        {/* User Account / Profile button */}
        <button
          onClick={onOpenAuth}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-semibold text-[#16342e] bg-transparent hover:bg-[#f0eee6] rounded-full border border-[#d9ded5] transition-colors max-w-[170px] truncate"
        >
          <span className="truncate">{currentUser.name.split(' ')[0]}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#e2ead1] text-[#16342e] uppercase font-bold tracking-wider">
            {currentUser.role}
          </span>
        </button>

        {/* Basket Button */}
        <button
          onClick={onOpenCart}
          className="flex items-center gap-2 bg-[#16342e] hover:bg-[#0e241f] text-white px-3.5 py-2 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all shadow-xs"
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

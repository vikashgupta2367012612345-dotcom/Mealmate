/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { SmartCombosSection } from './components/SmartCombosSection';
import { MenuSection } from './components/MenuSection';
import { FeaturedVendorsSection } from './components/FeaturedVendorsSection';
import { BenefitsSection } from './components/BenefitsSection';
import { ValueSection } from './components/ValueSection';
import { ReferralSection } from './components/ReferralSection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { StudentOrdersModal } from './components/StudentOrdersModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { VendorDashboard } from './components/VendorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { AuthPage } from './components/AuthPage';
import { LiveOrderTracker } from './components/LiveOrderTracker';
import { Toast } from './components/Toast';
import { Order } from './types';
import { Bell, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    addToCart,
    cart,
    orders,
    isLoggedIn,
    currentUser,
    activeRole,
    switchUserRole
  } = useApp();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [ordersInitialTab, setOrdersInitialTab] = useState<'active' | 'past' | 'all'>('active');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [discount, setDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState('');

  const handleOpenOrders = (tab: 'active' | 'past' | 'all' = 'active') => {
    setOrdersInitialTab(tab);
    setIsOrdersOpen(true);
  };

  const readyOrders = orders.filter(
    o => o.id !== 'ord-101' && o.id !== 'ord-102' && o.id !== 'ord-103' && (o.status === 'Ready' || o.status === 'Ready for Pickup')
  );

  const handleQuickOrderRajma = () => {
    addToCart('1'); // Rajma rice bowl
    setIsCartOpen(true);
  };

  const handleProceedToCheckout = (appliedDiscount: number, code: string) => {
    if (!isLoggedIn) {
      setIsAuthOpen(true);
      return;
    }
    setDiscount(appliedDiscount);
    setPromoCode(code);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderPlaced = () => {
    setIsCheckoutOpen(false);
    setIsConfirmationOpen(true);
  };

  const handleRepeatOrder = (order: Order) => {
    for (const item of order.items) {
      addToCart(item.id);
    }
    setIsOrdersOpen(false);
    setIsCartOpen(true);
  };

  // 1. Mandatory Authentication Gate:
  // Whenever anyone opens or reloads MealMate, or accesses a shared link,
  // show the Login / Sign Up screen first. Unauthenticated access is blocked.
  if (!isLoggedIn || !currentUser || !currentUser.uid) {
    return (
      <div className="min-h-screen bg-[#FFFDF9]">
        <AuthPage />
        <Toast />
      </div>
    );
  }

  // 2. Protected Route: Vendor Dashboard
  if (activeRole === 'vendor') {
    return (
      <div className="min-h-screen bg-[#FFFDF9]">
        <VendorDashboard onBackToStudentPortal={() => switchUserRole('student')} />
        <Toast />
      </div>
    );
  }

  // 3. Protected Route: Admin Console
  if (activeRole === 'admin') {
    return (
      <div className="min-h-screen bg-[#FFFDF9]">
        <AdminDashboard onBackToStudentPortal={() => switchUserRole('student')} />
        <Toast />
      </div>
    );
  }

  // Default: Student Portal Experience
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-[#1C1917]">
      {/* Top Notification Alert Banner if student order is ready */}
      {readyOrders.length > 0 && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 text-center animate-pulse sticky top-0 z-40">
          <Bell className="w-3.5 h-3.5 text-[#FDE047]" />
          <span>
            Order #{readyOrders[0].token} is <strong>READY FOR PICKUP</strong> at {readyOrders[0].vendorName || 'DGU Central Canteen'} counter!
          </span>
          <button
            onClick={() => handleOpenOrders('active')}
            className="underline text-[#FDE047] font-bold ml-1 hover:text-white cursor-pointer"
          >
            View Token Pass
          </button>
        </div>
      )}

      {/* Guest Welcome Banner if not logged in */}
      {!isLoggedIn && (
        <div className="bg-[#E23744] text-[#FFFDF9] px-4 py-2 text-xs flex items-center justify-between border-b border-white/10">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <span className="text-white/95 font-medium">
              👋 Welcome to MealMate! Skip the 20-minute queue at <strong>DBS Global University</strong> canteens.
            </span>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#E23744] text-xs font-bold hover:bg-white/90 transition-all ml-4 shrink-0 cursor-pointer shadow-xs"
            >
              <span>Student Login / Register</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={handleOpenOrders}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Content */}
      <main id="top" className="flex-1">
        {/* Phase 3 — Hero */}
        <Hero onQuickOrderRajma={handleQuickOrderRajma} />

        {/* Phase 3 & 10 — Smart Combos */}
        <SmartCombosSection />

        {/* Phase 4 — Food Discovery & Menu */}
        <MenuSection />

        {/* Phase 3 — Featured Campus Vendors */}
        <FeaturedVendorsSection />

        {/* How MealMate Works */}
        <BenefitsSection />

        {/* Value Proposition */}
        <ValueSection />

        {/* Student Referrals & Loyalty */}
        <ReferralSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Slide-overs & Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        discount={discount}
        promoCode={promoCode}
        onOrderPlaced={handleOrderPlaced}
      />

      <OrderConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onOpenMyOrders={() => handleOpenOrders('active')}
      />

      <StudentOrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        onRepeatOrder={handleRepeatOrder}
        initialTab={ordersInitialTab}
      />

      <StudentProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenMyOrders={() => handleOpenOrders('active')}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <LiveOrderTracker onOpenOrders={() => handleOpenOrders('active')} />

      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

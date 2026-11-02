/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BenefitsSection } from './components/BenefitsSection';
import { MenuSection } from './components/MenuSection';
import { ValueSection } from './components/ValueSection';
import { ReferralSection } from './components/ReferralSection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { StudentOrdersModal } from './components/StudentOrdersModal';
import { AuthModal } from './components/AuthModal';
import { LiveOrderTracker } from './components/LiveOrderTracker';
import { Toast } from './components/Toast';
import { Order } from './types';
import { Bell, UserPlus } from 'lucide-react';

const AppContent: React.FC = () => {
  const { addToCart, cart, orders, isLoggedIn, currentUser } = useApp();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [ordersInitialTab, setOrdersInitialTab] = useState<'active' | 'past' | 'all'>('active');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [discount, setDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState('');

  const handleOpenOrders = (tab: 'active' | 'past' | 'all' = 'active') => {
    setOrdersInitialTab(tab);
    setIsOrdersOpen(true);
  };

  // Prompt Create Account / Login on initial visit if not logged in
  useEffect(() => {
    const hasSeenPrompt = sessionStorage.getItem('mm_welcome_prompt_shown');
    if (!isLoggedIn && !hasSeenPrompt) {
      const timer = setTimeout(() => {
        setIsAuthOpen(true);
        sessionStorage.setItem('mm_welcome_prompt_shown', 'true');
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn]);

  const readyOrders = orders.filter(o => o.status === 'Ready');

  const handleQuickOrderRajma = () => {
    addToCart('1'); // Rajma rice bowl
    setIsCartOpen(true);
  };

  const handleProceedToCheckout = (appliedDiscount: number, code: string) => {
    if (!isLoggedIn) {
      // Require student to sign in / create account before placing order
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

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf7] text-[#16342e]">
      {/* Top Notification / Ready Alert Banner if any student order is ready */}
      {readyOrders.length > 0 && (
        <div className="bg-[#126b55] text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 text-center animate-pulse">
          <Bell className="w-3.5 h-3.5 text-[#d9f04a]" />
          <span>
            Order #{readyOrders[0].token} is <strong>READY FOR PICKUP</strong> at DGU Central Canteen counter!
          </span>
          <button
            onClick={() => setIsOrdersOpen(true)}
            className="underline text-[#d9f04a] font-bold ml-1 hover:text-white cursor-pointer"
          >
            View Token Pass
          </button>
        </div>
      )}

      {/* Guest Welcome Banner if not logged in */}
      {!isLoggedIn && (
        <div className="bg-[#16342e] text-[#f7f4eb] px-4 py-2 text-xs flex items-center justify-between border-b border-[#0b4c3b]">
          <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
            <span className="text-white/90">
              👋 Welcome to MealMate! Reserve fresh hot meals at <strong>DGU Central Canteen</strong> without waiting in line.
            </span>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d9f04a] text-[#16342e] text-xs font-bold hover:bg-[#c2dc37] transition-all ml-4 shrink-0 cursor-pointer shadow-xs"
            >
              <span>Student Login</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={handleOpenOrders}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content */}
      <main id="top" className="flex-1">
        <Hero onQuickOrderRajma={handleQuickOrderRajma} />
        <BenefitsSection />
        <MenuSection />
        <ValueSection />
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

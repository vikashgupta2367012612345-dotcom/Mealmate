/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
import { VendorDashboard } from './components/VendorDashboard';
import { VentureQuestModal } from './components/VentureQuestModal';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import { Order } from './types';
import { ChefHat, GraduationCap, FileSpreadsheet, Bell, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeRole, switchUserRole, addToCart, cart, orders } = useApp();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isVendorOpen, setIsVendorOpen] = useState(false);
  const [isVentureOpen, setIsVentureOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [discount, setDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState('');

  const activeOrders = orders.filter(
    o => o.status !== 'Picked up' && o.status !== 'Cancelled'
  );
  const readyOrders = orders.filter(o => o.status === 'Ready');

  const handleQuickOrderRajma = () => {
    addToCart('1'); // Rajma rice bowl
    setIsCartOpen(true);
  };

  const handleProceedToCheckout = (appliedDiscount: number, code: string) => {
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
    <div className="min-h-screen flex flex-col bg-[#f7f4eb] text-[#16342e]">
      {/* Top Notification / Ready Alert Banner if any student order is ready */}
      {readyOrders.length > 0 && (
        <div className="bg-[#126b55] text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 text-center animate-pulse">
          <Bell className="w-3.5 h-3.5 text-[#d9f04a]" />
          <span>
            Order #{readyOrders[0].token} is <strong>READY FOR PICKUP</strong> at {readyOrders[0].vendorName} counter!
          </span>
          <button
            onClick={() => setIsOrdersOpen(true)}
            className="underline text-[#d9f04a] font-bold ml-1 hover:text-white"
          >
            View Token Pass
          </button>
        </div>
      )}

      {/* Main Header */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenVenture={() => setIsVentureOpen(true)}
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
      <Footer
        onOpenVendor={() => setIsVendorOpen(true)}
        onOpenVenture={() => setIsVentureOpen(true)}
      />

      {/* Floating Mode Switcher & Quick Bar */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 bg-[#16342e] p-1.5 rounded-full shadow-2xl border border-[#d9f04a]/30">
        <button
          onClick={() => {
            switchUserRole('student');
            setIsVendorOpen(false);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeRole === 'student'
              ? 'bg-[#d9f04a] text-[#16342e]'
              : 'text-[#d8e9e2] hover:text-white'
          }`}
          title="Student Ordering View"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Student</span>
        </button>

        <button
          onClick={() => {
            switchUserRole('vendor', 'Green Leaf Canteen');
            setIsVendorOpen(true);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeRole === 'vendor'
              ? 'bg-[#d9f04a] text-[#16342e]'
              : 'text-[#d8e9e2] hover:text-white'
          }`}
          title="Kitchen Management Portal"
        >
          <ChefHat className="w-3.5 h-3.5" />
          <span>Kitchen Portal</span>
          {activeOrders.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#126b55] text-white text-[10px] flex items-center justify-center font-bold">
              {activeOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsVentureOpen(true)}
          className="p-1.5 text-[#d9f04a] hover:text-white rounded-full transition-colors"
          title="DGU Venture Quest Blueprint & Financial Simulator"
          aria-label="Venture Quest Blueprint"
        >
          <FileSpreadsheet className="w-4 h-4" />
        </button>
      </div>

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
        onOpenMyOrders={() => setIsOrdersOpen(true)}
      />

      <StudentOrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        onRepeatOrder={handleRepeatOrder}
      />

      {isVendorOpen && (
        <VendorDashboard onClose={() => setIsVendorOpen(false)} />
      )}

      <VentureQuestModal
        isOpen={isVentureOpen}
        onClose={() => setIsVentureOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

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

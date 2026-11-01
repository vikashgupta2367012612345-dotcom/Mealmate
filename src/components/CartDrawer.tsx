import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Trash2, Clock, ShieldCheck, ArrowRight, Tag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: (appliedDiscount: number, discountCode: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout
}) => {
  const { cart, removeFromCart, updateCartQuantity, slots, selectedSlotId, setSelectedSlotId, showToast, canteenSchedule } = useApp();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');

  if (!isOpen) return null;

  const currentSlot = slots.find(s => s.id === selectedSlotId) || slots[0];
  const spotsLeft = Math.max(0, currentSlot.capacity - currentSlot.reserved);
  const subtotal = cart.reduce((sum, item) => sum + (item.meal.price * item.quantity), 0);
  const total = Math.max(0, subtotal - discount);

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (clean === 'MM-DGU20') {
      setDiscount(20);
      setAppliedPromo('MM-DGU20');
      showToast('Referral code MM-DGU20 applied: ₹20 saved!');
    } else {
      showToast('Invalid promo code. Use MM-DGU20 for ₹20 off.');
    }
  };

  const removePromo = () => {
    setDiscount(0);
    setAppliedPromo('');
    setPromoCode('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#102a23]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-md bg-[#fffdf8] shadow-2xl flex flex-col justify-between border-l border-[#e4e6df]">
          {/* Header */}
          <div className="p-6 border-b border-[#e4e6df] flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#16342e]">
                Your Basket
              </h2>
              <p className="text-xs text-[#64736d] mt-0.5">
                {cart.length === 0 ? 'Empty basket' : `${cart.reduce((a, b) => a + b.quantity, 0)} items selected`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#64736d] hover:text-[#16342e] rounded-full hover:bg-[#f0eee6] transition-colors"
              aria-label="Close basket"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#f7f4eb] flex items-center justify-center text-3xl">
                  🥗
                </div>
                <h3 className="font-bold text-base text-[#16342e]">Your basket is empty</h3>
                <p className="text-xs text-[#64736d] max-w-xs mx-auto">
                  Browse today's menu to add hot campus meals with confirmed pickup slots.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-[#126b55] text-white text-xs font-bold rounded-md"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(({ meal, quantity }) => (
                  <div
                    key={meal.id}
                    className="flex items-center gap-3.5 p-3.5 bg-[#f7f4eb] rounded-lg border border-[#e6e5dd]"
                  >
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-[#e8dac5] shrink-0 border border-[#d9ded5] relative">
                      {meal.imageUrl ? (
                        <img
                          src={meal.imageUrl}
                          alt={meal.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-xl">
                          {meal.emoji}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-[#16342e] truncate">
                        {meal.name}
                      </h4>
                      <p className="text-[11px] text-[#64736d] truncate">
                        DGU Central Canteen · ₹{meal.price} each
                      </p>
                      <div className="text-xs font-bold text-[#16342e] mt-1">
                        ₹{meal.price * quantity}
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1.5 bg-[#fffdf8] border border-[#d9ded5] rounded-md p-1">
                      <button
                        onClick={() => updateCartQuantity(meal.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-sm font-bold text-[#16342e] hover:bg-[#f0eee6] rounded"
                      >
                        -
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-[#16342e]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(meal.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-sm font-bold text-[#16342e] hover:bg-[#f0eee6] rounded"
                      >
                        +
                      </button>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeFromCart(meal.id)}
                      className="text-[#991b1b] p-1.5 hover:bg-[#fee2e2] rounded transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Pickup Slot Selection */}
                <div className="pt-4 border-t border-[#e4e6df] space-y-2">
                  <label className="block text-xs font-bold text-[#16342e] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#126b55]" />
                    <span>Choose Pickup Window</span>
                  </label>

                  <select
                    value={selectedSlotId}
                    onChange={(e) => setSelectedSlotId(e.target.value)}
                    className="w-full p-2.5 bg-[#fffdf8] border border-[#d9ded5] rounded-md text-xs sm:text-sm font-medium text-[#16342e] focus:outline-none focus:border-[#126b55]"
                  >
                    {slots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label} ({s.capacity - s.reserved} slots left of {s.capacity})
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center justify-between text-[11px] text-[#64736d] px-1">
                    <span>Selected: <strong className="text-[#16342e]">{currentSlot.label}</strong></span>
                    <span className={spotsLeft <= 2 ? 'text-[#b91c1c] font-bold' : 'text-[#126b55] font-semibold'}>
                      {spotsLeft <= 2 ? '⚠️ Almost Full' : `${spotsLeft} spots available`}
                    </span>
                  </div>
                </div>

                {/* Referral / Promo Code */}
                <div className="pt-2">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-2.5 bg-[#e2ead1] rounded-md text-xs text-[#16342e] font-medium border border-[#c2dc37]">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-[#126b55]" />
                        <span>Code <strong>{appliedPromo}</strong> applied (-₹20)</span>
                      </span>
                      <button
                        onClick={removePromo}
                        className="text-[#991b1b] text-xs font-bold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={applyPromo} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Promo code (e.g. MM-DGU20)"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs bg-[#fffdf8] border border-[#d9ded5] rounded-md focus:outline-none focus:border-[#126b55]"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-[#f0eee6] hover:bg-[#e4e6df] text-xs font-bold text-[#16342e] rounded-md"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-6 bg-[#f7f4eb] border-t border-[#e4e6df] space-y-3">
              <div className="space-y-1.5 text-xs text-[#64736d]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#16342e]">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#126b55] font-semibold">
                    <span>Student Discount (MM-DGU20)</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Campus Booking Fee</span>
                  <span className="text-[#126b55] font-semibold">₹0 (Free)</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#16342e] pt-2 border-t border-[#d9ded5]">
                  <span>Total Amount</span>
                  <span className="text-xl font-serif">₹{total}</span>
                </div>
              </div>

              {/* Canteen Schedule Pill */}
              <div
                className={`p-2.5 rounded-lg border text-[11px] flex items-center justify-between ${
                  canteenSchedule.isOpen
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      canteenSchedule.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  <span className="font-semibold">
                    {canteenSchedule.isOpen
                      ? 'Canteen Open Now (until 11:00 PM)'
                      : 'Canteen Closed (Opens at 10:00 AM Everyday)'}
                  </span>
                </div>
                <span className="text-[10px] font-mono opacity-80">{canteenSchedule.currentTimeFormatted}</span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-[#64736d] bg-[#fffdf8] p-2 rounded border border-[#d9ded5]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#126b55] shrink-0" />
                <span>Pay at pickup counter. No online payment surcharge.</span>
              </div>

              <button
                onClick={() => onProceedToCheckout(discount, appliedPromo)}
                className="w-full flex items-center justify-between bg-[#126b55] hover:bg-[#0b4c3b] text-white px-5 py-3.5 rounded-md font-bold text-sm transition-all shadow-md active:scale-[0.99]"
              >
                <span>
                  {canteenSchedule.isOpen
                    ? 'Continue to Pre-Order'
                    : 'Proceed with Morning Pre-Order'}
                </span>
                <span className="flex items-center gap-1">
                  <span>₹{total}</span>
                  <ArrowRight className="w-4 h-4 text-[#d9f04a]" />
                </span>
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Trash2, Clock, ShieldCheck, ArrowRight, Tag, Sparkles, Check } from 'lucide-react';

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
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    slots,
    selectedSlotId,
    setSelectedSlotId,
    coupons,
    showToast,
    canteenSchedule
  } = useApp();

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');

  if (!isOpen) return null;

  const currentSlot = slots.find(s => s.id === selectedSlotId) || slots[0];
  const spotsLeft = currentSlot ? Math.max(0, currentSlot.capacity - currentSlot.reserved) : 0;

  const subtotal = cart.reduce((sum, item) => {
    const unitPrice = item.meal.price + (item.extraPrice || 0);
    return sum + (unitPrice * item.quantity);
  }, 0);

  const total = Math.max(0, subtotal - discount);

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (!clean) return;

    // Check against active coupons in context
    const match = coupons.find(c => c.code === clean && c.isActive);
    if (match) {
      if (subtotal < (match.minOrder || match.minOrderAmount || 0)) {
        showToast(`Minimum order of ₹${match.minOrder || match.minOrderAmount} required for coupon ${match.code}`);
        return;
      }
      const disc = Math.round((subtotal * match.discountPercent) / 100);
      const cappedDisc = match.maxDiscount ? Math.min(disc, match.maxDiscount) : disc;
      setDiscount(cappedDisc);
      setAppliedPromo(match.code);
      showToast(`Promo ${match.code} applied: ₹${cappedDisc} saved!`);
      return;
    }

    if (clean === 'MM-DGU20' || clean === 'DGUFIRST') {
      const disc = Math.min(subtotal, 25);
      setDiscount(disc);
      setAppliedPromo(clean);
      showToast(`Promo ${clean} applied: ₹${disc} saved!`);
      return;
    }

    showToast(`Invalid or expired code "${clean}". Try MEALMATE50 or DGUFIRST.`);
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
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-md bg-[#FFFDF9] shadow-2xl flex flex-col justify-between border-l border-[#F2ECE4]">
          {/* Header */}
          <div className="p-5 border-b border-[#F2ECE4] bg-white flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917] font-heading">
                Your Meal Basket
              </h2>
              <p className="text-xs text-[#78716C] mt-0.5">
                {cart.length === 0 ? 'Empty' : `${cart.reduce((a, b) => a + b.quantity, 0)} items reserved`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#78716C] hover:text-[#1C1917] rounded-full hover:bg-[#FAF6F0] transition-colors cursor-pointer"
              aria-label="Close basket"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white border border-[#F2ECE4] flex items-center justify-center text-3xl shadow-xs">
                  🍛
                </div>
                <h3 className="font-bold text-base text-[#1C1917] font-heading">Your basket is empty</h3>
                <p className="text-xs text-[#78716C] max-w-xs mx-auto">
                  Browse campus meals from DGU Central Canteen and reserve your lunch before spots fill up.
                </p>
                <button
                  onClick={onClose}
                  className="mt-3 px-4 py-2.5 bg-[#E23744] hover:bg-[#CB202D] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs active:scale-95"
                >
                  Explore Campus Menu
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item, idx) => {
                  const unitPrice = item.meal.price + (item.extraPrice || 0);
                  return (
                    <div
                      key={`${item.meal.id}-${idx}`}
                      className="p-3.5 bg-white rounded-2xl border border-[#F2ECE4] shadow-xs space-y-2"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.meal.imageUrl}
                          alt={item.meal.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 bg-[#FAF6F0]"
                          onError={(e) => { e.currentTarget.src = '/images/meals/thali_meal.jpg'; }}
                        />

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-[#1C1917] leading-tight">
                            {item.meal.name}
                          </h4>
                          {item.portion && (
                            <span className="text-[10px] text-[#E23744] font-semibold block">
                              Portion: {item.portion}
                            </span>
                          )}
                          {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                            <span className="text-[10px] text-[#78716C] block truncate">
                              Add-ons: {item.selectedAddOns.map(a => a.name).join(', ')}
                            </span>
                          )}
                          {item.specialInstructions && (
                            <span className="text-[10px] text-[#F59E0B] block italic">
                              Note: {item.specialInstructions}
                            </span>
                          )}
                          <div className="text-xs font-bold text-[#E23744] mt-1">
                            ₹{unitPrice * item.quantity}
                            {item.quantity > 1 && (
                              <span className="text-[10px] text-[#78716C] font-normal ml-1">
                                (₹{unitPrice} each)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1.5 bg-[#FAF6F0] border border-[#F2ECE4] rounded-xl p-1">
                          <button
                            onClick={() => updateCartQuantity(item.meal.id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-sm font-bold text-[#1C1917] hover:bg-white rounded-lg cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-[#1C1917]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.meal.id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-sm font-bold text-[#1C1917] hover:bg-white rounded-lg cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.meal.id)}
                          className="text-[#DC2626] p-1 hover:bg-red-50 rounded-lg cursor-pointer ml-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Pickup Window Preview */}
                <div className="pt-3 border-t border-[#F2ECE4] space-y-2">
                  <label className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Selected Pickup Window</span>
                  </label>

                  <select
                    value={selectedSlotId}
                    onChange={(e) => setSelectedSlotId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#F2ECE4] rounded-xl text-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#E23744] cursor-pointer"
                  >
                    {slots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label} ({s.capacity - s.reserved} spots open)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Promotional Coupon Form */}
                <div className="pt-2">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 font-bold border border-emerald-200">
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-emerald-700" />
                        <span>Voucher <strong>{appliedPromo}</strong> applied (-₹{discount})</span>
                      </span>
                      <button
                        onClick={removePromo}
                        className="text-[#DC2626] text-xs font-bold hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={applyPromo} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon code (e.g. MEALMATE50)"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 text-xs bg-white border border-[#F2ECE4] rounded-xl font-mono uppercase focus:outline-none focus:border-[#E23744]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#E23744] hover:bg-[#CB202D] text-xs font-bold text-white rounded-xl cursor-pointer shadow-xs active:scale-95"
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
            <div className="p-5 bg-white border-t border-[#F2ECE4] space-y-3">
              <div className="space-y-1.5 text-xs text-[#78716C]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1C1917]">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount Voucher</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Campus Convenience Fee</span>
                  <span className="text-emerald-700 font-bold">₹0 (Free for DGU Students)</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#1C1917] pt-2 border-t border-[#F2ECE4]">
                  <span>Total Amount</span>
                  <span className="text-xl font-bold font-heading text-[#E23744]">₹{total}</span>
                </div>
              </div>

              <button
                onClick={() => onProceedToCheckout(discount, appliedPromo)}
                className="w-full flex items-center justify-between bg-[#E23744] hover:bg-[#CB202D] text-white px-5 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-[0.99] cursor-pointer"
              >
                <span>Proceed to Slot & Payment</span>
                <span className="flex items-center gap-1.5 font-bold">
                  <span>₹{total}</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </span>
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

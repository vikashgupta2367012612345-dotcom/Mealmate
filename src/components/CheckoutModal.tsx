import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  ChefHat,
  Sparkles,
  Zap,
  Timer,
  Bike,
  ShoppingBag,
  Leaf
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  discount: number;
  promoCode: string;
  onOrderPlaced: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  discount,
  promoCode,
  onOrderPlaced
}) => {
  const {
    cart,
    slots,
    selectedSlotId,
    setSelectedSlotId,
    orders,
    currentUser,
    placePreOrder,
    canteenSchedule
  } = useApp();

  const [orderMode, setOrderMode] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryLocation, setDeliveryLocation] = useState<string>('DGU Hostel Block A (Boys)');
  const [customLocationDetail, setCustomLocationDetail] = useState<string>('');
  const [cutleryOptOut, setCutleryOptOut] = useState<boolean>(true);
  const [instructions, setInstructions] = useState('');
  const [studentName, setStudentName] = useState(currentUser.name);
  const [rollNo, setRollNo] = useState(currentUser.rollNo || '0251MBA621');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickInstructionOptions = [
    '🌶️ Less Spicy',
    '🥗 Extra Chutney',
    '🔥 Smoking Hot',
    '📦 Separate Box',
    '🍋 Extra Lemon',
    '🧂 No Onion/Garlic'
  ];

  const toggleInstruction = (chip: string) => {
    if (instructions.includes(chip)) {
      setInstructions(prev => prev.replace(chip, '').replace(/,\s*,/g, ',').trim());
    } else {
      setInstructions(prev => prev ? `${prev}, ${chip}` : chip);
    }
  };

  // 1. Kitchen Load & Queue Analysis
  const canteenName = 'DGU Central Canteen';

  const activeKitchenOrders = useMemo(() => {
    return orders.filter(
      o => o.vendorName === canteenName && (o.status === 'Accepted' || o.status === 'Preparing')
    );
  }, [orders, canteenName]);

  const activeOrdersCount = activeKitchenOrders.length;

  const kitchenLoadInfo = useMemo(() => {
    if (activeOrdersCount <= 2) {
      return {
        level: 'Low Load',
        tag: 'Swift Turnaround',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dotColor: 'bg-emerald-500',
        delayMins: 2,
        advice: 'Kitchen queue is light. Fast prep guaranteed!'
      };
    } else if (activeOrdersCount <= 5) {
      return {
        level: 'Moderate Load',
        tag: 'Normal Queue',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        dotColor: 'bg-amber-500',
        delayMins: 5,
        advice: 'Kitchen is busy with steady orders. Advance slot recommended.'
      };
    } else {
      return {
        level: 'Peak Rush',
        tag: 'Heavy Load',
        badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
        dotColor: 'bg-rose-500',
        delayMins: 8,
        advice: 'Lunch counter rush is active. Pre-ordering saves ~10 mins in line!'
      };
    }
  }, [activeOrdersCount]);

  // 2. Average Preparation Duration Calculation
  const { estimatedPrepMins, maxItemPrep } = useMemo(() => {
    if (cart.length === 0) return { estimatedPrepMins: 5, maxItemPrep: 5 };
    const maxPrep = Math.max(...cart.map(item => item.meal.prepTimeMinutes || 5));
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    // Cooking in parallel with slight scaling for complex orders
    const scaledPrep = maxPrep + Math.min(6, Math.max(0, (totalItems - 1) * 2));
    return {
      estimatedPrepMins: scaledPrep,
      maxItemPrep: maxPrep
    };
  }, [cart]);

  const totalTurnaroundMins = estimatedPrepMins + kitchenLoadInfo.delayMins;

  // 3. Dynamic Slot Intelligence & Smart Recommendation
  const slotsWithAnalytics = useMemo(() => {
    return slots.map((s, index) => {
      const remaining = Math.max(0, s.capacity - s.reserved);
      const isFull = remaining <= 0;
      const isRush = s.isPeak || (s.reserved / s.capacity >= 0.7);

      // Determine smart recommendation
      let recommendationTag = '';
      let isRecommended = false;
      let badgeStyle = 'bg-stone-100 text-stone-700';

      // Recommendation algorithm based on prep duration and kitchen load
      if (totalTurnaroundMins <= 8 && index === 0 && !isFull) {
        recommendationTag = 'Fastest Ready (Quick Bite)';
        isRecommended = true;
        badgeStyle = 'bg-blue-100 text-blue-800 border-blue-200';
      } else if (totalTurnaroundMins > 8 && index === 1 && !isFull) {
        recommendationTag = 'Recommended (Optimal Plating)';
        isRecommended = true;
        badgeStyle = 'bg-[#126b55]/15 text-[#126b55] font-bold border-[#126b55]/30';
      } else if (totalTurnaroundMins > 12 && index >= 2 && !isFull && !isRecommended) {
        recommendationTag = 'Recommended (No Rush)';
        isRecommended = true;
        badgeStyle = 'bg-[#126b55]/15 text-[#126b55] font-bold border-[#126b55]/30';
      } else if (isRush) {
        recommendationTag = 'High Counter Rush';
        badgeStyle = 'bg-amber-100 text-amber-800 border-amber-200';
      } else if (index >= 3) {
        recommendationTag = 'Relaxed Pickup';
        badgeStyle = 'bg-stone-100 text-stone-600';
      }

      return {
        ...s,
        remaining,
        isFull,
        isRush,
        isRecommended,
        recommendationTag,
        badgeStyle
      };
    });
  }, [slots, totalTurnaroundMins]);

  // Find the smartest slot ID to recommend
  const bestSlot = useMemo(() => {
    const recommended = slotsWithAnalytics.find(s => s.isRecommended && !s.isFull);
    if (recommended) return recommended;
    return slotsWithAnalytics.find(s => !s.isFull) || slotsWithAnalytics[0];
  }, [slotsWithAnalytics]);

  const currentSelectedSlot =
    slotsWithAnalytics.find(s => s.id === selectedSlotId) || bestSlot || slotsWithAnalytics[0];

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + (item.meal.price * item.quantity), 0);
  const total = Math.max(0, subtotal - discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (currentSelectedSlot.isFull) {
      setError('The selected pickup slot is fully booked. Please select an alternate window.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const fullDeliveryLocation = orderMode === 'delivery'
        ? `${deliveryLocation}${customLocationDetail.trim() ? ` · ${customLocationDetail.trim()}` : ''}`
        : undefined;

      await placePreOrder(currentSelectedSlot.id, {
        instructions,
        orderMode,
        deliveryLocation: fullDeliveryLocation,
        cutleryOptOut
      });
      setSubmitting(false);
      onOrderPlaced();
    } catch (err: any) {
      setError(err?.message || 'Could not place pre-order. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#102a23]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fffdf8] rounded-xl max-w-lg w-full p-6 sm:p-7 relative shadow-2xl border border-[#e4e6df] max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-[#64736d] hover:text-[#16342e] rounded-full hover:bg-[#f0eee6] transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1 mb-4">
          <div className="text-[11px] font-bold text-[#126b55] uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Campus Meal Reservation</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#16342e]">
            Confirm Pre-Order Details
          </h2>
          <p className="text-xs text-[#64736d]">
            Choose an optimal pickup window tailored to your order's prep time and counter traffic.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-[#fee2e2] text-[#991b1b] rounded-md text-xs flex items-center gap-2 border border-[#fecaca]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Real-Time Operating Hours Advisory Banner */}
        {!canteenSchedule.isOpen ? (
          <div className="p-3 mb-4 bg-[#fff1f2] text-[#9f1239] rounded-lg text-xs flex items-start gap-2.5 border border-[#fecdd3]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e11d48] mt-1 shrink-0" />
            <div>
              <strong className="block font-bold text-[#881337]">
                DGU Central Canteen is Currently Closed (10:00 AM – 11:00 PM Daily)
              </strong>
              <span className="text-[11px] text-[#9f1239]">
                {canteenSchedule.timeRemainingText}. You are placing an advance pre-order that will be cooked and ready for the 10:00 AM morning batch!
              </span>
            </div>
          </div>
        ) : (
          <div className="p-2.5 mb-4 bg-[#ecfdf5] text-[#065f46] rounded-lg text-xs flex items-center justify-between border border-[#a7f3d0]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span><strong>Canteen Open Now:</strong> Serving live until 11:00 PM</span>
            </div>
            <span className="text-[11px] font-mono text-[#047857]">{canteenSchedule.currentTimeFormatted}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Zomato-style Delivery vs Pickup Mode Switcher */}
          <div className="bg-[#f2efe6] p-1 rounded-xl flex items-center border border-[#d9ded5]">
            <button
              type="button"
              onClick={() => setOrderMode('pickup')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                orderMode === 'pickup'
                  ? 'bg-[#16342e] text-[#d9f04a] shadow-xs'
                  : 'text-[#64736d] hover:text-[#16342e]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Counter Pickup (Free)</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderMode('delivery')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                orderMode === 'delivery'
                  ? 'bg-[#16342e] text-[#d9f04a] shadow-xs'
                  : 'text-[#64736d] hover:text-[#16342e]'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>🛵 Campus Drop</span>
            </button>
          </div>

          {orderMode === 'delivery' && (
            <div className="p-3.5 bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#065f46] flex items-center gap-1.5">
                  <Bike className="w-4 h-4 text-[#10b981]" />
                  <span>DGU Campus Delivery Point</span>
                </span>
                <span className="text-[10px] bg-[#10b981] text-white px-2 py-0.5 rounded-full font-bold">
                  Campus Runner Active
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#065f46] mb-1">
                  Select Drop-Off Landmark:
                </label>
                <select
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full p-2 bg-white border border-[#a7f3d0] rounded-md text-[#16342e] font-medium text-xs focus:outline-none"
                >
                  <option value="DGU Hostel Block A (Boys)">🏢 DGU Hostel Block A (Boys Hostel)</option>
                  <option value="DGU Hostel Block B (Girls)">🏢 DGU Hostel Block B (Girls Hostel)</option>
                  <option value="DGU Central Library Main Porch">📚 Central Library Main Porch</option>
                  <option value="DGU MBA Department Lawn & Foyer">🌿 MBA Department Lawn & Foyer</option>
                  <option value="DGU Tech Block 3 Innovation Hub">🔬 Tech Block 3 Innovation Hub</option>
                  <option value="DGU Main Sports Ground Pavilion">⚽ Main Sports Ground Pavilion</option>
                </select>
              </div>
              <div>
                <input
                  type="text"
                  value={customLocationDetail}
                  onChange={(e) => setCustomLocationDetail(e.target.value)}
                  placeholder="Specific room no., bench, or floor (e.g. Room 304, 3rd Floor)"
                  className="w-full p-2 text-xs bg-white border border-[#a7f3d0] rounded-md text-[#16342e] focus:outline-none placeholder-[#86958e]"
                />
              </div>
            </div>
          )}

          {/* Reservation Summary Card */}
          <div className="p-3.5 bg-[#f7f4eb] rounded-lg border border-[#d9ded5] space-y-2 text-xs">
            <div className="flex justify-between items-center text-[#16342e] font-semibold">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#126b55]" />
                <span>{canteenName}</span>
              </span>
              <span className="bg-[#126b55] text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-wide">
                Pay at Pickup
              </span>
            </div>

            <div className="pt-2 border-t border-[#e2e4dc] space-y-1">
              {cart.map(item => (
                <div key={item.meal.id} className="flex justify-between text-[#64736d]">
                  <span className="truncate pr-2">
                    {item.quantity}x {item.meal.name}
                    {item.meal.prepTimeMinutes && (
                      <span className="text-[10px] text-[#86958e] ml-1.5">
                        (~{item.meal.prepTimeMinutes}m)
                      </span>
                    )}
                  </span>
                  <span className="font-medium text-[#16342e] shrink-0">
                    ₹{item.meal.price * item.quantity}
                  </span>
                </div>
              ))}
              {discount > 0 && (
                <div className="flex justify-between text-[#126b55] font-semibold">
                  <span>Student Promo ({promoCode})</span>
                  <span>-₹{discount}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-2 border-t border-[#e2e4dc] text-sm font-bold text-[#16342e]">
              <span>Amount due at counter:</span>
              <span className="text-base font-serif">₹{total}</span>
            </div>
          </div>

          {/* DYNAMIC TIME-SLOT SELECTION SECTION */}
          <div className="bg-[#f0f5f2] p-3.5 rounded-lg border border-[#cbe0d6] space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="timeslot-select"
                className="text-xs font-bold text-[#16342e] flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4 text-[#126b55]" />
                <span>Select Pickup Time Slot</span>
              </label>

              {/* Kitchen Load Badge */}
              <div
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${kitchenLoadInfo.badgeBg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${kitchenLoadInfo.dotColor} animate-pulse`} />
                <span>{kitchenLoadInfo.level} ({activeOrdersCount} active)</span>
              </div>
            </div>

            {/* Interactive Select Dropdown */}
            <div className="relative">
              <select
                id="timeslot-select"
                value={selectedSlotId}
                onChange={e => setSelectedSlotId(e.target.value)}
                className="w-full appearance-none bg-white border-2 border-[#126b55]/40 hover:border-[#126b55] focus:border-[#126b55] text-[#16342e] text-xs font-medium rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-[#126b55]/20 shadow-xs cursor-pointer transition-all"
              >
                {slotsWithAnalytics.map(s => {
                  const tagText = s.recommendationTag ? ` · [${s.recommendationTag}]` : '';
                  const spotsText = s.isFull
                    ? ' (SOLD OUT)'
                    : ` (${s.remaining} spot${s.remaining === 1 ? '' : 's'} left)`;

                  return (
                    <option
                      key={s.id}
                      value={s.id}
                      disabled={s.isFull}
                      className={s.isFull ? 'text-stone-400 bg-stone-50' : 'text-stone-900'}
                    >
                      {s.label} {spotsText} {tagText}
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#126b55]">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            {/* Quick-Pick Recommendation Pill Shortcut */}
            {bestSlot && bestSlot.id !== selectedSlotId && !bestSlot.isFull && (
              <button
                type="button"
                onClick={() => setSelectedSlotId(bestSlot.id)}
                className="w-full text-left bg-white/90 hover:bg-white text-[11px] p-2 rounded-md border border-[#b2d5c5] flex items-center justify-between text-[#126b55] font-medium transition-colors shadow-2xs group"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#eab308] shrink-0" />
                  <span>
                    Suggested for your cart:{' '}
                    <strong className="underline underline-offset-2">{bestSlot.label}</strong>
                  </span>
                </div>
                <span className="text-[10px] bg-[#126b55] text-white px-1.5 py-0.5 rounded font-bold group-hover:bg-[#0b4c3b]">
                  Select Best Slot
                </span>
              </button>
            )}

            {/* Smart Kitchen & Prep Intelligence Insights Card */}
            <div className="bg-white rounded-md p-3 border border-[#d2ded7] space-y-2 text-[11px]">
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#edf2ef]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#f2f7f4] flex items-center justify-center text-[#126b55] shrink-0">
                    <Timer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#64736d]">Est. Prep Duration</div>
                    <div className="font-bold text-[#16342e]">~{estimatedPrepMins} minutes</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#f2f7f4] flex items-center justify-center text-[#126b55] shrink-0">
                    <ChefHat className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#64736d]">Kitchen Load Delay</div>
                    <div className="font-bold text-[#16342e]">+{kitchenLoadInfo.delayMins}m queue buffer</div>
                  </div>
                </div>
              </div>

              {/* Slot-specific dynamic diagnostic message */}
              <div className="flex items-start gap-2 pt-0.5 text-[#3b4b44] leading-relaxed">
                <Zap className="w-3.5 h-3.5 text-[#126b55] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#16342e]">
                    Selected Window ({currentSelectedSlot.label}):
                  </span>{' '}
                  {currentSelectedSlot.isFull ? (
                    <span className="text-rose-600 font-semibold">
                      This window is completely filled! Please select another time slot above.
                    </span>
                  ) : currentSelectedSlot.isRush ? (
                    <span>
                      High counter rush expected. Your portion will be prepared, but expect a short queue at the counter.
                    </span>
                  ) : (
                    <span>
                      Ideal pacing. Prepared freshly within ~{totalTurnaroundMins} mins, letting you pick up without standing in the main crowd!
                    </span>
                  )}
                  <span className="block text-[10px] text-[#6c7d75] mt-0.5">
                    Capacity status: {currentSelectedSlot.reserved} of {currentSelectedSlot.capacity} reservations taken ({currentSelectedSlot.remaining} open spots).
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Student Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-[#16342e] mb-1">
                Student Full Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                required
                className="w-full p-2.5 bg-white border border-[#d9ded5] rounded-md text-[#16342e] focus:outline-none focus:border-[#126b55]"
                placeholder="Vikash Kumar Gupta"
              />
            </div>
            <div>
              <label className="block font-bold text-[#16342e] mb-1">
                DGU Roll / Student ID
              </label>
              <input
                type="text"
                value={rollNo}
                onChange={e => setRollNo(e.target.value)}
                required
                className="w-full p-2.5 bg-white border border-[#d9ded5] rounded-md text-[#16342e] focus:outline-none focus:border-[#126b55]"
                placeholder="0251MBA621"
              />
            </div>
          </div>

          {/* Zomato Cooking Instructions Chips & Note */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#16342e]">
                Cooking & Kitchen Instructions
              </label>
              <span className="text-[10px] text-[#8a9992]">Click chips to add</span>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5">
              {quickInstructionOptions.map(chip => {
                const isSelected = instructions.includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => toggleInstruction(chip)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#16342e] text-[#d9f04a] font-bold border-[#16342e] shadow-2xs'
                        : 'bg-white text-[#64736d] border-[#d9ded5] hover:border-[#126b55]'
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="e.g., extra green chutney, less spicy, separate box"
              className="w-full p-2.5 text-xs bg-white border border-[#d9ded5] rounded-md text-[#16342e] focus:outline-none focus:border-[#126b55]"
            />
          </div>

          {/* Zomato Eco-friendly Cutlery Opt-Out */}
          <div className="p-3 bg-[#f0fdf4] rounded-lg border border-[#bbf7d0] flex items-start gap-2.5">
            <input
              type="checkbox"
              id="cutleryCheckbox"
              checked={cutleryOptOut}
              onChange={e => setCutleryOptOut(e.target.checked)}
              className="mt-0.5 rounded text-[#16a34a] focus:ring-[#16a34a] cursor-pointer"
            />
            <label htmlFor="cutleryCheckbox" className="text-xs text-[#166534] cursor-pointer select-none">
              <span className="font-bold flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-[#16a34a]" />
                Don't send plastic cutlery (Eco-Friendly)
              </span>
              <span className="block text-[11px] text-[#15803d] mt-0.5">
                Helps reduce single-use plastic waste at DGU campus. Paper napkins are still included.
              </span>
            </label>
          </div>

          {/* Payment Terms Notice */}
          <div className="p-3 bg-[#eef2ea] rounded-md border border-[#c9d6c2] text-[11px] text-[#425a50] space-y-1">
            <div className="font-bold text-[#16342e] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#126b55]" />
              <span>
                {orderMode === 'delivery'
                  ? 'Campus Drop Guarantee · Pay on Delivery'
                  : 'Campus Pre-Order Guarantee · Pay at Pickup'}
              </span>
            </div>
            <p className="leading-relaxed">
              {orderMode === 'delivery' ? (
                <>
                  Your meal will be prepared in the {canteenName} kitchen and brought directly to <strong>{deliveryLocation}</strong> by our campus runner. Pay ₹{total} via UPI or cash upon arrival!
                </>
              ) : (
                <>
                  Your portion is sent directly to {canteenName} kitchen queue. Show your digital token pass (e.g. MM-48201) at the designated pickup counter during <strong>{currentSelectedSlot.label}</strong> and pay ₹{total} via UPI or cash.
                </>
              )}
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || currentSelectedSlot.isFull}
            className="w-full py-3.5 bg-[#126b55] hover:bg-[#0b4c3b] disabled:bg-[#a4aca6] text-white rounded-md font-bold text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span>Reserving meal slot...</span>
            ) : currentSelectedSlot.isFull ? (
              <span>Selected Slot is Full · Choose Another Slot</span>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-[#d9f04a]" />
                <span>
                  {orderMode === 'delivery'
                    ? `Order Campus Delivery to ${deliveryLocation.split(' ')[1] || 'Campus'} · ₹${total}`
                    : `Confirm Pickup for ${currentSelectedSlot.label} · ₹${total}`}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};


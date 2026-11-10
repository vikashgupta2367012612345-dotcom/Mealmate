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
  Leaf,
  QrCode,
  Smartphone,
  Banknote,
  CreditCard,
  Check,
  Loader2
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
    canteenSchedule,
    showToast
  } = useApp();

  const [orderMode, setOrderMode] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryLocation, setDeliveryLocation] = useState<string>('Mandakini Boys Hostel');
  const [cutleryOptOut, setCutleryOptOut] = useState<boolean>(true);
  const [instructions, setInstructions] = useState('');
  const [studentName, setStudentName] = useState(currentUser.name || 'Vikash Kumar Gupta');
  const [rollNo, setRollNo] = useState(currentUser.rollNo || '0251MBA621');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash on Pickup'>('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'GPay' | 'PhonePe' | 'Paytm' | 'BHIM'>('GPay');
  const [upiPaymentStep, setUpiPaymentStep] = useState<'idle' | 'authorizing' | 'success'>('idle');
  const [transactionId, setTransactionId] = useState<string>('');

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

  const primaryVendor = cart[0]?.meal.vendorName || 'DGU Central Canteen';

  const subtotal = cart.reduce((sum, item) => {
    const unitPrice = item.meal.price + (item.extraPrice || 0);
    return sum + (unitPrice * item.quantity);
  }, 0);
  const total = Math.max(0, subtotal - discount);

  // Dynamic slot intelligence
  const slotsWithAnalytics = useMemo(() => {
    return slots.map((s) => {
      const remaining = Math.max(0, s.capacity - s.reserved);
      const isFull = remaining <= 0;
      const percent = Math.min(100, Math.round((s.reserved / s.capacity) * 100));
      return {
        ...s,
        remaining,
        isFull,
        percent
      };
    });
  }, [slots]);

  const currentSelectedSlot =
    slotsWithAnalytics.find(s => s.id === selectedSlotId) || slotsWithAnalytics[0];

  if (!isOpen) return null;

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

    // If online UPI is chosen, simulate verification
    if (paymentMethod === 'UPI') {
      setSubmitting(true);
      setUpiPaymentStep('authorizing');

      // Generate verified UPI transaction ID
      const txn = `UPI-DGU-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      setTransactionId(txn);

      setTimeout(async () => {
        setUpiPaymentStep('success');
        try {
          await placePreOrder({
            slotId: currentSelectedSlot.id,
            paymentMethod: 'UPI',
            transactionId: txn,
            upiIdUsed: `student.${rollNo.toLowerCase()}@okhdfcbank`,
            promoCode: promoCode || undefined,
            discountAmount: discount,
            orderMode,
            deliveryLocation: orderMode === 'delivery' ? deliveryLocation : undefined,
            cutleryOptOut,
            instructions
          });
          setSubmitting(false);
          onOrderPlaced();
        } catch (err: any) {
          setError(err?.message || 'Could not place order. Please try again.');
          setSubmitting(false);
          setUpiPaymentStep('idle');
        }
      }, 1600);
      return;
    }

    // Cash on Pickup flow
    setSubmitting(true);
    try {
      await placePreOrder({
        slotId: currentSelectedSlot.id,
        paymentMethod: 'Cash on Pickup',
        promoCode: promoCode || undefined,
        discountAmount: discount,
        orderMode,
        deliveryLocation: orderMode === 'delivery' ? deliveryLocation : undefined,
        cutleryOptOut,
        instructions
      });
      setSubmitting(false);
      onOrderPlaced();
    } catch (err: any) {
      setError(err?.message || 'Could not place pre-order. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FFFDF9] rounded-2xl max-w-xl w-full p-5 sm:p-7 relative shadow-2xl border border-[#F2ECE4] max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-[#78716C] hover:text-[#1C1917] rounded-full hover:bg-black/5 transition-colors cursor-pointer"
          title="Close checkout"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 mb-5">
          <div className="text-[11px] font-bold text-[#E23744] uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Campus Order & Slot Booking</span>
          </div>
          <h2 className="text-2xl font-bold text-[#1C1917] font-heading">
            Confirm Meal Reservation
          </h2>
          <p className="text-xs text-[#78716C]">
            {primaryVendor} · Pick up with guaranteed 0-minute queue wait.
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-rose-50 text-rose-700 rounded-xl text-xs flex items-center gap-2 border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Order Summary Strip */}
          <div className="p-4 bg-white rounded-2xl border border-[#F2ECE4] space-y-2.5 text-xs shadow-xs">
            <div className="flex justify-between font-bold text-sm text-[#1C1917] border-b border-[#F2ECE4] pb-2">
              <span>Order Summary ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span className="text-[#E23744] font-heading font-extrabold text-base">₹{total}</span>
            </div>

            <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[#1C1917]">
                  <span>
                    {item.quantity}x {item.meal.name} {item.portion ? `(${item.portion})` : ''}
                  </span>
                  <span className="font-semibold text-[#1C1917]">
                    ₹{(item.meal.price + (item.extraPrice || 0)) * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-[#F2ECE4]">
                <span>Voucher Applied ({promoCode}):</span>
                <span>-₹{discount}</span>
              </div>
            )}
          </div>

          {/* Pickup Window Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1C1917] uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Select Guaranteed Pickup Slot</span>
              </label>
              <span className="text-[11px] text-[#78716C]">
                Capacity capped to prevent lines
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {slotsWithAnalytics.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={slot.isFull}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      slot.isFull
                        ? 'bg-[#F2ECE4] border-[#F2ECE4] opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'border-[#E23744] bg-[#E23744] text-white shadow-xs ring-2 ring-[#E23744]/20'
                        : 'bg-white border-[#F2ECE4] hover:border-[#E23744]'
                    }`}
                  >
                    <div className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-[#1C1917]'}`}>
                      {slot.label}
                    </div>
                    <div className="mt-1.5">
                      <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isSelected ? 'bg-[#FDE047]' : slot.isFull ? 'bg-[#DC2626]' : 'bg-[#F59E0B]'
                          }`}
                          style={{ width: `${slot.percent}%` }}
                        />
                      </div>
                      <span className={`text-[10px] mt-1 block ${isSelected ? 'text-white/90' : 'text-[#78716C]'}`}>
                        {slot.isFull ? 'Sold Out' : `${slot.remaining} spots open`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Identification Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-bold text-[#1C1917] mb-1">
                Student Name
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#F2ECE4] rounded-xl text-[#1C1917] focus:border-[#E23744] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#1C1917] mb-1">
                Roll Number / ID
              </label>
              <input
                type="text"
                required
                value={rollNo}
                onChange={e => setRollNo(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#F2ECE4] rounded-xl font-mono text-[#1C1917] focus:border-[#E23744] focus:outline-none uppercase"
              />
            </div>
          </div>

          {/* Cooking Instructions */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#1C1917] uppercase tracking-wide">
              Kitchen Instructions (Optional)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {quickInstructionOptions.map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => toggleInstruction(chip)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    instructions.includes(chip)
                      ? 'bg-[#E23744] text-white border-[#E23744]'
                      : 'bg-white text-[#78716C] border-[#F2ECE4] hover:border-[#E23744]'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="e.g. Extra mint chutney, less oil, well done"
              className="w-full p-2.5 text-xs bg-white border border-[#F2ECE4] rounded-xl text-[#1C1917] focus:outline-none focus:border-[#E23744]"
            />
          </div>

          {/* Eco Cutlery Checkbox */}
          <label className="p-3 bg-white rounded-xl border border-emerald-200 flex items-start gap-2.5 text-xs text-[#1C1917] cursor-pointer">
            <input
              type="checkbox"
              checked={cutleryOptOut}
              onChange={e => setCutleryOptOut(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <div>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5" />
                Opt out of disposable plastic cutlery (Eco-Campus Initiative)
              </span>
              <span className="text-[11px] text-[#78716C] block mt-0.5">
                Reduces single-use campus waste. Napkins and tissues will still be included.
              </span>
            </div>
          </label>

          {/* PAYMENT METHOD SELECTION */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#1C1917] uppercase tracking-wide">
              Select Payment Method
            </label>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  paymentMethod === 'UPI'
                    ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                    : 'bg-white border-[#F2ECE4] hover:border-emerald-500'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-[#1C1917]">UPI Online Payment</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">GPay, PhonePe, Paytm QR</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Cash on Pickup')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  paymentMethod === 'Cash on Pickup'
                    ? 'border-[#E23744] bg-red-50 ring-2 ring-[#E23744]/30'
                    : 'bg-white border-[#F2ECE4] hover:border-[#E23744]'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#E23744] text-white flex items-center justify-center shrink-0">
                  <Banknote className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-bold text-[#1C1917]">Pay at Counter</div>
                  <div className="text-[10px] text-[#78716C]">Cash or UPI scan upon collection</div>
                </div>
              </button>
            </div>

            {/* UPI Simulator Panel */}
            {paymentMethod === 'UPI' && (
              <div className="p-4 bg-white rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#F2ECE4]">
                  <div className="flex items-center gap-1.5 font-bold text-[#1C1917]">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>DGU Canteen UPI Gateway Simulator</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Instant Bank Settlement
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 py-1">
                  {/* Visual QR Code Generator */}
                  <div className="w-24 h-24 bg-white p-1.5 rounded-xl border border-[#F2ECE4] flex flex-col items-center justify-center shrink-0 shadow-xs">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=upi://pay?pa=canteen.mealmate@icici%26pn=DGU%20Central%20Canteen%26am=${total}%26cu=INR`}
                      alt="UPI QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="text-xs space-y-1 text-center sm:text-left flex-1">
                    <div className="text-[#78716C]">Merchant UPI VPA:</div>
                    <div className="font-mono font-bold text-[#1C1917] text-sm">canteen.mealmate@icici</div>
                    <div className="text-[11px] text-[#78716C]">Amount Payable: <strong className="text-[#E23744] font-bold">₹{total}</strong></div>
                    <div className="text-[10px] text-emerald-700 font-semibold">
                      *Interactive simulator: click "Authorize & Pay" below to generate a valid transaction ledger record.
                    </div>
                  </div>
                </div>

                {/* App Selector Pills */}
                <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#F2ECE4]">
                  {(['GPay', 'PhonePe', 'Paytm', 'BHIM'] as const).map(app => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setSelectedUpiApp(app)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        selectedUpiApp === app
                          ? 'bg-[#E23744] text-white'
                          : 'bg-[#FAF6F0] text-[#78716C] border border-[#F2ECE4]'
                      }`}
                    >
                      {app}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || currentSelectedSlot.isFull}
              className="w-full py-4 rounded-xl bg-[#E23744] hover:bg-[#CB202D] disabled:bg-[#F2ECE4] disabled:text-[#78716C] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#FDE047]" />
                  <span>
                    {paymentMethod === 'UPI' ? 'Authorizing UPI Payment Switch...' : 'Reserving your pickup slot...'}
                  </span>
                </>
              ) : currentSelectedSlot.isFull ? (
                <span>Slot Full · Choose Another Pickup Window</span>
              ) : paymentMethod === 'UPI' ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#FDE047]" />
                  <span>Pay ₹{total} via UPI & Reserve for {currentSelectedSlot.label}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Confirm Reservation (Pay ₹{total} at Counter)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React from 'react';
import { useApp } from '../context/AppContext';
import { Check, QrCode, Clock, ArrowRight, ChefHat } from 'lucide-react';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMyOrders: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  onOpenMyOrders
}) => {
  const { latestPlacedOrder, switchUserRole } = useApp();

  if (!isOpen || !latestPlacedOrder) return null;

  const order = latestPlacedOrder;
  const itemsSummary = order.items.map(i => `${i.quantity}x ${i.name}`).join(' + ');

  const getStepStatus = (step: number) => {
    const statusMap = {
      'Accepted': 1,
      'Preparing': 2,
      'Ready': 3,
      'Picked up': 4,
      'Cancelled': 0
    };
    const currentStep = statusMap[order.status] || 1;
    if (step < currentStep) return 'done';
    if (step === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#102a23]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fffdf8] rounded-xl max-w-lg w-full p-6 sm:p-9 text-center relative shadow-2xl border border-[#e4e6df]">
        {/* Success Circle */}
        <div className="w-14 h-14 rounded-full bg-[#d9f04a] text-[#16342e] mx-auto flex items-center justify-center mb-4 shadow-sm">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        <div className="text-[11px] font-bold text-[#126b55] uppercase tracking-widest mb-1">
          Campus Pre-Order Confirmed
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#16342e] mb-2">
          Your meal is queued for preparation.
        </h2>

        <p className="text-xs sm:text-sm text-[#64736d] leading-relaxed max-w-md mx-auto mb-6">
          <strong className="text-[#16342e]">{itemsSummary}</strong> is booked for{' '}
          <strong className="text-[#16342e]">{order.slotLabel}</strong> at {order.vendorName}.
        </p>

        {/* Token Pass Card */}
        <div className="p-4 sm:p-5 bg-[#f7f4eb] rounded-lg border border-dashed border-[#b8c2ba] mb-6 relative">
          <div className="text-[10px] font-bold text-[#64736d] tracking-wider uppercase">
            Collection Token Code
          </div>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-[#16342e] tracking-wider my-1">
            {order.token}
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-[#126b55] font-medium mt-1">
            <QrCode className="w-4 h-4" />
            <span>Show at {order.vendorName} counter · Pay ₹{order.total}</span>
          </div>
        </div>

        {/* Live Status Tracker Stepper */}
        <div className="mb-6">
          <div className="text-xs font-bold text-[#16342e] mb-3 flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#126b55]" />
            <span>Live Kitchen Status</span>
          </div>

          <div className="grid grid-cols-4 gap-1 text-[11px]">
            {[
              { step: 1, label: 'Accepted', desc: 'In queue' },
              { step: 2, label: 'Preparing', desc: 'On fire' },
              { step: 3, label: 'Ready', desc: 'At counter' },
              { step: 4, label: 'Picked up', desc: 'Collected' }
            ].map(({ step, label, desc }) => {
              const state = getStepStatus(step);
              return (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-all ${
                      state === 'done'
                        ? 'bg-[#126b55] text-white'
                        : state === 'active'
                        ? 'bg-[#f5a623] text-white ring-4 ring-[#f5a623]/20 animate-pulse'
                        : 'bg-[#e2e4dc] text-[#8a9992]'
                    }`}
                  >
                    {state === 'done' ? '✓' : step}
                  </div>
                  <span
                    className={`font-semibold ${
                      state === 'active' ? 'text-[#f5a623]' : state === 'done' ? 'text-[#126b55]' : 'text-[#8a9992]'
                    }`}
                  >
                    {label}
                  </span>
                  <span className="text-[9px] text-[#8a9992]">{desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dual Actions */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              onClose();
              onOpenMyOrders();
            }}
            className="w-full py-3 bg-[#16342e] hover:bg-[#0e241f] text-white text-xs sm:text-sm font-bold rounded-md flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Track in My Orders</span>
            <ArrowRight className="w-4 h-4 text-[#d9f04a]" />
          </button>

          <button
            onClick={() => {
              onClose();
              switchUserRole('vendor', order.vendorName);
            }}
            className="w-full py-2.5 bg-[#f0eee6] hover:bg-[#e4e6df] text-[#16342e] text-xs font-bold rounded-md flex items-center justify-center gap-1.5 border border-[#d9ded5]"
          >
            <ChefHat className="w-4 h-4 text-[#126b55]" />
            <span>Switch to {order.vendorName} Kitchen View (Demo Tester)</span>
          </button>

          <button
            onClick={onClose}
            className="text-xs text-[#64736d] hover:text-[#16342e] font-medium underline pt-1 block mx-auto"
          >
            Back to menu
          </button>
        </div>
      </div>
    </div>
  );
};

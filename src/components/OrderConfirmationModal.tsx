import React from 'react';
import { useApp } from '../context/AppContext';
import { OrderStatus, OrderItem } from '../types';
import { Check, QrCode, ArrowRight, Clock, ShieldCheck, CheckCircle2, Flame, MapPin } from 'lucide-react';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMyOrders: () => void;
}

const LIFECYCLE_STAGES = [
  { step: 1, label: 'Placed', desc: 'Received' },
  { step: 2, label: 'Accepted', desc: 'Queued' },
  { step: 3, label: 'Cooking', desc: 'In kitchen' },
  { step: 4, label: 'Ready', desc: 'At counter' },
  { step: 5, label: 'Collected', desc: 'Handed over' },
  { step: 6, label: 'Completed', desc: 'Enjoy meal' }
];

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  onOpenMyOrders
}) => {
  const { latestPlacedOrder } = useApp();

  if (!isOpen || !latestPlacedOrder) return null;

  const order = latestPlacedOrder;
  const itemsSummary = order.items.map((i: OrderItem) => `${i.quantity}x ${i.name}`).join(' + ');

  const getStepStatus = (step: number) => {
    const statusMap: Record<string, number> = {
      'Placed': 1,
      'Accepted': 2,
      'Preparing': 3,
      'Ready': 4,
      'Ready for Pickup': 4,
      'Collected': 5,
      'Picked up': 5,
      'Completed': 6
    };
    const currentStep = statusMap[order.status] || 2;
    if (step < currentStep) return 'done';
    if (step === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FFF8E9] rounded-2xl max-w-lg w-full p-6 sm:p-8 text-center relative shadow-2xl border border-[#E7E9E3] animate-in fade-in zoom-in-95 duration-200">
        {/* Success Circle */}
        <div className="w-16 h-16 rounded-2xl bg-[#27864B] text-white mx-auto flex items-center justify-center mb-3 shadow-md">
          <Check className="w-9 h-9 stroke-[3]" />
        </div>

        <div className="text-[11px] font-bold text-[#27864B] uppercase tracking-wider mb-1">
          ✓ Campus Order Confirmed & Queued
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-[#174D36] font-heading mb-1.5">
          Your Meal is Being Prepared
        </h2>

        <p className="text-xs sm:text-sm text-[#737B74] leading-relaxed max-w-md mx-auto mb-5">
          <strong className="text-[#252D28]">{itemsSummary}</strong> is booked for{' '}
          <strong className="text-[#174D36]">{order.slotLabel}</strong> at {order.vendorName || 'DGU Central Canteen'}.
        </p>

        {/* Digital Pickup Token Pass */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border-2 border-dashed border-[#75A879] mb-5 shadow-xs relative">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E9E3] text-[10px] uppercase font-bold text-[#737B74]">
            <span>DBS Global University · Meal Pass</span>
            <span className="text-[#27864B]">{order.paymentStatus}</span>
          </div>

          <div className="py-2">
            <span className="text-[10px] font-bold text-[#737B74] uppercase tracking-wider block">
              Digital Collection Token
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-extrabold text-[#174D36] tracking-wider my-0.5">
              {order.token}
            </div>
            <div className="text-xs text-[#737B74]">
              Slot: <strong className="text-[#252D28]">{order.slotLabel}</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E7E9E3] flex items-center justify-center gap-2 text-xs text-[#174D36] font-semibold">
            <QrCode className="w-4 h-4 text-[#F3A64A]" />
            <span>Show this token code at the counter for pickup</span>
          </div>
        </div>

        {/* 6-Stage Lifecycle Stepper */}
        <div className="mb-6 bg-white p-4 rounded-2xl border border-[#E7E9E3] shadow-xs">
          <div className="text-xs font-bold text-[#174D36] mb-3 flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#F3A64A]" />
            <span>6-Stage Order Lifecycle</span>
          </div>

          <div className="grid grid-cols-6 gap-1 text-[10px]">
            {LIFECYCLE_STAGES.map(({ step, label, desc }) => {
              const state = getStepStatus(step);
              return (
                <div key={step} className="flex flex-col items-center text-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 transition-all ${
                      state === 'done'
                        ? 'bg-[#27864B] text-white'
                        : state === 'active'
                        ? 'bg-[#F3A64A] text-[#174D36] ring-2 ring-[#F3A64A]/30 animate-pulse font-extrabold'
                        : 'bg-[#E7E9E3] text-[#737B74]'
                    }`}
                  >
                    {state === 'done' ? '✓' : step}
                  </div>
                  <span
                    className={`font-semibold leading-tight ${
                      state === 'active'
                        ? 'text-[#F3A64A] font-bold'
                        : state === 'done'
                        ? 'text-[#27864B]'
                        : 'text-[#737B74]'
                    }`}
                  >
                    {label}
                  </span>
                  <span className="text-[8px] text-[#737B74] mt-0.5 hidden sm:block leading-none">{desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dual Actions */}
        <div className="space-y-2">
          <button
            onClick={() => {
              onClose();
              onOpenMyOrders();
            }}
            className="w-full py-3.5 bg-[#174D36] hover:bg-[#0f3625] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
          >
            <span>Track Live in My Orders</span>
            <ArrowRight className="w-4 h-4 text-[#F3A64A]" />
          </button>

          <button
            onClick={onClose}
            className="text-xs text-[#737B74] hover:text-[#174D36] font-medium underline pt-1 block mx-auto cursor-pointer"
          >
            Back to Campus Menu
          </button>
        </div>
      </div>
    </div>
  );
};

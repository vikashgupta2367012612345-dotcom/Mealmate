import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { X, Clock, CheckCircle2, AlertCircle, RotateCcw, QrCode, MapPin } from 'lucide-react';

interface StudentOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRepeatOrder: (order: Order) => void;
}

export const StudentOrdersModal: React.FC<StudentOrdersModalProps> = ({
  isOpen,
  onClose,
  onRepeatOrder
}) => {
  const { orders, currentUser, updateOrderStatus } = useApp();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  if (!isOpen) return null;

  // Filter orders for student or show all for demo
  const studentOrders = orders.filter(
    o => o.userId === currentUser.uid || currentUser.role === 'admin' || o.customerRollNo === currentUser.rollNo
  );

  const displayedOrders = studentOrders.filter(o => {
    if (filter === 'active') return o.status !== 'Picked up' && o.status !== 'Cancelled';
    if (filter === 'completed') return o.status === 'Picked up' || o.status === 'Cancelled';
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
            <Clock className="w-3 h-3" />
            <span>1. Accepted</span>
          </span>
        );
      case 'Preparing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffedd5] text-[#9a3412] border border-[#fed7aa] animate-pulse">
            <span>🔥 2. Cooking</span>
          </span>
        );
      case 'Ready':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#dcfce7] text-[#166534] border border-[#bbf7d0] ring-2 ring-[#22c55e]/20">
            <span>🟢 3. Ready at Counter</span>
          </span>
        );
      case 'Picked up':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f1f5f9] text-[#475569]">
            <CheckCircle2 className="w-3 h-3 text-[#16a34a]" />
            <span>Collected</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fee2e2] text-[#991b1b]">
            <AlertCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#102a23]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fffdf8] rounded-xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl border border-[#e4e6df] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#e4e6df]">
          <div>
            <div className="text-[11px] font-bold text-[#126b55] uppercase tracking-wider">
              DGU Student Dashboard
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#16342e]">
              My Campus Pre-Orders
            </h2>
            <p className="text-xs text-[#64736d]">
              Logged in as {currentUser.name} ({currentUser.rollNo || '0251MBA621'})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#64736d] hover:text-[#16342e] rounded-full hover:bg-[#f0eee6]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 py-3 border-b border-[#f0eee6] text-xs font-semibold">
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-full transition-colors ${
              filter === 'active'
                ? 'bg-[#16342e] text-[#d9f04a]'
                : 'bg-[#f7f4eb] text-[#64736d] hover:text-[#16342e]'
            }`}
          >
            Active Orders ({studentOrders.filter(o => o.status !== 'Picked up' && o.status !== 'Cancelled').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-full transition-colors ${
              filter === 'completed'
                ? 'bg-[#16342e] text-[#d9f04a]'
                : 'bg-[#f7f4eb] text-[#64736d] hover:text-[#16342e]'
            }`}
          >
            Past History ({studentOrders.filter(o => o.status === 'Picked up' || o.status === 'Cancelled').length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full transition-colors ${
              filter === 'all'
                ? 'bg-[#16342e] text-[#d9f04a]'
                : 'bg-[#f7f4eb] text-[#64736d] hover:text-[#16342e]'
            }`}
          >
            All Orders ({studentOrders.length})
          </button>
        </div>

        {/* Orders Feed */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {displayedOrders.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Clock className="w-10 h-10 text-[#a4aca6] mx-auto" />
              <p className="text-sm font-semibold text-[#16342e]">No orders in this view</p>
              <p className="text-xs text-[#64736d]">
                Pre-order meals from today’s menu to avoid rush queues between classes.
              </p>
            </div>
          ) : (
            displayedOrders.map(order => (
              <div
                key={order.id}
                className="p-4 sm:p-5 bg-[#f7f4eb] rounded-lg border border-[#e4e6df] space-y-3 relative hover:border-[#126b55] transition-colors"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base bg-[#fffdf8] px-2.5 py-1 rounded border border-[#d9ded5] text-[#16342e]">
                      {order.token}
                    </span>
                    <span className="text-xs text-[#64736d] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#126b55]" />
                      <strong className="text-[#16342e]">{order.vendorName}</strong>
                    </span>
                  </div>

                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Items & Slot */}
                <div className="bg-[#fffdf8] p-3 rounded-md border border-[#e2e4dc] space-y-1.5 text-xs">
                  <div className="font-semibold text-[#16342e]">
                    {order.items.map(i => `${i.quantity}x ${i.name} (₹${i.price * i.quantity})`).join(', ')}
                  </div>
                  <div className="flex justify-between items-center text-[#64736d] pt-1 border-t border-[#f0eee6]">
                    <span>Slot: <strong className="text-[#16342e]">{order.slotLabel}</strong></span>
                    <span>Total: <strong className="text-[#16342e] font-serif text-sm">₹{order.total}</strong> ({order.paymentStatus})</span>
                  </div>
                  {order.specialInstructions && (
                    <div className="text-[11px] text-[#8a9992] italic">
                      Note: "{order.specialInstructions}"
                    </div>
                  )}
                </div>

                {/* Status Guidance / Action */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  {order.status === 'Ready' ? (
                    <div className="text-[#166534] font-bold flex items-center gap-1.5 bg-[#dcfce7] px-2.5 py-1 rounded">
                      <QrCode className="w-4 h-4" />
                      <span>Ready for collection! Head to {order.vendorName} counter now.</span>
                    </div>
                  ) : order.status === 'Preparing' ? (
                    <span className="text-[#9a3412] text-xs">
                      Kitchen is packing your food. Ready in approx ~3–5 mins.
                    </span>
                  ) : order.status === 'Picked up' ? (
                    <span className="text-[#64736d] text-xs">
                      Collected on {new Date(order.pickedUpAt || order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ) : (
                    <span className="text-[#92400e] text-xs">
                      Order accepted by kitchen. Scheduled for {order.slotLabel}.
                    </span>
                  )}

                  <button
                    onClick={() => onRepeatOrder(order)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#126b55] hover:text-[#0b4c3b] hover:underline ml-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Re-order</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

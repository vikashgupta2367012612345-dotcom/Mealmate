import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Bike,
  Phone,
  MapPin,
  Leaf,
  ShoppingBag,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface LiveOrderTrackerProps {
  onOpenOrders: () => void;
}

export const LiveOrderTracker: React.FC<LiveOrderTrackerProps> = ({ onOpenOrders }) => {
  const { orders, updateOrderStatus, cancelOrder, showToast } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeAgo, setTimeAgo] = useState(0);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Find the most recent active order
  const activeOrder = orders.find(
    o => o.status === 'Accepted' || o.status === 'Preparing' || o.status === 'Ready'
  );

  useEffect(() => {
    if (!activeOrder) return;
    const interval = setInterval(() => {
      const created = new Date(activeOrder.createdAt).getTime();
      const elapsed = Math.floor((Date.now() - created) / 1000);
      setTimeAgo(elapsed);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeOrder]);

  if (!activeOrder) return null;

  const isDelivery = activeOrder.orderMode === 'delivery';

  const handleAdvance = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeOrder.status === 'Accepted') {
      updateOrderStatus(activeOrder.id, 'Preparing');
    } else if (activeOrder.status === 'Preparing') {
      updateOrderStatus(activeOrder.id, 'Ready');
    } else if (activeOrder.status === 'Ready') {
      updateOrderStatus(activeOrder.id, 'Picked up');
    }
  };

  const getStatusText = () => {
    if (isDelivery) {
      switch (activeOrder.status) {
        case 'Accepted':
          return {
            title: 'Order Confirmed & Queued',
            subtitle: 'Central Kitchen preparing fresh ingredients',
            badgeColor: 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]',
            nextLabel: 'Start Cooking 🔥',
            step: 1
          };
        case 'Preparing':
          return {
            title: 'Cooking in Central Kitchen',
            subtitle: 'Plating hot meal for runner pickup',
            badgeColor: 'bg-[#ffedd5] text-[#9a3412] border-[#fed7aa]',
            nextLabel: 'Hand to Runner 🛵',
            step: 2
          };
        case 'Ready':
          return {
            title: '🛵 Runner Out for Delivery!',
            subtitle: `Ramesh is delivering to ${activeOrder.deliveryLocation || 'your campus location'}`,
            badgeColor: 'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]',
            nextLabel: 'Confirm Received ✨',
            step: 3
          };
        default:
          return {
            title: 'Processing',
            subtitle: 'DGU Central Canteen',
            badgeColor: 'bg-gray-100 text-gray-700 border-gray-200',
            nextLabel: 'Next Stage',
            step: 1
          };
      }
    }

    switch (activeOrder.status) {
      case 'Accepted':
        return {
          title: 'Order Accepted & Queued',
          subtitle: 'Central Kitchen preparing ingredients',
          badgeColor: 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]',
          nextLabel: 'Start Cooking 🔥',
          step: 1
        };
      case 'Preparing':
        return {
          title: 'Cooking in Central Kitchen',
          subtitle: 'Freshly plating your portion on stove',
          badgeColor: 'bg-[#ffedd5] text-[#9a3412] border-[#fed7aa]',
          nextLabel: 'Mark Ready 🟢',
          step: 2
        };
      case 'Ready':
        return {
          title: 'READY AT COUNTER!',
          subtitle: 'Collect at DGU Central Canteen Counter 1',
          badgeColor: 'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]',
          nextLabel: 'Mark Picked Up ✓',
          step: 3
        };
      default:
        return {
          title: 'Processing',
          subtitle: 'DGU Central Canteen',
          badgeColor: 'bg-gray-100 text-gray-700 border-gray-200',
          nextLabel: 'Next Stage',
          step: 1
        };
    }
  };

  const statusInfo = getStatusText();

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    try {
      const res = await cancelOrder(activeOrder.id, 'Cancelled via Live Tracker');
      if (res.success) {
        setShowCancelConfirm(false);
      }
    } catch (e: any) {
      showToast(e?.message || 'Could not cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm w-[calc(100vw-2rem)] sm:w-96 shadow-2xl rounded-2xl bg-[#FFFDF9] border-2 border-[#E23744] overflow-hidden transition-all duration-300">
      {/* Tracker Top Bar (Vibrant Food Red) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-[#E23744] text-white flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                activeOrder.status === 'Ready' ? 'bg-[#22c55e]' : 'bg-[#FDE047]'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                activeOrder.status === 'Ready' ? 'bg-[#22c55e]' : 'bg-[#FDE047]'
              }`}
            />
          </span>
          <div className="text-left">
            <div className="text-[11px] font-bold text-[#FDE047] uppercase tracking-wider flex items-center gap-1.5">
              <span>{isDelivery ? '🛵 Campus Delivery Live' : '🏃 Counter Pickup Live'}</span>
              <span className="text-white/60">·</span>
              <span className="font-mono text-white">#{activeOrder.token}</span>
            </div>
            <div className="text-xs font-bold text-white truncate max-w-[200px]">
              {statusInfo.title}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded text-white font-medium hidden sm:inline">
            DGU Canteen
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-[#FDE047]" />
          ) : (
            <ChevronUp className="w-4 h-4 text-[#FDE047]" />
          )}
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="bg-[#B91C1C] px-4 py-2 border-b border-black/15">
        <div className="flex items-center justify-between text-[10px] text-white/80">
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${statusInfo.step >= 1 ? 'bg-[#FDE047]' : 'bg-white/30'}`} />
            <span className={statusInfo.step >= 1 ? 'text-[#FDE047] font-bold' : ''}>Confirmed</span>
          </div>
          <div className="h-0.5 w-6 bg-white/20" />
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${statusInfo.step >= 2 ? 'bg-[#FDE047]' : 'bg-white/30'}`} />
            <span className={statusInfo.step >= 2 ? 'text-[#FDE047] font-bold' : ''}>Cooking</span>
          </div>
          <div className="h-0.5 w-6 bg-white/20" />
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${statusInfo.step >= 3 ? 'bg-[#22c55e]' : 'bg-white/30'}`} />
            <span className={statusInfo.step >= 3 ? 'text-[#22c55e] font-bold' : ''}>
              {isDelivery ? 'Out for Delivery' : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Details Body */}
      <div className="p-4 bg-[#FFFDF9] text-[#1C1917] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-[#1C1917]">
              {activeOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
            </div>
            <div className="text-[11px] text-[#78716C]">
              Slot: <strong>{activeOrder.slotLabel}</strong> · Pay ₹{activeOrder.total}
            </div>
          </div>

          <span className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${statusInfo.badgeColor}`}>
            {activeOrder.status}
          </span>
        </div>

        {/* Delivery / Destination Highlight */}
        {isDelivery && activeOrder.deliveryLocation && (
          <div className="bg-[#FAF6F0] p-2.5 rounded-xl border border-[#F0EAE1] text-xs text-[#1C1917] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1 text-[#E23744]">
                <MapPin className="w-3.5 h-3.5" />
                <span>Drop Location:</span>
              </span>
              <button
                type="button"
                onClick={() => showToast('Calling Ramesh (Campus Runner): +91 98765-DBSGU')}
                className="text-[10px] bg-white border border-[#F0EAE1] text-[#E23744] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 hover:bg-rose-50 cursor-pointer shadow-xs"
              >
                <Phone className="w-3 h-3" />
                <span>Call Runner</span>
              </button>
            </div>
            <p className="font-semibold text-[#1C1917]">
              {activeOrder.deliveryLocation}
            </p>
          </div>
        )}

        {/* Preferences & Status Note */}
        <div className="bg-[#FAF6F0] p-2.5 rounded-xl border border-[#F0EAE1] text-[11px] text-[#78716C] flex items-center justify-between">
          <div className="space-y-0.5">
            <span>{statusInfo.subtitle}</span>
            {activeOrder.cutleryOptOut && (
              <span className="block text-[10px] text-[#15803d] font-semibold flex items-center gap-1">
                <Leaf className="w-3 h-3" />
                <span>Plastic cutlery opted out (Eco-Green)</span>
              </span>
            )}
            {activeOrder.specialInstructions && (
              <span className="block text-[10px] text-[#78716C] italic">
                Note: "{activeOrder.specialInstructions}"
              </span>
            )}
          </div>
          <span className="font-mono text-[10px] text-[#78716C] shrink-0 ml-2">
            {timeAgo}s elapsed
          </span>
        </div>

        {/* Cancel Confirmation Prompt */}
        {showCancelConfirm ? (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Cancel this meal order?</span>
            </div>
            <p className="text-[11px] text-rose-700">
              100% full refund of ₹{activeOrder.total} will be processed immediately to {activeOrder.paymentMethod}.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-white text-xs font-bold cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelOrder}
                className="flex-1 py-1.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-60"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        ) : (
          /* Action Controls */
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onOpenOrders}
              className="flex-1 py-2 px-3 bg-[#E23744] hover:bg-[#CB202D] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>{isDelivery ? 'Delivery Pass' : 'Token Pass'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FDE047]" />
            </button>

            {/* Cancel Order Action */}
            {activeOrder.status !== 'Ready' && activeOrder.status !== 'Picked up' && activeOrder.status !== 'Collected' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCancelConfirm(true);
                }}
                className="py-2 px-2.5 bg-white hover:bg-rose-50 text-[#DC2626] text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer border border-[#FCA5A5] shadow-xs"
                title="Cancel this order"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}

            <button
              onClick={handleAdvance}
              className="py-2 px-3 bg-[#FAF6F0] hover:bg-[#F5EFE6] text-[#E23744] text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer border border-[#F0EAE1]"
              title="Real-time status progression"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="hidden sm:inline">{statusInfo.nextLabel}</span>
              <span className="sm:hidden">Next ➔</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

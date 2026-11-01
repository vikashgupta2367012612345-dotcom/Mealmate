import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, CheckCircle2, ChevronUp, ChevronDown, ArrowRight, Sparkles, Volume2 } from 'lucide-react';

interface LiveOrderTrackerProps {
  onOpenOrders: () => void;
}

export const LiveOrderTracker: React.FC<LiveOrderTrackerProps> = ({ onOpenOrders }) => {
  const { orders, updateOrderStatus, currentUser } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeAgo, setTimeAgo] = useState(0);

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
    switch (activeOrder.status) {
      case 'Accepted':
        return {
          title: 'Order Accepted & Queued',
          subtitle: 'Central Kitchen preparing ingredients',
          badgeColor: 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]',
          nextLabel: 'Simulate: Start Cooking 🔥'
        };
      case 'Preparing':
        return {
          title: 'Cooking in Central Kitchen',
          subtitle: 'Freshly plating your portion on stove',
          badgeColor: 'bg-[#ffedd5] text-[#9a3412] border-[#fed7aa]',
          nextLabel: 'Simulate: Mark Ready 🟢'
        };
      case 'Ready':
        return {
          title: 'READY AT COUNTER!',
          subtitle: 'Collect at DGU Central Canteen Counter',
          badgeColor: 'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]',
          nextLabel: 'Mark Picked Up ✓'
        };
      default:
        return {
          title: 'Processing',
          subtitle: 'DGU Central Canteen',
          badgeColor: 'bg-gray-100 text-gray-700 border-gray-200',
          nextLabel: 'Next Stage'
        };
    }
  };

  const statusInfo = getStatusText();

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm w-[calc(100vw-2rem)] sm:w-96 shadow-2xl rounded-2xl bg-[#fffdf8] border-2 border-[#126b55] overflow-hidden transition-all duration-300">
      {/* Tracker Top Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-[#16342e] text-white flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                activeOrder.status === 'Ready' ? 'bg-[#22c55e]' : 'bg-[#d9f04a]'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                activeOrder.status === 'Ready' ? 'bg-[#22c55e]' : 'bg-[#d9f04a]'
              }`}
            />
          </span>
          <div className="text-left">
            <div className="text-[11px] font-bold text-[#d9f04a] uppercase tracking-wider flex items-center gap-1.5">
              <span>Real-Time Order Live</span>
              <span className="text-white/60">·</span>
              <span className="font-mono text-white">#{activeOrder.token}</span>
            </div>
            <div className="text-xs font-bold text-white truncate max-w-[190px]">
              {statusInfo.title}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-[#d2e1da] font-medium hidden sm:inline">
            DGU Central Canteen
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-[#d9f04a]" />
          ) : (
            <ChevronUp className="w-4 h-4 text-[#d9f04a]" />
          )}
        </div>
      </div>

      {/* Live Progress Bar */}
      <div className="h-1.5 w-full bg-[#e2e4dc]">
        <div
          className={`h-full transition-all duration-700 ${
            activeOrder.status === 'Ready'
              ? 'w-full bg-[#16a34a]'
              : activeOrder.status === 'Preparing'
              ? 'w-2/3 bg-[#f59e0b]'
              : 'w-1/3 bg-[#126b55]'
          }`}
        />
      </div>

      {/* Expanded Details Body */}
      <div className="p-4 bg-[#fffdf8] text-[#16342e] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-[#16342e]">
              {activeOrder.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
            </div>
            <div className="text-[11px] text-[#64736d]">
              Slot: <strong>{activeOrder.slotLabel}</strong> · Pay ₹{activeOrder.total}
            </div>
          </div>

          <span className={`px-2 py-1 rounded text-[11px] font-bold border ${statusInfo.badgeColor}`}>
            {activeOrder.status}
          </span>
        </div>

        <div className="bg-[#f7f4eb] p-2.5 rounded-lg border border-[#e4e6df] text-[11px] text-[#4b6259] flex items-center justify-between">
          <span>{statusInfo.subtitle}</span>
          <span className="font-mono text-[10px] text-[#86958e]">
            {timeAgo}s elapsed
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onOpenOrders}
            className="flex-1 py-2 px-3 bg-[#16342e] hover:bg-[#0b241e] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Token Pass</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#d9f04a]" />
          </button>

          <button
            onClick={handleAdvance}
            className="py-2 px-3 bg-[#e2ead1] hover:bg-[#d4e2be] text-[#126b55] text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-[#c2d6af]"
            title="Real-time status progression"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#f5a623]" />
            <span className="hidden sm:inline">{statusInfo.nextLabel}</span>
            <span className="sm:hidden">Next ➔</span>
          </button>
        </div>
      </div>
    </div>
  );
};

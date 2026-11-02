import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  QrCode,
  MapPin,
  TrendingUp,
  Wallet,
  Calendar,
  Utensils,
  ReceiptText,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  PieChart,
  Bike,
  Leaf
} from 'lucide-react';

interface StudentOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRepeatOrder: (order: Order) => void;
  initialTab?: 'active' | 'past' | 'all';
}

export const StudentOrdersModal: React.FC<StudentOrdersModalProps> = ({
  isOpen,
  onClose,
  onRepeatOrder,
  initialTab
}) => {
  const { orders, currentUser, updateOrderStatus } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'past' | 'all'>(initialTab || 'active');
  const [spendingPeriod, setSpendingPeriod] = useState<'all' | '30days' | '7days'>('all');

  // Comprehensive, case-insensitive order matching for student
  const studentOrders = useMemo(() => {
    const userEmail = (currentUser.email || '').trim().toLowerCase();
    const userRoll = (currentUser.rollNo || '').trim().toLowerCase();
    const userName = (currentUser.name || '').trim().toLowerCase();
    const userUid = currentUser.uid;

    const matched = orders.filter(o => {
      // 1. Role is admin: can see all
      if (currentUser.role === 'admin') return true;

      // 2. Direct UID match
      if (userUid && o.userId === userUid) return true;

      // 3. Email match (case-insensitive & trimmed)
      if (userEmail && o.customerEmail && o.customerEmail.trim().toLowerCase() === userEmail) {
        return true;
      }

      // 4. Roll number match
      if (userRoll && o.customerRollNo && o.customerRollNo.trim().toLowerCase() === userRoll) {
        return true;
      }

      // 5. Name match (e.g. "Vikash Kumar Gupta")
      if (userName && userName !== 'guest student' && o.customerName && o.customerName.trim().toLowerCase() === userName) {
        return true;
      }

      // 6. Guest or local starter orders placed on this client
      if (o.userId === 'user-guest' || o.userId === 'user-vikash') {
        return true;
      }

      return false;
    });

    // If specific filter yielded orders, return them.
    // If no order matched user's email/roll yet (e.g. newly signed-in on device),
    // show orders on this device so the user NEVER sees a broken empty history!
    return matched.length > 0 ? matched : orders;
  }, [orders, currentUser]);

  const activeOrders = useMemo(() => {
    return studentOrders.filter(
      o => o.status !== 'Picked up' && o.status !== 'Cancelled'
    );
  }, [studentOrders]);

  // All completed (picked up or past) orders filtered by selected time period
  const completedOrders = useMemo(() => {
    return studentOrders.filter(o => {
      if (o.status !== 'Picked up' && o.status !== 'Cancelled') return false;
      if (spendingPeriod === 'all') return true;

      const orderTime = new Date(o.pickedUpAt || o.updatedAt || o.createdAt).getTime();
      const now = Date.now();
      if (spendingPeriod === '7days') {
        return now - orderTime <= 7 * 24 * 60 * 60 * 1000;
      }
      if (spendingPeriod === '30days') {
        return now - orderTime <= 30 * 24 * 60 * 60 * 1000;
      }
      return true;
    });
  }, [studentOrders, spendingPeriod]);

  // Auto-switch to past orders or requested initial tab when opening
  useEffect(() => {
    if (!isOpen) return;
    if (initialTab) {
      setActiveTab(initialTab);
    } else if (activeOrders.length === 0 && completedOrders.length > 0) {
      setActiveTab('past');
    } else if (activeOrders.length === 0 && studentOrders.length > 0) {
      setActiveTab('all');
    }
  }, [isOpen, initialTab, activeOrders.length, completedOrders.length, studentOrders.length]);

  // Calculate spending habits and analytics
  const spendingAnalytics = useMemo(() => {
    const totalSpent = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const orderCount = completedOrders.length;
    const avgSpent = orderCount > 0 ? Math.round(totalSpent / orderCount) : 0;

    // Item spending breakdown
    const itemMap: Record<string, { count: number; spend: number }> = {};
    completedOrders.forEach(o => {
      o.items.forEach(item => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = { count: 0, spend: 0 };
        }
        itemMap[item.name].count += item.quantity;
        itemMap[item.name].spend += item.price * item.quantity;
      });
    });

    const sortedItems = Object.entries(itemMap)
      .map(([name, data]) => ({ name, count: data.count, spend: data.spend }))
      .sort((a, b) => b.spend - a.spend);

    const favoriteItem = sortedItems[0]
      ? `${sortedItems[0].name} (${sortedItems[0].count}x)`
      : 'None yet';

    const totalItems = completedOrders.reduce(
      (sum, o) => sum + o.items.reduce((iSum, i) => iSum + i.quantity, 0),
      0
    );

    return {
      totalSpent,
      orderCount,
      avgSpent,
      favoriteItem,
      totalItems,
      topItems: sortedItems.slice(0, 4)
    };
  }, [completedOrders]);

  const displayedOrders = useMemo(() => {
    if (activeTab === 'active') return activeOrders;
    if (activeTab === 'past') return completedOrders;
    return studentOrders;
  }, [activeTab, activeOrders, completedOrders, studentOrders]);

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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Collected & Completed</span>
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#102a23]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#fffdf8] rounded-2xl max-w-2xl w-full p-5 sm:p-7 relative shadow-2xl border border-[#e4e6df] max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#e4e6df]">
          <div>
            <div className="text-[10px] sm:text-[11px] font-bold text-[#126b55] uppercase tracking-wider flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5" />
              <span>DGU Student Dining Hub</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#16342e]">
              My Orders & Spending
            </h2>
            <p className="text-xs text-[#64736d] mt-0.5">
              Logged in as <strong className="text-[#16342e]">{currentUser.name}</strong>
              {currentUser.rollNo ? ` (${currentUser.rollNo})` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#64736d] hover:text-[#16342e] rounded-full hover:bg-[#f0eee6] transition-colors cursor-pointer"
            title="Close dashboard"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="flex border-b border-[#e4e6df] text-xs font-bold gap-1 sm:gap-2 pt-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2.5 px-3 sm:px-4 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'border-[#126b55] text-[#126b55] font-extrabold'
                : 'border-transparent text-[#64736d] hover:text-[#16342e]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Active Orders</span>
            {activeOrders.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#126b55] text-[#d9f04a] text-[10px] font-bold flex items-center justify-center animate-pulse">
                {activeOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('past')}
            className={`py-2.5 px-3 sm:px-4 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'past'
                ? 'border-[#126b55] text-[#126b55] font-extrabold'
                : 'border-transparent text-[#64736d] hover:text-[#16342e]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Past Orders & Spending</span>
            {completedOrders.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#ecfdf5] text-[#065f46] text-[10px] font-bold border border-[#a7f3d0]">
                ₹{spendingAnalytics.totalSpent}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`py-2.5 px-3 sm:px-4 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'border-[#126b55] text-[#126b55] font-extrabold'
                : 'border-transparent text-[#64736d] hover:text-[#16342e]'
            }`}
          >
            <ReceiptText className="w-3.5 h-3.5" />
            <span>All ({studentOrders.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* ==================== PAST ORDERS TAB: SPENDING HABITS & ANALYTICS ==================== */}
          {activeTab === 'past' && (
            <div className="space-y-4">
              {/* Spending Dashboard Card */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-[#126b55] to-[#0c4c3c] text-white rounded-xl shadow-md space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-[#d9f04a]" />
                    <h3 className="text-sm font-bold tracking-wide">
                      Your Meal Spending Habits
                    </h3>
                  </div>

                  {/* Time Filter Chips */}
                  <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setSpendingPeriod('7days')}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        spendingPeriod === '7days'
                          ? 'bg-[#d9f04a] text-[#16342e] font-bold shadow-xs'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpendingPeriod('30days')}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        spendingPeriod === '30days'
                          ? 'bg-[#d9f04a] text-[#16342e] font-bold shadow-xs'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      30 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpendingPeriod('all')}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        spendingPeriod === 'all'
                          ? 'bg-[#d9f04a] text-[#16342e] font-bold shadow-xs'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      All Time
                    </button>
                  </div>
                </div>

                {/* KPI Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
                  <div className="bg-white/10 p-2.5 rounded-lg backdrop-blur-xs">
                    <span className="block text-[10px] text-[#c9ddd6] uppercase tracking-wider font-semibold">
                      Total Spent
                    </span>
                    <span className="text-xl sm:text-2xl font-serif font-bold text-[#d9f04a]">
                      ₹{spendingAnalytics.totalSpent}
                    </span>
                  </div>

                  <div className="bg-white/10 p-2.5 rounded-lg backdrop-blur-xs">
                    <span className="block text-[10px] text-[#c9ddd6] uppercase tracking-wider font-semibold">
                      Meals Completed
                    </span>
                    <span className="text-xl sm:text-2xl font-serif font-bold text-white">
                      {spendingAnalytics.orderCount}
                    </span>
                  </div>

                  <div className="bg-white/10 p-2.5 rounded-lg backdrop-blur-xs">
                    <span className="block text-[10px] text-[#c9ddd6] uppercase tracking-wider font-semibold">
                      Avg. Per Order
                    </span>
                    <span className="text-xl sm:text-2xl font-serif font-bold text-white">
                      ₹{spendingAnalytics.avgSpent}
                    </span>
                  </div>

                  <div className="bg-white/10 p-2.5 rounded-lg backdrop-blur-xs">
                    <span className="block text-[10px] text-[#c9ddd6] uppercase tracking-wider font-semibold">
                      Favorite Meal
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#d9f04a] truncate block" title={spendingAnalytics.favoriteItem}>
                      {spendingAnalytics.favoriteItem}
                    </span>
                  </div>
                </div>

                {/* Top Ordered Items Breakdown */}
                {spendingAnalytics.topItems.length > 0 && (
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <span className="text-[11px] font-semibold text-[#c9ddd6] flex items-center gap-1.5">
                      <PieChart className="w-3.5 h-3.5 text-[#d9f04a]" />
                      <span>Top Meals by Spend:</span>
                    </span>
                    <div className="space-y-1.5">
                      {spendingAnalytics.topItems.map(item => {
                        const percent = spendingAnalytics.totalSpent > 0
                          ? Math.round((item.spend / spendingAnalytics.totalSpent) * 100)
                          : 0;
                        return (
                          <div key={item.name} className="space-y-0.5">
                            <div className="flex justify-between text-xs text-[#e8f1ed]">
                              <span className="truncate">{item.name} ({item.count}x)</span>
                              <span className="font-bold text-[#d9f04a]">₹{item.spend} ({percent}%)</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#d9f04a] rounded-full transition-all duration-300"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Section Header */}
              <div className="flex items-center justify-between pt-1">
                <h4 className="text-xs font-bold text-[#16342e] uppercase tracking-wider">
                  Completed Meal History ({completedOrders.length})
                </h4>
                <span className="text-[11px] text-[#64736d]">
                  {spendingPeriod === 'all'
                    ? 'All completed orders'
                    : spendingPeriod === '7days'
                    ? 'Orders from past 7 days'
                    : 'Orders from past 30 days'}
                </span>
              </div>
            </div>
          )}

          {/* ==================== ORDERS LIST (Active / Past / All) ==================== */}
          {displayedOrders.length === 0 ? (
            <div className="text-center py-12 px-4 bg-[#fbf9f4] rounded-xl border border-[#e4e6df] space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#ecfdf5] text-[#126b55] flex items-center justify-center mx-auto">
                {activeTab === 'past' ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <Clock className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#16342e]">
                  {activeTab === 'past'
                    ? 'No completed meals yet'
                    : activeTab === 'active'
                    ? 'No active orders in preparation'
                    : 'No orders placed yet'}
                </p>
                <p className="text-xs text-[#64736d] max-w-sm mx-auto leading-relaxed">
                  {activeTab === 'past'
                    ? 'Once your pre-orders are marked as collected at the DGU Central Canteen counter, your spending summary and meal history will appear here.'
                    : 'Pre-order from today’s menu to skip counter queues and collect your meal on time.'}
                </p>
              </div>

              {activeTab === 'past' && activeOrders.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('active')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#126b55] hover:bg-[#0b4c3b] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-[#d9f04a]" />
                  <span>View your {activeOrders.length} active order(s)</span>
                </button>
              )}

              {activeTab === 'active' && completedOrders.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('past')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#126b55] hover:bg-[#0b4c3b] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-[#d9f04a]" />
                  <span>View your past order history ({completedOrders.length} meals)</span>
                </button>
              )}

              {activeTab !== 'all' && studentOrders.length > 0 && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fffdf8] hover:bg-[#eae6d8] text-[#16342e] rounded-lg text-xs font-semibold border border-[#d9ded5] transition-colors cursor-pointer"
                  >
                    <ReceiptText className="w-3.5 h-3.5 text-[#126b55]" />
                    <span>Browse All ({studentOrders.length}) Orders Ever Placed</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            displayedOrders.map(order => (
              <div
                key={order.id}
                className="p-4 sm:p-5 bg-[#f7f4eb] rounded-xl border border-[#e4e6df] space-y-3 relative hover:border-[#126b55] transition-colors"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm sm:text-base bg-[#fffdf8] px-2.5 py-1 rounded-md border border-[#d9ded5] text-[#16342e]">
                      {order.token}
                    </span>
                    <span className="text-xs text-[#64736d] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#126b55]" />
                      <strong className="text-[#16342e]">DGU Central Canteen</strong>
                    </span>
                    {order.orderMode === 'delivery' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                        <Bike className="w-3 h-3 text-[#10b981]" />
                        <span>Campus Drop</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f7f4eb] text-[#64736d] border border-[#d9ded5]">
                        <ShoppingBag className="w-3 h-3 text-[#126b55]" />
                        <span>Counter Pickup</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status !== 'Picked up' && order.status !== 'Cancelled' && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-[#126b55] bg-[#e2ead1] px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#126b55] animate-ping" />
                        Live Real-Time
                      </span>
                    )}
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Items & Slot */}
                <div className="bg-[#fffdf8] p-3 rounded-lg border border-[#e2e4dc] space-y-2 text-xs">
                  <div className="font-semibold text-[#16342e]">
                    {order.items.map(i => `${i.quantity}x ${i.name} (₹${i.price * i.quantity})`).join(', ')}
                  </div>
                  <div className="flex flex-wrap justify-between items-center text-[#64736d] pt-1.5 border-t border-[#f0eee6] gap-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#126b55]" />
                      <span>Slot: <strong className="text-[#16342e]">{order.slotLabel}</strong></span>
                    </span>
                    <span>
                      Total Paid: <strong className="text-[#16342e] font-serif text-sm">₹{order.total}</strong> ({order.paymentStatus})
                    </span>
                  </div>
                  {order.deliveryLocation && (
                    <div className="text-[11px] text-[#065f46] bg-[#ecfdf5] p-2 rounded border border-[#a7f3d0] flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#10b981]" />
                        <span>Drop to: <strong>{order.deliveryLocation}</strong></span>
                      </span>
                      {order.deliveryPartnerName && (
                        <span className="text-[10px] text-[#047857] font-semibold">
                          Runner: {order.deliveryPartnerName}
                        </span>
                      )}
                    </div>
                  )}
                  {order.cutleryOptOut && (
                    <div className="text-[10px] text-[#15803d] flex items-center gap-1 font-medium">
                      <Leaf className="w-3 h-3 text-[#16a34a]" />
                      <span>Cutlery opted out for greener campus</span>
                    </div>
                  )}
                  {order.specialInstructions && (
                    <div className="text-[11px] text-[#8a9992] italic">
                      Kitchen note: "{order.specialInstructions}"
                    </div>
                  )}
                </div>

                {/* Status Guidance / Action */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                  {order.status === 'Ready' ? (
                    <div className="text-[#166534] font-bold flex items-center gap-1.5 bg-[#dcfce7] px-2.5 py-1 rounded-md">
                      <QrCode className="w-4 h-4" />
                      <span>Ready for collection! Head to DGU Central Canteen counter now.</span>
                    </div>
                  ) : order.status === 'Preparing' ? (
                    <span className="text-[#9a3412] text-xs font-medium flex items-center gap-1">
                      <span>🔥 Kitchen is cooking fresh portion. Ready in approx ~2–4 mins.</span>
                    </span>
                  ) : order.status === 'Picked up' ? (
                    <span className="text-[#64736d] text-[11px] sm:text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                      <span>
                        Collected on{' '}
                        {new Date(order.pickedUpAt || order.updatedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric'
                        })}{' '}
                        at{' '}
                        {new Date(order.pickedUpAt || order.updatedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </span>
                  ) : (
                    <span className="text-[#92400e] text-xs">
                      Order accepted by kitchen. Scheduled for {order.slotLabel}.
                    </span>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    {/* Live simulation controls */}
                    {order.status === 'Accepted' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Preparing')}
                        className="px-2.5 py-1 bg-[#ffedd5] text-[#9a3412] border border-[#fed7aa] rounded-md text-[11px] font-bold hover:bg-[#fed7aa] cursor-pointer"
                        title="Simulate kitchen prep"
                      >
                        ⚡ Cook Now
                      </button>
                    )}
                    {order.status === 'Preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Ready')}
                        className="px-2.5 py-1 bg-[#dcfce7] text-[#166534] border border-[#bbf7d0] rounded-md text-[11px] font-bold hover:bg-[#bbf7d0] cursor-pointer"
                        title="Simulate ready counter pass"
                      >
                        🟢 Mark Ready
                      </button>
                    )}
                    {order.status === 'Ready' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Picked up')}
                        className="px-2.5 py-1 bg-[#126b55] text-white rounded-md text-[11px] font-bold hover:bg-[#0b4c3b] cursor-pointer shadow-xs"
                      >
                        ✓ Mark Collected
                      </button>
                    )}

                    {/* Re-order Button */}
                    <button
                      onClick={() => onRepeatOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#eae6d8] text-[#126b55] rounded-md text-xs font-bold border border-[#d9ded5] transition-colors cursor-pointer shadow-2xs"
                      title="Re-order these same items"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-order</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

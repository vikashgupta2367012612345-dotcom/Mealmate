import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus, MealItem } from '../types';
import {
  UtensilsCrossed,
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  Flame,
  Check,
  X,
  ShieldCheck,
  Eye,
  Store,
  LogOut
} from 'lucide-react';

interface VendorDashboardProps {
  onBackToStudentPortal?: () => void;
}

export const VendorDashboard: React.FC<VendorDashboardProps> = ({ onBackToStudentPortal }) => {
  const {
    orders,
    meals,
    selectedKitchen,
    setSelectedKitchen,
    vendors,
    updateOrderStatus,
    restockMeal,
    toggleMealAvailability,
    addNewMeal,
    updateMeal,
    verifyPickupToken,
    showToast,
    logoutUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'analytics' | 'verify'>('orders');
  const [tokenInput, setTokenInput] = useState('');
  const [verifiedOrder, setVerifiedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'ready' | 'completed'>('active');

  // New Dish Modal State
  const [isAddDishOpen, setIsAddDishOpen] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishPrice, setNewDishPrice] = useState('99');
  const [newDishCategory, setNewDishCategory] = useState('Lunch');
  const [newDishType, setNewDishType] = useState<'veg' | 'non-veg'>('veg');
  const [newDishStock, setNewDishStock] = useState('20');
  const [newDishDesc, setNewDishDesc] = useState('');

  // Filter orders for the selected kitchen outlet
  const kitchenOrders = useMemo(() => {
    return orders.filter(
      o => !o.vendorName || o.vendorName === selectedKitchen || selectedKitchen === 'All Outlets'
    );
  }, [orders, selectedKitchen]);

  // Statistics
  const stats = useMemo(() => {
    const todayOrders = kitchenOrders.length;
    const pendingOrders = kitchenOrders.filter(o => o.status === 'Accepted').length;
    const preparingOrders = kitchenOrders.filter(o => o.status === 'Preparing').length;
    const readyOrders = kitchenOrders.filter(o => o.status === 'Ready' || o.status === 'Ready for Pickup').length;
    const completedOrders = kitchenOrders.filter(o => o.status === 'Collected' || o.status === 'Completed' || o.status === 'Picked up').length;
    const todayRevenue = kitchenOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      todayOrders,
      pendingOrders,
      preparingOrders,
      readyOrders,
      completedOrders,
      todayRevenue
    };
  }, [kitchenOrders]);

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'active') {
      return kitchenOrders.filter(o => o.status === 'Accepted' || o.status === 'Preparing');
    }
    if (orderFilter === 'ready') {
      return kitchenOrders.filter(o => o.status === 'Ready' || o.status === 'Ready for Pickup');
    }
    if (orderFilter === 'completed') {
      return kitchenOrders.filter(o => o.status === 'Collected' || o.status === 'Completed' || o.status === 'Picked up');
    }
    return kitchenOrders;
  }, [kitchenOrders, orderFilter]);

  const handleVerifyToken = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tokenInput.trim()) {
      showToast('Please enter a 5-digit token number (e.g. MM-48219)');
      return;
    }
    const order = verifyPickupToken(tokenInput);
    if (order) {
      setVerifiedOrder(order);
      showToast(`Token Verified: Order #${order.token} found for ${order.customerName}`);
    } else {
      setVerifiedOrder(null);
      showToast(`Invalid Token "${tokenInput}". No matching order found.`);
    }
  };

  const handleMarkCollected = (orderId: string) => {
    updateOrderStatus(orderId, 'Collected');
    setVerifiedOrder(null);
    setTokenInput('');
    showToast('Meal successfully handed over to student!');
  };

  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim()) {
      showToast('Please enter dish name.');
      return;
    }
    addNewMeal({
      name: newDishName.trim(),
      price: parseInt(newDishPrice, 10) || 80,
      category: newDishCategory as any,
      type: newDishType,
      dietaryType: newDishType === 'veg' ? 'pure_veg' : 'non_veg',
      available: parseInt(newDishStock, 10) || 15,
      initialStock: parseInt(newDishStock, 10) || 15,
      description: newDishDesc.trim() || 'Freshly prepared specialty dish.',
      vendorName: selectedKitchen,
      imageUrl: newDishType === 'veg' ? '/images/meals/paneer_butter_masala.jpg' : '/images/meals/chicken_biryani.jpg'
    });
    setIsAddDishOpen(false);
    setNewDishName('');
    setNewDishDesc('');
  };

  return (
    <div className="min-h-screen bg-[#FFF8E9] text-[#252D28] pb-16">
      {/* Top Vendor Banner */}
      <div className="bg-[#174D36] text-white px-4 py-4 shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3A64A] text-[#174D36] flex items-center justify-center font-bold shadow-sm">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-heading">Vendor Operations Hub</h1>
                <span className="bg-[#27864B] text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                </span>
              </div>
              <p className="text-xs text-white/80">
                DBS Global University · Campus Food Vendor Console
              </p>
            </div>
          </div>

          {/* Kitchen Selector & Switch Portal */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-xs">
              <Store className="w-4 h-4 text-[#F3A64A]" />
              <select
                value={selectedKitchen}
                onChange={(e) => setSelectedKitchen(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                {vendors.map(v => (
                  <option key={v.id} value={v.name} className="text-[#252D28] bg-white">
                    {v.name} ({v.isOpen ? 'Open' : 'Closed'})
                  </option>
                ))}
              </select>
            </div>

            {onBackToStudentPortal && (
              <button
                onClick={onBackToStudentPortal}
                className="px-3.5 py-1.5 rounded-xl bg-white text-[#174D36] hover:bg-[#FFF8E9] font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Exit to Student App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => logoutUser()}
              className="px-3.5 py-1.5 rounded-xl bg-[#D94848]/90 hover:bg-[#D94848] text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              title="Sign out of Vendor Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E7E9E3] shadow-xs">
            <span className="text-[11px] text-[#737B74] font-semibold block">Today's Revenue</span>
            <div className="text-2xl font-bold text-[#174D36] font-heading mt-1">₹{stats.todayRevenue}</div>
            <span className="text-[10px] text-[#27864B] font-bold">100% Verified</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E7E9E3] shadow-xs">
            <span className="text-[11px] text-[#737B74] font-semibold block">Total Orders</span>
            <div className="text-2xl font-bold text-[#252D28] font-heading mt-1">{stats.todayOrders}</div>
            <span className="text-[10px] text-[#737B74]">All active windows</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E7E9E3] shadow-xs">
            <span className="text-[11px] text-[#F3A64A] font-semibold block">Incoming (Accepted)</span>
            <div className="text-2xl font-bold text-[#F3A64A] font-heading mt-1">{stats.pendingOrders}</div>
            <span className="text-[10px] text-[#737B74]">Needs preparation</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E7E9E3] shadow-xs">
            <span className="text-[11px] text-[#174D36] font-semibold block">In Cooking (Preparing)</span>
            <div className="text-2xl font-bold text-[#174D36] font-heading mt-1">{stats.preparingOrders}</div>
            <span className="text-[10px] text-[#737B74]">On the burner</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E7E9E3] shadow-xs">
            <span className="text-[11px] text-[#27864B] font-semibold block">Ready for Pickup</span>
            <div className="text-2xl font-bold text-[#27864B] font-heading mt-1">{stats.readyOrders}</div>
            <span className="text-[10px] text-[#27864B] font-bold animate-pulse">At counter</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E7E9E3] shadow-xs">
            <span className="text-[11px] text-[#737B74] font-semibold block">Handed Over</span>
            <div className="text-2xl font-bold text-[#737B74] font-heading mt-1">{stats.completedOrders}</div>
            <span className="text-[10px] text-[#27864B]">Collected</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[#E7E9E3] pb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-[#174D36] text-white shadow-xs'
                  : 'bg-white text-[#737B74] hover:text-[#252D28] border border-[#E7E9E3]'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Live Orders Queue ({kitchenOrders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('verify')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'verify'
                  ? 'bg-[#174D36] text-white shadow-xs'
                  : 'bg-white text-[#737B74] hover:text-[#252D28] border border-[#E7E9E3]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#F3A64A]" />
              <span>Token Handover Validator</span>
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'menu'
                  ? 'bg-[#174D36] text-white shadow-xs'
                  : 'bg-white text-[#737B74] hover:text-[#252D28] border border-[#E7E9E3]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Menu & Stock Inventory</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-[#174D36] text-white shadow-xs'
                  : 'bg-white text-[#737B74] hover:text-[#252D28] border border-[#E7E9E3]'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Campus Analytics</span>
            </button>
          </div>

          {activeTab === 'menu' && (
            <button
              onClick={() => setIsAddDishOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#27864B] hover:bg-[#1f6b3b] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish</span>
            </button>
          )}
        </div>

        {/* TAB 1: LIVE ORDERS QUEUE */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter pills */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#737B74] font-medium mr-1">Filter view:</span>
              {(['active', 'ready', 'completed', 'all'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setOrderFilter(filter)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                    orderFilter === filter
                      ? 'bg-[#174D36] text-white'
                      : 'bg-white text-[#737B74] border border-[#E7E9E3] hover:border-[#75A879]'
                  }`}
                >
                  {filter} orders
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-[#E7E9E3] text-[#737B74]">
                <UtensilsCrossed className="w-10 h-10 mx-auto text-[#75A879] mb-2" />
                <h3 className="font-bold text-[#174D36] text-base">No orders in this state</h3>
                <p className="text-xs text-[#737B74] mt-1">
                  Incoming orders placed by students will appear in real time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map(order => {
                  const isAccepted = order.status === 'Accepted';
                  const isPreparing = order.status === 'Preparing';
                  const isReady = order.status === 'Ready' || order.status === 'Ready for Pickup';
                  const isCollected = order.status === 'Collected' || order.status === 'Completed' || order.status === 'Picked up';

                  return (
                    <div
                      key={order.id}
                      className={`bg-white rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
                        isReady
                          ? 'border-[#27864B] bg-[#27864B]/5 ring-2 ring-[#27864B]/20'
                          : isPreparing
                          ? 'border-[#F3A64A] bg-[#F3A64A]/5'
                          : 'border-[#E7E9E3]'
                      }`}
                    >
                      <div>
                        {/* Header: Token & Status */}
                        <div className="flex items-center justify-between pb-3 border-b border-[#E7E9E3]">
                          <div>
                            <span className="text-[11px] font-bold text-[#737B74] block">PICKUP TOKEN</span>
                            <span className="text-lg font-mono font-bold text-[#174D36]">{order.token}</span>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              isReady
                                ? 'bg-[#27864B] text-white animate-pulse'
                                : isPreparing
                                ? 'bg-[#F3A64A] text-[#174D36]'
                                : isCollected
                                ? 'bg-[#E7E9E3] text-[#737B74]'
                                : 'bg-[#174D36] text-white'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>

                        {/* Customer & Slot details */}
                        <div className="py-2.5 space-y-1 text-xs">
                          <div className="flex justify-between text-[#252D28]">
                            <span className="font-semibold">{order.customerName}</span>
                            <span className="text-[#737B74] font-mono">{order.customerRollNo}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#174D36] font-medium">
                            <Clock className="w-3.5 h-3.5 text-[#F3A64A]" />
                            <span>Slot: {order.slotLabel}</span>
                          </div>
                          {order.paymentMethod && (
                            <div className="text-[11px] text-[#737B74]">
                              Payment: <strong className="text-[#252D28]">{order.paymentMethod}</strong> (₹{order.total})
                            </div>
                          )}
                          {order.specialInstructions && (
                            <div className="p-2 bg-[#FFF8E9] rounded-lg text-[#174D36] text-[11px] border border-[#F3A64A]/40 mt-1">
                              <strong>Note:</strong> {order.specialInstructions}
                            </div>
                          )}
                        </div>

                        {/* Ordered Items list */}
                        <div className="py-2 border-t border-[#E7E9E3] space-y-1 text-xs">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[#252D28]">
                              <span className="font-medium">
                                {item.quantity}x {item.name} {item.portion ? `(${item.portion})` : ''}
                              </span>
                              <span className="text-[#737B74]">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 border-t border-[#E7E9E3] flex items-center gap-2 mt-2">
                        {isAccepted && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Preparing')}
                            className="flex-1 py-2 rounded-xl bg-[#F3A64A] hover:bg-[#e09235] text-[#174D36] font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Flame className="w-3.5 h-3.5" />
                            <span>Start Cooking</span>
                          </button>
                        )}

                        {isPreparing && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Ready')}
                            className="flex-1 py-2 rounded-xl bg-[#27864B] hover:bg-[#1f6b3b] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Ready for Pickup</span>
                          </button>
                        )}

                        {isReady && (
                          <button
                            onClick={() => handleMarkCollected(order.id)}
                            className="flex-1 py-2 rounded-xl bg-[#174D36] hover:bg-[#0f3625] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-[#F3A64A]" />
                            <span>Handover & Complete</span>
                          </button>
                        )}

                        {isCollected && (
                          <span className="text-center text-xs text-[#27864B] font-bold w-full py-1">
                            ✓ Collected by Student
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TOKEN HANDOVER VALIDATOR */}
        {activeTab === 'verify' && (
          <div className="max-w-xl mx-auto bg-white rounded-2xl p-6 border border-[#E7E9E3] shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-bold text-[#174D36] font-heading flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#F3A64A]" />
                <span>Instant Token Pickup Validator</span>
              </h2>
              <p className="text-xs text-[#737B74] mt-1">
                Enter the student's digital pickup token to verify order legitimacy and handover food.
              </p>
            </div>

            <form onSubmit={handleVerifyToken} className="flex gap-2">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                placeholder="e.g. MM-48219 or 48219"
                className="flex-1 px-4 py-3 rounded-xl border border-[#E7E9E3] font-mono text-base font-bold text-[#174D36] focus:outline-none focus:border-[#174D36] uppercase"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#174D36] hover:bg-[#0f3625] text-white font-bold text-sm cursor-pointer shadow-xs"
              >
                Verify Token
              </button>
            </form>

            {verifiedOrder && (
              <div className="p-4 bg-[#27864B]/10 rounded-2xl border border-[#27864B]/30 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#27864B] flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>VALID TOKEN · ORDER FOUND</span>
                  </span>
                  <span className="font-mono text-lg font-bold text-[#174D36]">{verifiedOrder.token}</span>
                </div>

                <div className="text-xs space-y-1 text-[#252D28]">
                  <div>Student: <strong>{verifiedOrder.customerName}</strong> ({verifiedOrder.customerRollNo})</div>
                  <div>Scheduled Slot: <strong>{verifiedOrder.slotLabel}</strong></div>
                  <div>Current Status: <strong className="text-[#174D36]">{verifiedOrder.status}</strong></div>
                  <div>Total Amount: <strong>₹{verifiedOrder.total}</strong> ({verifiedOrder.paymentStatus})</div>
                </div>

                <div className="border-t border-[#27864B]/20 pt-2 space-y-1 text-xs">
                  <div className="font-semibold text-[#174D36]">Meal Items to Hand Over:</div>
                  {verifiedOrder.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>• {i.quantity}x {i.name}</span>
                      <span>₹{i.price * i.quantity}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleMarkCollected(verifiedOrder.id)}
                  className="w-full py-3 rounded-xl bg-[#27864B] hover:bg-[#1f6b3b] text-white font-bold text-sm transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Handover & Complete Order</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MENU & STOCK INVENTORY */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#174D36] font-heading">
                Menu Management for {selectedKitchen}
              </h2>
              <span className="text-xs text-[#737B74]">
                {meals.filter(m => !m.vendorName || m.vendorName === selectedKitchen).length} active dishes listed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meals
                .filter(m => !m.vendorName || m.vendorName === selectedKitchen || selectedKitchen === 'All Outlets')
                .map(dish => {
                  const isAvailable = dish.available > 0;
                  return (
                    <div
                      key={dish.id}
                      className="bg-white rounded-2xl p-4 border border-[#E7E9E3] shadow-xs flex gap-3 items-start justify-between"
                    >
                      <img
                        src={dish.imageUrl || '/images/meals/thali_meal.jpg'}
                        alt={dish.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 bg-[#FFF8E9]"
                        onError={(e) => {
                          e.currentTarget.src = '/images/meals/thali_meal.jpg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              dish.type === 'veg' ? 'bg-[#27864B]' : 'bg-[#D94848]'
                            }`}
                          />
                          <h4 className="font-bold text-xs text-[#252D28] truncate">{dish.name}</h4>
                        </div>
                        <div className="text-xs text-[#174D36] font-bold mt-0.5">₹{dish.price}</div>
                        <div className="text-[11px] text-[#737B74] mt-0.5 flex items-center gap-2">
                          <span>Stock: <strong>{dish.available}</strong> portions</span>
                        </div>

                        {/* Quick controls */}
                        <div className="flex items-center gap-1.5 mt-2.5">
                          <button
                            onClick={() => restockMeal(dish.id, 5)}
                            className="px-2 py-1 rounded bg-[#FFF8E9] border border-[#E7E9E3] text-[10px] font-bold text-[#174D36] hover:bg-[#F3A64A]/20 cursor-pointer"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => restockMeal(dish.id, 10)}
                            className="px-2 py-1 rounded bg-[#FFF8E9] border border-[#E7E9E3] text-[10px] font-bold text-[#174D36] hover:bg-[#F3A64A]/20 cursor-pointer"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => toggleMealAvailability(dish.id)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              isAvailable
                                ? 'bg-[#D94848]/10 text-[#D94848] hover:bg-[#D94848]/20'
                                : 'bg-[#27864B]/10 text-[#27864B] hover:bg-[#27864B]/20'
                            }`}
                          >
                            {isAvailable ? 'Mark Sold Out' : 'Mark Available'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 4: OPERATIONAL ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E7E9E3] shadow-xs">
                <h3 className="font-bold text-xs text-[#737B74] uppercase tracking-wide">
                  Peak Ordering Hours
                </h3>
                <div className="space-y-2 mt-3">
                  <div className="flex justify-between text-xs">
                    <span>12:30 PM - 01:30 PM (Lunch Rush)</span>
                    <strong className="text-[#174D36]">48% volume</strong>
                  </div>
                  <div className="w-full bg-[#FFF8E9] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#174D36] h-full w-[48%]" />
                  </div>

                  <div className="flex justify-between text-xs pt-2">
                    <span>08:15 AM - 09:30 AM (Breakfast)</span>
                    <strong className="text-[#F3A64A]">24% volume</strong>
                  </div>
                  <div className="w-full bg-[#FFF8E9] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#F3A64A] h-full w-[24%]" />
                  </div>

                  <div className="flex justify-between text-xs pt-2">
                    <span>04:30 PM - 06:00 PM (Snacks & Tea)</span>
                    <strong className="text-[#75A879]">18% volume</strong>
                  </div>
                  <div className="w-full bg-[#FFF8E9] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#75A879] h-full w-[18%]" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E7E9E3] shadow-xs">
                <h3 className="font-bold text-xs text-[#737B74] uppercase tracking-wide">
                  Top Campus Sellers
                </h3>
                <div className="space-y-2.5 mt-3 text-xs">
                  <div className="flex justify-between items-center pb-1.5 border-b border-[#E7E9E3]">
                    <span className="font-semibold text-[#252D28]">1. Rajma Chawal Canteen Bowl</span>
                    <span className="text-[#27864B] font-bold">142 orders</span>
                  </div>
                  <div className="flex justify-between items-center pb-1.5 border-b border-[#E7E9E3]">
                    <span className="font-semibold text-[#252D28]">2. Paneer Butter Masala Thali</span>
                    <span className="text-[#27864B] font-bold">98 orders</span>
                  </div>
                  <div className="flex justify-between items-center pb-1.5 border-b border-[#E7E9E3]">
                    <span className="font-semibold text-[#252D28]">3. Desi Masala Chai & Samosa</span>
                    <span className="text-[#27864B] font-bold">86 orders</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#252D28]">4. Chole Bhature Special</span>
                    <span className="text-[#27864B] font-bold">74 orders</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E7E9E3] shadow-xs">
                <h3 className="font-bold text-xs text-[#737B74] uppercase tracking-wide">
                  Queue Efficiency Metric
                </h3>
                <div className="space-y-3 mt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span>Average Prep Time:</span>
                    <strong className="text-[#174D36]">4.8 minutes</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Order Queue Clearance Rate:</span>
                    <strong className="text-[#27864B]">98.2% on-time</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Student Pickup Punctuality:</span>
                    <strong className="text-[#174D36]">94% collected in window</strong>
                  </div>
                  <div className="p-3 bg-[#FFF8E9] rounded-xl text-[11px] text-[#174D36] border border-[#F3A64A]/30">
                    💡 <strong>Smart Pre-Ordering:</strong> MealMate has reduced canteen queue wait times at DGU from 22 mins to under 2 mins!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add New Dish Modal */}
      {isAddDishOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFF8E9] rounded-2xl max-w-md w-full p-6 border border-[#E7E9E3] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#174D36] font-heading">
                Add Dish to {selectedKitchen}
              </h3>
              <button
                onClick={() => setIsAddDishOpen(false)}
                className="w-7 h-7 rounded-full bg-white text-[#737B74] flex items-center justify-center hover:bg-[#E7E9E3] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDish} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#252D28] block mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  placeholder="e.g. Masala Dosa with Sambar"
                  className="w-full p-2.5 rounded-xl bg-white border border-[#E7E9E3] text-[#252D28] focus:border-[#174D36] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#252D28] block mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={newDishPrice}
                    onChange={(e) => setNewDishPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E7E9E3] text-[#252D28] focus:border-[#174D36] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#252D28] block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newDishStock}
                    onChange={(e) => setNewDishStock(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E7E9E3] text-[#252D28] focus:border-[#174D36] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#252D28] block mb-1">Category</label>
                  <select
                    value={newDishCategory}
                    onChange={(e) => setNewDishCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E7E9E3] text-[#252D28] focus:border-[#174D36] focus:outline-none"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Quick Bites">Quick Bites</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#252D28] block mb-1">Dietary Type</label>
                  <select
                    value={newDishType}
                    onChange={(e) => setNewDishType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E7E9E3] text-[#252D28] focus:border-[#174D36] focus:outline-none"
                  >
                    <option value="veg">Pure Vegetarian (Green)</option>
                    <option value="non-veg">Non-Vegetarian (Red)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#252D28] block mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={newDishDesc}
                  onChange={(e) => setNewDishDesc(e.target.value)}
                  placeholder="Ingredients, preparation style or sides included"
                  className="w-full p-2.5 rounded-xl bg-white border border-[#E7E9E3] text-[#252D28] focus:border-[#174D36] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#174D36] hover:bg-[#0f3625] text-white font-bold text-xs shadow-xs cursor-pointer mt-2"
              >
                Add Dish to Menu
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

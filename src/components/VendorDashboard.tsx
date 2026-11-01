import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import {
  ChefHat,
  Clock,
  CheckCircle,
  Plus,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Package,
  Layers,
  UtensilsCrossed,
  Filter,
  Check,
  BellRing
} from 'lucide-react';

interface VendorDashboardProps {
  onClose: () => void;
}

export const VendorDashboard: React.FC<VendorDashboardProps> = ({ onClose }) => {
  const {
    orders,
    meals,
    slots,
    selectedKitchen,
    setSelectedKitchen,
    updateOrderStatus,
    restockMeal,
    toggleMealAvailability,
    addNewMeal,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'slots'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'ready' | 'completed'>('active');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState(89);
  const [newItemEmoji, setNewItemEmoji] = useState('🍱');
  const [newItemPortions, setNewItemPortions] = useState(10);
  const [newItemType, setNewItemType] = useState<'veg' | 'quick' | 'protein' | 'drinks'>('veg');

  // Filter orders for the selected kitchen (or show all if multi-kitchen view)
  const kitchenOrders = orders.filter(
    o => o.vendorName === selectedKitchen || o.items.some(i => i.vendorName === selectedKitchen)
  );

  const displayedOrders = kitchenOrders.filter(o => {
    if (orderFilter === 'active') return o.status === 'Accepted' || o.status === 'Preparing';
    if (orderFilter === 'ready') return o.status === 'Ready';
    if (orderFilter === 'completed') return o.status === 'Picked up';
    return true;
  });

  const kitchenMeals = meals.filter(m => m.vendorName === selectedKitchen);

  // Financial and operational KPI calculations
  const totalSales = kitchenOrders.reduce((sum, o) => sum + o.total, 0);
  const readyCount = kitchenOrders.filter(o => o.status === 'Ready').length;
  const preparingCount = kitchenOrders.filter(o => o.status === 'Preparing').length;
  const acceptedCount = kitchenOrders.filter(o => o.status === 'Accepted').length;

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    addNewMeal({
      name: newItemName.trim(),
      price: Number(newItemPrice),
      emoji: newItemEmoji.trim() || '🍱',
      type: newItemType,
      available: Number(newItemPortions),
      vendorName: selectedKitchen,
      tag: 'NEW TODAY'
    });
    setNewItemName('');
    setIsAddingItem(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#102a23]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#fffdf8] rounded-xl max-w-5xl w-full p-5 sm:p-8 relative shadow-2xl border border-[#e4e6df] max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e4e6df] gap-3">
          <div>
            <div className="text-[11px] font-bold text-[#126b55] uppercase tracking-wider flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 text-[#126b55]" />
              <span>Campus Vendor Portal · Canteen Demand Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#16342e]">
              {selectedKitchen}
            </h2>
            <p className="text-xs text-[#64736d]">
              Live demand coordination, kitchen prep queue, and inventory control.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Kitchen Switcher */}
            <select
              value={selectedKitchen}
              onChange={e => setSelectedKitchen(e.target.value)}
              className="p-2 text-xs font-semibold bg-[#f7f4eb] border border-[#d9ded5] rounded-md text-[#16342e] focus:outline-none focus:border-[#126b55]"
            >
              <option value="Green Leaf Canteen">Green Leaf Canteen</option>
              <option value="North Block Café">North Block Café</option>
              <option value="South Square">South Square</option>
            </select>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#f0eee6] hover:bg-[#e4e6df] text-[#16342e] flex items-center justify-center font-bold text-base"
              aria-label="Close dashboard"
            >
              ×
            </button>
          </div>
        </div>

        {/* Dashboard KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
          <div className="bg-[#f7f4eb] p-3.5 rounded-lg border border-[#e4e6df]">
            <span className="text-[11px] text-[#64736d] block font-semibold">Today’s Orders</span>
            <div className="text-2xl font-serif font-bold text-[#16342e]">
              {kitchenOrders.length}
            </div>
            <span className="text-[10px] text-[#126b55] font-semibold">
              {acceptedCount} pending · {preparingCount} prep
            </span>
          </div>

          <div className="bg-[#f7f4eb] p-3.5 rounded-lg border border-[#e4e6df]">
            <span className="text-[11px] text-[#64736d] block font-semibold">Ready for Pickup</span>
            <div className="text-2xl font-serif font-bold text-[#166534] flex items-center gap-1.5">
              <span>{readyCount}</span>
              {readyCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] animate-ping" />}
            </div>
            <span className="text-[10px] text-[#64736d]">Awaiting student collection</span>
          </div>

          <div className="bg-[#f7f4eb] p-3.5 rounded-lg border border-[#e4e6df]">
            <span className="text-[11px] text-[#64736d] block font-semibold">Gross Demand</span>
            <div className="text-2xl font-serif font-bold text-[#16342e]">
              ₹{totalSales}
            </div>
            <span className="text-[10px] text-[#126b55] font-semibold">
              Net platform cut ~10% (₹{Math.round(totalSales * 0.1)})
            </span>
          </div>

          <div className="bg-[#f7f4eb] p-3.5 rounded-lg border border-[#e4e6df]">
            <span className="text-[11px] text-[#64736d] block font-semibold">Peak Rush Slot</span>
            <div className="text-2xl font-serif font-bold text-[#f5a623]">
              12:40 PM
            </div>
            <span className="text-[10px] text-[#64736d]">Capped to prevent queue</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#e4e6df] text-xs font-semibold gap-6 pt-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'orders'
                ? 'text-[#126b55] font-bold border-b-2 border-[#126b55]'
                : 'text-[#64736d] hover:text-[#16342e]'
            }`}
          >
            Live Orders Queue ({kitchenOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'inventory'
                ? 'text-[#126b55] font-bold border-b-2 border-[#126b55]'
                : 'text-[#64736d] hover:text-[#16342e]'
            }`}
          >
            Menu Stock & Inventory ({kitchenMeals.length} items)
          </button>
          <button
            onClick={() => setActiveTab('slots')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'slots'
                ? 'text-[#126b55] font-bold border-b-2 border-[#126b55]'
                : 'text-[#64736d] hover:text-[#16342e]'
            }`}
          >
            Pickup Slots & Capacity Meter
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* TAB 1: LIVE ORDERS QUEUE */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Order Status Filters */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrderFilter('active')}
                    className={`px-3 py-1 rounded-full ${
                      orderFilter === 'active'
                        ? 'bg-[#16342e] text-[#d9f04a] font-bold'
                        : 'bg-[#f0eee6] text-[#64736d]'
                    }`}
                  >
                    To Prepare ({kitchenOrders.filter(o => o.status === 'Accepted' || o.status === 'Preparing').length})
                  </button>
                  <button
                    onClick={() => setOrderFilter('ready')}
                    className={`px-3 py-1 rounded-full ${
                      orderFilter === 'ready'
                        ? 'bg-[#126b55] text-white font-bold'
                        : 'bg-[#f0eee6] text-[#64736d]'
                    }`}
                  >
                    Ready for Pickup ({readyCount})
                  </button>
                  <button
                    onClick={() => setOrderFilter('completed')}
                    className={`px-3 py-1 rounded-full ${
                      orderFilter === 'completed'
                        ? 'bg-[#16342e] text-[#d9f04a] font-bold'
                        : 'bg-[#f0eee6] text-[#64736d]'
                    }`}
                  >
                    Picked Up
                  </button>
                  <button
                    onClick={() => setOrderFilter('all')}
                    className={`px-3 py-1 rounded-full ${
                      orderFilter === 'all'
                        ? 'bg-[#16342e] text-[#d9f04a] font-bold'
                        : 'bg-[#f0eee6] text-[#64736d]'
                    }`}
                  >
                    All ({kitchenOrders.length})
                  </button>
                </div>

                <div className="text-[11px] text-[#64736d]">
                  Click buttons to advance order state in real time.
                </div>
              </div>

              {/* Orders List */}
              {displayedOrders.length === 0 ? (
                <div className="text-center py-12 bg-[#f7f4eb] rounded-lg border border-dashed border-[#d9ded5]">
                  <UtensilsCrossed className="w-8 h-8 text-[#a4aca6] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-[#16342e]">No orders in this state</p>
                  <p className="text-xs text-[#64736d]">
                    New pre-orders placed by DGU students will pop up here live.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayedOrders.map(order => (
                    <div
                      key={order.id}
                      className="p-4 bg-[#f7f4eb] rounded-lg border border-[#e4e6df] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#126b55] transition-all"
                    >
                      {/* Left: Token & Items */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm bg-[#16342e] text-[#d9f04a] px-2.5 py-0.5 rounded">
                            {order.token}
                          </span>
                          <span className="text-xs font-bold text-[#16342e]">
                            {order.customerName}
                          </span>
                          {order.customerRollNo && (
                            <span className="text-[11px] text-[#64736d] bg-[#fffdf8] px-1.5 py-0.5 rounded border border-[#d9ded5]">
                              {order.customerRollNo}
                            </span>
                          )}
                          <span className="text-xs text-[#126b55] font-semibold ml-auto sm:ml-0">
                            Slot: {order.slotLabel}
                          </span>
                        </div>

                        <div className="text-xs text-[#16342e] font-medium">
                          {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>

                        {order.specialInstructions && (
                          <div className="text-[11px] text-[#b45309] font-medium">
                            Kitchen note: "{order.specialInstructions}"
                          </div>
                        )}

                        <div className="text-[11px] text-[#64736d] flex items-center gap-2">
                          <span>Total: ₹{order.total} ({order.paymentStatus})</span>
                          <span>•</span>
                          <span>Placed {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {/* Right: Status Advance Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {order.status === 'Accepted' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Preparing')}
                            className="px-3.5 py-2 bg-[#f5a623] hover:bg-[#d9822b] text-[#16342e] font-bold text-xs rounded-md shadow-xs flex items-center gap-1.5"
                          >
                            <span>Start Prep 🔥</span>
                          </button>
                        )}

                        {order.status === 'Preparing' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Ready')}
                            className="px-3.5 py-2 bg-[#126b55] hover:bg-[#0b4c3b] text-white font-bold text-xs rounded-md shadow-xs flex items-center gap-1.5"
                          >
                            <BellRing className="w-3.5 h-3.5 text-[#d9f04a]" />
                            <span>Mark Ready 🟢</span>
                          </button>
                        )}

                        {order.status === 'Ready' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Picked up')}
                            className="px-3.5 py-2 bg-[#16342e] hover:bg-[#0b4c3b] text-[#d9f04a] font-bold text-xs rounded-md shadow-xs flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark Picked Up ☑️</span>
                          </button>
                        )}

                        {order.status === 'Picked up' && (
                          <span className="text-xs font-semibold text-[#166534] bg-[#dcfce7] px-3 py-1.5 rounded-md flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Collected</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MENU STOCK & INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#16342e]">
                    Daily Counter Availability ({selectedKitchen})
                  </h3>
                  <p className="text-xs text-[#64736d]">
                    Update remaining portions or toggle sold out items instantly.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingItem(!isAddingItem)}
                  className="px-3 py-1.5 bg-[#126b55] hover:bg-[#0b4c3b] text-white text-xs font-bold rounded-md flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-[#d9f04a]" />
                  <span>{isAddingItem ? 'Cancel' : 'Add New Item'}</span>
                </button>
              </div>

              {/* Add New Item Form */}
              {isAddingItem && (
                <form onSubmit={handleCreateNewItem} className="p-4 bg-[#f7f4eb] rounded-lg border border-[#d9ded5] space-y-3">
                  <h4 className="text-xs font-bold text-[#16342e] uppercase tracking-wider">
                    Add Campus Special to {selectedKitchen}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-[#64736d] mb-1">Item Name</label>
                      <input
                        type="text"
                        value={newItemName}
                        onChange={e => setNewItemName(e.target.value)}
                        required
                        placeholder="e.g., Paneer Bhurji Pav"
                        className="w-full p-2 bg-white border border-[#d9ded5] rounded-md text-[#16342e]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#64736d] mb-1">Price (₹)</label>
                      <input
                        type="number"
                        value={newItemPrice}
                        onChange={e => setNewItemPrice(Number(e.target.value))}
                        required
                        className="w-full p-2 bg-white border border-[#d9ded5] rounded-md text-[#16342e]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#64736d] mb-1">Emoji Icon</label>
                      <input
                        type="text"
                        value={newItemEmoji}
                        onChange={e => setNewItemEmoji(e.target.value)}
                        className="w-full p-2 bg-white border border-[#d9ded5] rounded-md text-[#16342e]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#64736d] mb-1">Initial Portions</label>
                      <input
                        type="number"
                        value={newItemPortions}
                        onChange={e => setNewItemPortions(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-[#d9ded5] rounded-md text-[#16342e]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#16342e] text-[#d9f04a] text-xs font-bold rounded-md"
                  >
                    Save & Publish to Menu
                  </button>
                </form>
              )}

              {/* Items Table */}
              <div className="divide-y divide-[#e4e6df] border border-[#e4e6df] rounded-lg overflow-hidden bg-white">
                {kitchenMeals.map(meal => (
                  <div
                    key={meal.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#faf9f5]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-md overflow-hidden bg-[#e8dac5] shrink-0 border border-[#d9ded5] relative">
                        {meal.imageUrl ? (
                          <img
                            src={meal.imageUrl}
                            alt={meal.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="w-full h-full flex items-center justify-center text-lg">
                            {meal.emoji}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-[#16342e]">{meal.name}</strong>
                          <span className="text-xs font-serif font-bold text-[#126b55]">₹{meal.price}</span>
                        </div>
                        <p className="text-xs text-[#64736d]">
                          {meal.available > 0 ? (
                            <span className="text-[#166534] font-medium">{meal.available} portions ready</span>
                          ) : (
                            <span className="text-[#991b1b] font-medium">Sold Out</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => restockMeal(meal.id, 5)}
                        className="px-2.5 py-1.5 bg-[#f0eee6] hover:bg-[#e4e6df] text-[#16342e] text-xs font-bold rounded-md"
                      >
                        +5 portions
                      </button>
                      <button
                        onClick={() => restockMeal(meal.id, 10)}
                        className="px-2.5 py-1.5 bg-[#f0eee6] hover:bg-[#e4e6df] text-[#16342e] text-xs font-bold rounded-md"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => toggleMealAvailability(meal.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md ${
                          meal.available > 0
                            ? 'bg-[#fee2e2] text-[#991b1b] hover:bg-[#fecaca]'
                            : 'bg-[#dcfce7] text-[#166534] hover:bg-[#bbf7d0]'
                        }`}
                      >
                        {meal.available > 0 ? 'Mark Sold Out' : 'Mark In Stock'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PICKUP SLOTS & CAPACITY METER */}
          {activeTab === 'slots' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#16342e]">
                  Pickup Slot Demand Balancing
                </h3>
                <p className="text-xs text-[#64736d]">
                  Capping slots at 8 meals per 10-minute window keeps median pickup waits below 7 minutes.
                </p>
              </div>

              <div className="space-y-3">
                {slots.map(s => {
                  const percent = Math.min(100, Math.round((s.reserved / s.capacity) * 100));
                  const isFull = s.reserved >= s.capacity;
                  return (
                    <div
                      key={s.id}
                      className="p-4 bg-[#f7f4eb] rounded-lg border border-[#e4e6df] space-y-2"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#126b55]" />
                          <strong className="text-sm text-[#16342e]">{s.label}</strong>
                          {s.isPeak && (
                            <span className="text-[10px] bg-[#fef3c7] text-[#92400e] font-bold px-2 py-0.5 rounded border border-[#fde68a]">
                              Peak Lecture End
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-[#16342e]">
                          {s.reserved} / {s.capacity} meals booked ({percent}%)
                        </span>
                      </div>

                      <div className="h-2.5 w-full bg-[#e2e4dc] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isFull
                              ? 'bg-[#ef4444]'
                              : percent > 70
                              ? 'bg-[#f5a623]'
                              : 'bg-[#126b55]'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] text-[#64736d]">
                        <span>Remaining Counter Capacity: {Math.max(0, s.capacity - s.reserved)} orders</span>
                        <span>{isFull ? '🔴 Capacity Full' : '🟢 Accepting Pre-Orders'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

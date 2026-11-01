import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MealItem, PickupSlot, Order, OrderStatus, UserProfile } from '../types';
import { STARTER_MEALS, STARTER_SLOTS, INITIAL_ORDERS, VENTURE_BLUEPRINT } from '../data/initialData';
import {
  calculateCanteenSchedule,
  CanteenScheduleInfo,
  ScheduleMode,
  generateUpcomingSlots
} from '../utils/canteenSchedule';

interface CartItem {
  meal: MealItem;
  quantity: number;
}

interface AppContextType {
  meals: MealItem[];
  slots: PickupSlot[];
  cart: CartItem[];
  orders: Order[];
  currentUser: UserProfile;
  activeRole: 'student' | 'vendor' | 'quest';
  selectedKitchen: string;
  selectedSlotId: string;
  latestPlacedOrder: Order | null;
  isLoggedIn: boolean;
  loginUser: (emailOrRoll: string, password?: string) => boolean;
  registerUser: (userData: { name: string; rollNo: string; email: string; hostelBlock?: string; password?: string }) => void;
  logoutUser: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  setSelectedSlotId: (slotId: string) => void;
  setSelectedKitchen: (kitchen: string) => void;
  setActiveRole: (role: 'student' | 'vendor' | 'quest') => void;
  addToCart: (mealId: string) => boolean;
  removeFromCart: (mealId: string) => void;
  updateCartQuantity: (mealId: string, delta: number) => void;
  clearCart: () => void;
  placePreOrder: (slotId: string, instructions?: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  restockMeal: (mealId: string, portions: number) => void;
  toggleMealAvailability: (mealId: string) => void;
  addNewMeal: (item: Partial<MealItem>) => void;
  switchUserRole: (role: 'student' | 'vendor' | 'quest', vendorName?: string) => void;
  resetAllData: () => void;
  importBackup: (jsonData: any) => boolean;
  exportBackup: () => any;
  setLatestPlacedOrder: (order: Order | null) => void;
  canteenSchedule: CanteenScheduleInfo;
  setScheduleMode: (mode: ScheduleMode) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Play an audible pleasant collection chime when status becomes "Ready"
function playChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    // Ignore audio autostart restrictions
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meals, setMeals] = useState<MealItem[]>(() => {
    // Purge older stale cache versions so broken URLs and legacy canteens are completely eliminated
    [
      'mm_meals', 'mm_meals_v1', 'mm_meals_v2', 'mm_meals_v3', 'mm_meals_v4',
      'mm_meals_v5', 'mm_meals_v6', 'mm_meals_v7', 'mm_meals_v8', 'mm_meals_v9',
      'mm_meals_v10', 'mm_meals_v11'
    ].forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });

    const saved = localStorage.getItem('mm_meals_v12');
    if (saved) {
      try {
        const parsed: MealItem[] = JSON.parse(saved);
        const starterMap = new Map(STARTER_MEALS.map(m => [m.id, m]));
        return parsed.map((m) => {
          const fresh = starterMap.get(m.id);
          return fresh
            ? {
                ...m,
                name: fresh.name,
                imageUrl: fresh.imageUrl,
                description: fresh.description,
                tag: fresh.tag,
                emoji: fresh.emoji,
                vendorName: 'DGU Central Canteen'
              }
            : {
                ...m,
                vendorName: 'DGU Central Canteen'
              };
        });
      } catch (e) {
        return STARTER_MEALS.map(m => ({ ...m, vendorName: 'DGU Central Canteen' }));
      }
    }
    return STARTER_MEALS.map(m => ({ ...m, vendorName: 'DGU Central Canteen' }));
  });

  // Real-Time Canteen Operating Hours State (10:00 AM – 11:00 PM Everyday)
  const [scheduleMode, setScheduleModeState] = useState<ScheduleMode>(() => {
    try {
      const saved = localStorage.getItem('mm_canteen_mode');
      if (saved === 'simulate_open' || saved === 'simulate_closed') return saved;
    } catch (e) {}
    return 'realtime';
  });

  const [canteenSchedule, setCanteenSchedule] = useState<CanteenScheduleInfo>(() =>
    calculateCanteenSchedule(new Date(), scheduleMode)
  );

  const [slots, setSlots] = useState<PickupSlot[]>(() => {
    // Purge outdated static slots cache
    try {
      localStorage.removeItem('mm_slots');
      localStorage.removeItem('mm_slots_v2');
    } catch (e) {}
    return generateUpcomingSlots(new Date(), scheduleMode);
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try { localStorage.removeItem('mm_cart'); } catch (e) {}
    const saved = localStorage.getItem('mm_cart_v2');
    if (saved) {
      try {
        const parsed: CartItem[] = JSON.parse(saved);
        return parsed.map(c => ({
          ...c,
          meal: { ...c.meal, vendorName: 'DGU Central Canteen' }
        }));
      } catch (e) {}
    }
    return [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    // Purge legacy orders that might contain outdated canteen names
    try { localStorage.removeItem('mm_orders'); } catch (e) {}
    const saved = localStorage.getItem('mm_orders_v2');
    if (saved) {
      try {
        const parsed: Order[] = JSON.parse(saved);
        return parsed.map(o => ({
          ...o,
          vendorName: 'DGU Central Canteen',
          items: (o.items || []).map(i => ({ ...i, vendorName: 'DGU Central Canteen' }))
        }));
      } catch (e) {}
    }
    return INITIAL_ORDERS.map(o => ({
      ...o,
      vendorName: 'DGU Central Canteen',
      items: (o.items || []).map(i => ({ ...i, vendorName: 'DGU Central Canteen' }))
    }));
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('mm_user_auth_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          assignedVendor: 'DGU Central Canteen'
        };
      } catch (e) {
        // Fall through
      }
    }
    return {
      uid: 'user-guest',
      name: 'Guest Student',
      email: 'student@dgu.ac.in',
      rollNo: '',
      role: 'student',
      savedOrdersCount: 0,
      hostelBlock: 'Campus Hostels',
      isLoggedIn: false
    };
  });

  const isLoggedIn = !!currentUser.isLoggedIn;

  const [activeRole, setActiveRole] = useState<'student' | 'vendor' | 'quest'>('student');
  const [selectedKitchen, setSelectedKitchen] = useState<string>('DGU Central Canteen');
  const [selectedSlotId, setSelectedSlotId] = useState<string>(() => {
    const initialSlots = generateUpcomingSlots(new Date(), scheduleMode);
    return initialSlots[0]?.id || 'slot-current';
  });
  const [latestPlacedOrder, setLatestPlacedOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3200);
  }, []);

  const setScheduleMode = useCallback((mode: ScheduleMode) => {
    setScheduleModeState(mode);
    try {
      localStorage.setItem('mm_canteen_mode', mode);
    } catch (e) {}
    const now = new Date();
    const updated = calculateCanteenSchedule(now, mode);
    setCanteenSchedule(updated);

    const freshSlots = generateUpcomingSlots(now, mode);
    setSlots(freshSlots);
    if (freshSlots[0]) {
      setSelectedSlotId(freshSlots[0].id);
    }

    if (mode === 'simulate_open') {
      showToast('Simulation: DGU Central Canteen forced OPEN (10:00 AM – 11:00 PM)');
    } else if (mode === 'simulate_closed') {
      showToast('Simulation: DGU Central Canteen forced CLOSED (Opens 10:00 AM)');
    } else {
      showToast(`Real-Time Clock Active: Canteen is currently ${updated.isOpen ? 'OPEN' : 'CLOSED'}`);
    }
  }, [showToast]);

  // Dynamic real-time schedule & slot ticker:
  // Automatically calculates upcoming windows as actual real time rolls forward
  useEffect(() => {
    const updateScheduleAndSlots = () => {
      const now = new Date();
      setCanteenSchedule(calculateCanteenSchedule(now, scheduleMode));

      const freshSlots = generateUpcomingSlots(now, scheduleMode);
      setSlots(prevSlots => {
        // If immediate next slot moved (e.g. from 4:45-5:00 to 5:00-5:15), update slots
        if (!prevSlots.length || prevSlots[0]?.id !== freshSlots[0]?.id || prevSlots[0]?.label !== freshSlots[0]?.label) {
          return freshSlots;
        }
        return prevSlots;
      });
    };
    updateScheduleAndSlots();
    const interval = setInterval(updateScheduleAndSlots, 10000);
    return () => clearInterval(interval);
  }, [scheduleMode]);

  // Keep selectedSlotId valid whenever slots update
  useEffect(() => {
    if (slots.length > 0 && !slots.some(s => s.id === selectedSlotId)) {
      setSelectedSlotId(slots[0].id);
    }
  }, [slots, selectedSlotId]);

  const loginUser = useCallback((identifier: string, password?: string): boolean => {
    const trimmed = identifier.trim();
    if (!trimmed) return false;
    const isEmail = trimmed.includes('@');
    const isPhone = /^[0-9+ -]{10,14}$/.test(trimmed);

    let name = 'Vikash Kumar Gupta';
    let rollNo = '0251MBA621';
    let email = 'vikash.0251mba621@dgu.ac.in';

    if (isEmail) {
      email = trimmed.toLowerCase();
      const prefix = trimmed.split('@')[0];
      name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    } else if (isPhone) {
      rollNo = '0251MBA621';
      email = `student.${trimmed.slice(-4)}@dgu.ac.in`;
      name = 'Vikash Kumar Gupta';
    } else {
      rollNo = trimmed.toUpperCase();
      email = `${trimmed.toLowerCase()}@dgu.ac.in`;
      name = trimmed.toUpperCase() === '0251MBA621' ? 'Vikash Kumar Gupta' : `Student (${trimmed.toUpperCase()})`;
    }

    const updated: UserProfile = {
      uid: currentUser.uid && currentUser.uid !== 'user-guest' ? currentUser.uid : `user-${Date.now()}`,
      name: currentUser.name && currentUser.name !== 'Guest Student' ? currentUser.name : name,
      rollNo,
      email,
      role: 'student',
      savedOrdersCount: Math.max(1, currentUser.savedOrdersCount || 1),
      hostelBlock: currentUser.hostelBlock || 'Hostel Block B',
      isLoggedIn: true
    };
    setCurrentUser(updated);
    localStorage.setItem('mm_user_auth_v1', JSON.stringify(updated));
    showToast(`Welcome back, ${updated.name.split(' ')[0]}!`);
    return true;
  }, [currentUser, showToast]);

  const registerUser = useCallback((userData: {
    name: string;
    rollNo: string;
    email: string;
    hostelBlock?: string;
    password?: string;
  }) => {
    const newUser: UserProfile = {
      uid: `user-${Date.now()}`,
      name: userData.name.trim(),
      rollNo: userData.rollNo.trim().toUpperCase(),
      email: userData.email.trim().toLowerCase(),
      hostelBlock: userData.hostelBlock || 'Hostel Block B',
      role: 'student',
      savedOrdersCount: 0,
      isLoggedIn: true
    };
    setCurrentUser(newUser);
    localStorage.setItem('mm_user_auth_v1', JSON.stringify(newUser));
    showToast(`Account created! Welcome to MealMate, ${newUser.name.split(' ')[0]}!`);
  }, [showToast]);

  const logoutUser = useCallback(() => {
    const loggedOutUser: UserProfile = {
      ...currentUser,
      isLoggedIn: false
    };
    setCurrentUser(loggedOutUser);
    localStorage.setItem('mm_user_auth_v1', JSON.stringify(loggedOutUser));
    showToast('Signed out. See you next lunch break!');
  }, [currentUser, showToast]);

  // Save changes to localStorage with versioned keys
  useEffect(() => {
    localStorage.setItem('mm_meals_v12', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('mm_slots_v2', JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    localStorage.setItem('mm_cart_v2', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('mm_orders_v2', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('mm_user_auth_v1', JSON.stringify(currentUser));
  }, [currentUser]);

  // Real-Time Kitchen Order Lifecycle Engine:
  // Automatically advances active orders in real time (Accepted -> Preparing -> Ready)
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders(prevOrders => {
        let hasChanges = false;
        const now = Date.now();
        const updated = prevOrders.map(order => {
          // If Accepted and placed >= 14s ago -> advance to Preparing
          if (order.status === 'Accepted') {
            const ageSec = (now - new Date(order.createdAt).getTime()) / 1000;
            if (ageSec >= 14) {
              hasChanges = true;
              showToast(`🔥 Central Kitchen is now cooking Order #${order.token}!`);
              return {
                ...order,
                status: 'Preparing' as OrderStatus,
                updatedAt: new Date().toISOString()
              };
            }
          }
          // If Preparing and updated >= 22s ago -> advance to Ready
          if (order.status === 'Preparing') {
            const ageSec = (now - new Date(order.updatedAt || order.createdAt).getTime()) / 1000;
            if (ageSec >= 22) {
              hasChanges = true;
              playChime();
              showToast(`🟢 Order #${order.token} is READY FOR PICKUP at DGU Central Canteen Counter!`);
              return {
                ...order,
                status: 'Ready' as OrderStatus,
                updatedAt: new Date().toISOString(),
                readyAt: new Date().toISOString()
              };
            }
          }
          return order;
        });

        if (hasChanges) {
          try {
            const channel = new BroadcastChannel('mealmate_sync_channel');
            channel.postMessage({ type: 'SYNC_ALL', payload: { orders: updated } });
            channel.close();
          } catch (e) {}
          return updated;
        }
        return prevOrders;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [showToast]);

  // Cross-tab synchronization via BroadcastChannel
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('mealmate_sync_channel');
      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'SYNC_ALL') {
          if (payload.meals) setMeals(payload.meals);
          if (payload.slots) setSlots(payload.slots);
          if (payload.orders) setOrders(payload.orders);
        } else if (type === 'ORDER_STATUS_CHANGED') {
          setOrders(prev => prev.map(o => o.id === payload.orderId ? { ...o, status: payload.status } : o));
          if (payload.status === 'Ready') {
            playChime();
            showToast(`Order #${payload.token || payload.orderId} is now READY for pickup!`);
          }
        }
      };
    } catch (e) {
      // BroadcastChannel not available in all environments
    }
    return () => {
      channel?.close();
    };
  }, [showToast]);

  const broadcastSync = (type: string, payload: any) => {
    try {
      const channel = new BroadcastChannel('mealmate_sync_channel');
      channel.postMessage({ type, payload });
      channel.close();
    } catch (e) {}
  };

  const addToCart = (mealId: string): boolean => {
    const meal = meals.find(m => m.id === mealId);
    if (!meal || meal.available <= 0) {
      showToast('This item is currently sold out.');
      return false;
    }

    setCart(prev => {
      const existing = prev.find(item => item.meal.id === mealId);
      if (existing) {
        if (existing.quantity >= meal.available) {
          showToast(`Only ${meal.available} portions left for ${meal.name}.`);
          return prev;
        }
        return prev.map(item =>
          item.meal.id === mealId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { meal, quantity: 1 }];
    });

    showToast(`Added ${meal.name} to basket`);
    return true;
  };

  const removeFromCart = (mealId: string) => {
    setCart(prev => prev.filter(item => item.meal.id !== mealId));
  };

  const updateCartQuantity = (mealId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.meal.id === mealId) {
            const nextQty = item.quantity + delta;
            const currentMeal = meals.find(m => m.id === mealId) || item.meal;
            if (nextQty > currentMeal.available) {
              showToast(`Max available portion is ${currentMeal.available}`);
              return item;
            }
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const placePreOrder = async (slotId: string, instructions?: string): Promise<Order> => {
    if (cart.length === 0) {
      throw new Error('Your basket is empty.');
    }

    const slot = slots.find(s => s.id === slotId) || slots[0];
    if (slot.reserved >= slot.capacity) {
      throw new Error(`The pickup slot ${slot.label} is already full. Please select another slot.`);
    }

    // Verify inventory for every item
    for (const item of cart) {
      const currentMeal = meals.find(m => m.id === item.meal.id);
      if (!currentMeal || currentMeal.available < item.quantity) {
        throw new Error(`${item.meal.name} is no longer available in this quantity. Check live menu.`);
      }
    }

    const total = cart.reduce((sum, item) => sum + (item.meal.price * item.quantity), 0);
    const tokenNum = Math.floor(10000 + Math.random() * 90000);
    const token = `MM-${tokenNum}`;
    const orderId = `ord-${Date.now().toString(36)}-${tokenNum}`;

    const newOrder: Order = {
      id: orderId,
      token,
      userId: currentUser.uid,
      customerName: currentUser.name,
      customerRollNo: currentUser.rollNo || '0251MBA621',
      customerEmail: currentUser.email,
      items: cart.map(c => ({
        id: c.meal.id,
        name: c.meal.name,
        price: c.meal.price,
        emoji: c.meal.emoji,
        vendorName: 'DGU Central Canteen',
        quantity: c.quantity
      })),
      total,
      slotId: slot.id,
      slotLabel: slot.label,
      vendorName: 'DGU Central Canteen',
      status: 'Accepted',
      paymentStatus: 'Pay at pickup',
      specialInstructions: instructions?.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Deduct stock from meals
    const updatedMeals = meals.map(m => {
      const cartMatch = cart.find(c => c.meal.id === m.id);
      if (cartMatch) {
        return {
          ...m,
          available: Math.max(0, m.available - cartMatch.quantity)
        };
      }
      return m;
    });

    // Increment slot reservation
    const updatedSlots = slots.map(s => {
      if (s.id === slot.id) {
        return { ...s, reserved: s.reserved + 1 };
      }
      return s;
    });

    const updatedOrders = [newOrder, ...orders];

    setMeals(updatedMeals);
    setSlots(updatedSlots);
    setOrders(updatedOrders);
    setCart([]);
    setLatestPlacedOrder(newOrder);

    broadcastSync('SYNC_ALL', {
      meals: updatedMeals,
      slots: updatedSlots,
      orders: updatedOrders
    });

    showToast(`Order confirmed! Token ${token} reserved for ${slot.label}.`);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    let changedToken = '';
    const updated = orders.map(o => {
      if (o.id === orderId) {
        changedToken = o.token;
        const now = new Date().toISOString();
        return {
          ...o,
          status,
          updatedAt: now,
          readyAt: status === 'Ready' ? now : o.readyAt,
          pickedUpAt: status === 'Picked up' ? now : o.pickedUpAt
        };
      }
      return o;
    });

    setOrders(updated);
    if (status === 'Ready') {
      playChime();
      showToast(`Order #${changedToken} marked READY for collection!`);
    } else if (status === 'Picked up') {
      showToast(`Order #${changedToken} marked PICKED UP & completed.`);
    } else {
      showToast(`Order #${changedToken} updated to ${status}.`);
    }

    broadcastSync('ORDER_STATUS_CHANGED', { orderId, status, token: changedToken });
  };

  const restockMeal = (mealId: string, portions: number) => {
    const updated = meals.map(m => {
      if (m.id === mealId) {
        const nextAvail = Math.max(0, m.available + portions);
        return { ...m, available: nextAvail };
      }
      return m;
    });
    setMeals(updated);
    broadcastSync('SYNC_ALL', { meals: updated });
    const targetMeal = meals.find(m => m.id === mealId);
    showToast(`Restocked ${targetMeal?.name || 'item'}: added ${portions} portions.`);
  };

  const toggleMealAvailability = (mealId: string) => {
    const updated = meals.map(m => {
      if (m.id === mealId) {
        const next = m.available > 0 ? 0 : (m.initialStock || 10);
        return { ...m, available: next };
      }
      return m;
    });
    setMeals(updated);
    broadcastSync('SYNC_ALL', { meals: updated });
    const target = updated.find(m => m.id === mealId);
    showToast(`${target?.name} marked as ${target?.available ? 'Available' : 'Sold Out'}.`);
  };

  const addNewMeal = (item: Partial<MealItem>) => {
    const id = Date.now().toString();
    const newMeal: MealItem = {
      id,
      name: item.name || 'New Campus Special',
      price: item.price || 99,
      emoji: item.emoji || '🍲',
      tag: item.tag || 'SPECIAL',
      type: item.type || 'veg',
      available: item.available || 10,
      initialStock: item.available || 10,
      vendorName: item.vendorName || selectedKitchen,
      description: item.description || 'Freshly prepared daily meal at campus counter.',
      prepTimeMinutes: item.prepTimeMinutes || 6
    };
    const updated = [newMeal, ...meals];
    setMeals(updated);
    broadcastSync('SYNC_ALL', { meals: updated });
    showToast(`Added "${newMeal.name}" to ${newMeal.vendorName} menu!`);
  };

  const switchUserRole = (role: 'student' | 'vendor' | 'quest', vendorName = 'DGU Central Canteen') => {
    setActiveRole(role);
    if (role === 'student') {
      setCurrentUser({
        uid: 'user-vikash-0251',
        name: 'Vikash Kumar Gupta',
        email: 'vikash.0251mba621@dgu.ac.in',
        rollNo: '0251MBA621',
        role: 'student',
        savedOrdersCount: 2
      });
      showToast('Switched to Student Mode (Vikash Kumar Gupta · 0251MBA621)');
    } else if (role === 'vendor') {
      setSelectedKitchen(vendorName);
      setCurrentUser({
        uid: 'vendor-kitchen-lead',
        name: `${vendorName} Manager`,
        email: `canteen.${vendorName.toLowerCase().replace(/\s+/g, '')}@dgu.ac.in`,
        role: 'vendor',
        assignedVendor: vendorName
      });
      showToast(`Switched to Kitchen Portal (${vendorName})`);
    } else if (role === 'quest') {
      showToast('Viewing DGU Venture Quest Capstone & Strategic Blueprint');
    }
  };

  const resetAllData = () => {
    setMeals(STARTER_MEALS);
    setSlots(STARTER_SLOTS);
    setOrders(INITIAL_ORDERS);
    setCart([]);
    localStorage.removeItem('mm_meals');
    localStorage.removeItem('mm_meals_v3');
    localStorage.removeItem('mm_meals_v4');
    localStorage.removeItem('mm_meals_v5');
    localStorage.removeItem('mm_slots');
    localStorage.removeItem('mm_orders');
    localStorage.removeItem('mm_cart');
    showToast('Reset MealMate demo database to original starter state.');
  };

  const importBackup = (jsonData: any): boolean => {
    try {
      if (jsonData.venture || jsonData.app === 'DGU Venture Quest') {
        showToast('Imported DGU Venture Quest venture data successfully!');
        return true;
      }
      if (jsonData.meals && Array.isArray(jsonData.meals)) {
        setMeals(jsonData.meals);
      }
      if (jsonData.slots && Array.isArray(jsonData.slots)) {
        setSlots(jsonData.slots);
      }
      if (jsonData.orders && Array.isArray(jsonData.orders)) {
        setOrders(jsonData.orders);
      }
      showToast('Custom MealMate backup imported successfully!');
      return true;
    } catch (e) {
      showToast('Could not import JSON file. Please check format.');
      return false;
    }
  };

  const exportBackup = () => {
    return {
      app: 'MealMate - DGU Venture Quest',
      exportVersion: '2.0',
      exportedAt: new Date().toISOString(),
      student: {
        name: 'Vikash Kumar Gupta',
        rollNo: '0251MBA621',
        email: 'vikash.0251mba621@dgu.ac.in',
        institution: 'DBS Global University'
      },
      ventureBlueprint: VENTURE_BLUEPRINT,
      meals,
      slots,
      orders
    };
  };

  return (
    <AppContext.Provider
      value={{
        meals,
        slots,
        cart,
        orders,
        currentUser,
        isLoggedIn,
        loginUser,
        registerUser,
        logoutUser,
        activeRole,
        selectedKitchen,
        selectedSlotId,
        latestPlacedOrder,
        toastMessage,
        showToast,
        setSelectedSlotId,
        setSelectedKitchen,
        setActiveRole,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        placePreOrder,
        updateOrderStatus,
        restockMeal,
        toggleMealAvailability,
        addNewMeal,
        switchUserRole,
        resetAllData,
        importBackup,
        exportBackup,
        setLatestPlacedOrder,
        canteenSchedule,
        setScheduleMode
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

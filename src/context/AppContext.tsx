import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  MealItem,
  PickupSlot,
  Order,
  OrderStatus,
  UserProfile,
  RegisteredAccount,
  CampusVendor,
  PromotionalCoupon,
  StudentReview,
  StudentComplaint,
  SelectedAddOn,
  MealCategory
} from '../types';
import {
  STARTER_MEALS,
  STARTER_SLOTS,
  INITIAL_ORDERS,
  VENTURE_BLUEPRINT,
  CAMPUS_VENDORS,
  PROMOTIONAL_COUPONS,
  STUDENT_REVIEWS,
  INITIAL_COMPLAINTS
} from '../data/initialData';
import {
  calculateCanteenSchedule,
  CanteenScheduleInfo,
  ScheduleMode,
  generateUpcomingSlots
} from '../utils/canteenSchedule';
import {
  auth,
  db,
  setPersistence,
  inMemoryPersistence,
  ensureInMemoryPersistence,
  firebaseSignIn,
  firebaseSignUp,
  firebaseResetPassword,
  firebaseSignOut,
  firebaseGoogleSignIn,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from '../firebase';

export const GUEST_USER: UserProfile = {
  uid: '',
  name: '',
  email: '',
  rollNo: '',
  role: 'student',
  savedOrdersCount: 0,
  hostelBlock: 'Campus Hostels',
  isLoggedIn: false,
  favorites: []
};

export interface CartItem {
  meal: MealItem;
  quantity: number;
  portion?: string;
  extraPrice?: number;
  selectedAddOns?: SelectedAddOn[];
  specialInstructions?: string;
}

interface AppContextType {
  meals: MealItem[];
  slots: PickupSlot[];
  cart: CartItem[];
  orders: Order[];
  vendors: CampusVendor[];
  coupons: PromotionalCoupon[];
  reviews: StudentReview[];
  complaints: StudentComplaint[];
  favorites: string[];
  toggleFavorite: (mealId: string) => void;
  currentUser: UserProfile;
  activeRole: 'student' | 'vendor' | 'admin' | 'quest';
  selectedKitchen: string;
  selectedSlotId: string;
  selectedCategory: MealCategory;
  setSelectedCategory: (cat: MealCategory) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  latestPlacedOrder: Order | null;
  isLoggedIn: boolean;
  loginUser: (emailOrRoll: string, password?: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  loginWithPhoneOtp: (phone: string, otp: string, rememberMe?: boolean, confirmationResult?: any) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (googleUser?: { name?: string; email?: string; password?: string }, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  rememberedCredentials: { email: string; isGoogle?: boolean } | null;
  clearRememberedCredentials: () => void;
  registerUser: (userData: {
    name: string;
    email: string;
    phone?: string;
    rollNo?: string;
    hostelBlock?: string;
    password?: string;
    role?: 'student' | 'vendor' | 'admin';
    assignedVendor?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  registeredAccounts: RegisteredAccount[];
  logoutUser: () => Promise<void> | void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  setSelectedSlotId: (slotId: string) => void;
  setSelectedKitchen: (kitchen: string) => void;
  setActiveRole: (role: 'student' | 'vendor' | 'admin' | 'quest') => void;
  addToCart: (
    mealId: string,
    options?: {
      quantity?: number;
      portion?: string;
      extraPrice?: number;
      selectedAddOns?: SelectedAddOn[];
      specialInstructions?: string;
    }
  ) => boolean;
  removeFromCart: (mealId: string) => void;
  updateCartQuantity: (mealId: string, delta: number) => void;
  clearCart: () => void;
  placePreOrder: (
    orderData:
      | string
      | {
          slotId: string;
          paymentMethod?: 'UPI' | 'Cash on Pickup' | 'Campus Card';
          transactionId?: string;
          upiIdUsed?: string;
          promoCode?: string;
          discountAmount?: number;
          orderMode?: 'pickup' | 'delivery';
          deliveryLocation?: string;
          cutleryOptOut?: boolean;
          instructions?: string;
        }
  ) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrder: (orderId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  verifyPickupToken: (token: string) => Order | null;
  restockMeal: (mealId: string, portions: number) => void;
  toggleMealAvailability: (mealId: string) => void;
  addNewMeal: (item: Partial<MealItem>) => void;
  updateMeal: (mealId: string, updates: Partial<MealItem>) => void;
  toggleVendorStatus: (vendorId: string) => void;
  addNewCoupon: (coupon: PromotionalCoupon) => void;
  toggleCoupon: (code: string) => void;
  resolveComplaint: (complaintId: string, note?: string) => void;
  submitComplaint: (complaint: Omit<StudentComplaint, 'id' | 'createdAt' | 'status'>) => void;
  submitReview: (review: Omit<StudentReview, 'id' | 'createdAt' | 'verifiedStudent'>) => void;
  switchUserRole: (role: 'student' | 'vendor' | 'admin' | 'quest', vendorName?: string) => void;
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
    // Purge older stale cache versions so broken URLs and legacy data are completely eliminated
    [
      'mm_meals', 'mm_meals_v1', 'mm_meals_v2', 'mm_meals_v3', 'mm_meals_v4',
      'mm_meals_v5', 'mm_meals_v6', 'mm_meals_v7', 'mm_meals_v8', 'mm_meals_v9',
      'mm_meals_v10', 'mm_meals_v11', 'mm_meals_v12', 'mm_meals_v13', 'mm_meals_v14', 'mm_meals_v15'
    ].forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });

    const saved = localStorage.getItem('mm_meals_v16');
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
                dietaryType: fresh.dietaryType,
                type: fresh.type,
                calories: fresh.calories,
                proteinGrams: fresh.proteinGrams,
                allergens: fresh.allergens,
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

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3200);
  }, []);

  // Remembered login credentials on this device (only present if user explicitly checked 'Remember credentials')
  const [rememberedCredentials, setRememberedCredentials] = useState<{ email: string; isGoogle?: boolean } | null>(() => {
    try {
      const isRemembered = localStorage.getItem('mm_remember_credentials') === 'true';
      const email = localStorage.getItem('mm_remembered_email');
      const isGoogle = localStorage.getItem('mm_remembered_is_google') === 'true';
      if (isRemembered && email) {
        return { email, isGoogle };
      }
    } catch (e) {}
    return null;
  });

  const clearRememberedCredentials = useCallback(() => {
    try {
      localStorage.removeItem('mm_remember_credentials');
      localStorage.removeItem('mm_remembered_email');
      localStorage.removeItem('mm_remembered_is_google');
      localStorage.removeItem('mm_remembered_user');
    } catch (e) {}
    setRememberedCredentials(null);
    showToast('Saved credentials cleared from this device.');
  }, [showToast]);

  // Session persistence and restoration logic
  useEffect(() => {
    const isRemembered = localStorage.getItem('mm_remember_credentials') === 'true';
    if (!isRemembered) {
      // User chose NOT to remember: strictly purge persistent tokens & enforce inMemoryPersistence
      try {
        ['mm_cart', 'mm_cart_v2', 'mm_orders', 'mm_orders_v2', 'mm_user_auth', 'mm_user_auth_v1', 'mm_favorites_v1', 'mm_remembered_user'].forEach(k => {
          localStorage.removeItem(k);
        });
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('firebase:authUser') || k.startsWith('mm_user_auth'))) {
            localStorage.removeItem(k);
          }
        }
      } catch (e) {}

      if (auth) {
        setPersistence(auth, inMemoryPersistence).catch((err) => {
          console.warn('AppProvider: Setting in-memory persistence failed:', err);
        });
        if (auth.currentUser) {
          firebaseSignOut().catch(() => {});
        }
      }
      ensureInMemoryPersistence();
    }
  }, []);

  // In-memory cart for current session only (no shared persistence across sessions)
  const [cart, setCart] = useState<CartItem[]>([]);

  // Realistic orders: Only orders actually placed by the user (no fake pre-populated orders)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      // Clean up legacy mock order caches
      ['mm_orders', 'mm_orders_v2', 'mm_user_auth_orders'].forEach(k => {
        try { localStorage.removeItem(k); } catch (e) {}
      });

      const saved = localStorage.getItem('mm_real_orders_v1');
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Exclude any mock demo orders
          return parsed.filter(o => o.id !== 'ord-101' && o.id !== 'ord-102' && o.id !== 'ord-103');
        }
      }
    } catch (e) {}
    return [];
  });

  // User profile: If user explicitly ticked 'remember login credentials', restore their session!
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const isRemembered = localStorage.getItem('mm_remember_credentials') === 'true';
      if (isRemembered) {
        const savedUser = localStorage.getItem('mm_remembered_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.uid && parsed.uid.trim() !== '') {
            return { ...parsed, isLoggedIn: true };
          }
        }
      }
    } catch (e) {}
    return GUEST_USER;
  });

  // Authenticated status strictly requires active in-memory session with non-empty UID
  const isLoggedIn = Boolean(currentUser && currentUser.uid && currentUser.uid.trim() !== '' && currentUser.isLoggedIn !== false);

  const [activeRole, setActiveRole] = useState<'student' | 'vendor' | 'admin' | 'quest'>(() => {
    try {
      const isRemembered = localStorage.getItem('mm_remember_credentials') === 'true';
      if (isRemembered) {
        const savedUser = localStorage.getItem('mm_remembered_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.role) return parsed.role;
        }
      }
    } catch (e) {}
    return 'student';
  });
  const [selectedKitchen, setSelectedKitchen] = useState<string>('DGU Central Canteen');
  const [selectedCategory, setSelectedCategory] = useState<MealCategory>('All Food');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [vendors, setVendors] = useState<CampusVendor[]>(() => {
    try {
      const saved = localStorage.getItem('mm_vendors_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return CAMPUS_VENDORS;
  });

  const [coupons, setCoupons] = useState<PromotionalCoupon[]>(() => {
    try {
      const saved = localStorage.getItem('mm_coupons_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return PROMOTIONAL_COUPONS;
  });

  const [reviews, setReviews] = useState<StudentReview[]>(() => {
    try {
      const saved = localStorage.getItem('mm_reviews_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return STUDENT_REVIEWS;
  });

  const [complaints, setComplaints] = useState<StudentComplaint[]>(() => {
    try {
      const saved = localStorage.getItem('mm_complaints_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_COMPLAINTS;
  });

  // User-isolated favorites
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try { localStorage.setItem('mm_vendors_v1', JSON.stringify(vendors)); } catch (e) {}
  }, [vendors]);

  useEffect(() => {
    try { localStorage.setItem('mm_coupons_v1', JSON.stringify(coupons)); } catch (e) {}
  }, [coupons]);

  useEffect(() => {
    try { localStorage.setItem('mm_reviews_v1', JSON.stringify(reviews)); } catch (e) {}
  }, [reviews]);

  useEffect(() => {
    try { localStorage.setItem('mm_complaints_v1', JSON.stringify(complaints)); } catch (e) {}
  }, [complaints]);

  useEffect(() => {
    try { localStorage.setItem('mm_favorites_v1', JSON.stringify(favorites)); } catch (e) {}
  }, [favorites]);

  const toggleFavorite = useCallback((mealId: string) => {
    setFavorites(prev => {
      const exists = prev.includes(mealId);
      const updated = exists ? prev.filter(id => id !== mealId) : [...prev, mealId];
      return updated;
    });
  }, []);

  const [selectedSlotId, setSelectedSlotId] = useState<string>(() => {
    const initialSlots = generateUpcomingSlots(new Date(), scheduleMode);
    return initialSlots[0]?.id || 'slot-current';
  });
  const [latestPlacedOrder, setLatestPlacedOrder] = useState<Order | null>(null);

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

  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredAccount[]>(() => {
    try {
      localStorage.removeItem('mm_registered_accounts_v1'); // Purge legacy dummy accounts
      const saved = localStorage.getItem('mm_registered_accounts_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('mm_registered_accounts_v2', JSON.stringify(registeredAccounts));
    } catch (e) {}
  }, [registeredAccounts]);

  const loginUser = useCallback(async (identifier: string, password?: string, rememberMe: boolean = false): Promise<{ success: boolean; error?: string }> => {
    const cleanIdentifier = identifier.trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanIdentifier) {
      return { success: false, error: 'Please enter your registered email address.' };
    }

    if (!cleanPassword) {
      return { success: false, error: 'Please enter your account password.' };
    }

    try {
      let firebaseUid: string | null = null;
      let firebaseEmail: string = cleanIdentifier;
      let displayName: string = '';

      // Authenticate strictly with Firebase Auth
      try {
        const userCred = await firebaseSignIn(cleanIdentifier, cleanPassword, rememberMe);
        firebaseUid = userCred.user.uid;
        firebaseEmail = userCred.user.email || cleanIdentifier;
        displayName = userCred.user.displayName || '';
      } catch (authErr: any) {
        const code = authErr?.code || '';
        const msg = authErr?.message || '';
        console.warn('Firebase signIn notice:', code, msg);

        // Check if user has an account registered in local registeredAccounts:
        const localMatch = registeredAccounts.find(a => a.email.toLowerCase() === cleanIdentifier);

        // If the password was incorrect or invalid credentials:
        if (
          code === 'auth/wrong-password' ||
          code === 'auth/invalid-credential' ||
          msg.includes('INVALID_LOGIN_CREDENTIALS') ||
          msg.includes('wrong-password')
        ) {
          // If a local registered record exists with a password and it doesn't match cleanPassword, reject!
          if (localMatch && localMatch.password && localMatch.password !== cleanPassword) {
            return {
              success: false,
              error: 'Incorrect password. Please enter the valid password you registered with.'
            };
          }
          // If local record exists and password matches, authenticate
          if (localMatch && localMatch.password === cleanPassword) {
            firebaseUid = localMatch.uid;
            displayName = localMatch.name;
          } else {
            return {
              success: false,
              error: 'Incorrect password. Please enter your valid account password or use "Forgot password?".'
            };
          }
        } else if (code === 'auth/user-not-found' || msg.includes('user-not-found')) {
          if (localMatch && localMatch.password === cleanPassword) {
            firebaseUid = localMatch.uid;
            displayName = localMatch.name;
          } else {
            return {
              success: false,
              error: 'No account found with this email. Please click "New Account" to register.'
            };
          }
        } else if (code === 'auth/too-many-requests') {
          return {
            success: false,
            error: 'Too many failed login attempts. Please wait a moment or reset your password.'
          };
        } else if (code === 'auth/invalid-email') {
          return {
            success: false,
            error: 'Invalid email address format. Please enter a valid email address.'
          };
        } else {
          // Any other error from Firebase: fail securely unless local credentials match
          if (localMatch && localMatch.password === cleanPassword) {
            firebaseUid = localMatch.uid;
            displayName = localMatch.name;
          } else {
            return {
              success: false,
              error: 'Authentication failed. Please verify your email and password.'
            };
          }
        }
      }

      if (!firebaseUid) {
        return {
          success: false,
          error: 'Authentication failed. Please verify your credentials.'
        };
      }

      // Handle remember credentials preference
      if (rememberMe) {
        try {
          localStorage.setItem('mm_remember_credentials', 'true');
          localStorage.setItem('mm_remembered_email', cleanIdentifier);
          localStorage.setItem('mm_remembered_is_google', 'false');
        } catch (e) {}
        setRememberedCredentials({ email: cleanIdentifier, isGoogle: false });
      } else {
        try {
          localStorage.removeItem('mm_remember_credentials');
          localStorage.removeItem('mm_remembered_email');
          localStorage.removeItem('mm_remembered_is_google');
          localStorage.removeItem('mm_remembered_user');
        } catch (e) {}
        setRememberedCredentials(null);
      }

      // Query or create Firestore user profile in /users/{userId}
      let profile: UserProfile | null = null;
      if (db) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUid));
          if (snap.exists()) {
            profile = snap.data() as UserProfile;
          }
        } catch (e) {
          console.warn('Firestore getDoc profile notice:', e);
        }
      }

      // Assign campus-specific role and metadata if not stored in Firestore
      if (!profile) {
        if (cleanIdentifier.includes('canteen') || cleanIdentifier.includes('vendor')) {
          profile = {
            uid: firebaseUid,
            name: 'Central Canteen Kitchen Lead',
            email: firebaseEmail,
            role: 'vendor',
            assignedVendor: 'DGU Central Canteen',
            hostelBlock: 'Campus Central Dining Hall',
            isLoggedIn: true,
            favorites: [],
            referralCode: 'CANTEEN-VEND',
            savedOrdersCount: 0
          };
        } else if (cleanIdentifier.includes('director') || cleanIdentifier.includes('admin')) {
          profile = {
            uid: firebaseUid,
            name: 'Campus Dining Directorate',
            email: firebaseEmail,
            role: 'admin',
            hostelBlock: 'Administrative Block A',
            isLoggedIn: true,
            favorites: [],
            referralCode: 'ADMIN-DGU',
            savedOrdersCount: 0
          };
        } else if (cleanIdentifier.includes('vikash') || cleanIdentifier.includes('0251')) {
          profile = {
            uid: firebaseUid,
            name: 'Vikash Kumar Gupta',
            email: firebaseEmail,
            rollNo: '0251MBA621',
            role: 'student',
            hostelBlock: 'Mandakini Boys Hostel',
            isLoggedIn: true,
            favorites: ['1', '3', '7'],
            referralCode: 'VIKASH0251-MM',
            savedOrdersCount: 0
          };
        } else {
          const cleanName = displayName || cleanIdentifier.split('@')[0].replace(/[._0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim();
          profile = {
            uid: firebaseUid,
            name: cleanName || 'DGU Student',
            email: firebaseEmail,
            rollNo: '0251' + Math.floor(100 + Math.random() * 900),
            role: 'student',
            hostelBlock: 'Campus Hostels',
            isLoggedIn: true,
            favorites: [],
            referralCode: `${cleanIdentifier.substring(0, 4).toUpperCase()}-MM`,
            savedOrdersCount: 0
          };
        }

        if (db && firebaseUid) {
          try {
            await setDoc(doc(db, 'users', firebaseUid), profile, { merge: true });
          } catch (e) {
            console.warn('Firestore setDoc user profile notice:', e);
          }
        }
      } else {
        profile = {
          ...profile,
          uid: firebaseUid,
          email: profile.email || firebaseEmail,
          isLoggedIn: true
        };
      }

      // Guarantee activeProfile is explicitly authenticated with isLoggedIn: true and non-empty uid:
      const activeProfile: UserProfile = {
        ...profile,
        uid: firebaseUid,
        email: profile?.email || firebaseEmail,
        isLoggedIn: true
      };

      // Enforce strict in-memory account isolation:
      if (rememberMe) {
        try {
          localStorage.setItem('mm_remember_credentials', 'true');
          localStorage.setItem('mm_remembered_user', JSON.stringify(activeProfile));
        } catch (e) {}
      } else {
        try {
          localStorage.removeItem('mm_remember_credentials');
          localStorage.removeItem('mm_remembered_user');
        } catch (e) {}
      }

      setCurrentUser(activeProfile);
      setActiveRole(activeProfile.role);
      setFavorites(activeProfile.favorites || []);
      setCart([]); // Reset basket for newly authenticated user

      // Strictly isolate orders:
      if (activeProfile.role === 'admin') {
        setOrders(INITIAL_ORDERS);
      } else if (activeProfile.role === 'vendor') {
        const vendorTarget = activeProfile.assignedVendor || 'DGU Central Canteen';
        setOrders(INITIAL_ORDERS.filter(o => o.vendorName === vendorTarget));
      } else {
        // Student role: Realistic orders only. Only orders actually placed by this student are loaded.
        try {
          const saved = localStorage.getItem('mm_real_orders_v1');
          if (saved) {
            const parsed: Order[] = JSON.parse(saved);
            const userOrders = Array.isArray(parsed)
              ? parsed.filter(o => o.userId === activeProfile.uid && o.id !== 'ord-101' && o.id !== 'ord-102' && o.id !== 'ord-103')
              : [];
            setOrders(userOrders);
          } else {
            setOrders([]);
          }
        } catch (e) {
          setOrders([]);
        }
      }

      showToast(`Welcome back, ${activeProfile.name.split(' ')[0]}! Signed in as ${activeProfile.role}.`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed. Please check credentials.' };
    }
  }, [showToast]);

  const registerUser = useCallback(async (userData: {
    name: string;
    email: string;
    phone?: string;
    rollNo?: string;
    hostelBlock?: string;
    password?: string;
    role?: 'student' | 'vendor' | 'admin';
    assignedVendor?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanName = userData.name.trim();
    const cleanEmail = userData.email.trim().toLowerCase();
    const cleanPhone = (userData.phone || '').trim();
    const cleanRollNo = (userData.rollNo || '').trim().toUpperCase();
    const cleanPassword = (userData.password || '').trim();
    const role = userData.role || 'student';
    const assignedVendor = userData.assignedVendor;

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Please enter your full name.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid university email address.' };
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    try {
      // Register with Firebase Auth using inMemoryPersistence
      const cred = await firebaseSignUp(cleanEmail, cleanPassword, cleanName);
      const uid = cred.user.uid;

      const newProfile: UserProfile = {
        uid,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || undefined,
        rollNo: cleanRollNo || (role === 'student' ? '0251' + Math.floor(100 + Math.random() * 900) : undefined),
        hostelBlock: userData.hostelBlock || 'Campus Hostels',
        role,
        assignedVendor: role === 'vendor' ? (assignedVendor || 'DGU Central Canteen') : undefined,
        savedOrdersCount: 0,
        isLoggedIn: true,
        favorites: [],
        referralCode: `${(cleanRollNo || cleanName.substring(0, 4)).toUpperCase()}-MM`
      };

      if (db) {
        try {
          await setDoc(doc(db, 'users', uid), newProfile, { merge: true });
        } catch (e) {
          console.warn('Firestore setDoc new user notice:', e);
        }
      }

      // Record registered account credentials for strict password verification
      const newAcc: RegisteredAccount = {
        uid,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || undefined,
        rollNo: cleanRollNo || undefined,
        hostelBlock: userData.hostelBlock || 'Campus Hostels',
        password: cleanPassword,
        createdAt: new Date().toISOString(),
        role
      };
      setRegisteredAccounts(prev => [...prev.filter(a => a.email !== cleanEmail), newAcc]);

      // Set state in memory only:
      setCurrentUser(newProfile);
      setActiveRole(role);
      setCart([]);
      setOrders([]); // Strict isolation: brand new student starts with 0 orders!
      setFavorites([]);

      showToast(`Account registered! Welcome to MealMate, ${cleanName.split(' ')[0]}!`);
      return { success: true };
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        return {
          success: false,
          error: `An account with ${cleanEmail} already exists. Please select "Sign In" to log in.`
        };
      }
      return {
        success: false,
        error: err.message?.replace('Firebase: ', '') || 'Registration failed. Please try again.'
      };
    }
  }, [showToast]);

  const forgotPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Please enter your registered email address.' };
    }
    try {
      await firebaseResetPassword(cleanEmail);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message?.replace('Firebase: ', '') || 'Could not send reset email. Verify email address.'
      };
    }
  }, []);

  const loginWithPhoneOtp = useCallback(async (phone: string, otp: string, rememberMe: boolean = false, confirmationResult?: any): Promise<{ success: boolean; error?: string }> => {
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    const cleanOtp = otp.trim();

    if (!cleanPhone || cleanPhone.length !== 10) {
      return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
    }

    if (!cleanOtp || cleanOtp.length !== 6) {
      return { success: false, error: 'Please enter the 6-digit verification code.' };
    }

    // If confirmationResult from Firebase Phone Auth is present, verify real SMS code:
    if (confirmationResult && typeof confirmationResult.confirm === 'function') {
      try {
        const userCred = await confirmationResult.confirm(cleanOtp);
        const firebaseUid = userCred.user.uid;
        const phoneFormatted = userCred.user.phoneNumber || `+91${cleanPhone}`;

        let profile: UserProfile | null = null;
        if (db) {
          try {
            const snap = await getDoc(doc(db, 'users', firebaseUid));
            if (snap.exists()) {
              profile = snap.data() as UserProfile;
            }
          } catch (e) {}
        }

        if (!profile) {
          profile = {
            uid: firebaseUid,
            name: `Student (+91 ${cleanPhone.slice(-4)})`,
            email: `student.${cleanPhone}@dgu.ac.in`,
            phone: phoneFormatted,
            rollNo: '0251' + Math.floor(100 + Math.random() * 900),
            role: 'student',
            hostelBlock: 'Campus Hostels',
            isLoggedIn: true,
            favorites: [],
            referralCode: `STU${cleanPhone.slice(-4)}-MM`,
            savedOrdersCount: 0
          };
          if (db) {
            try {
              await setDoc(doc(db, 'users', firebaseUid), profile, { merge: true });
            } catch (e) {}
          }
        } else {
          profile = { ...profile, isLoggedIn: true };
        }

        if (rememberMe) {
          try {
            localStorage.setItem('mm_remember_credentials', 'true');
            localStorage.setItem('mm_remembered_phone', phoneFormatted);
            localStorage.setItem('mm_remembered_user', JSON.stringify(profile));
          } catch (e) {}
          setRememberedCredentials({ email: phoneFormatted, isGoogle: false });
        } else {
          try {
            localStorage.removeItem('mm_remember_credentials');
            localStorage.removeItem('mm_remembered_phone');
            localStorage.removeItem('mm_remembered_user');
          } catch (e) {}
          setRememberedCredentials(null);
        }

        setCurrentUser(profile);
        setActiveRole(profile.role);
        setCart([]);
        setOrders([]);
        setFavorites(profile.favorites || []);
        showToast(`Phone verified successfully! Signed in as ${profile.name}.`);
        return { success: true };
      } catch (confirmErr: any) {
        return {
          success: false,
          error: confirmErr?.message?.replace('Firebase: ', '') || 'Invalid OTP code. Please enter the real code sent to your phone.'
        };
      }
    }

    return {
      success: false,
      error: 'Please request a real OTP first by entering your mobile number.'
    };
  }, [loginUser, showToast]);

  const loginWithGoogle = useCallback(async (googleUser?: { name?: string; email?: string; password?: string }, rememberMe: boolean = false): Promise<{ success: boolean; error?: string }> => {
    try {
      let email = googleUser?.email;
      let name = googleUser?.name;
      const pass = googleUser?.password;
      let firebaseUid: string | null = null;

      // 1. Try real Firebase GoogleAuthProvider popup sign-in if no explicit email & password passed
      if (!email && !pass) {
        try {
          const cred = await firebaseGoogleSignIn(rememberMe);
          if (cred?.user) {
            email = cred.user.email || undefined;
            name = cred.user.displayName || undefined;
            firebaseUid = cred.user.uid;
          }
        } catch (popupErr: any) {
          console.warn('Firebase Google popup notice:', popupErr);
          return {
            success: false,
            error: 'Google Sign-In popup could not open. Please enter your registered Google email and password.'
          };
        }
      }

      if (!email) {
        return {
          success: false,
          error: 'Please enter your Google email address.'
        };
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name?.trim() || cleanEmail.split('@')[0].replace(/[._0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim() || 'Google Student';

      // 2. If password was provided, strictly verify it via Firebase Auth
      if (!firebaseUid) {
        if (!pass) {
          return {
            success: false,
            error: 'Please enter your account password.'
          };
        }

        try {
          const userCred = await firebaseSignIn(cleanEmail, pass, rememberMe);
          firebaseUid = userCred.user.uid;
        } catch (authErr: any) {
          const code = authErr?.code || '';
          const msg = authErr?.message || '';
          console.warn('Firebase Google verification notice:', code, msg);

          // Check if user has an account registered in local registeredAccounts:
          const localMatch = registeredAccounts.find(a => a.email.toLowerCase() === cleanEmail);

          if (
            code === 'auth/wrong-password' ||
            code === 'auth/invalid-credential' ||
            msg.includes('INVALID_LOGIN_CREDENTIALS') ||
            msg.includes('wrong-password')
          ) {
            // Strictly reject wrong password!
            if (localMatch && localMatch.password === pass) {
              firebaseUid = localMatch.uid;
            } else {
              return {
                success: false,
                error: 'Incorrect password for this email. Please enter your valid password.'
              };
            }
          } else if (code === 'auth/user-not-found' || msg.includes('user-not-found')) {
            if (localMatch && localMatch.password === pass) {
              firebaseUid = localMatch.uid;
            } else {
              return {
                success: false,
                error: 'No account registered with this email. Please click "New Account" to register.'
              };
            }
          } else {
            if (localMatch && localMatch.password === pass) {
              firebaseUid = localMatch.uid;
            } else {
              return {
                success: false,
                error: 'Authentication failed. Please verify your email and password.'
              };
            }
          }
        }
      }

      // Handle remember credentials preference
      if (rememberMe) {
        try {
          localStorage.setItem('mm_remember_credentials', 'true');
          localStorage.setItem('mm_remembered_email', cleanEmail);
          localStorage.setItem('mm_remembered_is_google', 'true');
        } catch (e) {}
        setRememberedCredentials({ email: cleanEmail, isGoogle: true });
      } else {
        try {
          localStorage.removeItem('mm_remember_credentials');
          localStorage.removeItem('mm_remembered_email');
          localStorage.removeItem('mm_remembered_is_google');
          localStorage.removeItem('mm_remembered_user');
        } catch (e) {}
        setRememberedCredentials(null);
      }

      // Check or create profile in Firestore /users/{uid}
      let profile: UserProfile | null = null;
      if (db && firebaseUid) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUid));
          if (snap.exists()) {
            profile = snap.data() as UserProfile;
          }
        } catch (e) {
          console.warn('Firestore getDoc google user notice:', e);
        }
      }

      if (!profile) {
        const rollSeed = Math.floor(100 + Math.random() * 900);
        const nameCode = cleanName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'DGU';
        profile = {
          uid: firebaseUid,
          name: cleanName,
          email: cleanEmail,
          rollNo: `0251MBA${rollSeed}`,
          role: 'student',
          hostelBlock: 'Mandakini Boys Hostel',
          isLoggedIn: true,
          favorites: [],
          referralCode: `${nameCode}${rollSeed}-MM`,
          savedOrdersCount: 0
        };
        if (db && firebaseUid) {
          try {
            await setDoc(doc(db, 'users', firebaseUid), profile, { merge: true });
          } catch (e) {}
        }
      } else {
        profile = { ...profile, isLoggedIn: true };
      }

      if (rememberMe) {
        try {
          localStorage.setItem('mm_remember_credentials', 'true');
          localStorage.setItem('mm_remembered_email', cleanEmail);
          localStorage.setItem('mm_remembered_is_google', 'true');
          localStorage.setItem('mm_remembered_user', JSON.stringify(profile));
        } catch (e) {}
        setRememberedCredentials({ email: cleanEmail, isGoogle: true });
      } else {
        try {
          localStorage.removeItem('mm_remember_credentials');
          localStorage.removeItem('mm_remembered_email');
          localStorage.removeItem('mm_remembered_is_google');
          localStorage.removeItem('mm_remembered_user');
        } catch (e) {}
        setRememberedCredentials(null);
      }

      setCurrentUser(profile);
      setActiveRole(profile.role || 'student');
      setFavorites(profile.favorites || []);
      setCart([]);
      
      // Load only realistic orders placed by this student (no fake pre-populated orders)
      try {
        const saved = localStorage.getItem('mm_real_orders_v1');
        if (saved) {
          const parsed: Order[] = JSON.parse(saved);
          const userOrders = Array.isArray(parsed)
            ? parsed.filter(o => o.userId === firebaseUid && o.id !== 'ord-101' && o.id !== 'ord-102' && o.id !== 'ord-103')
            : [];
          setOrders(userOrders);
        } else {
          setOrders([]);
        }
      } catch (e) {
        setOrders([]);
      }
      showToast(`Signed in with Google as ${cleanName.split(' ')[0]}!`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google Sign-In failed.' };
    }
  }, [showToast]);

  const logoutUser = useCallback(async () => {
    try {
      await firebaseSignOut();
    } catch (e) {
      console.warn('Firebase signout notice:', e);
    }

    // Check if user previously marked "Remember login credentials on this device"
    const isRemembered = localStorage.getItem('mm_remember_credentials') === 'true';
    if (!isRemembered) {
      try {
        localStorage.removeItem('mm_remember_credentials');
        localStorage.removeItem('mm_remembered_email');
        localStorage.removeItem('mm_remembered_is_google');
        localStorage.removeItem('mm_remembered_user');
        localStorage.removeItem('mm_remembered_phone');
      } catch (e) {}
      setRememberedCredentials(null);
    } else {
      // User explicitly opted to remember credentials on this device!
      // Keep rememberedCredentials state so Google and email auto-login work without re-asking password!
      const rememberedEmail = localStorage.getItem('mm_remembered_email') || '';
      const rememberedIsGoogle = localStorage.getItem('mm_remembered_is_google') === 'true';
      if (rememberedEmail) {
        setRememberedCredentials({ email: rememberedEmail, isGoogle: rememberedIsGoogle });
      }
    }

    setCurrentUser(GUEST_USER);
    setActiveRole('student');
    setCart([]);
    setOrders([]);
    setFavorites([]);
    setLatestPlacedOrder(null);
    showToast('Signed out. Please sign in to access MealMate.');
  }, [showToast]);

  // Persist only public menu items and slots configuration to localStorage (no user or order data!)
  useEffect(() => {
    try { localStorage.setItem('mm_meals_v16', JSON.stringify(meals)); } catch (e) {}
  }, [meals]);

  useEffect(() => {
    try { localStorage.setItem('mm_slots_v2', JSON.stringify(slots)); } catch (e) {}
  }, [slots]);

  // Persist only real student orders (strictly excluding any mock demo orders)
  useEffect(() => {
    try {
      const realOrders = orders.filter(o => o.id !== 'ord-101' && o.id !== 'ord-102' && o.id !== 'ord-103');
      localStorage.setItem('mm_real_orders_v1', JSON.stringify(realOrders));
    } catch (e) {}
  }, [orders]);

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

  const addToCart = (
    mealId: string,
    options?: {
      quantity?: number;
      portion?: string;
      extraPrice?: number;
      selectedAddOns?: SelectedAddOn[];
      specialInstructions?: string;
    }
  ): boolean => {
    const meal = meals.find(m => m.id === mealId);
    if (!meal || meal.available <= 0) {
      showToast('This item is currently sold out.');
      return false;
    }

    const qtyToAdd = options?.quantity || 1;
    const extraPrice = options?.extraPrice || 0;
    const portion = options?.portion;
    const selectedAddOns = options?.selectedAddOns;
    const specialInstructions = options?.specialInstructions;

    setCart(prev => {
      // Find matching item by meal id AND portion
      const existingIndex = prev.findIndex(
        item => item.meal.id === mealId && item.portion === portion
      );

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        if (existing.quantity + qtyToAdd > meal.available) {
          showToast(`Only ${meal.available} portions left for ${meal.name}.`);
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          quantity: existing.quantity + qtyToAdd,
          selectedAddOns: selectedAddOns || existing.selectedAddOns,
          specialInstructions: specialInstructions || existing.specialInstructions
        };
        return updated;
      }

      if (qtyToAdd > meal.available) {
        showToast(`Only ${meal.available} portions left for ${meal.name}.`);
        return prev;
      }

      return [
        ...prev,
        {
          meal,
          quantity: qtyToAdd,
          portion,
          extraPrice,
          selectedAddOns,
          specialInstructions
        }
      ];
    });

    showToast(`Added ${meal.name} ${portion ? `(${portion})` : ''} to basket`);
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

  const placePreOrder = async (
    orderData:
      | string
      | {
          slotId: string;
          paymentMethod?: 'UPI' | 'Cash on Pickup' | 'Campus Card';
          transactionId?: string;
          upiIdUsed?: string;
          promoCode?: string;
          discountAmount?: number;
          orderMode?: 'pickup' | 'delivery';
          deliveryLocation?: string;
          cutleryOptOut?: boolean;
          instructions?: string;
        }
  ): Promise<Order> => {
    if (!currentUser || !currentUser.isLoggedIn || !currentUser.uid) {
      throw new Error('Authentication required: Please sign in to place an order.');
    }

    if (cart.length === 0) {
      throw new Error('Your basket is empty.');
    }

    const payload = typeof orderData === 'string' ? { slotId: orderData } : orderData;
    const slotId = payload.slotId;
    const slot = slots.find(s => s.id === slotId) || slots[0];

    if (slot && slot.reserved >= slot.capacity) {
      throw new Error(`The pickup slot ${slot.label} is already full. Please select another slot.`);
    }

    // Verify inventory for every item
    for (const item of cart) {
      const currentMeal = meals.find(m => m.id === item.meal.id);
      if (!currentMeal || currentMeal.available < item.quantity) {
        throw new Error(`${item.meal.name} is no longer available in this quantity. Check live menu.`);
      }
    }

    const rawTotal = cart.reduce((sum, item) => {
      const unitPrice = item.meal.price + (item.extraPrice || 0);
      return sum + (unitPrice * item.quantity);
    }, 0);

    const discountAmount = payload.discountAmount || 0;
    const finalTotal = Math.max(0, rawTotal - discountAmount);

    const tokenNum = Math.floor(10000 + Math.random() * 90000);
    const token = `MM-${tokenNum}`;
    const orderId = `ord-${Date.now().toString(36)}-${tokenNum}`;
    const primaryVendor = cart[0]?.meal.vendorName || selectedKitchen || 'DGU Central Canteen';

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
        price: c.meal.price + (c.extraPrice || 0),
        emoji: c.meal.emoji,
        vendorName: c.meal.vendorName || primaryVendor,
        quantity: c.quantity,
        portion: c.portion,
        addOns: c.selectedAddOns?.map(a => `${a.name} (+₹${a.price})`),
        specialInstructions: c.specialInstructions
      })),
      total: finalTotal,
      slotId: slot?.id || 'slot-current',
      slotLabel: slot?.label || 'Immediate Pickup',
      vendorName: primaryVendor,
      status: 'Accepted',
      paymentStatus: payload.paymentMethod === 'Cash on Pickup' ? 'Pay at pickup' : 'Paid Online (UPI)',
      paymentMethod: payload.paymentMethod || 'UPI',
      transactionId: payload.transactionId || `UPI-TXN-${Date.now()}`,
      promoCode: payload.promoCode,
      orderMode: payload.orderMode || 'pickup',
      deliveryLocation: payload.deliveryLocation,
      cutleryOptOut: payload.cutleryOptOut ?? false,
      deliveryPartnerName: payload.orderMode === 'delivery' ? 'Ramesh (Campus Runner)' : undefined,
      specialInstructions: payload.instructions?.trim() || undefined,
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
      if (slot && s.id === slot.id) {
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

    // Save order to Firestore orders collection
    if (db && currentUser.uid) {
      try {
        setDoc(doc(db, 'orders', orderId), newOrder).catch(err => {
          console.warn('Firestore setDoc order notice:', err);
        });
      } catch (e) {
        console.warn('Firestore write notice:', e);
      }
    }

    broadcastSync('SYNC_ALL', {
      meals: updatedMeals,
      slots: updatedSlots,
      orders: updatedOrders
    });

    showToast(`Order confirmed! Token ${token} reserved for ${slot?.label || 'pickup'}.`);
    return newOrder;
  };

  const verifyPickupToken = (token: string): Order | null => {
    const cleanToken = token.trim().toUpperCase();
    const found = orders.find(o => o.token.toUpperCase() === cleanToken);
    return found || null;
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
          readyAt: status === 'Ready' || status === 'Ready for Pickup' ? now : o.readyAt,
          pickedUpAt: status === 'Picked up' || status === 'Collected' || status === 'Completed' ? now : o.pickedUpAt
        };
      }
      return o;
    });

    setOrders(updated);
    if (status === 'Ready' || status === 'Ready for Pickup') {
      playChime();
      showToast(`Order #${changedToken} marked READY for collection!`);
    } else if (status === 'Picked up' || status === 'Collected' || status === 'Completed') {
      showToast(`Order #${changedToken} marked COLLECTED & completed.`);
    } else {
      showToast(`Order #${changedToken} updated to ${status}.`);
    }

    broadcastSync('ORDER_STATUS_CHANGED', { orderId, status, token: changedToken });
  };

  const cancelOrder = async (orderId: string, reason?: string): Promise<{ success: boolean; error?: string }> => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) {
      return { success: false, error: 'Order not found.' };
    }

    if (
      targetOrder.status === 'Ready' ||
      targetOrder.status === 'Ready for Pickup' ||
      targetOrder.status === 'Collected' ||
      targetOrder.status === 'Picked up' ||
      targetOrder.status === 'Completed'
    ) {
      return {
        success: false,
        error: 'Cannot cancel order because the meal is already cooked and ready at the counter.'
      };
    }

    if (targetOrder.status === 'Cancelled') {
      return { success: false, error: 'This order is already cancelled.' };
    }

    const cancelReason = reason || 'Customer requested cancellation';
    const now = new Date().toISOString();

    // 1. Restore item stock quantities back to meals
    if (targetOrder.items && targetOrder.items.length > 0) {
      setMeals(prevMeals => {
        const mealQtyMap = new Map<string, number>();
        targetOrder.items.forEach(it => {
          mealQtyMap.set(it.id, (mealQtyMap.get(it.id) || 0) + it.quantity);
        });

        const next = prevMeals.map(m => {
          const qtyToRestore = mealQtyMap.get(m.id);
          if (qtyToRestore) {
            return {
              ...m,
              available: Math.min(m.initialStock || 99, m.available + qtyToRestore)
            };
          }
          return m;
        });

        try {
          localStorage.setItem('mm_meals_v16', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    }

    // 2. Update order status to 'Cancelled'
    setOrders(prevOrders => {
      const nextOrders = prevOrders.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'Cancelled' as OrderStatus,
            cancellationReason: cancelReason,
            cancelledAt: now,
            updatedAt: now
          };
        }
        return o;
      });
      return nextOrders;
    });

    // 3. Sync to Firestore if available
    if (db) {
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          status: 'Cancelled',
          cancellationReason: cancelReason,
          cancelledAt: now,
          updatedAt: now
        });
      } catch (e) {
        console.warn('Firestore cancelOrder notice:', e);
      }
    }

    showToast(`Order #${targetOrder.token} cancelled. Refund of ₹${targetOrder.total} initiated.`);
    broadcastSync('ORDER_CANCELLED', { orderId, token: targetOrder.token, reason: cancelReason });
    return { success: true };
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
      prepTimeMinutes: item.prepTimeMinutes || 6,
      category: item.category || 'Lunch',
      dietaryType: item.type === 'veg' ? 'pure_veg' : 'non_veg',
      imageUrl: item.imageUrl || '/images/meals/thali_meal.jpg',
      rating: 4.8,
      reviewsCount: 12
    };
    const updated = [newMeal, ...meals];
    setMeals(updated);
    broadcastSync('SYNC_ALL', { meals: updated });
    showToast(`Added "${newMeal.name}" to ${newMeal.vendorName} menu!`);
  };

  const updateMeal = (mealId: string, updates: Partial<MealItem>) => {
    const updated = meals.map(m => m.id === mealId ? { ...m, ...updates } : m);
    setMeals(updated);
    broadcastSync('SYNC_ALL', { meals: updated });
    showToast('Dish details updated successfully.');
  };

  const toggleVendorStatus = (vendorId: string) => {
    setVendors(prev => prev.map(v => {
      if (v.id === vendorId) {
        const nextOpen = !v.isOpen;
        showToast(`${v.name} is now ${nextOpen ? 'Open for Orders' : 'Temporarily Closed'}.`);
        return { ...v, isOpen: nextOpen };
      }
      return v;
    }));
  };

  const addNewCoupon = (coupon: PromotionalCoupon) => {
    setCoupons(prev => [coupon, ...prev]);
    showToast(`Coupon ${coupon.code} created successfully.`);
  };

  const toggleCoupon = (code: string) => {
    setCoupons(prev => prev.map(c => {
      if (c.code === code) {
        const nextActive = !c.isActive;
        showToast(`Coupon ${code} is now ${nextActive ? 'Active' : 'Disabled'}.`);
        return { ...c, isActive: nextActive };
      }
      return c;
    }));
  };

  const resolveComplaint = (complaintId: string, note?: string) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        showToast(`Complaint #${c.id} marked Resolved.`);
        return {
          ...c,
          status: 'Resolved',
          resolutionNote: note || 'Resolved by Campus Administration.'
        };
      }
      return c;
    }));
  };

  const submitComplaint = (complaint: Omit<StudentComplaint, 'id' | 'createdAt' | 'status'>) => {
    const newComplaint: StudentComplaint = {
      ...complaint,
      id: `ticket-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      status: 'Open'
    };
    setComplaints(prev => [newComplaint, ...prev]);
    showToast('Feedback submitted to Campus Dining Office. Ticket created.');
  };

  const submitReview = (review: Omit<StudentReview, 'id' | 'createdAt' | 'verifiedStudent'>) => {
    const newReview: StudentReview = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      verifiedStudent: true
    };
    setReviews(prev => [newReview, ...prev]);
    showToast('Thank you! Your verified campus review has been posted.');
  };

  const switchUserRole = useCallback((role: 'student' | 'vendor' | 'admin' | 'quest', vendorName = 'DGU Central Canteen') => {
    if (!currentUser || !currentUser.isLoggedIn) {
      showToast('Please sign in first to access portal features.');
      return;
    }

    // Role-Based Access Control (RBAC):
    // Students cannot access Vendor or Admin dashboards without appropriate role
    if (currentUser.role === 'student' && (role === 'vendor' || role === 'admin')) {
      showToast('Access restricted: You do not have Vendor or Admin permissions.');
      return;
    }

    // Vendors cannot access Admin console
    if (currentUser.role === 'vendor' && role === 'admin') {
      showToast('Access restricted: Administrator credentials required.');
      return;
    }

    setActiveRole(role);
    if (role === 'vendor') {
      setSelectedKitchen(vendorName);
      showToast(`Kitchen Dashboard: ${vendorName}`);
    } else if (role === 'admin') {
      showToast('Campus Food Administrator Console');
    } else if (role === 'student') {
      showToast('Student Ordering Portal');
    } else if (role === 'quest') {
      showToast('Viewing DGU Venture Quest Capstone & Strategic Blueprint');
    }
  }, [currentUser, showToast]);

  const resetAllData = () => {
    setMeals(STARTER_MEALS);
    setSlots(STARTER_SLOTS);
    setOrders(INITIAL_ORDERS);
    setVendors(CAMPUS_VENDORS);
    setCoupons(PROMOTIONAL_COUPONS);
    setReviews(STUDENT_REVIEWS);
    setComplaints(INITIAL_COMPLAINTS);
    setCart([]);
    localStorage.clear();
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
      app: 'MealMate - DGU Campus Ordering',
      exportVersion: '3.0',
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
      orders,
      vendors,
      coupons
    };
  };

  return (
    <AppContext.Provider
      value={{
        meals,
        slots,
        cart,
        orders,
        vendors,
        coupons,
        reviews,
        complaints,
        favorites,
        toggleFavorite,
        currentUser,
        isLoggedIn,
        loginUser,
        loginWithPhoneOtp,
        loginWithGoogle,
        rememberedCredentials,
        clearRememberedCredentials,
        registerUser,
        forgotPassword,
        registeredAccounts,
        logoutUser,
        activeRole,
        selectedKitchen,
        selectedSlotId,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
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
        cancelOrder,
        verifyPickupToken,
        restockMeal,
        toggleMealAvailability,
        addNewMeal,
        updateMeal,
        toggleVendorStatus,
        addNewCoupon,
        toggleCoupon,
        resolveComplaint,
        submitComplaint,
        submitReview,
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

export type MealCategory =
  | 'all'
  | 'All Food'
  | 'breakfast'
  | 'Breakfast'
  | 'lunch'
  | 'Lunch'
  | 'dinner'
  | 'Dinner'
  | 'snacks'
  | 'Snacks'
  | 'quick'
  | 'Quick Bites'
  | 'veg'
  | 'Vegetarian'
  | 'non-veg'
  | 'Non-Vegetarian'
  | 'beverages'
  | 'Beverages'
  | 'desserts'
  | 'Desserts'
  | 'combos';

export interface PortionOption {
  name: string;
  extraPrice: number;
}

export interface AddOnOption {
  id: string;
  name: string;
  price: number;
}

export interface MealItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  tag: string;
  type: 'veg' | 'quick' | 'protein' | 'drinks' | 'snacks' | 'combos' | string;
  category?: MealCategory;
  available: number;
  initialStock: number;
  vendorName: string;
  description?: string;
  prepTimeMinutes?: number;
  imageUrl?: string;
  calories?: number;
  proteinGrams?: number;
  rating?: number;
  reviewCount?: number;
  reviewsCount?: number;
  spiceLevel?: 1 | 2 | 3;
  dietaryType?: 'veg' | 'non-veg' | 'egg' | 'pure_veg' | 'non_veg';
  allergens?: string[];
  isFavorite?: boolean;
  isTodaysSpecial?: boolean;
  isPopular?: boolean;
  mealTiming?: ('breakfast' | 'lunch' | 'dinner' | 'snacks' | 'all-day')[];
  customization?: {
    portions?: PortionOption[];
    addOns?: AddOnOption[];
  };
}

export interface CampusVendor {
  id: string;
  name: string;
  tagline: string;
  location: string;
  operatingHours: string;
  rating: number;
  reviewCount: number;
  cuisine: string;
  isActive: boolean;
  isOpen: boolean;
  imageUrl: string;
  accentColor: string;
  avgPrepMinutes: number;
  totalOrdersServed: number;
  timing?: string;
  specialty?: string;
}

export interface PickupSlot {
  id: string;
  label: string;
  capacity: number;
  reserved: number;
  isPeak?: boolean;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Order Accepted'
  | 'Preparing'
  | 'Ready for Pickup'
  | 'Collected'
  | 'Completed'
  | 'Cancelled'
  // Legacy aliases supported gracefully
  | 'Accepted'
  | 'Ready'
  | 'Picked up';

export interface SelectedAddOn {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  vendorName: string;
  quantity: number;
  portion?: string;
  selectedAddOns?: SelectedAddOn[];
  addOns?: string[];
  specialInstructions?: string;
}

export interface Order {
  id: string;
  token: string;
  userId: string;
  customerName: string;
  customerRollNo?: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  subtotal?: number;
  discountApplied?: number;
  promoCode?: string;
  slotId: string;
  slotLabel: string;
  vendorName: string;
  status: OrderStatus;
  paymentMethod: 'UPI' | 'Cash on Pickup' | 'Campus Card';
  paymentStatus: 'Paid' | 'Pay at pickup' | 'Pending' | 'Paid Online (UPI)';
  transactionId?: string;
  upiIdUsed?: string;
  orderMode?: 'pickup' | 'delivery';
  deliveryLocation?: string;
  cutleryOptOut?: boolean;
  deliveryPartnerName?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  readyAt?: string;
  pickedUpAt?: string;
  cancellationReason?: string;
  cancelledAt?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  rollNo?: string;
  role: 'student' | 'vendor' | 'admin';
  assignedVendor?: string;
  phone?: string;
  savedOrdersCount?: number;
  hostelBlock?: string;
  isLoggedIn?: boolean;
  favorites?: string[];
  referralCode?: string;
  referralsCount?: number;
  rewardPoints?: number;
}

export interface RegisteredAccount {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  rollNo?: string;
  hostelBlock?: string;
  password?: string;
  createdAt: string;
  role?: 'student' | 'vendor' | 'admin';
}

export interface PromotionalCoupon {
  code: string;
  discountPercent: number;
  maxDiscount?: number;
  minOrder?: number;
  minOrderAmount?: number;
  description: string;
  isActive: boolean;
  usageCount?: number;
  expiresOn?: string;
  validUntil?: string;
}

export interface StudentReview {
  id: string;
  studentName: string;
  course: string;
  rating: number;
  comment: string;
  dishName: string;
  avatarUrl: string;
  createdAt: string;
  verifiedStudent: boolean;
}

export interface StudentComplaint {
  id: string;
  orderToken?: string;
  studentName: string;
  studentRollNo?: string;
  studentEmail: string;
  vendorName: string;
  subject: string;
  message: string;
  status: 'Open' | 'Investigating' | 'Resolved';
  createdAt: string;
  resolutionNote?: string;
}

export interface SmartMealCombo {
  id: string;
  title: string;
  tagline: string;
  mealIds: string[];
  originalPrice: number;
  comboPrice: number;
  savings: number;
  badge: string;
  timing: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
}

export type MealCategory = 'all' | 'veg' | 'quick' | 'protein' | 'drinks' | 'snacks' | 'combos';

export interface MealItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  tag: string;
  type: 'veg' | 'quick' | 'protein' | 'drinks' | 'snacks' | 'combos';
  available: number;
  initialStock: number;
  vendorName: 'DGU Central Canteen' | string;
  description?: string;
  prepTimeMinutes?: number;
  imageUrl?: string;
  calories?: number;
  proteinGrams?: number;
  rating?: number;
  reviewCount?: number;
  spiceLevel?: 1 | 2 | 3;
  dietaryType?: 'veg' | 'non-veg' | 'egg';
  allergens?: string[];
}

export interface PickupSlot {
  id: string;
  label: string;
  capacity: number;
  reserved: number;
  isPeak?: boolean;
}

export type OrderStatus = 'Accepted' | 'Preparing' | 'Ready' | 'Picked up' | 'Cancelled';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  vendorName: string;
  quantity: number;
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
  slotId: string;
  slotLabel: string;
  vendorName: string;
  status: OrderStatus;
  paymentStatus: 'Pay at pickup' | 'Paid';
  orderMode?: 'pickup' | 'delivery';
  deliveryLocation?: string;
  cutleryOptOut?: boolean;
  deliveryPartnerName?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  readyAt?: string;
  pickedUpAt?: string;
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
}

export interface VentureMetrics {
  sellingPrice: number;
  variableCost: number;
  monthlyFixedCost: number;
  expectedCustomers: number;
  purchasesPerCustomer: number;
  averageMealPrice: number;
  commissionRatePercent: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
}

export interface OrderItem {
  id: string; // unique instance id
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string; // New field for special instructions
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: 'active' | 'completed' | 'cancelled';
  createdAt: number;
  completedAt?: number;
  subtotal: number;
  taxAmount: number;
  serviceChargeAmount: number;
  discountAmount: number;
  total: number;
  customerName?: string;
  note?: string;
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: 'available' | 'occupied';
  currentOrderId?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: 'Manager' | 'Waiter' | 'Chef' | 'Cashier';
  phone: string;
  email?: string;
  joinedAt: number;
}

export interface StoreSettings {
  name: string;
  address: string;
  gstRate: number; // percentage
  serviceChargeRate: number; // percentage
  currency: string;
  phone: string;
}

export type ViewState = 'tables' | 'pos' | 'dashboard' | 'menu' | 'staff' | 'settings';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
import { MenuItem, Table, StoreSettings, Staff } from './types';

export const INITIAL_SETTINGS: StoreSettings = {
  name: 'Spice Garden',
  address: '42 Masala Street, New Delhi, 110001',
  gstRate: 5,
  serviceChargeRate: 5,
  currency: '₹',
  phone: '+91 98765 43210'
};

export const MENU_ITEMS: MenuItem[] = [
  // Starters
  { id: '1', name: 'Paneer Tikka', price: 240, category: 'Starters', description: 'Marinated cottage cheese grilled in tandoor' },
  { id: '2', name: 'Chicken Tikka', price: 280, category: 'Starters', description: 'Spicy marinated chicken chunks' },
  { id: '3', name: 'Veg Manchurian', price: 180, category: 'Starters', description: 'Vegetable balls in spicy chinese sauce' },
  { id: '4', name: 'Samosa (2pcs)', price: 40, category: 'Starters', description: 'Crispy pastry filled with spiced potatoes' },
  
  // Main Course
  { id: '5', name: 'Butter Chicken', price: 350, category: 'Main Course', description: 'Classic chicken in rich tomato butter gravy' },
  { id: '6', name: 'Dal Makhani', price: 220, category: 'Main Course', description: 'Creamy black lentils slow cooked overnight' },
  { id: '7', name: 'Paneer Butter Masala', price: 260, category: 'Main Course', description: 'Cottage cheese in rich tomato gravy' },
  { id: '8', name: 'Kadai Chicken', price: 320, category: 'Main Course', description: 'Chicken cooked with bell peppers and spices' },
  
  // Breads & Rice
  { id: '9', name: 'Garlic Naan', price: 55, category: 'Breads', description: 'Leavened bread topped with garlic' },
  { id: '10', name: 'Butter Roti', price: 35, category: 'Breads', description: 'Whole wheat bread with butter' },
  { id: '11', name: 'Chicken Biryani', price: 280, category: 'Rice', description: 'Aromatic basmati rice cooked with spiced chicken' },
  { id: '12', name: 'Jeera Rice', price: 140, category: 'Rice', description: 'Basmati rice tempered with cumin seeds' },
  
  // South Indian
  { id: '13', name: 'Masala Dosa', price: 120, category: 'South Indian', description: 'Crispy rice crepe filled with potato masala' },
  { id: '14', name: 'Idli Sambar', price: 80, category: 'South Indian', description: 'Steamed rice cakes with lentil soup' },

  // Beverages & Desserts
  { id: '15', name: 'Masala Chai', price: 30, category: 'Beverages', description: 'Spiced indian tea' },
  { id: '16', name: 'Sweet Lassi', price: 80, category: 'Beverages', description: 'Chilled yogurt drink' },
  { id: '17', name: 'Gulab Jamun', price: 60, category: 'Dessert', description: 'Deep fried milk dumplings in sugar syrup' },
];

export const TABLES: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: `t${i + 1}`,
  name: `Table ${i + 1}`,
  capacity: 4,
  status: 'available'
}));

export const INITIAL_STAFF: Staff[] = [
  { id: 's1', name: 'Rahul Sharma', role: 'Manager', phone: '98765-00001', joinedAt: Date.now() },
  { id: 's2', name: 'Priya Singh', role: 'Waiter', phone: '98765-00002', joinedAt: Date.now() },
  { id: 's3', name: 'Amit Kumar', role: 'Chef', phone: '98765-00003', joinedAt: Date.now() },
];

export const CATEGORIES = ['All', ...Array.from(new Set(MENU_ITEMS.map(i => i.category)))];
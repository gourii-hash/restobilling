import React, { useState, useEffect } from 'react';
import { MenuItem, Order, StoreSettings, Table } from '../types';
import { Search, Plus, Minus, Trash2, Receipt, ChefHat, Save, Loader2, MessageSquare } from 'lucide-react';

interface POSViewProps {
  activeTable: Table;
  activeOrder: Order | null;
  menu: MenuItem[];
  categories: string[];
  settings: StoreSettings;
  onUpdateOrder: (order: Order) => void;
  onCompleteOrder: (order: Order) => void;
  onPrintBill: (order: Order) => void;
  onExit: () => void;
  isPrinting?: boolean;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const POSView: React.FC<POSViewProps> = ({
  activeTable,
  activeOrder,
  menu,
  categories,
  settings,
  onUpdateOrder,
  onCompleteOrder,
  onPrintBill,
  onExit,
  isPrinting = false,
  showToast
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [localOrder, setLocalOrder] = useState<Order | null>(activeOrder);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeOrder) {
      setLocalOrder({
        id: crypto.randomUUID(),
        tableId: activeTable.id,
        items: [],
        status: 'active',
        createdAt: Date.now(),
        subtotal: 0,
        taxAmount: 0,
        serviceChargeAmount: 0,
        discountAmount: 0,
        total: 0
      });
    } else {
      setLocalOrder(activeOrder);
    }
  }, [activeOrder, activeTable.id]);

  const calculateTotals = (items: Order['items']) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = (subtotal * settings.gstRate) / 100;
    const serviceChargeAmount = (subtotal * settings.serviceChargeRate) / 100;
    const total = subtotal + taxAmount + serviceChargeAmount;
    return { subtotal, taxAmount, serviceChargeAmount, total };
  };

  const addToOrder = (menuItem: MenuItem) => {
    if (!localOrder) return;

    // Always add as a new line item to allow distinct notes per item? 
    // Or group by ID? Grouping is standard, but if they want different notes, we might need a distinct ID logic.
    // For simplicity, we group by menuItemId. 
    
    const existingItemIndex = localOrder.items.findIndex(i => i.menuItemId === menuItem.id);
    let newItems;

    if (existingItemIndex > -1) {
      // Create a new array to trigger re-render
      newItems = [...localOrder.items];
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + 1
      };
    } else {
      newItems = [...localOrder.items, {
        id: crypto.randomUUID(),
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        note: ''
      }];
    }

    const totals = calculateTotals(newItems);
    const updatedOrder = { ...localOrder, items: newItems, ...totals };
    setLocalOrder(updatedOrder);
    onUpdateOrder(updatedOrder);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    if (!localOrder) return;

    const newItems = localOrder.items.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0);

    const totals = calculateTotals(newItems);
    const updatedOrder = { ...localOrder, items: newItems, ...totals };
    setLocalOrder(updatedOrder);
    onUpdateOrder(updatedOrder);
  };

  const updateItemNote = (itemId: string, note: string) => {
    if (!localOrder) return;
    const newItems = localOrder.items.map(item => 
      item.id === itemId ? { ...item, note } : item
    );
    const updatedOrder = { ...localOrder, items: newItems };
    setLocalOrder(updatedOrder);
    onUpdateOrder(updatedOrder);
  };

  const handlePrintClick = () => {
    if (!localOrder || localOrder.items.length === 0) return;
    onPrintBill(localOrder);
    showToast('Printing bill...', 'info');
  };

  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!localOrder) return <div>Loading...</div>;

  return (
    <div className="flex h-full flex-col md:flex-row gap-4">
      {/* Left: Menu Area */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search & Categories */}
        <div className="p-4 border-b border-gray-100 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search menu..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-primary text-white shadow-md shadow-blue-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenu.map(item => (
              <button
                key={item.id}
                onClick={() => addToOrder(item)}
                className="flex flex-col items-start p-4 bg-gray-50 rounded-xl hover:bg-blue-50 hover:ring-2 hover:ring-primary/20 transition-all text-left group active:scale-95 duration-75"
              >
                <div className="w-full flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-800 line-clamp-1 group-hover:text-primary">{item.name}</span>
                  <span className="text-sm font-bold text-gray-900">{settings.currency}{item.price}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.description}</p>
                <div className="mt-auto self-end bg-white shadow-sm p-1.5 rounded-full text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus size={16} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Order Summary */}
      <div className="w-full md:w-96 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
          <div className="flex justify-between items-center mb-1">
            <h2 className="font-bold text-lg text-gray-800">Order #{localOrder.id.slice(0, 6)}</h2>
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">{activeTable.name}</span>
          </div>
          <p className="text-xs text-gray-500">{new Date().toLocaleString()}</p>
        </div>

        {/* Order Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {localOrder.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
              <ChefHat size={48} className="opacity-20" />
              <p>No items added yet</p>
            </div>
          ) : (
            localOrder.items.map(item => (
              <div key={item.id} className="flex flex-col gap-2 group border-b border-gray-50 pb-2 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{settings.currency}{item.price}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-white rounded-md transition-colors text-gray-600 hover:text-red-500"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-white rounded-md transition-colors text-gray-600 hover:text-green-500"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-sm font-bold w-16 text-right">
                      {settings.currency}{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
                
                {/* Notes Section */}
                <div className="flex items-start gap-2">
                   {editingNoteId === item.id ? (
                     <div className="flex-1 flex gap-2">
                       <input 
                         type="text" 
                         autoFocus
                         className="flex-1 text-xs border border-blue-200 bg-blue-50 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                         placeholder="Add note (e.g. no onions)"
                         value={item.note || ''}
                         onChange={(e) => updateItemNote(item.id, e.target.value)}
                         onBlur={() => setEditingNoteId(null)}
                         onKeyDown={(e) => e.key === 'Enter' && setEditingNoteId(null)}
                       />
                     </div>
                   ) : (
                     <button 
                       onClick={() => setEditingNoteId(item.id)}
                       className={`flex items-center gap-1 text-xs hover:bg-gray-100 px-2 py-1 rounded transition-colors ${item.note ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
                     >
                       <MessageSquare size={12} />
                       <span>{item.note || 'Add Note'}</span>
                     </button>
                   )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl space-y-4">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{settings.currency}{localOrder.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>GST ({settings.gstRate}%)</span>
              <span>{settings.currency}{localOrder.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Service Charge ({settings.serviceChargeRate}%)</span>
              <span>{settings.currency}{localOrder.serviceChargeAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-800 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{settings.currency}{localOrder.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
               onClick={onExit}
               disabled={isPrinting}
               className="col-span-2 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
            >
               Back to Tables
            </button>
            <button 
              onClick={handlePrintClick}
              disabled={isPrinting || localOrder.items.length === 0}
              className="flex items-center justify-center space-x-2 bg-white border border-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPrinting ? <Loader2 size={18} className="animate-spin" /> : <Receipt size={18} />}
              <span>{isPrinting ? 'Printing...' : 'Print Bill'}</span>
            </button>
            <button 
              onClick={() => onCompleteOrder(localOrder)}
              disabled={localOrder.items.length === 0 || isPrinting}
              className="flex items-center justify-center space-x-2 bg-primary text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Save size={18} />
              <span>Complete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
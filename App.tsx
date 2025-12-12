import React, { useState, useEffect } from 'react';
import { ViewState, Table, Order, StoreSettings, ToastMessage, MenuItem, Staff } from './types';
import { MENU_ITEMS, TABLES, INITIAL_SETTINGS, INITIAL_STAFF, CATEGORIES as INITIAL_CATEGORIES } from './constants';
import { LayoutDashboard, Grid, Settings as SettingsIcon, Utensils, Users } from 'lucide-react';
import { TablesView } from './components/TablesView';
import { POSView } from './components/POSView';
import { Dashboard } from './components/Dashboard';
import { SettingsView } from './components/SettingsView';
import { MenuView } from './components/MenuView';
import { StaffView } from './components/StaffView';
import { BillTemplate } from './components/BillTemplate';
import { ToastContainer } from './components/ToastContainer';

const App: React.FC = () => {
  // --- Global State ---
  const [view, setView] = useState<ViewState>('tables');
  
  // Data State
  const [tables, setTables] = useState<Table[]>(TABLES);
  const [orders, setOrders] = useState<Record<string, Order>>({}); 
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);

  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // --- Persistence Logic ---
  useEffect(() => {
    // Load from local storage on mount
    const savedTables = localStorage.getItem('rb_tables');
    const savedOrders = localStorage.getItem('rb_orders');
    const savedSettings = localStorage.getItem('rb_settings');
    const savedMenu = localStorage.getItem('rb_menu');
    const savedStaff = localStorage.getItem('rb_staff');

    if (savedTables) setTables(JSON.parse(savedTables));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedMenu) setMenuItems(JSON.parse(savedMenu));
    if (savedStaff) setStaff(JSON.parse(savedStaff));
    
    setDataLoaded(true);
  }, []);

  useEffect(() => {
    if (dataLoaded) {
      localStorage.setItem('rb_tables', JSON.stringify(tables));
      localStorage.setItem('rb_orders', JSON.stringify(orders));
      localStorage.setItem('rb_settings', JSON.stringify(settings));
      localStorage.setItem('rb_menu', JSON.stringify(menuItems));
      localStorage.setItem('rb_staff', JSON.stringify(staff));
    }
  }, [tables, orders, settings, menuItems, staff, dataLoaded]);

  // --- Toast Logic ---
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Actions ---

  const handleSelectTable = (tableId: string) => {
    setActiveTableId(tableId);
    setView('pos');
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders(prev => ({ ...prev, [updatedOrder.id]: updatedOrder }));
    
    // If this is a new order for the table, link it
    setTables(prev => prev.map(t => {
      if (t.id === updatedOrder.tableId && t.status === 'available') {
        return { ...t, status: 'occupied', currentOrderId: updatedOrder.id };
      }
      return t;
    }));
  };

  const handleCompleteOrder = (order: Order) => {
    // Mark order as completed
    const completedOrder: Order = { 
      ...order, 
      status: 'completed', 
      completedAt: Date.now() 
    };
    
    setOrders(prev => ({ ...prev, [order.id]: completedOrder }));
    
    // Free up the table
    setTables(prev => prev.map(t => {
      if (t.id === order.tableId) {
        return { ...t, status: 'available', currentOrderId: undefined };
      }
      return t;
    }));

    setActiveTableId(null);
    setView('tables');
    showToast(`Order for Table ${order.tableId.replace('t', '')} completed!`, 'success');
  };

  const handlePrintBill = (order: Order) => {
    setPrintOrder(order);
    // Note: We don't automatically window.print() here anymore. 
    // The BillTemplate component will handle the print button action.
  };

  const handleClosePrint = () => {
    setPrintOrder(null);
  };

  // --- Derived State for Views ---
  const activeTable = activeTableId ? tables.find(t => t.id === activeTableId) : null;
  const activeOrder = activeTable?.currentOrderId ? orders[activeTable.currentOrderId] : null;
  const allOrdersList = Object.values(orders);

  // Dynamic Categories from Menu Items
  const categories = ['All', ...Array.from(new Set(menuItems.map(i => i.category)))];

  if (!dataLoaded) return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500">Loading data...</div>;

  return (
    <div className="flex h-screen w-full bg-gray-50 text-slate-900 font-sans print:bg-white">
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Sidebar - Hidden on print */}
      <aside className="w-20 lg:w-64 bg-white border-r border-gray-200 flex flex-col justify-between print:hidden flex-shrink-0 z-20">
        <div>
          <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-100">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
              R
            </div>
            <span className="ml-3 font-bold text-lg hidden lg:block text-gray-800">RestoBill AI</span>
          </div>

          <nav className="mt-6 px-2 lg:px-4 space-y-2">
            <NavButton view="tables" current={view} icon={<Grid size={22} />} label="Tables" onClick={() => { setView('tables'); setActiveTableId(null); }} />
            <NavButton view="pos" current={view} icon={<Utensils size={22} />} label="POS (Active)" onClick={() => { if(activeTableId) setView('pos'); else showToast('Select a table first', 'error'); }} />
            <div className="border-t border-gray-100 my-2 pt-2"></div>
            <NavButton view="dashboard" current={view} icon={<LayoutDashboard size={22} />} label="Reports" onClick={() => { setView('dashboard'); setActiveTableId(null); }} />
            <NavButton view="menu" current={view} icon={<Utensils size={22} />} label="Menu" onClick={() => { setView('menu'); setActiveTableId(null); }} />
            <NavButton view="staff" current={view} icon={<Users size={22} />} label="Staff" onClick={() => { setView('staff'); setActiveTableId(null); }} />
            <NavButton view="settings" current={view} icon={<SettingsIcon size={22} />} label="Settings" onClick={() => { setView('settings'); setActiveTableId(null); }} />
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 px-2 lg:px-3 py-2 text-gray-400">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-xs font-bold">JD</span>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-gray-700">John Doe</p>
              <p className="text-xs">Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Hidden on print */}
      <main className="flex-1 overflow-hidden h-full relative print:hidden">
        {/* Header (Mobile mostly) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between lg:hidden z-10">
          <span className="font-bold text-lg">RestoBill AI</span>
        </header>

        <div className="h-[calc(100vh-4rem)] lg:h-full overflow-y-auto bg-gray-50">
          {view === 'tables' && (
            <TablesView 
              tables={tables} 
              activeOrders={orders} 
              settings={settings}
              onSelectTable={handleSelectTable} 
            />
          )}

          {view === 'pos' && activeTable && (
            <div className="h-full p-4 lg:p-6">
              <POSView 
                activeTable={activeTable}
                activeOrder={activeOrder}
                menu={menuItems}
                categories={categories}
                settings={settings}
                onUpdateOrder={handleUpdateOrder}
                onCompleteOrder={handleCompleteOrder}
                onPrintBill={handlePrintBill}
                onExit={() => setView('tables')}
                isPrinting={printOrder !== null}
                showToast={showToast}
              />
            </div>
          )}

          {view === 'dashboard' && (
            <Dashboard 
              orders={allOrdersList} 
              menu={menuItems}
              settings={settings}
            />
          )}

          {view === 'menu' && (
            <MenuView 
              menu={menuItems}
              settings={settings}
              onUpdateMenu={setMenuItems}
              showToast={showToast}
            />
          )}

          {view === 'staff' && (
            <StaffView 
              staffList={staff}
              onUpdateStaff={setStaff}
              showToast={showToast}
            />
          )}

          {view === 'settings' && (
            <SettingsView 
              settings={settings} 
              onUpdate={setSettings}
              showToast={showToast}
            />
          )}
        </div>
      </main>

      {/* Print Overlay */}
      {printOrder && (
        <BillTemplate 
          order={printOrder} 
          settings={settings} 
          tableId={printOrder.tableId} 
          onClose={handleClosePrint}
        />
      )}
      
    </div>
  );
};

// Helper for Nav
const NavButton: React.FC<{ view: string; current: string; icon: React.ReactNode; label: string; onClick: () => void }> = ({ view, current, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-center lg:justify-start space-x-0 lg:space-x-3 px-3 py-3 rounded-xl transition-all ${
      current === view ? 'bg-blue-50 text-primary font-medium' : 'text-gray-500 hover:bg-gray-50'
    }`}
  >
    {icon}
    <span className="hidden lg:block">{label}</span>
  </button>
);

export default App;
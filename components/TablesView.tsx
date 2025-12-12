import React from 'react';
import { Table, Order, StoreSettings } from '../types';
import { Users, Coffee } from 'lucide-react';

interface TablesViewProps {
  tables: Table[];
  activeOrders: Record<string, Order>;
  settings: StoreSettings;
  onSelectTable: (tableId: string) => void;
}

export const TablesView: React.FC<TablesViewProps> = ({ tables, activeOrders, settings, onSelectTable }) => {
  return (
    <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Tables Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {tables.map(table => {
            const order = table.currentOrderId ? activeOrders[table.currentOrderId] : null;
            const isOccupied = table.status === 'occupied';

            return (
              <button
                key={table.id}
                onClick={() => onSelectTable(table.id)}
                className={`relative flex flex-col p-6 rounded-2xl transition-all duration-200 border-2 ${
                  isOccupied 
                    ? 'bg-red-50 border-red-200 hover:border-red-300' 
                    : 'bg-white border-gray-100 hover:border-blue-300 hover:shadow-lg'
                }`}
              >
                <div className="flex justify-between items-start w-full mb-4">
                  <span className={`text-lg font-bold ${isOccupied ? 'text-red-700' : 'text-gray-700'}`}>
                    {table.name}
                  </span>
                  <div className={`p-2 rounded-full ${isOccupied ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Users size={20} />
                  </div>
                </div>

                <div className="mt-auto w-full">
                  {isOccupied && order ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm text-red-600 font-medium">
                        <span>Occupied</span>
                        <span>{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        {settings.currency}{order.total.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.items.reduce((acc, i) => acc + i.quantity, 0)} items
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-green-600">
                      <Coffee size={16} />
                      <span className="font-medium">Available</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
    </div>
  );
};

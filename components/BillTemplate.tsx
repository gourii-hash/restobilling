import React from 'react';
import { Order, StoreSettings } from '../types';
import { Printer, X, ArrowLeft } from 'lucide-react';

interface BillTemplateProps {
  order: Order | null;
  settings: StoreSettings;
  tableId?: string;
  onClose?: () => void;
}

export const BillTemplate: React.FC<BillTemplateProps> = ({ order, settings, tableId, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      id="printable-bill" 
      className="fixed inset-0 w-full h-full bg-white z-[9999] overflow-y-auto flex flex-col"
    >
      {/* Action Bar - Hidden during print */}
      <div className="print:hidden sticky top-0 bg-gray-900/90 backdrop-blur text-white p-4 flex justify-between items-center shadow-lg">
        <button 
          onClick={onClose}
          className="flex items-center space-x-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to POS</span>
        </button>
        <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm hidden md:inline">Check details before printing</span>
            <button 
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95"
            >
              <Printer size={20} />
              <span>Print Bill</span>
            </button>
        </div>
      </div>

      {/* Printable Content */}
      <div className="p-8 font-mono text-sm leading-tight max-w-lg mx-auto w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-widest">{settings.name}</h1>
          <p className="mt-1 text-gray-600">{settings.address}</p>
          <p className="text-gray-600">Tel: {settings.phone}</p>
        </div>

        <div className="mb-4 border-b border-gray-300 pb-2">
          <div className="flex justify-between">
            <span>Date: {new Date().toLocaleDateString()}</span>
            <span>Time: {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Bill #: {order.id.slice(0, 8).toUpperCase()}</span>
            <span>Table: {tableId?.replace('t', '')}</span>
          </div>
          {order.customerName && (
             <div className="mt-1">Customer: {order.customerName}</div>
          )}
        </div>

        <table className="w-full mb-4">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left py-1">Item</th>
              <th className="text-right py-1">Qty</th>
              <th className="text-right py-1">Price</th>
              <th className="text-right py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="py-1">
                  <div>{item.name}</div>
                  {item.note && <div className="text-[10px] italic text-gray-500">Note: {item.note}</div>}
                </td>
                <td className="text-right py-1 align-top">{item.quantity}</td>
                <td className="text-right py-1 align-top">{settings.currency}{item.price.toFixed(2)}</td>
                <td className="text-right py-1 align-top">{settings.currency}{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-black pt-2 flex flex-col items-end space-y-1">
          <div className="w-48 flex justify-between">
            <span>Subtotal:</span>
            <span>{settings.currency}{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="w-48 flex justify-between">
            <span>GST ({settings.gstRate}%):</span>
            <span>{settings.currency}{order.taxAmount.toFixed(2)}</span>
          </div>
          <div className="w-48 flex justify-between">
            <span>Service ({settings.serviceChargeRate}%):</span>
            <span>{settings.currency}{order.serviceChargeAmount.toFixed(2)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="w-48 flex justify-between text-red-600 print:text-black">
              <span>Discount:</span>
              <span>-{settings.currency}{order.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="w-48 flex justify-between font-bold text-lg border-t border-black mt-2 pt-2">
            <span>Total:</span>
            <span>{settings.currency}{order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-12 text-center text-xs">
          <p>Thank you for dining with us!</p>
          <p>Please visit again.</p>
          <p className="mt-4 text-[10px] text-gray-400">Powered by RestoBill AI</p>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Order, MenuItem, StoreSettings } from '../types';
import { generateSalesInsight } from '../services/geminiService';
import { Sparkles, TrendingUp, DollarSign, ShoppingBag, Loader2, Calendar, FileText } from 'lucide-react';

interface DashboardProps {
  orders: Order[];
  menu: MenuItem[];
  settings: StoreSettings;
}

export const Dashboard: React.FC<DashboardProps> = ({ orders, menu, settings }) => {
  const [insight, setInsight] = useState<{ summary: string; insights: string[] } | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Filter orders by selected date
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (o.status !== 'completed' || !o.completedAt) return false;
      const orderDate = new Date(o.completedAt).toISOString().split('T')[0];
      return orderDate === selectedDate;
    });
  }, [orders, selectedDate]);

  // Calculate daily stats
  const dailyTotalSales = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const dailyTotalOrders = filteredOrders.length;
  const dailyAvgValue = dailyTotalOrders > 0 ? dailyTotalSales / dailyTotalOrders : 0;

  // Calculate most ordered items for the day
  const itemPopularity = useMemo(() => {
    const counts: Record<string, { count: number; revenue: number }> = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!counts[item.name]) counts[item.name] = { count: 0, revenue: 0 };
        counts[item.name].count += item.quantity;
        counts[item.name].revenue += (item.price * item.quantity);
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, data]) => ({ name, ...data }));
  }, [filteredOrders]);

  // Chart Data: Hourly Sales for selected day
  const salesByHour = Array.from({ length: 24 }, (_, i) => ({ hour: i, sales: 0 }));
  filteredOrders.forEach(o => {
    const hour = new Date(o.completedAt || 0).getHours();
    salesByHour[hour].sales += o.total;
  });
  
  const chartData = salesByHour.map(d => ({
    name: `${d.hour}:00`,
    sales: d.sales
  })).filter(d => d.sales > 0 || (parseInt(d.name) >= 10 && parseInt(d.name) <= 22));

  const handleGenerateInsight = async () => {
    setLoadingInsight(true);
    // We pass the filtered orders to get insight specifically for this day if wanted, 
    // or pass 'orders' for global. Let's pass global for a general manager view, 
    // but maybe refine prompt in service later. For now, using global 'orders' for pattern matching.
    const result = await generateSalesInsight(orders, menu);
    setInsight(result);
    setLoadingInsight(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Sales Reports</h2>
           <p className="text-sm text-gray-500">Overview and daily breakdown</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <Calendar size={18} className="text-gray-500" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="outline-none text-sm text-gray-700 bg-transparent"
            />
          </div>
          <button
            onClick={handleGenerateInsight}
            disabled={loadingInsight}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
          >
            {loadingInsight ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            <span className="hidden md:inline">Ask AI Analyst</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sales ({selectedDate})</p>
              <h3 className="text-2xl font-bold text-gray-800">{settings.currency}{dailyTotalSales.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Orders ({selectedDate})</p>
              <h3 className="text-2xl font-bold text-gray-800">{dailyTotalOrders}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg. Order</p>
              <h3 className="text-2xl font-bold text-gray-800">{settings.currency}{dailyAvgValue.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Ordered Items Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-96">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <FileText size={18} />
              Top Selling Items
            </h3>
            <span className="text-xs text-gray-400">For {selectedDate}</span>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-2 text-left rounded-l-lg">Item</th>
                  <th className="px-4 py-2 text-center">Qty</th>
                  <th className="px-4 py-2 text-right rounded-r-lg">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {itemPopularity.map((item, idx) => (
                  <tr key={item.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                         <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] ${idx < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                           {idx + 1}
                         </span>
                         {item.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">{item.count}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-600">{settings.currency}{item.revenue.toFixed(2)}</td>
                  </tr>
                ))}
                {itemPopularity.length === 0 && (
                   <tr>
                     <td colSpan={3} className="text-center py-8 text-gray-400">No sales recorded for this date.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
          <h3 className="font-bold text-gray-700 mb-6">Hourly Performance</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${settings.currency}${val}`} />
                <Tooltip 
                  formatter={(value: number) => [`${settings.currency}${value.toFixed(2)}`, 'Sales']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insight Section */}
      {insight && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 animate-in fade-in duration-500">
          <div className="flex items-center space-x-2 mb-4 text-indigo-800">
            <Sparkles size={20} />
            <h3 className="font-bold text-lg">AI Market Insights</h3>
          </div>
          <p className="text-gray-700 mb-4 italic">{insight.summary}</p>
          <ul className="space-y-2">
            {insight.insights.map((tip, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="bg-indigo-200 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full mt-1">{idx + 1}</span>
                <span className="text-gray-800">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
import React from 'react';
import { SummaryStats } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Calendar, Share2, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../utils/formatters';

interface DashboardProps {
  stats: SummaryStats;
  chartData: any[];
  filterType: 'daily' | 'monthly';
  setFilterType: (type: 'daily' | 'monthly') => void;
  onExport: () => void;
  onShare: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, chartData, filterType, setFilterType, onExport, onShare }) => {
  
  const StatCard = ({ title, value, icon: Icon, color, subValue }: any) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className={`text-2xl font-bold mt-1 ${color}`}>{value}</h3>
          {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
        </div>
        <div className={`p-2 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
          <Icon className={color} size={24} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setFilterType('daily')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterType === 'daily' ? 'bg-white dark:bg-gray-600 shadow text-taxi-600 dark:text-taxi-400' : 'text-gray-500 dark:text-gray-400'}`}
          >
            Daily
          </button>
          <button
            onClick={() => setFilterType('monthly')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterType === 'monthly' ? 'bg-white dark:bg-gray-600 shadow text-taxi-600 dark:text-taxi-400' : 'text-gray-500 dark:text-gray-400'}`}
          >
            Monthly
          </button>
        </div>

        <div className="flex gap-2">
           <button onClick={onShare} className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors">
              <Share2 size={16} /> <span className="hidden sm:inline">Share</span>
           </button>
           <button onClick={onExport} className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
              <FileText size={16} /> <span className="hidden sm:inline">PDF Report</span>
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Income" 
          value={formatCurrency(stats.totalIncome)} 
          icon={TrendingUp} 
          color="text-green-600" 
        />
        <StatCard 
          title="Total Expenses" 
          value={formatCurrency(stats.totalExpense)} 
          icon={TrendingDown} 
          color="text-red-500" 
        />
        <StatCard 
          title="Driver Salaries" 
          value={formatCurrency(stats.totalSalary)} 
          icon={Wallet} 
          color="text-purple-500" 
        />
        <StatCard 
          title="Net Profit" 
          value={formatCurrency(stats.totalProfit)} 
          icon={DollarSign} 
          color={stats.totalProfit >= 0 ? "text-taxi-600" : "text-red-600"}
          subValue={stats.bestDay ? `Best: ${stats.bestDay.date}` : ''}
        />
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-[300px]">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Profit Trend</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              cursor={{ fill: 'transparent' }}
              formatter={(value: number) => [`₹${value}`, 'Profit']}
            />
            <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#f59e0b' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
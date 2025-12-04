import React, { useState } from 'react';
import { TaxiEntry, EntryFilters } from '../types';
import { Search, Filter, Trash2, Edit2, CarFront } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/formatters';

interface EntryListProps {
  entries: TaxiEntry[];
  onEdit: (entry: TaxiEntry) => void;
  onDelete: (id: string) => void;
  filters: EntryFilters;
  setFilters: React.Dispatch<React.SetStateAction<EntryFilters>>;
}

const EntryList: React.FC<EntryListProps> = ({ entries, onEdit, onDelete, filters, setFilters }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter Logic
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.driver_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = 
      (!filters.dateStart || entry.date >= filters.dateStart) &&
      (!filters.dateEnd || entry.date <= filters.dateEnd);
    
    const matchesVehicle = !filters.vehicle || entry.vehicle_number.includes(filters.vehicle);
    const matchesDriver = !filters.driver || entry.driver_name.includes(filters.driver);

    return matchesSearch && matchesDate && matchesVehicle && matchesDriver;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <CarFront size={20} className="text-taxi-500" /> Recent Entries
        </h3>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search vehicle or driver..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-taxi-500"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border ${showFilters ? 'bg-taxi-100 border-taxi-500 text-taxi-700' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'}`}
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border-b border-gray-200 dark:border-gray-700">
           <input type="date" value={filters.dateStart} onChange={(e) => setFilters(prev => ({...prev, dateStart: e.target.value}))} className="p-2 text-sm rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
           <input type="date" value={filters.dateEnd} onChange={(e) => setFilters(prev => ({...prev, dateEnd: e.target.value}))} className="p-2 text-sm rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
           <input type="text" placeholder="Filter Vehicle" value={filters.vehicle} onChange={(e) => setFilters(prev => ({...prev, vehicle: e.target.value}))} className="p-2 text-sm rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
           <input type="text" placeholder="Filter Driver" value={filters.driver} onChange={(e) => setFilters(prev => ({...prev, driver: e.target.value}))} className="p-2 text-sm rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
      )}

      {/* Table/Cards */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Details</th>
              <th className="px-6 py-3 text-right">Income</th>
              <th className="px-6 py-3 text-right">Exp</th>
              <th className="px-6 py-3 text-right">Profit</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredEntries.length === 0 ? (
                <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">No entries found</td>
                </tr>
            ) : filteredEntries.map((entry) => {
              const expenses = (entry.fuel_expense || 0) + (entry.maintenance_expense || 0) + (entry.other_expense || 0) + (entry.driver_salary || 0);
              const profit = (entry.income_amount || 0) - expenses;
              
              return (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{format(new Date(entry.date), 'MMM dd')}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{entry.vehicle_number}</div>
                    <div className="text-xs text-gray-400">{entry.driver_name}</div>
                  </td>
                  <td className="px-6 py-4 text-right text-green-600 font-medium">+{formatCurrency(entry.income_amount)}</td>
                  <td className="px-6 py-4 text-right text-red-500">-{formatCurrency(expenses)}</td>
                  <td className={`px-6 py-4 text-right font-bold ${profit >= 0 ? 'text-taxi-600' : 'text-red-600'}`}>
                    {formatCurrency(profit)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => onEdit(entry)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"><Edit2 size={16} /></button>
                      <button onClick={() => entry.id && onDelete(entry.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EntryList;
import React, { useState, useEffect } from 'react';
import { TaxiEntry } from '../types';
import { X, Save, Calculator } from 'lucide-react';

interface EntryFormProps {
  initialData?: TaxiEntry;
  onSave: (entry: TaxiEntry) => Promise<void>;
  onCancel: () => void;
}

const emptyEntry: TaxiEntry = {
  date: new Date().toISOString().split('T')[0],
  vehicle_number: '',
  driver_name: '',
  trip_from: '',
  trip_to: '',
  total_km: 0,
  income_amount: 0,
  fuel_expense: 0,
  maintenance_expense: 0,
  other_expense: 0,
  driver_salary: 0,
  notes: ''
};

const EntryForm: React.FC<EntryFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<TaxiEntry>(initialData || emptyEntry);
  const [loading, setLoading] = useState(false);

  // Derived state for preview
  const totalExpenses = (formData.fuel_expense || 0) + (formData.maintenance_expense || 0) + (formData.other_expense || 0) + (formData.driver_salary || 0);
  const profit = (formData.income_amount || 0) - totalExpenses;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let val: string | number = value;
    if (type === 'number') {
      val = value === '' ? 0 : parseFloat(value);
    }
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? 'Edit Entry' : 'New Daily Entry'}
          </h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
              <input required type="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-taxi-500 focus:ring-taxi-500 p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle No.</label>
              <input required type="text" name="vehicle_number" placeholder="" value={formData.vehicle_number} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-taxi-500 focus:ring-taxi-500 p-2 border uppercase" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Driver Name</label>
              <input required type="text" name="driver_name" value={formData.driver_name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-taxi-500 focus:ring-taxi-500 p-2 border" />
            </div>
          </div>

          {/* Section 2: Trip Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trip From</label>
              <input type="text" name="trip_from" value={formData.trip_from} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-taxi-500 focus:ring-taxi-500 p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trip To</label>
              <input type="text" name="trip_to" value={formData.trip_to} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-taxi-500 focus:ring-taxi-500 p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total KM</label>
<input
  type="number"
  step="0.1"
  name="total_km"
  value={formData.total_km !== 0 ? formData.total_km : ''}
  onChange={handleChange}
  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-taxi-500 focus:ring-taxi-500 p-2 border"
/>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

          {/* Section 3: Financials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <h3 className="text-lg font-medium text-green-600 dark:text-green-400">Income</h3>
               <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Income Amount</label>
<div className="relative mt-1">
  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
  <input
    required
    type="number"
    step="0.01"
    name="income_amount"
    value={formData.income_amount !== 0 ? formData.income_amount : ''}
    onChange={handleChange}
    className="block w-full pl-7 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border text-lg font-semibold"
  />
</div>

              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-red-600 dark:text-red-400">Expenses</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Fuel</label>
  <input
    type="number"
    step="0.01"
    name="fuel_expense"
    value={formData.fuel_expense !== 0 ? formData.fuel_expense : ''}
    onChange={handleChange}
    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 border"
  />
</div>

<div>
  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Maintenance</label>
  <input
    type="number"
    step="0.01"
    name="maintenance_expense"
    value={formData.maintenance_expense !== 0 ? formData.maintenance_expense : ''}
    onChange={handleChange}
    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 border"
  />
</div>

<div>
  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Salary</label>
  <input
    type="number"
    step="0.01"
    name="driver_salary"
    value={formData.driver_salary !== 0 ? formData.driver_salary : ''}
    onChange={handleChange}
    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 border"
  />
</div>

<div>
  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Other</label>
  <input
    type="number"
    step="0.01"
    name="other_expense"
    value={formData.other_expense !== 0 ? formData.other_expense : ''}
    onChange={handleChange}
    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-2 border"
  />
</div>

              </div>
            </div>
          </div>

          {/* Section 4: Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
            <textarea name="notes" rows={2} value={formData.notes} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-taxi-500 focus:ring-taxi-500 p-2 border"></textarea>
          </div>
          
          {/* Live Calc Strip */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg flex justify-between items-center text-sm">
             <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
               <Calculator size={16} />
               <span>Total Exp: <strong>{totalExpenses.toFixed(2)}</strong></span>
             </div>
             <div className={`font-bold text-lg ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Profit: {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
             </div>
          </div>

        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="px-4 py-2 bg-taxi-600 hover:bg-taxi-700 text-white rounded-lg shadow-md flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : <><Save size={18} /> Save Entry</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntryForm;
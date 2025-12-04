import { supabase, TABLE_NAME, SQL_SCHEMA_INSTRUCTION } from './supabaseClient';
import { TaxiEntry, SummaryStats } from '../types';

export { SQL_SCHEMA_INSTRUCTION };

export const fetchEntries = async () => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return data as TaxiEntry[];
};

export const addEntry = async (entry: TaxiEntry) => {
  // Remove id and created_at if undefined so DB handles generation
  const { id, created_at, ...payload } = entry;
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data as TaxiEntry;
};

export const updateEntry = async (entry: TaxiEntry) => {
  const { id, created_at, ...payload } = entry;
  if (!id) throw new Error("ID required for update");
  
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as TaxiEntry;
};

export const deleteEntry = async (id: string) => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const calculateStats = (entries: TaxiEntry[]): SummaryStats => {
  let totalIncome = 0;
  let totalExpense = 0;
  let totalSalary = 0;
  let bestDay = null;
  let maxProfit = -Infinity;

  // Group by date for "Best Day"
  const dailyProfits: Record<string, number> = {};

  entries.forEach(e => {
    const expenses = (e.fuel_expense || 0) + (e.maintenance_expense || 0) + (e.other_expense || 0) + (e.driver_salary || 0);
    const profit = (e.income_amount || 0) - expenses;

    totalIncome += (e.income_amount || 0);
    totalExpense += expenses;
    totalSalary += (e.driver_salary || 0);

    if (!dailyProfits[e.date]) dailyProfits[e.date] = 0;
    dailyProfits[e.date] += profit;
  });

  const totalProfit = totalIncome - totalExpense;

  // Find best day
  Object.entries(dailyProfits).forEach(([date, profit]) => {
    if (profit > maxProfit) {
      maxProfit = profit;
      bestDay = { date, profit };
    }
  });

  return {
    totalIncome,
    totalExpense,
    totalSalary,
    totalProfit,
    bestDay: maxProfit > -Infinity ? bestDay : null
  };
};
export interface TaxiEntry {
  id?: string;
  created_at?: string;
  date: string;
  vehicle_number: string;
  driver_name: string;
  trip_from: string;
  trip_to: string;
  total_km: number;
  income_amount: number;
  fuel_expense: number;
  maintenance_expense: number;
  other_expense: number;
  driver_salary: number;
  notes: string;
}

export interface EntryFilters {
  dateStart: string;
  dateEnd: string;
  vehicle: string;
  driver: string;
}

export interface SummaryStats {
  totalIncome: number;
  totalExpense: number;
  totalSalary: number;
  totalProfit: number;
  bestDay: { date: string; profit: number } | null;
}

export type ThemeMode = 'light' | 'dark';

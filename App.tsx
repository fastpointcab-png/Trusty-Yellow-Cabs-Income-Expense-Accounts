import React, { useState, useEffect, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { Plus, Moon, Sun, LayoutDashboard, LogOut } from 'lucide-react';
import { fetchEntries, addEntry, updateEntry, deleteEntry, calculateStats, SQL_SCHEMA_INSTRUCTION } from './services/dataService';
import { generatePDFReport } from './utils/pdfGenerator';
import { TaxiEntry, EntryFilters } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EntryList from './components/EntryList';
import EntryForm from './components/EntryForm';
import PWAInstall from './components/PWAInstall';
import { formatCurrency } from './utils/formatters';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [entries, setEntries] = useState<TaxiEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TaxiEntry | undefined>(undefined);
  const [filterType, setFilterType] = useState<'daily' | 'monthly'>('daily');
  
  const [listFilters, setListFilters] = useState<EntryFilters>({
    dateStart: '',
    dateEnd: '',
    vehicle: '',
    driver: ''
  });

  // Dark Mode Toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Data Fetching
  const loadData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await fetchEntries();
      setEntries(data || []);
    } catch (error: any) {
      console.error("Data Load Error Full Object:", error);
      let errorMessage = "An unexpected error occurred.";
      if (typeof error === 'string') errorMessage = error;
      else if (error instanceof Error) errorMessage = error.message;
      else if (typeof error === 'object' && error !== null) {
        errorMessage = error.message || error.error_description || error.details || JSON.stringify(error);
      }
      if (errorMessage === '{}' || errorMessage.startsWith('{"')) {
        try { const parsed = JSON.parse(errorMessage); errorMessage = parsed.message || parsed.code || "Check console for error details."; } catch {}
      }
      if (errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
        toast.error("Database table missing! Check console for SQL.");
        console.log(SQL_SCHEMA_INSTRUCTION);
      } else if (errorMessage.includes("apikey") || errorMessage.includes("JWT") || (error as any)?.code === 'PGRST301') {
        toast.error("Supabase API Key invalid or missing.");
      } else if (errorMessage.includes("fetch") || errorMessage.includes("connection") || !errorMessage) {
        toast.error("Connection failed. Check Supabase URL.");
      } else {
        toast.error(`Error: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [isAuthenticated]);

  const handleSave = async (entry: TaxiEntry) => {
    try {
      if (entry.id) { await updateEntry(entry); toast.success("Entry updated!"); }
      else { await addEntry(entry); toast.success("Entry added!"); }
      setShowForm(false); setEditingEntry(undefined); loadData();
    } catch (error: any) { toast.error(`Error saving: ${error.message || "Failed to save entry"}`); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try { await deleteEntry(id); toast.success("Entry deleted"); loadData(); }
    catch (error: any) { toast.error(`Error deleting: ${error.message || "Failed to delete entry"}`); }
  };

  const handleExport = () => { const stats = calculateStats(entries); generatePDFReport(entries, stats, "All Time"); toast.info("PDF Downloading..."); };
  const handleShare = () => {
    const stats = calculateStats(entries);
    const text = `*Taxi Business Report*\nIncome: ${formatCurrency(stats.totalIncome)}\nExpense: ${formatCurrency(stats.totalExpense)}\nProfit: ${formatCurrency(stats.totalProfit)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const stats = useMemo(() => calculateStats(entries), [entries]);

  const chartData = useMemo(() => {
    if (filterType === 'daily') {
      return entries.slice(0, 7).reverse().map(e => ({
        name: new Date(e.date).toLocaleDateString(undefined, { weekday: 'short' }),
        profit: (e.income_amount || 0) - ((e.fuel_expense || 0) + (e.maintenance_expense || 0) + (e.other_expense || 0) + (e.driver_salary || 0))
      }));
    } else {
      const months: Record<string, number> = {};
      entries.forEach(e => {
        const month = new Date(e.date).toLocaleString('default', { month: 'short' });
        const profit = (e.income_amount || 0) - ((e.fuel_expense || 0) + (e.maintenance_expense || 0) + (e.other_expense || 0) + (e.driver_salary || 0));
        months[month] = (months[month] || 0) + profit;
      });
      return Object.entries(months).map(([name, profit]) => ({ name, profit }));
    }
  }, [entries, filterType]);


  if (!isAuthenticated) {
    return (
      <>
        <div className="absolute top-4 right-4 z-50">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full shadow-sm">
            {darkMode ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20} className="text-gray-600"/>}
          </button>
        </div>
        <Login onLogin={() => setIsAuthenticated(true)} />
        <ToastContainer position="top-center" theme={darkMode ? 'dark' : 'light'} aria-label="notification messages" />
      </>
    );
  }

  return (
    <div className="min-h-screen pb-20 sm:pb-4 transition-colors duration-200">
      <ToastContainer position="top-center" theme={darkMode ? 'dark' : 'light'} aria-label="notification messages" />
      <PWAInstall />

      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2 text-taxi-600">
               
                <span className="font-bold text-xl dark:text-taxi-500"> Trustyyellowcabs </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button onClick={() => setIsAuthenticated(false)} className="p-2 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
            {loading && <span className="text-sm text-gray-400 animate-pulse">Syncing...</span>}
          </div>
          <Dashboard stats={stats} chartData={chartData} filterType={filterType} setFilterType={setFilterType} onExport={handleExport} onShare={handleShare} />
        </section>

        <section>
          <EntryList entries={entries} onEdit={(e) => { setEditingEntry(e); setShowForm(true); }} onDelete={handleDelete} filters={listFilters} setFilters={setListFilters} />
        </section>
      </main>

      <div className="fixed bottom-6 right-6 z-40">
        <button onClick={() => { setEditingEntry(undefined); setShowForm(true); }} className="bg-taxi-600 hover:bg-taxi-700 text-white p-4 rounded-full shadow-lg shadow-taxi-500/40 transition-transform hover:scale-105 active:scale-95">
          <Plus size={28} />
        </button>
      </div>

      {showForm && <EntryForm initialData={editingEntry} onSave={handleSave} onCancel={() => { setShowForm(false); setEditingEntry(undefined); }} />}
    </div>
  );
};

export default App;



if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('SW registered', reg))
      .catch(err => console.error('SW registration failed', err));
  });
}

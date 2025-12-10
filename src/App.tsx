import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Dashboard } from './components/Dashboard';
import { CreateInvoice } from './components/CreateInvoice';
import { ClientsList } from './components/ClientsList';
import { InvoicesList } from './components/InvoicesList';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { LayoutDashboard, FileText, Users, BarChart3, Settings as SettingsIcon, List } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { useKeyboardShortcuts, APP_SHORTCUTS } from './hooks/useKeyboardShortcuts';

type Screen = 'dashboard' | 'create-invoice' | 'invoices' | 'clients' | 'reports' | 'settings';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { ...APP_SHORTCUTS.DASHBOARD, action: () => setCurrentScreen('dashboard') },
    { ...APP_SHORTCUTS.INVOICES, action: () => setCurrentScreen('invoices') },
    { ...APP_SHORTCUTS.CLIENTS, action: () => setCurrentScreen('clients') },
    { ...APP_SHORTCUTS.REPORTS, action: () => setCurrentScreen('reports') },
    { ...APP_SHORTCUTS.SETTINGS, action: () => setCurrentScreen('settings') },
    { ...APP_SHORTCUTS.NEW_INVOICE, action: () => setCurrentScreen('create-invoice') },
  ]);

  const navItems = [
    { id: 'dashboard' as Screen, label: 'Accueil', icon: LayoutDashboard },
    { id: 'create-invoice' as Screen, label: 'Facturer', icon: FileText },
    { id: 'invoices' as Screen, label: 'Factures', icon: List },
    { id: 'clients' as Screen, label: 'Clients', icon: Users },
    { id: 'reports' as Screen, label: 'Rapports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-emerald-600">FacturePro</h1>
        </div>
        
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  currentScreen === item.id
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-3 right-3">
          <button
            onClick={() => setCurrentScreen('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              currentScreen === 'settings'
                ? 'bg-emerald-50 text-emerald-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span>Paramètres</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {currentScreen === 'dashboard' && <Dashboard onNavigate={setCurrentScreen} />}
        {currentScreen === 'create-invoice' && <CreateInvoice />}
        {currentScreen === 'invoices' && <InvoicesList />}
        {currentScreen === 'clients' && <ClientsList />}
        {currentScreen === 'reports' && <Reports />}
        {currentScreen === 'settings' && <Settings />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <Toaster />
    </AppProvider>
  );
}
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: 'cash' | 'card' | 'transfer' | 'check' | 'other';
  notes?: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'paid' | 'unpaid' | 'pending' | 'partial';
  date: string;
  dueDate: string;
  notes: string;
  createdAt: string;
  payments?: Payment[];
  paidAmount?: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  createdAt: string;
}

export interface Settings {
  companyName: string;
  phone: string;
  email: string;
  address: string;
  logo?: string;
  invoicePrefix: string;
  invoiceNumber: number;
  currency: string;
  taxRate: number;
  darkMode: boolean;
  language: 'fr' | 'en';
}

export interface Activity {
  id: string;
  type: 'invoice_created' | 'invoice_updated' | 'invoice_deleted' | 'client_created' | 'client_updated' | 'client_deleted' | 'payment_added' | 'settings_updated';
  description: string;
  timestamp: string;
  data?: any;
}

interface AppContextType {
  invoices: Invoice[];
  clients: Client[];
  settings: Settings;
  activities: Activity[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'number' | 'createdAt'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  addPayment: (invoiceId: string, payment: Omit<Payment, 'id'>) => void;
  getClientInvoices: (clientId: string) => Invoice[];
  getClientUnpaidAmount: (clientId: string) => number;
  getDashboardStats: () => {
    todaySales: number;
    monthSales: number;
    todayInvoices: number;
    unpaidTotal: number;
  };
  exportData: () => void;
  importData: (data: string) => void;
  addActivity: (type: Activity['type'], description: string, data?: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultSettings: Settings = {
  companyName: 'Mon Entreprise SARL',
  phone: '+225 07 08 09 10 11',
  email: 'contact@monentreprise.ci',
  address: 'Abidjan, Cocody Riviera',
  invoicePrefix: 'F-',
  invoiceNumber: 1234,
  currency: 'FCFA',
  taxRate: 18,
  darkMode: false,
  language: 'fr',
};

// Demo data for first launch
const demoClients: Client[] = [
  {
    id: 'demo-client-1',
    name: 'Société KONAN',
    phone: '+225 07 08 09 10 11',
    email: 'contact@konan.ci',
    address: 'Abidjan, Plateau',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-client-2',
    name: 'Entreprise DIALLO',
    phone: '+225 05 06 07 08 09',
    email: 'info@diallo.ci',
    address: 'Abidjan, Cocody',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-client-3',
    name: 'Commerce YAO',
    phone: '+225 01 02 03 04 05',
    email: 'yao.commerce@gmail.com',
    address: 'Abidjan, Marcory',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const demoInvoices: Invoice[] = [
  {
    id: 'demo-invoice-1',
    number: 'F-001234',
    clientId: 'demo-client-1',
    clientName: 'Société KONAN',
    items: [
      { id: '1', description: 'Consultation informatique', quantity: 2, unitPrice: 50000, discount: 0 },
      { id: '2', description: 'Support technique', quantity: 1, unitPrice: 30000, discount: 10 },
    ],
    subtotal: 127000,
    taxRate: 18,
    taxAmount: 22860,
    total: 149860,
    status: 'paid',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Merci pour votre collaboration',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    payments: [
      {
        id: '1',
        amount: 149860,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        method: 'transfer',
        notes: 'Virement bancaire',
      },
    ],
    paidAmount: 149860,
  },
  {
    id: 'demo-invoice-2',
    number: 'F-001235',
    clientId: 'demo-client-2',
    clientName: 'Entreprise DIALLO',
    items: [
      { id: '1', description: 'Développement site web', quantity: 1, unitPrice: 500000, discount: 0 },
    ],
    subtotal: 500000,
    taxRate: 18,
    taxAmount: 90000,
    total: 590000,
    status: 'partial',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Paiement en 2 fois',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    payments: [
      {
        id: '1',
        amount: 300000,
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        method: 'cash',
        notes: 'Premier versement',
      },
    ],
    paidAmount: 300000,
  },
  {
    id: 'demo-invoice-3',
    number: 'F-001236',
    clientId: 'demo-client-3',
    clientName: 'Commerce YAO',
    items: [
      { id: '1', description: 'Formation bureautique', quantity: 5, unitPrice: 25000, discount: 5 },
    ],
    subtotal: 118750,
    taxRate: 18,
    taxAmount: 21375,
    total: 140125,
    status: 'unpaid',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Facture en attente de paiement',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    payments: [],
    paidAmount: 0,
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices');
    const savedClients = localStorage.getItem('clients');
    const savedSettings = localStorage.getItem('settings');
    const savedActivities = localStorage.getItem('activities');
    const hasLaunched = localStorage.getItem('hasLaunched');

    if (hasLaunched) {
      setIsFirstLaunch(false);
    }

    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    } else if (isFirstLaunch) {
      setInvoices(demoInvoices);
    }

    if (savedClients) {
      setClients(JSON.parse(savedClients));
    } else if (isFirstLaunch) {
      setClients(demoClients);
    }

    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedActivities) setActivities(JSON.parse(savedActivities));

    if (isFirstLaunch) {
      localStorage.setItem('hasLaunched', 'true');
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('activities', JSON.stringify(activities));
  }, [activities]);

  // Auto-backup every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const backup = {
        invoices,
        clients,
        settings,
        activities,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('autobackup', JSON.stringify(backup));
      console.log('Auto-backup created at', new Date().toLocaleString());
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [invoices, clients, settings, activities]);

  const addActivity = (type: Activity['type'], description: string, data?: any) => {
    const activity: Activity = {
      id: Date.now().toString(),
      type,
      description,
      timestamp: new Date().toISOString(),
      data,
    };
    setActivities([activity, ...activities].slice(0, 100)); // Keep only last 100
  };

  const addInvoice = (invoice: Omit<Invoice, 'id' | 'number' | 'createdAt'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: Date.now().toString(),
      number: `${settings.invoicePrefix}${String(settings.invoiceNumber).padStart(6, '0')}`,
      createdAt: new Date().toISOString(),
      payments: [],
      paidAmount: 0,
    };
    setInvoices([newInvoice, ...invoices]);
    setSettings({ ...settings, invoiceNumber: settings.invoiceNumber + 1 });
    addActivity('invoice_created', `Facture ${newInvoice.number} créée pour ${newInvoice.clientName}`, newInvoice);
  };

  const updateInvoice = (id: string, updatedInvoice: Partial<Invoice>) => {
    setInvoices(invoices.map((inv) => (inv.id === id ? { ...inv, ...updatedInvoice } : inv)));
    const invoice = invoices.find(inv => inv.id === id);
    if (invoice) {
      addActivity('invoice_updated', `Facture ${invoice.number} mise à jour`, updatedInvoice);
    }
  };

  const deleteInvoice = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id);
    setInvoices(invoices.filter((inv) => inv.id !== id));
    if (invoice) {
      addActivity('invoice_deleted', `Facture ${invoice.number} supprimée`, invoice);
    }
  };

  const addPayment = (invoiceId: string, payment: Omit<Payment, 'id'>) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;

    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
    };

    const updatedPayments = [...(invoice.payments || []), newPayment];
    const paidAmount = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
    
    let status: Invoice['status'] = 'unpaid';
    if (paidAmount >= invoice.total) {
      status = 'paid';
    } else if (paidAmount > 0) {
      status = 'partial';
    }

    updateInvoice(invoiceId, {
      payments: updatedPayments,
      paidAmount,
      status,
    });

    addActivity('payment_added', `Paiement de ${payment.amount.toLocaleString('fr-FR')} ${settings.currency} ajouté à la facture ${invoice.number}`, newPayment);
  };

  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setClients([newClient, ...clients]);
    addActivity('client_created', `Client ${newClient.name} créé`, newClient);
  };

  const updateClient = (id: string, updatedClient: Partial<Client>) => {
    setClients(clients.map((client) => (client.id === id ? { ...client, ...updatedClient } : client)));
    const client = clients.find(c => c.id === id);
    if (client) {
      addActivity('client_updated', `Client ${client.name} mis à jour`, updatedClient);
    }
  };

  const deleteClient = (id: string) => {
    const client = clients.find(c => c.id === id);
    setClients(clients.filter((client) => client.id !== id));
    if (client) {
      addActivity('client_deleted', `Client ${client.name} supprimé`, client);
    }
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings({ ...settings, ...newSettings });
    addActivity('settings_updated', 'Paramètres mis à jour', newSettings);
  };

  const getClientInvoices = (clientId: string) => {
    return invoices.filter((inv) => inv.clientId === clientId);
  };

  const getClientUnpaidAmount = (clientId: string) => {
    return invoices
      .filter((inv) => inv.clientId === clientId && inv.status !== 'paid')
      .reduce((sum, inv) => sum + (inv.total - (inv.paidAmount || 0)), 0);
  };

  const getDashboardStats = () => {
    const today = new Date().toDateString();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const todayInvoices = invoices.filter(
      (inv) => new Date(inv.date).toDateString() === today
    );
    const monthInvoices = invoices.filter((inv) => {
      const date = new Date(inv.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    return {
      todaySales: todayInvoices.reduce((sum, inv) => sum + inv.total, 0),
      monthSales: monthInvoices.reduce((sum, inv) => sum + inv.total, 0),
      todayInvoices: todayInvoices.length,
      unpaidTotal: invoices
        .filter((inv) => inv.status !== 'paid')
        .reduce((sum, inv) => sum + (inv.total - (inv.paidAmount || 0)), 0),
    };
  };

  const exportData = () => {
    const data = {
      invoices,
      clients,
      settings,
      activities,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `facturepro-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addActivity('settings_updated', 'Données exportées');
  };

  const importData = (dataStr: string) => {
    try {
      const data = JSON.parse(dataStr);
      if (data.invoices) setInvoices(data.invoices);
      if (data.clients) setClients(data.clients);
      if (data.settings) setSettings(data.settings);
      if (data.activities) setActivities(data.activities);
      addActivity('settings_updated', 'Données importées');
    } catch (error) {
      console.error('Error importing data:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        invoices,
        clients,
        settings,
        activities,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        addClient,
        updateClient,
        deleteClient,
        updateSettings,
        addPayment,
        getClientInvoices,
        getClientUnpaidAmount,
        getDashboardStats,
        exportData,
        importData,
        addActivity,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

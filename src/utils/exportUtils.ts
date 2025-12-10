import { Invoice, Client, Settings } from '../context/AppContext';

export const exportInvoicesToCSV = (invoices: Invoice[], settings: Settings) => {
  const headers = [
    'Numéro',
    'Client',
    'Date',
    'Échéance',
    'Sous-total',
    'TVA',
    'Total',
    'Payé',
    'Reste',
    'Statut',
  ];

  const rows = invoices.map((inv) => [
    inv.number,
    inv.clientName,
    new Date(inv.date).toLocaleDateString('fr-FR'),
    new Date(inv.dueDate).toLocaleDateString('fr-FR'),
    inv.subtotal,
    inv.taxAmount,
    inv.total,
    inv.paidAmount || 0,
    inv.total - (inv.paidAmount || 0),
    inv.status === 'paid' ? 'Payée' : inv.status === 'unpaid' ? 'Impayée' : inv.status === 'partial' ? 'Partiel' : 'En attente',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  downloadCSV(csvContent, `factures-${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportClientsToCSV = (clients: Client[], getClientInvoices: (id: string) => Invoice[], getClientUnpaidAmount: (id: string) => number) => {
  const headers = ['Nom', 'Téléphone', 'Email', 'Adresse', 'Factures', 'Montant impayé'];

  const rows = clients.map((client) => [
    client.name,
    client.phone,
    client.email || '',
    client.address || '',
    getClientInvoices(client.id).length,
    getClientUnpaidAmount(client.id),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  downloadCSV(csvContent, `clients-${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportReportToCSV = (invoices: Invoice[], settings: Settings, period: string) => {
  const headers = ['Numéro', 'Client', 'Date', 'Montant', 'Statut'];

  const rows = invoices.map((inv) => [
    inv.number,
    inv.clientName,
    new Date(inv.date).toLocaleDateString('fr-FR'),
    `${inv.total.toLocaleString('fr-FR')} ${settings.currency}`,
    inv.status === 'paid' ? 'Payée' : inv.status === 'unpaid' ? 'Impayée' : inv.status === 'partial' ? 'Partiel' : 'En attente',
  ]);

  const csvContent = [
    `Rapport - ${period}`,
    `Généré le ${new Date().toLocaleDateString('fr-FR')}`,
    '',
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  downloadCSV(csvContent, `rapport-${period}-${new Date().toISOString().split('T')[0]}.csv`);
};

const downloadCSV = (content: string, filename: string) => {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

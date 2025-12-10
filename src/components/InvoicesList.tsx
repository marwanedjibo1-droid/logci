import { useState } from 'react';
import { Search, Filter, Eye, Edit, Trash2, FileDown, Send, Copy, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useApp, Invoice } from '../context/AppContext';
import { toast } from 'sonner';
import { CreateInvoice } from './CreateInvoice';
import jsPDF from 'jspdf';

export function InvoicesList() {
  const { invoices, updateInvoice, deleteInvoice, settings, clients } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'client'>('date');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const getStatusColor = (status: string) => {
    if (status === 'paid') return 'bg-emerald-100 text-emerald-700';
    if (status === 'pending') return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'paid') return 'Payée';
    if (status === 'pending') return 'En attente';
    return 'Impayée';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'paid') return <CheckCircle className="w-4 h-4" />;
    if (status === 'pending') return <Clock className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  const filteredInvoices = invoices
    .filter((inv) => {
      const matchesSearch =
        inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'amount') return b.total - a.total;
      if (sortBy === 'client') return a.clientName.localeCompare(b.clientName);
      return 0;
    });

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      deleteInvoice(id);
      toast.success('Facture supprimée');
    }
  };

  const handleStatusChange = (id: string, status: 'paid' | 'unpaid' | 'pending') => {
    updateInvoice(id, { status });
    toast.success('Statut mis à jour');
  };

  const duplicateInvoice = (invoice: Invoice) => {
    // Logic to duplicate would be handled by CreateInvoice with pre-filled data
    toast.success('Facture dupliquée - modifiez les détails');
    setEditingInvoice({ ...invoice, id: '', number: '' });
  };

  const generatePDF = (invoice: Invoice) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(24);
    doc.setTextColor(16, 185, 129);
    doc.text(settings.companyName, 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(settings.address, 20, 30);
    doc.text(`Tél: ${settings.phone}`, 20, 35);
    doc.text(`Email: ${settings.email}`, 20, 40);

    // Invoice title
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text('FACTURE', 150, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`N° ${invoice.number}`, 150, 30);
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString('fr-FR')}`, 150, 35);
    doc.text(`Échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`, 150, 40);

    // Client info
    const client = clients.find(c => c.id === invoice.clientId);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Facturé à:', 20, 55);
    doc.setFontSize(10);
    doc.text(invoice.clientName, 20, 62);
    if (client) {
      doc.text(client.phone, 20, 67);
      if (client.email) doc.text(client.email, 20, 72);
    }

    // Items table
    let yPos = 90;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Description', 20, yPos);
    doc.text('Qté', 100, yPos);
    doc.text('Prix unit.', 120, yPos);
    doc.text('Remise', 150, yPos);
    doc.text('Total', 175, yPos);

    yPos += 5;
    doc.line(20, yPos, 190, yPos);

    yPos += 7;
    doc.setTextColor(0, 0, 0);
    invoice.items.forEach((item) => {
      const itemTotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
      doc.text(item.description.substring(0, 40), 20, yPos);
      doc.text(item.quantity.toString(), 100, yPos);
      doc.text(`${item.unitPrice.toLocaleString('fr-FR')} ${settings.currency}`, 120, yPos);
      doc.text(`${item.discount}%`, 150, yPos);
      doc.text(`${itemTotal.toLocaleString('fr-FR')} ${settings.currency}`, 175, yPos);
      yPos += 7;
    });

    yPos += 3;
    doc.line(20, yPos, 190, yPos);

    // Totals
    yPos += 10;
    doc.setTextColor(100, 100, 100);
    doc.text('Sous-total:', 130, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(`${invoice.subtotal.toLocaleString('fr-FR')} ${settings.currency}`, 175, yPos);

    yPos += 7;
    doc.setTextColor(100, 100, 100);
    doc.text(`TVA (${invoice.taxRate}%):`, 130, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(`${invoice.taxAmount.toLocaleString('fr-FR')} ${settings.currency}`, 175, yPos);

    yPos += 7;
    doc.line(130, yPos, 190, yPos);
    yPos += 7;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('TOTAL:', 130, yPos);
    doc.text(`${invoice.total.toLocaleString('fr-FR')} ${settings.currency}`, 175, yPos);

    // Status
    yPos += 10;
    doc.setFontSize(10);
    const statusText = getStatusLabel(invoice.status).toUpperCase();
    doc.setTextColor(invoice.status === 'paid' ? 16 : 239, invoice.status === 'paid' ? 185 : 68, invoice.status === 'paid' ? 129 : 68);
    doc.text(`STATUT: ${statusText}`, 130, yPos);

    // Notes
    if (invoice.notes) {
      yPos += 15;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Notes:', 20, yPos);
      yPos += 5;
      doc.setTextColor(0, 0, 0);
      const splitNotes = doc.splitTextToSize(invoice.notes, 170);
      doc.text(splitNotes, 20, yPos);
    }

    doc.save(`facture-${invoice.number}.pdf`);
    toast.success('PDF généré avec succès !');
  };

  const sendWhatsApp = (invoice: Invoice) => {
    const client = clients.find(c => c.id === invoice.clientId);
    if (!client) return;

    const statusText = getStatusLabel(invoice.status);
    const message = `Bonjour ${invoice.clientName},\n\nVoici les détails de votre facture:\nNuméro: ${invoice.number}\nMontant: ${invoice.total.toLocaleString('fr-FR')} ${settings.currency}\nStatut: ${statusText}\nDate d'échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}\n\nMerci de votre confiance!\n${settings.companyName}`;

    const phone = client.phone.replace(/\s/g, '').replace('+', '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    toast.success('Message WhatsApp préparé !');
  };

  const stats = {
    total: invoices.length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    unpaid: invoices.filter(inv => inv.status === 'unpaid').length,
    pending: invoices.filter(inv => inv.status === 'pending').length,
  };

  if (editingInvoice) {
    return (
      <div>
        <Button
          onClick={() => setEditingInvoice(null)}
          variant="ghost"
          className="mb-4 rounded-xl"
        >
          ← Retour à la liste
        </Button>
        <CreateInvoice
          editInvoice={editingInvoice}
          onSaved={() => setEditingInvoice(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Liste des factures</h1>
        <p className="text-gray-500">{filteredInvoices.length} factures au total</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-gray-500 mb-1">Total</p>
            <p className="text-gray-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 shadow-sm bg-emerald-50">
          <CardContent className="p-4">
            <p className="text-emerald-700 mb-1">Payées</p>
            <p className="text-emerald-900">{stats.paid}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 shadow-sm bg-amber-50">
          <CardContent className="p-4">
            <p className="text-amber-700 mb-1">En attente</p>
            <p className="text-amber-900">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 shadow-sm bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700 mb-1">Impayées</p>
            <p className="text-red-900">{stats.unpaid}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par client ou numéro..."
                className="pl-10 rounded-xl border-gray-200"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-48 rounded-xl border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="paid">Payées</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="unpaid">Impayées</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-48 rounded-xl border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Trier par date</SelectItem>
                <SelectItem value="amount">Trier par montant</SelectItem>
                <SelectItem value="client">Trier par client</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <div className="space-y-3">
        {filteredInvoices.length === 0 ? (
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">Aucune facture trouvée</p>
            </CardContent>
          </Card>
        ) : (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-gray-900">{invoice.number}</h3>
                      <span className={`px-3 py-1 rounded-full flex items-center gap-2 ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        {getStatusLabel(invoice.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">{invoice.clientName}</p>
                    <p className="text-gray-500">
                      Émise le {new Date(invoice.date).toLocaleDateString('fr-FR')} • 
                      Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-gray-900 mb-1">{invoice.total.toLocaleString('fr-FR')} {settings.currency}</p>
                    <p className="text-gray-500">{invoice.items.length} article{invoice.items.length > 1 ? 's' : ''}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setSelectedInvoice(invoice)}
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-gray-200"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setEditingInvoice(invoice)}
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-gray-200"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Select
                      value={invoice.status}
                      onValueChange={(value: any) => handleStatusChange(invoice.id, value)}
                    >
                      <SelectTrigger className="w-32 h-9 rounded-xl border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Payée</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="unpaid">Impayée</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => generatePDF(invoice)}
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-gray-200"
                    >
                      <FileDown className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => sendWhatsApp(invoice)}
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-gray-200"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => duplicateInvoice(invoice)}
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-gray-200"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(invoice.id)}
                      variant="ghost"
                      size="sm"
                      className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Invoice Details Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="rounded-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la facture {selectedInvoice?.number}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 mb-1">Client</p>
                  <p className="text-gray-900">{selectedInvoice.clientName}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Date d'émission</p>
                  <p className="text-gray-900">{new Date(selectedInvoice.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Date d'échéance</p>
                  <p className="text-gray-900">{new Date(selectedInvoice.dueDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Statut</p>
                  <span className={`px-3 py-1 rounded-full ${getStatusColor(selectedInvoice.status)}`}>
                    {getStatusLabel(selectedInvoice.status)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-gray-900 mb-4">Articles</h4>
                <div className="space-y-3">
                  {selectedInvoice.items.map((item) => (
                    <div key={item.id} className="flex justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-gray-900">{item.description}</p>
                        <p className="text-gray-500">
                          Qté: {item.quantity} × {item.unitPrice.toLocaleString('fr-FR')} {settings.currency}
                          {item.discount > 0 && ` (-${item.discount}%)`}
                        </p>
                      </div>
                      <p className="text-gray-900">
                        {(item.quantity * item.unitPrice * (1 - item.discount / 100)).toLocaleString('fr-FR')} {settings.currency}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{selectedInvoice.subtotal.toLocaleString('fr-FR')} {settings.currency}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>TVA ({selectedInvoice.taxRate}%)</span>
                  <span>{selectedInvoice.taxAmount.toLocaleString('fr-FR')} {settings.currency}</span>
                </div>
                <div className="flex justify-between text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{selectedInvoice.total.toLocaleString('fr-FR')} {settings.currency}</span>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-900">{selectedInvoice.notes}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => generatePDF(selectedInvoice)}
                  className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Télécharger PDF
                </Button>
                <Button
                  onClick={() => sendWhatsApp(selectedInvoice)}
                  className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

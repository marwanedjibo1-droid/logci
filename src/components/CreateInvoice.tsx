import { useState } from 'react';
import { Plus, Trash2, FileDown, Send, Save, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useApp, InvoiceItem, Invoice } from '../context/AppContext';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface CreateInvoiceProps {
  editInvoice?: Invoice;
  onSaved?: () => void;
}

export function CreateInvoice({ editInvoice, onSaved }: CreateInvoiceProps) {
  const { clients, addInvoice, updateInvoice, settings } = useApp();
  const [selectedClientId, setSelectedClientId] = useState(editInvoice?.clientId || '');
  const [invoiceDate, setInvoiceDate] = useState(
    editInvoice?.date || new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState(
    editInvoice?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(editInvoice?.notes || '');
  const [items, setItems] = useState<InvoiceItem[]>(
    editInvoice?.items || [{ id: '1', description: '', quantity: 1, unitPrice: 0, discount: 0 }]
  );

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, discount: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = (subtotal * item.discount) / 100;
    return subtotal - discountAmount;
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * settings.taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const validateInvoice = () => {
    if (!selectedClientId) {
      toast.error('Veuillez sélectionner un client');
      return false;
    }
    if (items.every((item) => !item.description)) {
      toast.error('Veuillez ajouter au moins un article');
      return false;
    }
    return true;
  };

  const saveInvoice = (status: 'paid' | 'unpaid' | 'pending' = 'pending') => {
    if (!validateInvoice()) return;

    const selectedClient = clients.find((c) => c.id === selectedClientId);
    if (!selectedClient) return;

    const invoiceData = {
      clientId: selectedClientId,
      clientName: selectedClient.name,
      items,
      subtotal: calculateSubtotal(),
      taxRate: settings.taxRate,
      taxAmount: calculateTax(),
      total: calculateTotal(),
      status,
      date: invoiceDate,
      dueDate,
      notes,
    };

    if (editInvoice) {
      updateInvoice(editInvoice.id, invoiceData);
      toast.success('Facture mise à jour !');
    } else {
      addInvoice(invoiceData);
      toast.success('Facture créée avec succès !');
    }

    // Reset form
    setSelectedClientId('');
    setItems([{ id: '1', description: '', quantity: 1, unitPrice: 0, discount: 0 }]);
    setNotes('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    if (onSaved) onSaved();
  };

  const generatePDF = () => {
    if (!validateInvoice()) return;

    const selectedClient = clients.find((c) => c.id === selectedClientId);
    if (!selectedClient) return;

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
    doc.text(`N° ${settings.invoicePrefix}${String(settings.invoiceNumber).padStart(6, '0')}`, 150, 30);
    doc.text(`Date: ${new Date(invoiceDate).toLocaleDateString('fr-FR')}`, 150, 35);
    doc.text(`Échéance: ${new Date(dueDate).toLocaleDateString('fr-FR')}`, 150, 40);

    // Client info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Facturé à:', 20, 55);
    doc.setFontSize(10);
    doc.text(selectedClient.name, 20, 62);
    doc.text(selectedClient.phone, 20, 67);
    if (selectedClient.email) doc.text(selectedClient.email, 20, 72);

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
    items.forEach((item) => {
      if (item.description) {
        doc.text(item.description.substring(0, 40), 20, yPos);
        doc.text(item.quantity.toString(), 100, yPos);
        doc.text(`${item.unitPrice.toLocaleString('fr-FR')} ${settings.currency}`, 120, yPos);
        doc.text(`${item.discount}%`, 150, yPos);
        doc.text(`${calculateItemTotal(item).toLocaleString('fr-FR')} ${settings.currency}`, 175, yPos);
        yPos += 7;
      }
    });

    yPos += 3;
    doc.line(20, yPos, 190, yPos);

    // Totals
    yPos += 10;
    doc.setTextColor(100, 100, 100);
    doc.text('Sous-total:', 130, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(`${calculateSubtotal().toLocaleString('fr-FR')} ${settings.currency}`, 175, yPos);

    yPos += 7;
    doc.setTextColor(100, 100, 100);
    doc.text(`TVA (${settings.taxRate}%):`, 130, yPos);
    doc.setTextColor(0, 0, 0);
    doc.text(`${calculateTax().toLocaleString('fr-FR')} ${settings.currency}`, 175, yPos);

    yPos += 7;
    doc.line(130, yPos, 190, yPos);
    yPos += 7;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('TOTAL:', 130, yPos);
    doc.text(`${calculateTotal().toLocaleString('fr-FR')} ${settings.currency}`, 175, yPos);

    // Notes
    if (notes) {
      yPos += 15;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Notes:', 20, yPos);
      yPos += 5;
      doc.setTextColor(0, 0, 0);
      const splitNotes = doc.splitTextToSize(notes, 170);
      doc.text(splitNotes, 20, yPos);
    }

    doc.save(`facture-${settings.invoicePrefix}${String(settings.invoiceNumber).padStart(6, '0')}.pdf`);
    toast.success('PDF généré avec succès !');
  };

  const sendWhatsApp = () => {
    if (!validateInvoice()) return;

    const selectedClient = clients.find((c) => c.id === selectedClientId);
    if (!selectedClient) return;

    const message = `Bonjour ${selectedClient.name},\n\nVoici votre facture:\nNuméro: ${settings.invoicePrefix}${String(settings.invoiceNumber).padStart(6, '0')}\nMontant: ${calculateTotal().toLocaleString('fr-FR')} ${settings.currency}\nDate d'échéance: ${new Date(dueDate).toLocaleDateString('fr-FR')}\n\nMerci de votre confiance!\n${settings.companyName}`;

    const phone = selectedClient.phone.replace(/\s/g, '').replace('+', '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    toast.success('Message WhatsApp préparé !');
  };

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">{editInvoice ? 'Modifier la facture' : 'Créer une facture'}</h1>
        <p className="text-gray-500">Remplissez les informations de facturation</p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="col-span-2 space-y-6">
          {/* Client Selection */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Informations client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="client" className="text-gray-700">Client</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger id="client" className="mt-2 rounded-xl border-gray-200">
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date" className="text-gray-700">Date de facturation</Label>
                    <Input
                      id="date"
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="mt-2 rounded-xl border-gray-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate" className="text-gray-700">Date d'échéance</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="mt-2 rounded-xl border-gray-200"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">Articles & Services</CardTitle>
                <Button onClick={addItem} variant="outline" className="rounded-xl border-gray-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-700">Article {index + 1}</span>
                      {items.length > 1 && (
                        <Button
                          onClick={() => removeItem(item.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div>
                      <Label className="text-gray-700">Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Ex: Consultation informatique"
                        className="mt-2 rounded-xl border-gray-200 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-gray-700">Quantité</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="mt-2 rounded-xl border-gray-200 bg-white"
                          min="0"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700">Prix unitaire ({settings.currency})</Label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="mt-2 rounded-xl border-gray-200 bg-white"
                          min="0"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700">Remise (%)</Label>
                        <Input
                          type="number"
                          value={item.discount}
                          onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                          className="mt-2 rounded-xl border-gray-200 bg-white"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Sous-total</span>
                        <span className="text-gray-900">
                          {calculateItemTotal(item).toLocaleString('fr-FR')} {settings.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Notes & Commentaires</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Conditions de paiement, remarques..."
                className="rounded-xl border-gray-200 min-h-24"
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={generatePDF} className="h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
              <FileDown className="w-5 h-5 mr-2" />
              Générer PDF
            </Button>
            <Button onClick={sendWhatsApp} className="h-14 rounded-xl bg-green-600 hover:bg-green-700 text-white">
              <Send className="w-5 h-5 mr-2" />
              Envoyer WhatsApp
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Button
              onClick={() => saveInvoice('pending')}
              variant="outline"
              className="h-12 rounded-xl border-gray-200"
            >
              <Save className="w-4 h-4 mr-2" />
              Brouillon
            </Button>
            <Button
              onClick={() => saveInvoice('unpaid')}
              variant="outline"
              className="h-12 rounded-xl border-gray-200"
            >
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
            <Button
              onClick={() => saveInvoice('paid')}
              className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Payée
            </Button>
          </div>
        </div>

        {/* Preview Sidebar */}
        <div className="col-span-1">
          <Card className="border-gray-200 shadow-sm sticky top-8">
            <CardHeader>
              <CardTitle className="text-gray-900">Aperçu rapide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-gray-600 mb-1">Client</p>
                <p className="text-gray-900">{selectedClient?.name || 'Non sélectionné'}</p>
                {selectedClient && (
                  <p className="text-gray-500">{selectedClient.phone}</p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-600 mb-1">Dates</p>
                <p className="text-gray-700">Émission: {new Date(invoiceDate).toLocaleDateString('fr-FR')}</p>
                <p className="text-gray-700">Échéance: {new Date(dueDate).toLocaleDateString('fr-FR')}</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-600 mb-3">Articles</p>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={item.id} className="flex justify-between text-gray-700">
                      <span>Article {index + 1}</span>
                      <span>{calculateItemTotal(item).toLocaleString('fr-FR')} {settings.currency}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{calculateSubtotal().toLocaleString('fr-FR')} {settings.currency}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>TVA ({settings.taxRate}%)</span>
                  <span>{calculateTax().toLocaleString('fr-FR')} {settings.currency}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{calculateTotal().toLocaleString('fr-FR')} {settings.currency}</span>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-emerald-900">Facture N° {settings.invoicePrefix}{String(settings.invoiceNumber).padStart(6, '0')}</p>
                <p className="text-emerald-700">{new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useApp, Invoice, Payment } from '../context/AppContext';
import { toast } from 'sonner';

interface PaymentDialogProps {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentDialog({ invoice, open, onOpenChange }: PaymentDialogProps) {
  const { addPayment, settings } = useApp();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<Payment['method']>('cash');
  const [notes, setNotes] = useState('');

  const remainingAmount = invoice.total - (invoice.paidAmount || 0);

  const handleSubmit = () => {
    const paymentAmount = parseFloat(amount);
    
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error('Veuillez entrer un montant valide');
      return;
    }

    if (paymentAmount > remainingAmount) {
      toast.error('Le montant dépasse le reste à payer');
      return;
    }

    addPayment(invoice.id, {
      amount: paymentAmount,
      date,
      method,
      notes,
    });

    toast.success('Paiement enregistré !');
    
    // Reset form
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setMethod('cash');
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Enregistrer un paiement</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {/* Invoice Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Facture</span>
              <span className="text-gray-900">{invoice.number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Client</span>
              <span className="text-gray-900">{invoice.clientName}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-600">Montant total</span>
              <span className="text-gray-900">{invoice.total.toLocaleString('fr-FR')} {settings.currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Déjà payé</span>
              <span className="text-emerald-600">{(invoice.paidAmount || 0).toLocaleString('fr-FR')} {settings.currency}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-900">Reste à payer</span>
              <span className="text-red-600">{remainingAmount.toLocaleString('fr-FR')} {settings.currency}</span>
            </div>
          </div>

          {/* Payment Form */}
          <div>
            <Label htmlFor="amount" className="text-gray-700">Montant du paiement *</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="mt-2 rounded-xl border-gray-200"
              min="0"
              max={remainingAmount}
            />
            <p className="text-gray-500 mt-1">Maximum: {remainingAmount.toLocaleString('fr-FR')} {settings.currency}</p>
          </div>

          <div>
            <Label htmlFor="paymentDate" className="text-gray-700">Date du paiement *</Label>
            <Input
              id="paymentDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 rounded-xl border-gray-200"
            />
          </div>

          <div>
            <Label htmlFor="method" className="text-gray-700">Méthode de paiement *</Label>
            <Select value={method} onValueChange={(value: any) => setMethod(value)}>
              <SelectTrigger id="method" className="mt-2 rounded-xl border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Espèces</SelectItem>
                <SelectItem value="card">Carte bancaire</SelectItem>
                <SelectItem value="transfer">Virement</SelectItem>
                <SelectItem value="check">Chèque</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="paymentNotes" className="text-gray-700">Notes (optionnel)</Label>
            <Textarea
              id="paymentNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informations complémentaires..."
              className="mt-2 rounded-xl border-gray-200"
            />
          </div>

          {/* Payment History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-gray-900 mb-3">Historique des paiements</h4>
              <div className="space-y-2">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-gray-900">{payment.amount.toLocaleString('fr-FR')} {settings.currency}</p>
                      <p className="text-gray-500">
                        {new Date(payment.date).toLocaleDateString('fr-FR')} • 
                        {payment.method === 'cash' ? ' Espèces' :
                         payment.method === 'card' ? ' Carte' :
                         payment.method === 'transfer' ? ' Virement' :
                         payment.method === 'check' ? ' Chèque' : ' Autre'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <DollarSign className="w-5 h-5 mr-2" />
            Enregistrer le paiement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

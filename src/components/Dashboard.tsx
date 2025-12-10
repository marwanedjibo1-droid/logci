import { TrendingUp, FileText, Users, Settings, Sparkles, AlertCircle, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface DashboardProps {
  onNavigate: (screen: 'create-invoice' | 'clients' | 'reports' | 'settings' | 'invoices') => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { invoices, getDashboardStats } = useApp();
  const stats = getDashboardStats();
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const recentInvoices = invoices.slice(0, 5);

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

  const overdueDays = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Tableau de bord</h1>
        <p className="text-gray-500">Bienvenue sur votre espace de facturation</p>
      </div>

      {/* AI Summary Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-emerald-500 rounded-xl p-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-emerald-900 mb-1">Résumé du jour</h3>
            <p className="text-emerald-700">
              {stats.todayInvoices} factures créées • {stats.todaySales.toLocaleString('fr-FR')} FCFA
            </p>
          </div>
        </div>
      </div>

      {/* Alert for unpaid invoices */}
      {stats.unpaidTotal > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="bg-red-500 rounded-xl p-3">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-red-900 mb-1">Factures impayées</h3>
              <p className="text-red-700">
                Vous avez {invoices.filter(inv => inv.status !== 'paid').length} factures impayées pour un total de {stats.unpaidTotal.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <Button
              onClick={() => onNavigate('invoices')}
              variant="outline"
              className="rounded-xl border-red-300 text-red-700 hover:bg-red-100"
            >
              Voir
            </Button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-600">Total des ventes du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-gray-900">{stats.todaySales.toLocaleString('fr-FR')}</span>
              <span className="text-gray-500 pb-1">FCFA</span>
            </div>
            <div className="flex items-center gap-2 mt-3 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span>{stats.todayInvoices} factures</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-600">Total des ventes du mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-gray-900">{stats.monthSales.toLocaleString('fr-FR')}</span>
              <span className="text-gray-500 pb-1">FCFA</span>
            </div>
            <div className="flex items-center gap-2 mt-3 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span>{invoices.filter(inv => {
                const date = new Date(inv.date);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length} factures</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="space-y-4">
        <Button
          onClick={() => onNavigate('create-invoice')}
          className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-sm"
        >
          <FileText className="w-5 h-5 mr-3" />
          Créer une facture
        </Button>

        <div className="grid grid-cols-3 gap-4">
          <Button
            onClick={() => onNavigate('clients')}
            variant="outline"
            className="h-14 rounded-xl border-gray-200 hover:bg-gray-50"
          >
            <Users className="w-5 h-5 mr-2" />
            Clients
          </Button>
          <Button
            onClick={() => onNavigate('reports')}
            variant="outline"
            className="h-14 rounded-xl border-gray-200 hover:bg-gray-50"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Rapports
          </Button>
          <Button
            onClick={() => onNavigate('settings')}
            variant="outline"
            className="h-14 rounded-xl border-gray-200 hover:bg-gray-50"
          >
            <Settings className="w-5 h-5 mr-2" />
            Paramètres
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">Dernières factures</CardTitle>
            <Button
              onClick={() => onNavigate('invoices')}
              variant="ghost"
              className="text-emerald-600 hover:text-emerald-700"
            >
              Voir tout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentInvoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucune facture créée</p>
              <Button
                onClick={() => onNavigate('create-invoice')}
                variant="outline"
                className="mt-4 rounded-xl border-gray-200"
              >
                Créer votre première facture
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-gray-900">{invoice.clientName}</p>
                    <p className="text-gray-500">{invoice.number}</p>
                  </div>
                  <div className="text-right mr-6">
                    <p className="text-gray-900">{invoice.total.toLocaleString('fr-FR')} FCFA</p>
                    <p className="text-gray-500">{new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                      {getStatusLabel(invoice.status)}
                    </span>
                    <Button
                      onClick={() => setSelectedInvoice(invoice)}
                      variant="ghost"
                      size="sm"
                      className="rounded-xl"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
                  <p className="text-gray-500 mb-1">Date</p>
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
                  {selectedInvoice.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-gray-900">{item.description}</p>
                        <p className="text-gray-500">Qté: {item.quantity} × {item.unitPrice.toLocaleString('fr-FR')} FCFA</p>
                      </div>
                      <p className="text-gray-900">
                        {(item.quantity * item.unitPrice * (1 - item.discount / 100)).toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{selectedInvoice.subtotal.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>TVA ({selectedInvoice.taxRate}%)</span>
                  <span>{selectedInvoice.taxAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{selectedInvoice.total.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-900">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

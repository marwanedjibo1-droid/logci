import { useState } from 'react';
import { Plus, Phone, Mail, Eye, Edit, Trash2, Search, Send, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useApp, Client } from '../context/AppContext';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function ClientsList() {
  const { clients, addClient, updateClient, deleteClient, getClientInvoices, getClientUnpaidAmount, settings } = useApp();
  const [showAddClient, setShowAddClient] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'invoices' | 'unpaid'>('name');
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', address: '' });

  const filteredClients = clients
    .filter((client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'invoices') return getClientInvoices(b.id).length - getClientInvoices(a.id).length;
      if (sortBy === 'unpaid') return getClientUnpaidAmount(b.id) - getClientUnpaidAmount(a.id);
      return 0;
    });

  const handleAddClient = () => {
    if (!newClient.name || !newClient.phone) {
      toast.error('Veuillez remplir le nom et le téléphone');
      return;
    }
    addClient(newClient);
    setNewClient({ name: '', phone: '', email: '', address: '' });
    setShowAddClient(false);
    toast.success('Client ajouté avec succès !');
  };

  const handleUpdateClient = () => {
    if (!editingClient || !newClient.name || !newClient.phone) {
      toast.error('Veuillez remplir le nom et le téléphone');
      return;
    }
    updateClient(editingClient.id, newClient);
    setEditingClient(null);
    setNewClient({ name: '', phone: '', email: '', address: '' });
    toast.success('Client mis à jour avec succès !');
  };

  const handleDeleteClient = (id: string, name: string) => {
    const invoiceCount = getClientInvoices(id).length;
    if (invoiceCount > 0) {
      if (!confirm(`Ce client a ${invoiceCount} facture(s). Êtes-vous sûr de vouloir le supprimer ?`)) {
        return;
      }
    } else {
      if (!confirm(`Êtes-vous sûr de vouloir supprimer ${name} ?`)) {
        return;
      }
    }
    deleteClient(id);
    toast.success('Client supprimé');
  };

  const startEdit = (client: Client) => {
    setEditingClient(client);
    setNewClient({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      address: client.address || '',
    });
  };

  const sendWhatsApp = (client: Client) => {
    const unpaid = getClientUnpaidAmount(client.id);
    const message = unpaid > 0
      ? `Bonjour ${client.name},\n\nVous avez un montant impayé de ${unpaid.toLocaleString('fr-FR')} ${settings.currency}.\n\nMerci de régulariser votre situation.\n${settings.companyName}`
      : `Bonjour ${client.name},\n\nMerci pour votre collaboration !\n${settings.companyName}`;

    const phone = client.phone.replace(/\s/g, '').replace('+', '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    toast.success('Message WhatsApp préparé !');
  };

  const exportClientsCSV = () => {
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

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clients-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Liste des clients exportée !');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Liste des clients</h1>
          <p className="text-gray-500">{filteredClients.length} clients enregistrés</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={exportClientsCSV}
            variant="outline"
            className="h-12 rounded-xl border-gray-200"
          >
            <Download className="w-5 h-5 mr-2" />
            Exporter CSV
          </Button>
          <Dialog open={showAddClient} onOpenChange={setShowAddClient}>
            <DialogTrigger asChild>
              <Button className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="w-5 h-5 mr-2" />
                Ajouter un client
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Nouveau client</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700">Nom du client *</Label>
                  <Input
                    id="name"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    placeholder="Ex: Société KOUASSI"
                    className="mt-2 rounded-xl border-gray-200"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-700">Numéro de téléphone *</Label>
                  <Input
                    id="phone"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    placeholder="+225 XX XX XX XX XX"
                    className="mt-2 rounded-xl border-gray-200"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    placeholder="exemple@email.com"
                    className="mt-2 rounded-xl border-gray-200"
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="text-gray-700">Adresse</Label>
                  <Input
                    id="address"
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    placeholder="Adresse complète"
                    className="mt-2 rounded-xl border-gray-200"
                  />
                </div>
                <Button
                  onClick={handleAddClient}
                  className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white mt-6"
                >
                  Créer le client
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Sort */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un client..."
                className="pl-10 rounded-xl border-gray-200"
              />
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-64 rounded-xl border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Trier par nom</SelectItem>
                <SelectItem value="invoices">Trier par nb factures</SelectItem>
                <SelectItem value="unpaid">Trier par impayés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="grid gap-4">
        {filteredClients.length === 0 ? (
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">Aucun client trouvé</p>
              <Button
                onClick={() => setShowAddClient(true)}
                variant="outline"
                className="rounded-xl border-gray-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter votre premier client
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => {
            const invoices = getClientInvoices(client.id);
            const unpaidAmount = getClientUnpaidAmount(client.id);

            return (
              <Card key={client.id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-gray-900 mb-3">{client.name}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{client.phone}</span>
                        </div>
                        {client.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{client.email}</span>
                          </div>
                        )}
                        {client.address && (
                          <p className="text-gray-500">{client.address}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-8">
                      <div className="text-right">
                        <p className="text-gray-500 mb-1">Factures</p>
                        <p className="text-gray-900">{invoices.length}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 mb-1">Montant impayé</p>
                        <p className={unpaidAmount > 0 ? 'text-red-600' : 'text-emerald-600'}>
                          {unpaidAmount.toLocaleString('fr-FR')} {settings.currency}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setSelectedClient(client)}
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-gray-200"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => startEdit(client)}
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-gray-200"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => sendWhatsApp(client)}
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-gray-200"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteClient(client.id, client.name)}
                          variant="ghost"
                          size="sm"
                          className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Client Dialog */}
      <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="edit-name" className="text-gray-700">Nom du client *</Label>
              <Input
                id="edit-name"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                className="mt-2 rounded-xl border-gray-200"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone" className="text-gray-700">Téléphone *</Label>
              <Input
                id="edit-phone"
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                className="mt-2 rounded-xl border-gray-200"
              />
            </div>
            <div>
              <Label htmlFor="edit-email" className="text-gray-700">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                className="mt-2 rounded-xl border-gray-200"
              />
            </div>
            <div>
              <Label htmlFor="edit-address" className="text-gray-700">Adresse</Label>
              <Input
                id="edit-address"
                value={newClient.address}
                onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                className="mt-2 rounded-xl border-gray-200"
              />
            </div>
            <Button
              onClick={handleUpdateClient}
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white mt-6"
            >
              Enregistrer les modifications
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Client Details Dialog */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="rounded-2xl max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedClient?.name}</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 mb-1">Téléphone</p>
                  <p className="text-gray-900">{selectedClient.phone}</p>
                </div>
                {selectedClient.email && (
                  <div>
                    <p className="text-gray-500 mb-1">Email</p>
                    <p className="text-gray-900">{selectedClient.email}</p>
                  </div>
                )}
                {selectedClient.address && (
                  <div className="col-span-2">
                    <p className="text-gray-500 mb-1">Adresse</p>
                    <p className="text-gray-900">{selectedClient.address}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <p className="text-gray-500 mb-1">Total factures</p>
                    <p className="text-gray-900">{getClientInvoices(selectedClient.id).length}</p>
                  </CardContent>
                </Card>
                <Card className={`${getClientUnpaidAmount(selectedClient.id) > 0 ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
                  <CardContent className="p-4">
                    <p className={`mb-1 ${getClientUnpaidAmount(selectedClient.id) > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                      Montant impayé
                    </p>
                    <p className={getClientUnpaidAmount(selectedClient.id) > 0 ? 'text-red-900' : 'text-emerald-900'}>
                      {getClientUnpaidAmount(selectedClient.id).toLocaleString('fr-FR')} {settings.currency}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-gray-900 mb-4">Historique des factures</h4>
                {getClientInvoices(selectedClient.id).length === 0 ? (
                  <p className="text-center text-gray-500 py-4">Aucune facture</p>
                ) : (
                  <div className="space-y-3">
                    {getClientInvoices(selectedClient.id).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-gray-900">{invoice.number}</p>
                          <p className="text-gray-500">{new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-900 mb-1">
                            {invoice.total.toLocaleString('fr-FR')} {settings.currency}
                          </p>
                          <span
                            className={`px-3 py-1 rounded-full ${
                              invoice.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-700'
                                : invoice.status === 'pending'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {invoice.status === 'paid' ? 'Payée' : invoice.status === 'pending' ? 'En attente' : 'Impayée'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => sendWhatsApp(selectedClient)}
                  className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  onClick={() => {
                    setSelectedClient(null);
                    startEdit(selectedClient);
                  }}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-gray-200"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

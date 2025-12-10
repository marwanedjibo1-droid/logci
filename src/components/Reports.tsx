import { useState } from 'react';
import { Calendar, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

type Period = 'day' | 'week' | 'month' | 'year';

export function Reports() {
  const { invoices, clients, settings } = useApp();
  const [period, setPeriod] = useState<Period>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filterInvoicesByPeriod = () => {
    const now = new Date();
    
    if (startDate && endDate) {
      return invoices.filter(inv => {
        const date = new Date(inv.date);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });
    }

    return invoices.filter((inv) => {
      const date = new Date(inv.date);
      
      if (period === 'day') {
        return date.toDateString() === now.toDateString();
      }
      if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= weekAgo;
      }
      if (period === 'month') {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
      if (period === 'year') {
        return date.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const periodInvoices = filterInvoicesByPeriod();
  const total = periodInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidTotal = periodInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
  const unpaidTotal = periodInvoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.total, 0);

  // Chart data based on period
  const getChartData = () => {
    if (period === 'day') {
      const hours = Array.from({ length: 24 }, (_, i) => i);
      return hours.map(hour => ({
        name: `${hour}h`,
        value: periodInvoices
          .filter(inv => new Date(inv.date).getHours() === hour)
          .reduce((sum, inv) => sum + inv.total, 0),
      }));
    }

    if (period === 'week') {
      const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      return days.map((day, index) => ({
        name: day,
        value: periodInvoices
          .filter(inv => new Date(inv.date).getDay() === index)
          .reduce((sum, inv) => sum + inv.total, 0),
      }));
    }

    if (period === 'month') {
      const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'];
      return weeks.map((week, index) => ({
        name: week,
        value: periodInvoices
          .filter(inv => Math.floor(new Date(inv.date).getDate() / 7) === index)
          .reduce((sum, inv) => sum + inv.total, 0),
      }));
    }

    if (period === 'year') {
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
      return months.map((month, index) => ({
        name: month,
        value: periodInvoices
          .filter(inv => new Date(inv.date).getMonth() === index)
          .reduce((sum, inv) => sum + inv.total, 0),
      }));
    }

    return [];
  };

  const chartData = getChartData();

  // Top clients
  const topClients = clients
    .map(client => ({
      name: client.name,
      total: invoices.filter(inv => inv.clientId === client.id).reduce((sum, inv) => sum + inv.total, 0),
      count: invoices.filter(inv => inv.clientId === client.id).length,
    }))
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Unpaid invoices
  const unpaidInvoices = invoices
    .filter(inv => inv.status !== 'paid')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Payment rate
  const paymentRate = invoices.length > 0
    ? Math.round((invoices.filter(inv => inv.status === 'paid').length / invoices.length) * 100)
    : 0;

  // Status distribution
  const statusData = [
    { name: 'Payées', value: invoices.filter(inv => inv.status === 'paid').length, color: '#10b981' },
    { name: 'En attente', value: invoices.filter(inv => inv.status === 'pending').length, color: '#f59e0b' },
    { name: 'Impayées', value: invoices.filter(inv => inv.status === 'unpaid').length, color: '#ef4444' },
  ];

  const exportPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(24);
    doc.setTextColor(16, 185, 129);
    doc.text('RAPPORT DE VENTES', 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(settings.companyName, 20, 30);
    doc.text(`Période: ${period === 'day' ? 'Jour' : period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Année'}`, 20, 35);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 40);

    // Summary
    let yPos = 55;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Résumé', 20, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.text(`Total des ventes: ${total.toLocaleString('fr-FR')} ${settings.currency}`, 20, yPos);
    yPos += 7;
    doc.text(`Montant payé: ${paidTotal.toLocaleString('fr-FR')} ${settings.currency}`, 20, yPos);
    yPos += 7;
    doc.text(`Montant impayé: ${unpaidTotal.toLocaleString('fr-FR')} ${settings.currency}`, 20, yPos);
    yPos += 7;
    doc.text(`Nombre de factures: ${periodInvoices.length}`, 20, yPos);
    yPos += 7;
    doc.text(`Taux de paiement: ${paymentRate}%`, 20, yPos);

    // Top clients
    yPos += 15;
    doc.setFontSize(14);
    doc.text('Top 5 Clients', 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    topClients.forEach((client, index) => {
      doc.text(`${index + 1}. ${client.name}: ${client.total.toLocaleString('fr-FR')} ${settings.currency} (${client.count} factures)`, 20, yPos);
      yPos += 7;
    });

    // Unpaid invoices
    if (unpaidInvoices.length > 0) {
      yPos += 10;
      doc.setFontSize(14);
      doc.text('Factures impayées', 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      unpaidInvoices.slice(0, 10).forEach((inv) => {
        doc.text(`${inv.number} - ${inv.clientName}: ${inv.total.toLocaleString('fr-FR')} ${settings.currency}`, 20, yPos);
        yPos += 7;
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });
    }

    doc.save(`rapport-${period}-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Rapport PDF généré !');
  };

  const exportExcel = () => {
    const headers = ['Numéro', 'Client', 'Date', 'Échéance', 'Montant', 'Statut'];
    const rows = periodInvoices.map((inv) => [
      inv.number,
      inv.clientName,
      new Date(inv.date).toLocaleDateString('fr-FR'),
      new Date(inv.dueDate).toLocaleDateString('fr-FR'),
      inv.total,
      inv.status === 'paid' ? 'Payée' : inv.status === 'pending' ? 'En attente' : 'Impayée',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Rapport Excel généré !');
  };

  const getPeriodLabel = () => {
    if (startDate && endDate) {
      return `Du ${new Date(startDate).toLocaleDateString('fr-FR')} au ${new Date(endDate).toLocaleDateString('fr-FR')}`;
    }
    if (period === 'day') return "Aujourd'hui";
    if (period === 'week') return 'Cette semaine';
    if (period === 'month') return 'Ce mois';
    if (period === 'year') return 'Cette année';
    return '';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Rapports</h1>
          <p className="text-gray-500">Analyse de vos performances de vente</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={exportPDF} variant="outline" className="h-12 rounded-xl border-gray-200">
            <Download className="w-5 h-5 mr-2" />
            PDF
          </Button>
          <Button onClick={exportExcel} className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
            <Download className="w-5 h-5 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Period Filter */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div className="flex gap-2">
              {(['day', 'week', 'month', 'year'] as Period[]).map((p) => (
                <Button
                  key={p}
                  onClick={() => {
                    setPeriod(p);
                    setStartDate('');
                    setEndDate('');
                  }}
                  variant={period === p && !startDate ? 'default' : 'outline'}
                  className={`rounded-xl ${
                    period === p && !startDate
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {p === 'day' ? 'Jour' : p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : 'Année'}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 ml-4">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-gray-200 shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <p className="text-emerald-100 mb-2">Total des ventes</p>
            <p className="text-white mb-2">{total.toLocaleString('fr-FR')} {settings.currency}</p>
            <p className="text-emerald-100">{getPeriodLabel()}</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <p className="text-gray-500 mb-2">Montant payé</p>
            <p className="text-emerald-600 mb-2">{paidTotal.toLocaleString('fr-FR')} {settings.currency}</p>
            <p className="text-gray-500">{Math.round((paidTotal / total) * 100) || 0}% du total</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <p className="text-gray-500 mb-2">Montant impayé</p>
            <p className="text-red-600 mb-2">{unpaidTotal.toLocaleString('fr-FR')} {settings.currency}</p>
            <p className="text-gray-500">{unpaidInvoices.length} factures</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <p className="text-gray-500 mb-2">Taux de paiement</p>
            <p className="text-gray-900 mb-2">{paymentRate}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full"
                style={{ width: `${paymentRate}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="border-gray-200 shadow-sm col-span-2">
          <CardHeader>
            <CardTitle className="text-gray-900">Évolution des ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                  <YAxis
                    tick={{ fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '12px',
                    }}
                    formatter={(value: number) => `${value.toLocaleString('fr-FR')} ${settings.currency}`}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900">Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900">Top 5 Clients</CardTitle>
        </CardHeader>
        <CardContent>
          {topClients.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucun client</p>
          ) : (
            <div className="space-y-4">
              {topClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-gray-900">{client.name}</p>
                      <p className="text-gray-500">{client.count} factures</p>
                    </div>
                  </div>
                  <p className="text-gray-900">{client.total.toLocaleString('fr-FR')} {settings.currency}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unpaid Invoices */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">Factures impayées</CardTitle>
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-xl">
              {unpaidTotal.toLocaleString('fr-FR')} {settings.currency}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {unpaidInvoices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-emerald-600 mb-2">✓ Toutes les factures sont payées !</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unpaidInvoices.map((invoice) => {
                const overdue = new Date() > new Date(invoice.dueDate);
                const daysOverdue = Math.floor(
                  (new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-gray-900 mb-1">{invoice.clientName}</p>
                      <p className="text-gray-500">{invoice.number}</p>
                    </div>
                    <div className="text-right mr-6">
                      <p className="text-gray-900 mb-1">{invoice.total.toLocaleString('fr-FR')} {settings.currency}</p>
                      <p className="text-gray-500">{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      {overdue ? (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full flex items-center gap-2">
                          <TrendingDown className="w-4 h-4" />
                          {daysOverdue} jours
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full">
                          En attente
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

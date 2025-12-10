import { Invoice, Client, Settings } from '../context/AppContext';

export const sendInvoiceViaWhatsApp = (invoice: Invoice, client: Client, settings: Settings) => {
  const statusText = 
    invoice.status === 'paid' ? 'Payée' :
    invoice.status === 'unpaid' ? 'Impayée' :
    invoice.status === 'partial' ? 'Paiement partiel' :
    'En attente';

  let message = `Bonjour ${client.name},\n\n`;
  message += `Voici les détails de votre facture:\n\n`;
  message += `📄 Numéro: ${invoice.number}\n`;
  message += `💰 Montant: ${invoice.total.toLocaleString('fr-FR')} ${settings.currency}\n`;
  
  if (invoice.status === 'partial' && invoice.paidAmount) {
    message += `✅ Payé: ${invoice.paidAmount.toLocaleString('fr-FR')} ${settings.currency}\n`;
    message += `⏳ Reste: ${(invoice.total - invoice.paidAmount).toLocaleString('fr-FR')} ${settings.currency}\n`;
  }
  
  message += `📅 Date d'échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}\n`;
  message += `📊 Statut: ${statusText}\n\n`;

  if (invoice.notes) {
    message += `📝 Note: ${invoice.notes}\n\n`;
  }

  message += `Merci de votre confiance!\n`;
  message += `\n${settings.companyName}\n`;
  message += `📞 ${settings.phone}\n`;
  message += `📧 ${settings.email}`;

  const phone = client.phone.replace(/\s/g, '').replace('+', '');
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

export const sendPaymentReminderViaWhatsApp = (client: Client, unpaidAmount: number, settings: Settings, invoices: Invoice[]) => {
  let message = `Bonjour ${client.name},\n\n`;
  message += `Ceci est un rappel concernant vos factures impayées.\n\n`;
  message += `💰 Montant total impayé: ${unpaidAmount.toLocaleString('fr-FR')} ${settings.currency}\n\n`;
  
  message += `Détails des factures:\n`;
  invoices.forEach(inv => {
    const remaining = inv.total - (inv.paidAmount || 0);
    message += `\n📄 ${inv.number}\n`;
    message += `   Montant: ${remaining.toLocaleString('fr-FR')} ${settings.currency}\n`;
    message += `   Échéance: ${new Date(inv.dueDate).toLocaleDateString('fr-FR')}\n`;
  });

  message += `\nMerci de régulariser votre situation dans les plus brefs délais.\n\n`;
  message += `Pour tout renseignement, contactez-nous:\n`;
  message += `${settings.companyName}\n`;
  message += `📞 ${settings.phone}\n`;
  message += `📧 ${settings.email}`;

  const phone = client.phone.replace(/\s/g, '').replace('+', '');
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

export const sendThankYouViaWhatsApp = (client: Client, settings: Settings) => {
  const message = `Bonjour ${client.name},\n\n` +
    `Merci pour votre paiement et votre confiance! 🙏\n\n` +
    `Nous sommes ravis de travailler avec vous.\n\n` +
    `À très bientôt,\n` +
    `${settings.companyName}\n` +
    `📞 ${settings.phone}`;

  const phone = client.phone.replace(/\s/g, '').replace('+', '');
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

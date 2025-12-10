import { jsPDF } from 'jspdf';
import { Invoice, Settings } from '../context/AppContext';

export const generateInvoicePDF = (invoice: Invoice, settings: Settings, clientEmail?: string) => {
  const doc = new jsPDF();

  // Add logo if available
  if (settings.logo) {
    try {
      doc.addImage(settings.logo, 'PNG', 15, 10, 30, 30);
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }

  // Company Header
  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129); // Emerald color
  doc.text(settings.companyName, settings.logo ? 50 : 20, 20);

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(settings.address, settings.logo ? 50 : 20, 27);
  doc.text(`Tél: ${settings.phone}`, settings.logo ? 50 : 20, 32);
  doc.text(`Email: ${settings.email}`, settings.logo ? 50 : 20, 37);

  // Invoice Title
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  doc.text('FACTURE', 150, 25);

  // Invoice Details
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`N° ${invoice.number}`, 150, 35);
  doc.text(`Date: ${new Date(invoice.date).toLocaleDateString('fr-FR')}`, 150, 41);
  doc.text(`Échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`, 150, 47);

  // Client Info Box
  doc.setFillColor(249, 250, 251);
  doc.rect(15, 55, 85, 30, 'F');
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('FACTURÉ À:', 20, 62);
  
  doc.setFontSize(10);
  doc.text(invoice.clientName, 20, 69);
  if (clientEmail) {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(clientEmail, 20, 75);
  }

  // Status Badge
  const statusColors = {
    paid: { bg: [220, 252, 231], text: [22, 163, 74] },
    unpaid: { bg: [254, 226, 226], text: [220, 38, 38] },
    pending: { bg: [254, 243, 199], text: [245, 158, 11] },
    partial: { bg: [219, 234, 254], text: [59, 130, 246] },
  };

  const statusLabels = {
    paid: 'PAYÉE',
    unpaid: 'IMPAYÉE',
    pending: 'EN ATTENTE',
    partial: 'PAIEMENT PARTIEL',
  };

  const statusColor = statusColors[invoice.status];
  const statusLabel = statusLabels[invoice.status];

  doc.setFillColor(...statusColor.bg);
  doc.roundedRect(120, 55, 70, 12, 3, 3, 'F');
  doc.setTextColor(...statusColor.text);
  doc.setFontSize(10);
  doc.text(statusLabel, 155, 62, { align: 'center' });

  // Items Table Header
  let yPos = 100;
  doc.setFillColor(249, 250, 251);
  doc.rect(15, yPos, 180, 10, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('DESCRIPTION', 20, yPos + 7);
  doc.text('QTÉ', 115, yPos + 7);
  doc.text('PRIX U.', 135, yPos + 7);
  doc.text('REMISE', 158, yPos + 7);
  doc.text('TOTAL', 180, yPos + 7);

  yPos += 10;
  doc.setDrawColor(229, 231, 235);
  doc.line(15, yPos, 195, yPos);

  // Items
  yPos += 8;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  invoice.items.forEach((item) => {
    const itemTotal = item.quantity * item.unitPrice * (1 - item.discount / 100);
    
    // Wrap long descriptions
    const description = item.description.substring(0, 50);
    doc.text(description, 20, yPos);
    doc.text(item.quantity.toString(), 115, yPos);
    doc.text(`${item.unitPrice.toLocaleString('fr-FR')}`, 135, yPos);
    doc.text(`${item.discount}%`, 158, yPos);
    doc.text(`${itemTotal.toLocaleString('fr-FR')}`, 180, yPos);
    
    yPos += 7;
    
    // Add page if needed
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
  });

  // Separator line
  yPos += 3;
  doc.setDrawColor(229, 231, 235);
  doc.line(15, yPos, 195, yPos);

  // Summary Box
  yPos += 10;
  const summaryX = 130;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Sous-total:', summaryX, yPos);
  doc.setTextColor(0, 0, 0);
  doc.text(`${invoice.subtotal.toLocaleString('fr-FR')} ${settings.currency}`, 185, yPos, { align: 'right' });

  yPos += 7;
  doc.setTextColor(100, 100, 100);
  doc.text(`TVA (${invoice.taxRate}%):`, summaryX, yPos);
  doc.setTextColor(0, 0, 0);
  doc.text(`${invoice.taxAmount.toLocaleString('fr-FR')} ${settings.currency}`, 185, yPos, { align: 'right' });

  // Total line
  yPos += 2;
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.5);
  doc.line(summaryX, yPos, 195, yPos);

  yPos += 7;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('TOTAL:', summaryX, yPos);
  doc.setTextColor(16, 185, 129);
  doc.text(`${invoice.total.toLocaleString('fr-FR')} ${settings.currency}`, 185, yPos, { align: 'right' });

  // Payments if partial
  if (invoice.status === 'partial' && invoice.paidAmount) {
    yPos += 7;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Montant payé:', summaryX, yPos);
    doc.setTextColor(34, 197, 94);
    doc.text(`${invoice.paidAmount.toLocaleString('fr-FR')} ${settings.currency}`, 185, yPos, { align: 'right' });

    yPos += 7;
    doc.setTextColor(100, 100, 100);
    doc.text('Reste à payer:', summaryX, yPos);
    doc.setTextColor(239, 68, 68);
    doc.text(`${(invoice.total - invoice.paidAmount).toLocaleString('fr-FR')} ${settings.currency}`, 185, yPos, { align: 'right' });
  }

  // Notes
  if (invoice.notes) {
    yPos += 15;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Notes:', 20, yPos);
    
    yPos += 5;
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    const splitNotes = doc.splitTextToSize(invoice.notes, 170);
    doc.text(splitNotes, 20, yPos);
    yPos += splitNotes.length * 5;
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Merci de votre confiance | ${settings.companyName}`, 105, pageHeight - 15, { align: 'center' });
  doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, pageHeight - 10, { align: 'center' });

  return doc;
};

export const downloadInvoicePDF = (invoice: Invoice, settings: Settings, clientEmail?: string) => {
  const doc = generateInvoicePDF(invoice, settings, clientEmail);
  doc.save(`facture-${invoice.number}.pdf`);
};

export const printInvoicePDF = (invoice: Invoice, settings: Settings, clientEmail?: string) => {
  const doc = generateInvoicePDF(invoice, settings, clientEmail);
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
};

import { jsPDF } from 'jspdf';

export async function generateTicketPdf(
  qrDataUrl: string,
  ticketCode: string,
  categoryName: string,
  buyerName: string
): Promise<Blob> {
  const doc = new jsPDF({ unit: 'mm', format: [100, 150] });
  const noir = '#0A0A0A';
  const or = '#D39F2D';
  const ivoire = '#F5F0E8';
  const taupe = '#3A322C';

  // Fond noir (bandeau haut) + fond ivoire (corps)
  doc.setFillColor(noir);
  doc.rect(0, 0, 100, 26, 'F');
  doc.setFillColor(ivoire);
  doc.rect(0, 26, 100, 124, 'F');

  // Bandeau haut : titre événement + catégorie
  doc.setTextColor(ivoire);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text("J'AFFIRME 2026", 50, 12, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(or);
  doc.text(categoryName.toUpperCase(), 50, 19, { align: 'center' });

  // Cadre doré fin (signature visuelle du site)
  doc.setDrawColor(or);
  doc.setLineWidth(0.4);
  doc.rect(5, 31, 90, 114);

  // QR code centré
  const qrSize = 55;
  doc.addImage(qrDataUrl, 'PNG', (100 - qrSize) / 2, 38, qrSize, qrSize);

  // Code du billet
  doc.setTextColor(noir);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(ticketCode, 50, 102, { align: 'center' });

  // Nom de l'acheteur
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(taupe);
  doc.text(buyerName, 50, 110, { align: 'center' });

  // Infos événement
  doc.setFontSize(8);
  doc.text('24 OCTOBRE 2026 · FAMILY BEACH, COTONOU', 50, 128, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor('#8a8378');
  doc.text('T.Y.L.A — The Young Leadership Africa', 50, 138, { align: 'center' });

  return doc.output('blob');
}

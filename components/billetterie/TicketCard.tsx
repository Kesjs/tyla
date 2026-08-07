'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import Image from 'next/image';
import { Download } from 'lucide-react';

export function TicketCard({
  ticketCode,
  categoryName,
  buyerName,
}: {
  ticketCode: string;
  categoryName: string;
  buyerName: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, ticketCode, {
        width: 220,
        margin: 1,
        color: { dark: '#0A0A0A', light: '#F5F0E8' },
      });
    }
  }, [ticketCode]);

  async function downloadPdf() {
    if (!canvasRef.current) return;
    setDownloading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const qrDataUrl = canvasRef.current.toDataURL('image/png');

      // Format carte/billet, compact et imprimable
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

      doc.save(`jaffirme-billet-${ticketCode}.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="gold-frame relative overflow-hidden border border-or/40 bg-ivoire text-noir">
      <div className="flex items-center justify-between border-b border-taupe/20 bg-noir px-6 py-4">
        <div className="flex items-center gap-2">
          <Image src="/logo/tyla-logo-blanc.png" alt="T.Y.L.A" width={24} height={24} className="h-6 w-6 object-contain" />
          <span className="font-display text-xs tracking-[0.25em] text-ivoire">J&apos;AFFIRME 2026</span>
        </div>
        <span className="font-body text-[10px] uppercase tracking-[0.15em] text-or">{categoryName}</span>
      </div>

      <div className="flex flex-col items-center gap-4 px-6 py-8">
        <canvas ref={canvasRef} className="bg-ivoire" />
        <div className="text-center">
          <p className="font-display text-sm font-semibold tracking-[0.15em]">{ticketCode}</p>
          <p className="mt-1 font-body text-xs text-taupe">{buyerName}</p>
        </div>
        <p className="font-body text-[11px] uppercase tracking-[0.15em] text-taupe/70">
          24 octobre 2026 · Family Beach, Cotonou
        </p>

        <button
          onClick={downloadPdf}
          disabled={downloading}
          className="mt-2 flex w-full items-center justify-center gap-2 border border-noir py-3 font-body text-xs uppercase tracking-[0.2em] text-noir transition-colors hover:bg-noir hover:text-ivoire disabled:opacity-50"
        >
          <Download size={14} />
          {downloading ? 'Génération...' : 'Télécharger en PDF'}
        </button>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import Image from 'next/image';
import { Download, FileArchive } from 'lucide-react';
import { generateTicketPdf } from '@/lib/pdf-utils';
import { NavLink } from '@/components/NavLink';

// ============================================================================
// TicketCard - Version simple pour affichage individual (retrouver, etc.)
// ============================================================================
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
      const qrDataUrl = canvasRef.current.toDataURL('image/png');
      const blob = await generateTicketPdf(qrDataUrl, ticketCode, categoryName, buyerName);

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jaffirme-billet-${ticketCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="gold-frame relative overflow-hidden border border-or/40 bg-ivoire text-noir">
      <div className="flex items-center justify-between border-b border-taupe/20 bg-noir px-6 py-4">
        <div className="flex items-center gap-2">
          <Image
            src="/logo/tyla-logo-blanc.png"
            alt="T.Y.L.A"
            width={24}
            height={24}
            className="h-6 w-6 object-contain"
          />
          <span className="font-display text-xs tracking-[0.25em] text-ivoire">
            J&apos;AFFIRME 2026
          </span>
        </div>
        <span className="font-body text-[10px] uppercase tracking-[0.15em] text-or">
          {categoryName}
        </span>
      </div>

      <div className="flex flex-col items-center gap-4 px-6 py-8">
        <canvas ref={canvasRef} className="bg-ivoire" />
        <div className="text-center">
          <p className="font-display text-sm font-semibold tracking-[0.15em]">{ticketCode}</p>
          <p className="mt-1 font-body text-xs text-taupe">{buyerName}</p>
        </div>
        <p className="font-body text-[11px] uppercase tracking-[0.15em] text-taupe/70">
          24 octobre 2026 · Cotonou, Bénin
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

// ============================================================================
// ConfirmationContent - Version avec gestion multiple et ZIP
// ============================================================================
interface TicketData {
  id: string;
  ticketCode: string;
  categoryName: string;
  buyerName: string;
}

export function ConfirmationContent({ tickets }: { tickets: TicketData[] }) {
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  // Générer les QR codes
  useEffect(() => {
    tickets.forEach((ticket) => {
      if (canvasRefs.current[ticket.id]) {
        QRCode.toCanvas(canvasRefs.current[ticket.id], ticket.ticketCode, {
          width: 220,
          margin: 1,
          color: { dark: '#0A0A0A', light: '#F5F0E8' },
        });
      }
    });
  }, [tickets]);

  async function downloadSinglePdf(ticket: TicketData) {
    const canvas = canvasRefs.current[ticket.id];
    if (!canvas) return;

    setDownloadingId(ticket.id);
    try {
      const qrDataUrl = canvas.toDataURL('image/png');
      const blob = await generateTicketPdf(
        qrDataUrl,
        ticket.ticketCode,
        ticket.categoryName,
        ticket.buyerName
      );

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jaffirme-billet-${ticket.ticketCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingId(null);
    }
  }

  async function downloadAllAsZip() {
    setDownloadingAll(true);
    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();

      // Générer tous les PDFs
      for (const ticket of tickets) {
        const canvas = canvasRefs.current[ticket.id];
        if (!canvas) continue;

        const qrDataUrl = canvas.toDataURL('image/png');
        const blob = await generateTicketPdf(
          qrDataUrl,
          ticket.ticketCode,
          ticket.categoryName,
          ticket.buyerName
        );

        zip.file(`jaffirme-billet-${ticket.ticketCode}.pdf`, blob);
      }

      // Ajouter un fichier d'info
      const infoContent = `J'AFFIRME 2026 - Billets\n\nDate: 24 octobre 2026\nLieu: Cotonou, Bénin\n\nNombre de billets: ${tickets.length}\n\nPrésentez le QR code de chaque billet à l'entrée.\n\nContactez: benin@tylafrica.com`;
      zip.file('README.txt', infoContent);

      // Générer et télécharger le ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jaffirme-billets-${new Date().getTime()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingAll(false);
    }
  }

  return (
    <div className="min-h-screen bg-noir px-6 pb-32 pt-40 md:px-10 md:pt-48">
      <div className="mx-auto max-w-2xl">
        {/* En-tête */}
        <div className="mb-12 text-center">
          <p className="font-body text-xs uppercase tracking-[0.35em] text-or">
            Paiement confirmé
          </p>
          <h1 className="mt-5 font-display text-3xl font-semibold text-ivoire sm:text-4xl">
            Vos billets sont prêts.
          </h1>
          <p className="mx-auto mt-4 max-w-lg font-body text-sm text-ivoire/60">
            Présentez le QR code de chaque billet à l&apos;entrée le 24 octobre 2026.
            Téléchargez vos billets en PDF ou en ZIP pour les garder sur votre téléphone.
          </p>
          <p className="mt-3 font-body text-xs text-ivoire/40">
            Pas d&apos;inquiétude si vous fermez cette page : vos billets restent
            accessibles via{' '}
            <NavLink href="/billetterie/retrouver" className="text-or underline-offset-4 hover:underline">
              Retrouver mes billets
            </NavLink>
            .
          </p>
        </div>

        {/* Actions rapides */}
        <div className="mb-12 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={downloadAllAsZip}
            disabled={downloadingAll}
            className="flex items-center justify-center gap-2 flex-1 border border-or bg-or/10 py-3 font-body text-xs uppercase tracking-[0.2em] text-or transition-colors hover:bg-or/20 disabled:opacity-50"
          >
            <FileArchive size={16} />
            {downloadingAll ? 'Génération ZIP...' : `Télécharger tous (${tickets.length})`}
          </button>
        </div>

        {/* Billets */}
        <div className="flex flex-col gap-8">
          {tickets.map((ticket, i) => (
            <div
              key={ticket.id}
              className="gold-frame relative overflow-hidden border border-or/40 bg-ivoire text-noir"
            >
              {/* Numéro du billet */}
              <div className="absolute right-4 top-4 bg-noir/90 px-3 py-1">
                <span className="font-body text-xs text-or">#{i + 1}</span>
              </div>

              {/* En-tête du billet */}
              <div className="flex items-center justify-between border-b border-taupe/20 bg-noir px-6 py-4">
                <div className="flex items-center gap-2">
                  <Image
                    src="/logo/tyla-logo-blanc.png"
                    alt="T.Y.L.A"
                    width={24}
                    height={24}
                    className="h-6 w-6 object-contain"
                  />
                  <span className="font-display text-xs tracking-[0.25em] text-ivoire">
                    J&apos;AFFIRME 2026
                  </span>
                </div>
                <span className="font-body text-[10px] uppercase tracking-[0.15em] text-or">
                  {ticket.categoryName}
                </span>
              </div>

              {/* Contenu du billet */}
              <div className="flex flex-col items-center gap-4 px-6 py-8">
                <canvas
                  ref={(el) => {
                    if (el) canvasRefs.current[ticket.id] = el;
                  }}
                  className="bg-ivoire"
                />
                <div className="text-center">
                  <p className="font-display text-sm font-semibold tracking-[0.15em]">
                    {ticket.ticketCode}
                  </p>
                  <p className="mt-1 font-body text-xs text-taupe">{ticket.buyerName}</p>
                </div>
                <p className="font-body text-[11px] uppercase tracking-[0.15em] text-taupe/70">
                  24 octobre 2026 · Cotonou, Bénin
                </p>

                {/* Bouton télécharger */}
                <button
                  onClick={() => downloadSinglePdf(ticket)}
                  disabled={downloadingId === ticket.id}
                  className="mt-2 flex w-full items-center justify-center gap-2 border border-noir py-3 font-body text-xs uppercase tracking-[0.2em] text-noir transition-colors hover:bg-noir hover:text-ivoire disabled:opacity-50"
                >
                  <Download size={14} />
                  {downloadingId === ticket.id ? 'Génération...' : 'Télécharger PDF'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pied de page */}
        <div className="mt-12 border-t border-taupe/20 pt-8 text-center">
          <p className="font-body text-xs text-ivoire/40">
            Des questions ? Contactez-nous à{' '}
            <a href="mailto:benin@tylafrica.com" className="text-or hover:underline">
              benin@tylafrica.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

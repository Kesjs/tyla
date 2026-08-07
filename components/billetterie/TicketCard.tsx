'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import Image from 'next/image';

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

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, ticketCode, {
        width: 180,
        margin: 1,
        color: { dark: '#0A0A0A', light: '#F5F0E8' },
      });
    }
  }, [ticketCode]);

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
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';

/**
 * Scanner QR caméra pour le check-in le jour J.
 * Appelle onScan(valeurLue) à chaque QR détecté ; le composant parent
 * gère la vérification (voir CheckinPanel).
 */
export function QrScanner({ onScan, active }: { onScan: (value: string) => void; active: boolean }) {
  const containerId = 'qr-reader';
  const scannerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    (async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelled) return;

        const instance = new Html5Qrcode(containerId);
        scannerRef.current = instance;

        await instance.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            onScan(decodedText);
          },
          () => {
            // erreurs de décodage frame par frame : ignorées (bruit normal)
          }
        );
        if (!cancelled) setStarted(true);
      } catch (err) {
        if (!cancelled) {
          setError("Impossible d'accéder à la caméra. Vérifiez les autorisations, ou utilisez la saisie manuelle ci-dessous.");
        }
      }
    })();

    return () => {
      cancelled = true;
      const instance = scannerRef.current;
      if (instance) {
        instance.stop().then(() => instance.clear()).catch(() => {});
      }
      setStarted(false);
    };
  }, [active, onScan]);

  if (!active) return null;

  return (
    <div className="mt-4">
      <div id={containerId} className="mx-auto max-w-xs overflow-hidden border border-or/40" />
      {error && (
        <p className="mt-3 flex items-center gap-2 font-body text-xs text-porto-light">
          <CameraOff size={14} /> {error}
        </p>
      )}
      {started && !error && (
        <p className="mt-3 flex items-center justify-center gap-2 font-body text-xs text-ivoire/50">
          <Camera size={14} /> Visez le QR code du billet
        </p>
      )}
    </div>
  );
}

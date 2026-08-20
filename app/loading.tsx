import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-noir text-ivoire">
      <div className="relative flex items-center justify-center">
        {/* Anneau doré pulsant */}
        <div className="absolute h-20 w-20 animate-ping rounded-full bg-or/20" />
        
        {/* Logo */}
        <div className="relative h-12 w-12 animate-pulse">
          <Image
            src="/logo-tyla.png"
            alt="T.Y.L.A Loading"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
      
      <span className="mt-6 font-display text-xs tracking-[0.3em] text-or uppercase animate-pulse">
        Chargement...
      </span>
    </div>
  );
}

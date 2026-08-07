import { Hero } from '@/components/home/Hero';
import { ManifestoQuote } from '@/components/home/ManifestoQuote';
import { ProofSection } from '@/components/home/ProofSection';
import { BridgeSection } from '@/components/home/BridgeSection';
import { ValuesTeaser } from '@/components/home/ValuesTeaser';
import { GalleryStrip } from '@/components/home/GalleryStrip';
import { TicketPreview } from '@/components/home/TicketPreview';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ManifestoQuote />
      <ProofSection />
      <BridgeSection />
      <ValuesTeaser />
      <GalleryStrip />
      <TicketPreview />
    </>
  );
}

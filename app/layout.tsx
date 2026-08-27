import type { Metadata } from 'next';
import { Playfair_Display, Poppins } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { SmoothScroll } from '@/components/SmoothScroll';
import { ScrollProgressBar } from '@/components/ScrollProgressBar';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "J'AFFIRME — T.Y.L.A Fashion Week 2026",
  description:
    "J'AFFIRME n'est pas un défilé de mode comme les autres. Le 24 octobre 2026, à Cotonou, T.Y.L.A — The Young Leadership Africa — affirme que l'excellence créative africaine n'a besoin de la permission de personne pour exister au sommet.",
  metadataBase: new URL('https://jaffirme.tylafrica.com'),
  icons: {
    icon: '/icon.jpg',
  },
  openGraph: {
    title: "J'AFFIRME — T.Y.L.A Fashion Week 2026",
    description: 'Cotonou, Bénin · 24 octobre 2026',
    images: ['/images/podium-yawoto.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${playfair.variable} ${poppins.variable}`}>
      <body className="font-body antialiased">
        <ScrollProgressBar />
        <NextTopLoader
          color="#D39F2D"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #D39F2D,0 0 5px #D39F2D"
        />
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}

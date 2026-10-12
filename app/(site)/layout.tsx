import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Script from 'next/script';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <Script
        src="https://tryqualio.pro/widget.js"
        data-key="EXjpjNST8b1nG8tvDOSdZIzh_x2gByNM"
      />
    </>
  );
}

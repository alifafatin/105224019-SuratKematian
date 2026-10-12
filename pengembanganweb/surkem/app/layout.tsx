import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'WebSurkem - Layanan Pelaporan & Penerbitan Surat Kematian Digital',
  description:
    'Aplikasi Pelayanan Surat Kematian Digital dengan Enkripsi AES-256-GCM, Tanda Tangan Digital Ed25519 RT/RW, dan Penerbitan Akta Dukcapil.',
  keywords: [
    'Surat Kematian',
    'surat kematian',
    'Dukcapil',
    'RT RW',
    'Kependudukan Digital',
    'WebSurkem',
    'SPBE',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-200 selection:text-blue-900">
        <Navbar />
        <main id="main-content" className="flex-1 focus:outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

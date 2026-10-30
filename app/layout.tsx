import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Rute Jalan Santai HGN & HUT ke-81 PGRI 2026 Pasirwangi',
  description:
    'Aplikasi Pemandu Arah dan Navigasi GPS Interaktif Kegiatan Jalan Santai Peringatan Hari Guru Nasional (HGN) dan HUT ke-81 PGRI Tahun 2026 Kecamatan Pasirwangi.',
  applicationName: 'Navigasi Jalan Santai PGRI Pasirwangi',
  authors: [{ name: 'Panitia Jalan Santai PGRI Pasirwangi' }],
  keywords: [
    'Jalan Santai',
    'PGRI Pasirwangi',
    'HGN 2026',
    'HUT 81 PGRI',
    'Rute Pasirwangi',
    'Navigasi GPS',
  ],
  openGraph: {
    title: 'Rute Jalan Santai HGN & HUT ke-81 PGRI 2026 Pasirwangi',
    description:
      'Pemandu arah GPS real-time peserta Jalan Santai HGN dan HUT ke-81 PGRI Tahun 2026 Kecamatan Pasirwangi.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rute Jalan Santai HGN & HUT ke-81 PGRI 2026 Pasirwangi',
    description:
      'Panduan navigasi rute resmi jalan santai PGRI Kecamatan Pasirwangi 2026.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0284c7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-slate-50 text-slate-800 font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

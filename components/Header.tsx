'use client';

import React from 'react';
import Image from 'next/image';
import { Volume2, VolumeX, Share2, ListOrdered, Code2, PhoneCall } from 'lucide-react';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenCheckpoints: () => void;
  onOpenGasModal: () => void;
  onOpenEmergency: () => void;
}

export default function Header({
  soundEnabled,
  onToggleSound,
  onOpenCheckpoints,
  onOpenGasModal,
  onOpenEmergency,
}: HeaderProps) {
  const [copied, setCopied] = React.useState(false);

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Rute Jalan Santai HGN & HUT ke-81 PGRI 2026 Pasirwangi',
          text: 'Panduan navigasi GPS interaktif resmi Jalan Santai HGN & HUT ke-81 PGRI Tahun 2026 Kecamatan Pasirwangi.',
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-sky-700 via-sky-600 to-blue-700 text-white shadow-md border-b border-sky-500/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Event Identity with Official Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white shadow-md ring-2 ring-white/50 shrink-0 flex items-center justify-center">
            <Image
              src="/logo_pgri.jpg"
              alt="Logo PGRI HGN 2026 Pasirwangi"
              width={48}
              height={48}
              className="object-cover w-full h-full"
              priority
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-sky-200 tracking-wider uppercase leading-none">
              <span>JALAN SANTAI</span>
              <span className="text-white/40">/</span>
              <span>PASIRWANGI</span>
            </div>
            <h1 className="text-sm sm:text-lg font-extrabold tracking-tight text-white leading-tight truncate">
              HGN & HUT KE-81 PGRI TAHUN 2026
            </h1>
            <p className="text-[10px] sm:text-xs text-sky-100 font-medium leading-none mt-0.5 truncate">
              KECAMATAN PASIRWANGI · KABUPATEN GARUT
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Sound / TTS Toggle */}
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Matikan Suara Panduan' : 'Nyalakan Suara Panduan'}
            title={soundEnabled ? 'Suara Panduan Aktif' : 'Suara Panduan Bisu'}
            className={`min-h-[40px] min-w-[40px] px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              soundEnabled
                ? 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                : 'bg-black/20 text-sky-200 border-white/10 hover:bg-black/30'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-300" />
            )}
            <span className="hidden md:inline">{soundEnabled ? 'Suara On' : 'Suara Mute'}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            aria-label="Bagikan Tautan Rute"
            title="Bagikan Tautan Rute"
            className="min-h-[40px] min-w-[40px] px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white/15 text-white hover:bg-white/25 transition-colors border border-white/20 flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden lg:inline">{copied ? 'Tersalin!' : 'Bagikan'}</span>
          </button>

          {/* Checkpoints Drawer Trigger */}
          <button
            onClick={onOpenCheckpoints}
            aria-label="Lihat Daftar 8 Titik POS"
            title="Daftar Titik POS"
            className="min-h-[40px] min-w-[40px] px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white/15 text-white hover:bg-white/25 transition-colors border border-white/20 flex items-center gap-1.5"
          >
            <ListOrdered className="w-4 h-4" />
            <span className="hidden sm:inline">8 Titik</span>
          </button>

          {/* Google Apps Script Code Trigger */}
          <button
            onClick={onOpenGasModal}
            aria-label="Kode Google Apps Script"
            title="Ekspor / Kode Google Apps Script"
            className="min-h-[40px] min-w-[40px] px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white/15 text-white hover:bg-white/25 transition-colors border border-white/20 flex items-center gap-1.5"
          >
            <Code2 className="w-4 h-4 text-amber-200" />
            <span className="hidden md:inline">Apps Script</span>
          </button>

          {/* Emergency Hotline Trigger */}
          <button
            onClick={onOpenEmergency}
            aria-label="Bantuan Darurat Panitia"
            title="Kontak Panitia & Medis"
            className="min-h-[40px] min-w-[40px] px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors shadow-sm flex items-center gap-1.5 border border-rose-400"
          >
            <PhoneCall className="w-4 h-4 animate-pulse" />
            <span className="hidden sm:inline">Bantuan</span>
          </button>
        </div>
      </div>
    </header>
  );
}

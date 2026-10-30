'use client';

import React from 'react';
import { X, PhoneCall, MessageSquare, ShieldAlert, HeartPulse, UserCheck } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  if (!isOpen) return null;

  const coordinators = [
    {
      role: 'Koordinator POS 1',
      name: 'IMRON HADIANA, S.Pd.',
      phone: '08818297901',
      waNumber: '628818297901',
      location: 'POS 1 (Pemeriksaan & Stempel Awal)',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      role: 'Koordinator POS 2',
      name: 'AHMAD RONI SAFARI, S.Pd.',
      phone: '082116941275',
      waNumber: '6282116941275',
      location: 'POS 2 (Pemeriksaan & Pos Hidrasi Air Minum)',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      role: 'Koordinator POS 3',
      name: 'ASEP SOPIAN ANSORI, S.Pd.I.',
      phone: '089632911112',
      waNumber: '6289632911112',
      location: 'POS 3 (Pintu Masuk Jalur Perkebunan)',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      role: 'Koordinator POS 4',
      name: 'DUDI ABDULAH, S.Pd.I.',
      phone: '081220548543',
      waNumber: '6281220548543',
      location: 'POS 4 (Verifikasi Kupon Doorprize Sebelum Finish)',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
  ];

  const medicalAndSafety = [
    {
      title: 'Posko Kesehatan & Medis Panitia',
      desc: 'Tim Medis & Ambulans Siaga Jalur Pasirwangi',
      number: '081223456789',
      icon: HeartPulse,
      badge: 'Medis Panitia',
    },
    {
      title: 'Puskesmas DTP Pasirwangi',
      desc: 'Unit Gawat Darurat (UGD) 24 Jam Pasirwangi',
      number: '0262540119',
      icon: ShieldAlert,
      badge: 'UGD Pasirwangi',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg max-h-[92vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-rose-600 to-red-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold shadow-inner">
              <PhoneCall className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-extrabold leading-tight">Bantuan & Kontak Darurat</h3>
              <p className="text-xs text-rose-100">
                Koordinator POS & Tim Medis Jalan Santai Pasirwangi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup Jendela"
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Quick Notice */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
            📞 <strong>Butuh Bantuan Cepat?</strong> Silakan hubungi langsung Koordinator POS
            terdekat dengan menekan tombol <strong>Panggil</strong> atau <strong>WhatsApp</strong> di
            bawah ini.
          </div>

          {/* Section: Koordinator POS Lapangan */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-slate-700 px-1">
              <span>KOORDINATOR RESMI SETIAP POS</span>
              <span className="text-sky-600 font-bold">4 POS</span>
            </div>

            {coordinators.map((kord, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
              >
                <div className="min-w-0 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${kord.badgeColor}`}>
                        {kord.role}
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 mt-1 leading-snug">
                      {kord.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-tight">
                      {kord.location}
                    </p>
                    <div className="text-xs font-mono-num font-bold text-sky-700 mt-1">
                      {kord.phone}
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons: Tel and WhatsApp */}
                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                  <a
                    href={`tel:${kord.phone}`}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow active:scale-95 transition-all"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Panggil</span>
                  </a>
                  <a
                    href={`https://wa.me/${kord.waNumber}?text=Halo%20${encodeURIComponent(kord.name)},%20saya%20peserta%20Jalan%20Santai%20PGRI%20Pasirwangi%20memerlukan%20informasi/bantuan`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow active:scale-95 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Section: Layanan Medis Siaga */}
          <div className="space-y-2 pt-2 border-t border-slate-200/80">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-700 px-1">
              LAYANAN MEDIS & KESEHATAN
            </div>

            {medicalAndSafety.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-rose-600 flex items-center justify-center shrink-0">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 truncate">{item.title}</h5>
                      <p className="text-[11px] text-slate-500 truncate">{item.desc}</p>
                    </div>
                  </div>
                  <a
                    href={`tel:${item.number}`}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-rose-600 border border-rose-200 text-xs font-bold rounded-xl shrink-0 flex items-center gap-1 transition-colors"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Hubungi</span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

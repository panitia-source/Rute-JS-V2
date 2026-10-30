'use client';

import React from 'react';
import { RoutePoint, ROUTE_WAYPOINTS } from '@/lib/route-data';
import { calculateDistance, formatDistance, getGoogleMapsWalkingUrl } from '@/lib/geo-utils';
import { X, MapPin, ExternalLink, Compass } from 'lucide-react';

interface CheckpointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTargetIndex: number;
  onSelectWaypoint: (wp: RoutePoint, index: number) => void;
  userLat?: number | null;
  userLng?: number | null;
}

export default function CheckpointsModal({
  isOpen,
  onClose,
  currentTargetIndex,
  onSelectWaypoint,
  userLat,
  userLng,
}: CheckpointsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="p-4 bg-sky-50 border-b border-sky-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow">
              8
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                8 Titik Rute Jalan Santai
              </h3>
              <p className="text-xs text-slate-500">
                Peringatan HGN & HUT ke-81 PGRI Kecamatan Pasirwangi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup Jendela"
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Checkpoints */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {ROUTE_WAYPOINTS.map((wp, index) => {
            const isTarget = index === currentTargetIndex;
            const distFromUser =
              userLat && userLng
                ? calculateDistance(userLat, userLng, wp.lat, wp.lng)
                : null;

            return (
              <div
                key={wp.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isTarget
                    ? 'bg-sky-50/70 border-sky-300 ring-1 ring-sky-200 shadow-sm'
                    : 'bg-white border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Badge Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm font-bold text-sm"
                      style={{ backgroundColor: wp.color }}
                    >
                      {wp.category === 'start'
                        ? '🏁'
                        : wp.category === 'finish'
                        ? '🏆'
                        : wp.category === 'jalur'
                        ? '🚩'
                        : `P${index}`}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                          TITIK #{index + 1}
                        </span>
                        {isTarget && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            Target Aktif
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900 mt-0.5">
                        {wp.name}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {wp.description}
                      </p>
                      <div className="mt-1.5 text-[11px] text-sky-800 font-medium flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>{wp.instruction}</span>
                      </div>
                      {wp.coordinator && (
                        <div className="mt-2 p-2 bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[9px] font-extrabold text-rose-600 uppercase">Koordinator POS:</div>
                            <div className="text-xs font-extrabold text-slate-900 truncate">{wp.coordinator.name}</div>
                            <div className="text-[11px] font-mono-num font-bold text-rose-700">{wp.coordinator.phone}</div>
                          </div>
                          <a
                            href={`tel:${wp.coordinator.phone}`}
                            className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shrink-0 flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <span>📞</span> Panggil
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {distFromUser !== null && (
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">
                        DARI POSISI
                      </div>
                      <div className="text-sm font-black font-mono-num text-sky-600">
                        {formatDistance(distFromUser)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Coordinate & Action Row */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[10px] font-mono-num text-slate-400 truncate">
                    {wp.lat.toFixed(5)}, {wp.lng.toFixed(5)}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={getGoogleMapsWalkingUrl(wp.lat, wp.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Google Maps</span>
                    </a>
                    <button
                      onClick={() => {
                        onSelectWaypoint(wp, index);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Tampilkan</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

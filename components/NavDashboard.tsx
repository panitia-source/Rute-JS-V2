'use client';

import React from 'react';
import { RoutePoint, ROUTE_WAYPOINTS, ROUTE_PATH_COORDINATES, EVENT_INFO } from '@/lib/route-data';
import {
  UserLocation,
  calculateDistance,
  calculateBearing,
  formatDistance,
  formatEstimatedTime,
  getMinDistanceToPolyline,
  getGoogleMapsWalkingUrl,
  playAlertChime,
  speakIndonesian,
} from '@/lib/geo-utils';
import {
  Navigation,
  Play,
  Pause,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Activity,
  ArrowRight,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NavDashboardProps {
  userLocation: UserLocation | null;
  gpsStatus: 'active' | 'searching' | 'denied' | 'unsupported';
  gpsError: string | null;
  targetWaypointIndex: number;
  onSetTargetWaypointIndex: (index: number) => void;
  isNavigating: boolean;
  onToggleNavigation: () => void;
  onCenterUser: () => void;
  onFitRoute: () => void;
  onRequestGps: () => void;
  soundEnabled: boolean;
  onOpenCheckpoints: () => void;
}

export default function NavDashboard({
  userLocation,
  gpsStatus,
  gpsError,
  targetWaypointIndex,
  onSetTargetWaypointIndex,
  isNavigating,
  onToggleNavigation,
  onCenterUser,
  onFitRoute,
  onRequestGps,
  soundEnabled,
  onOpenCheckpoints,
}: NavDashboardProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [hasFinished, setHasFinished] = React.useState(false);
  const lastAnnouncedPosRef = React.useRef<string | null>(null);
  const prevOutOfRouteRef = React.useRef(false);

  const currentTarget = ROUTE_WAYPOINTS[targetWaypointIndex] || ROUTE_WAYPOINTS[0];
  const finishWaypoint = ROUTE_WAYPOINTS[ROUTE_WAYPOINTS.length - 1];

  // Distances calculations
  const distanceToTarget = userLocation
    ? calculateDistance(userLocation.lat, userLocation.lng, currentTarget.lat, currentTarget.lng)
    : null;

  const distanceToFinish = userLocation
    ? calculateDistance(userLocation.lat, userLocation.lng, finishWaypoint.lat, finishWaypoint.lng)
    : null;

  const bearingToTarget = userLocation
    ? calculateBearing(userLocation.lat, userLocation.lng, currentTarget.lat, currentTarget.lng)
    : null;

  // Distance to route polyline
  const distanceToRoute = userLocation
    ? getMinDistanceToPolyline(userLocation.lat, userLocation.lng, ROUTE_PATH_COORDINATES)
    : null;

  // Derived corridor check (out of route warning if > 40 meters away)
  const isOutOfRoute = Boolean(
    userLocation &&
      userLocation.accuracy <= 45 &&
      distanceToRoute !== null &&
      distanceToRoute > 40
  );

  // Audio alert is centralized in page.tsx to prevent duplicate speech or blip noises

  // Derived finish check
  const isAtFinish = Boolean(
    currentTarget.category === 'finish' &&
      distanceToTarget !== null &&
      distanceToTarget <= 30 &&
      (userLocation ? userLocation.accuracy <= 45 : false)
  );
  const showFinishBanner = hasFinished || isAtFinish;

  // Geofence detection for checkpoint arrival (25 meters)
  React.useEffect(() => {
    if (!userLocation || !distanceToTarget) return;

    // Radius geofence 25m considering GPS accuracy
    const geofenceRadius = Math.max(25, Math.min(35, userLocation.accuracy));

    if (distanceToTarget <= geofenceRadius && userLocation.accuracy <= 45) {
      if (lastAnnouncedPosRef.current !== currentTarget.id) {
        lastAnnouncedPosRef.current = currentTarget.id;

        if (currentTarget.category === 'finish') {
          // Reached Finish celebration!
          if (soundEnabled) {
            playAlertChime('finish');
            speakIndonesian('Selamat! Anda telah mencapai garis finish Jalan Santai Pasirwangi.');
          }
          try {
            confetti({
              particleCount: 150,
              spread: 90,
              origin: { y: 0.6 },
            });
          } catch {
            // Ignore confetti error
          }
        } else {
          // Approaching intermediate POS
          if (soundEnabled) {
            playAlertChime('pos');
            speakIndonesian(`Anda telah mendekati ${currentTarget.name}`);
          }
        }
      }
    }
  }, [distanceToTarget, userLocation, currentTarget, soundEnabled]);

  // Advance to next waypoint
  const handleAdvanceNext = () => {
    if (targetWaypointIndex < ROUTE_WAYPOINTS.length - 1) {
      const nextIdx = targetWaypointIndex + 1;
      onSetTargetWaypointIndex(nextIdx);
      if (soundEnabled) {
        playAlertChime('pos');
        speakIndonesian(`Tujuan berikutnya: ${ROUTE_WAYPOINTS[nextIdx].name}`);
      }
    } else {
      setHasFinished(true);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  };

  // Reset navigation
  const handleReset = () => {
    onSetTargetWaypointIndex(0);
    setHasFinished(false);
    lastAnnouncedPosRef.current = null;
  };

  // Completion percentage
  const progressPercent = Math.min(
    100,
    Math.round((targetWaypointIndex / (ROUTE_WAYPOINTS.length - 1)) * 100)
  );

  return (
    <div className="bg-white border-t lg:border-t-0 lg:border-l border-slate-200/90 shadow-2xl z-30 flex flex-col shrink-0 lg:w-[420px] transition-all duration-300">
      {/* Mobile Drawer Grab Header */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="lg:hidden flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200/60 cursor-pointer select-none"
      >
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto" />
      </div>

      <div className={`px-4 pt-3 pb-safe space-y-3 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Out of Route Alert Banner (Solid, Non-flickering) */}
        {isOutOfRoute && (
          <div className="p-3 rounded-2xl bg-rose-700 text-white shadow-lg border border-rose-500/80 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 text-xs">
                <strong className="block font-extrabold uppercase tracking-tight text-white">
                  ANDA BERADA DI LUAR JALUR
                </strong>
                <span className="text-[11px] text-rose-100 font-medium">
                  {distanceToRoute ? `±${formatDistance(distanceToRoute)}` : 'Jauh'} dari rute resmi. Silakan ikuti garis biru.
                </span>
              </div>
            </div>
            <button
              onClick={onCenterUser}
              className="px-2.5 py-1.5 bg-white text-rose-800 hover:bg-rose-50 font-bold text-xs rounded-xl shadow shrink-0 active:scale-95 transition-transform"
            >
              Cek Peta
            </button>
          </div>
        )}

        {/* Approaching Pos Alert Banner */}
        {distanceToTarget !== null && distanceToTarget <= 30 && !showFinishBanner && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="min-w-0 text-xs">
              <strong className="block font-bold">ANDA TELAH MENDEKATI POS BERIKUTNYA</strong>
              <span className="text-[11px] text-emerald-700">
                {currentTarget.name} — Siapkan kupon atau cap panitia.
              </span>
            </div>
          </div>
        )}

        {/* Finished Celebration Banner */}
        {showFinishBanner && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                SELEBRASI GARIS AKHIR
              </div>
              <div className="text-sm font-extrabold">SELAMAT! ANDA TELAH MENCAPAI GARIS FINISH</div>
              <div className="text-[11px] text-emerald-100 mt-0.5">
                Silakan ikuti panggung hiburan dan undian doorprize PGRI ke-81!
              </div>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-white text-emerald-800 font-bold text-xs rounded-xl shadow shrink-0 active:scale-95"
            >
              Ulangi
            </button>
          </div>
        )}

        {/* GPS Health & Telemetry Strip */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                gpsStatus === 'active' && userLocation && userLocation.accuracy <= 20
                  ? 'bg-emerald-500'
                  : gpsStatus === 'active' && userLocation && userLocation.accuracy <= 40
                  ? 'bg-amber-500'
                  : gpsStatus === 'denied'
                  ? 'bg-rose-500'
                  : 'bg-sky-500'
              }`}
            />
            <span className="font-semibold text-slate-800">
              {gpsStatus === 'active' && userLocation
                ? `GPS Aktif (±${userLocation.accuracy}m)`
                : gpsStatus === 'denied'
                ? 'Izin GPS Ditolak'
                : 'Mencari Sinyal GPS...'}
            </span>
          </div>

          {userLocation ? (
            <div className="flex items-center gap-2 text-[11px] font-mono-num text-slate-500">
              {userLocation.speed !== null && userLocation.speed > 0.5 && (
                <span>{(userLocation.speed * 3.6).toFixed(1)} km/j</span>
              )}
              {userLocation.altitude !== null && (
                <span>{Math.round(userLocation.altitude)} mdpl</span>
              )}
            </div>
          ) : (
            <button
              onClick={onRequestGps}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 underline"
            >
              Aktifkan GPS
            </button>
          )}
        </div>

        {/* Target Waypoint Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-50 via-white to-blue-50/50 border border-sky-200/80 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 bg-sky-100/90 px-2 py-0.5 rounded-md">
                  TUJUAN #{targetWaypointIndex + 1}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {currentTarget.category.toUpperCase()}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug truncate">
                {currentTarget.name}
              </h2>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                {currentTarget.description}
              </p>
            </div>

            {/* Distance & ETA to Next Waypoint */}
            <div className="text-right shrink-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                JARAK
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono-num text-sky-600 tracking-tight">
                {distanceToTarget !== null ? formatDistance(distanceToTarget) : '-- m'}
              </div>
              <div className="text-[11px] text-slate-500 font-mono-num font-medium">
                {distanceToTarget !== null ? formatEstimatedTime(distanceToTarget) : '~-- mnt'}
              </div>
            </div>
          </div>

          {/* Compass direction guidance */}
          {bearingToTarget !== null && (
            <div className="mt-2.5 pt-2.5 border-t border-sky-100/80 flex items-center justify-between text-xs text-slate-700">
              <div className="flex items-center gap-1.5 font-medium">
                <Compass className="w-4 h-4 text-sky-600" />
                <span>
                  Arah:{' '}
                  <strong>
                    {bearingToTarget >= 337.5 || bearingToTarget < 22.5
                      ? 'Utara'
                      : bearingToTarget < 67.5
                      ? 'Timur Laut'
                      : bearingToTarget < 112.5
                      ? 'Timur'
                      : bearingToTarget < 157.5
                      ? 'Tenggara'
                      : bearingToTarget < 202.5
                      ? 'Selatan'
                      : bearingToTarget < 247.5
                      ? 'Barat Daya'
                      : bearingToTarget < 292.5
                      ? 'Barat'
                      : 'Barat Laut'}{' '}
                    ({bearingToTarget}°)
                  </strong>
                </span>
              </div>
              <div className="text-[11px] text-sky-700 font-semibold truncate max-w-[180px]">
                {currentTarget.instruction}
              </div>
            </div>
          )}
        </div>

        {/* Route Progress Bar & Checkpoints Step Indicator */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>
              Progres Rute: <strong className="text-sky-700 font-bold">{progressPercent}%</strong>
            </span>
            <span>
              Sisa ke Finish:{' '}
              <strong className="text-slate-900 font-mono-num">
                {distanceToFinish !== null
                  ? formatDistance(distanceToFinish)
                  : `${EVENT_INFO.estimatedDistanceKm} km`}
              </strong>
            </span>
          </div>

          {/* Graphical Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 via-blue-600 to-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Step Pill Indicators */}
          <div className="flex items-center justify-between pt-1 gap-1 overflow-x-auto no-scrollbar">
            {ROUTE_WAYPOINTS.map((wp, idx) => {
              const isPassed = idx < targetWaypointIndex;
              const isCurrent = idx === targetWaypointIndex;
              return (
                <button
                  key={wp.id}
                  onClick={() => onSetTargetWaypointIndex(idx)}
                  title={`${wp.name} - Klik untuk target`}
                  className={`flex-1 min-w-[28px] py-1 px-1 rounded-lg text-center text-[10px] font-bold transition-all ${
                    isPassed
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-sky-600 text-white ring-2 ring-sky-300 shadow-sm'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {wp.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Interactive Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Mulai Navigasi / Jeda */}
          <button
            onClick={onToggleNavigation}
            className={`min-h-[48px] px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
              isNavigating
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
            }`}
          >
            {isNavigating ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>JEDA NAVIGASI</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>MULAI NAVIGASI</span>
              </>
            )}
          </button>

          {/* Navigasi ke Titik Berikutnya */}
          <button
            onClick={handleAdvanceNext}
            disabled={targetWaypointIndex >= ROUTE_WAYPOINTS.length - 1}
            className={`min-h-[48px] px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all border active:scale-[0.98] ${
              targetWaypointIndex >= ROUTE_WAYPOINTS.length - 1
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
            }`}
          >
            <span>TITIK BERIKUTNYA</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Lokasi Saya */}
          <button
            onClick={onCenterUser}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-300/80 active:scale-[0.98] transition-all"
          >
            <MapPin className="w-4 h-4 text-sky-600" />
            <span>LOKASI SAYA</span>
          </button>

          {/* Lihat Seluruh Rute */}
          <button
            onClick={onFitRoute}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-300/80 active:scale-[0.98] transition-all"
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>SELURUH RUTE</span>
          </button>
        </div>

        {/* Secondary Action: Buka Navigasi Pejalan Kaki di Google Maps */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <a
            href={getGoogleMapsWalkingUrl(currentTarget.lat, currentTarget.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[42px] px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-200 shadow-sm active:scale-[0.98] transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
            <span className="truncate">Google Maps POS</span>
          </a>

          <button
            onClick={onOpenCheckpoints}
            className="min-h-[42px] px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-200 shadow-sm active:scale-[0.98] transition-all"
          >
            <span>📋</span>
            <span>Detail 8 Titik</span>
          </button>
        </div>

        {/* GPS activation alert when denied */}
        {gpsStatus === 'denied' && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <strong className="block font-bold mb-1">Akses GPS Diperlukan</strong>
            <p className="leading-relaxed mb-2">
              Aplikasi membutuhkan izin GPS perangkat agar dapat menampilkan posisi dan memandu jalan
              santai Anda.
            </p>
            <button
              onClick={onRequestGps}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors"
            >
              AKTIFKAN GPS SAYA
            </button>
          </div>
        )}

        {/* Official Footer Attribution */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            {EVENT_INFO.organizer}
          </p>
        </div>
      </div>
    </div>
  );
}

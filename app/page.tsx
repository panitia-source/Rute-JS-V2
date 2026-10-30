'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import NavDashboard from '@/components/NavDashboard';
import CheckpointsModal from '@/components/CheckpointsModal';
import GoogleAppsScriptModal from '@/components/GoogleAppsScriptModal';
import EmergencyModal from '@/components/EmergencyModal';
import { RoutePoint, ROUTE_WAYPOINTS, ROUTE_PATH_COORDINATES } from '@/lib/route-data';
import {
  UserLocation,
  playAlertChime,
  speakIndonesian,
  getMinDistanceToPolyline,
  formatDistance,
} from '@/lib/geo-utils';
import { AlertTriangle, CheckCircle2, Crosshair } from 'lucide-react';

// Dynamically import Leaflet MapView with SSR disabled to prevent browser window undefined errors
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-500 gap-3">
      <div className="w-9 h-9 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-600">
        Memuat Peta Navigasi Interaktif Pasirwangi...
      </span>
    </div>
  ),
});

export default function HomePage() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'active' | 'searching' | 'denied' | 'unsupported'>('searching');
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [targetWaypointIndex, setTargetWaypointIndex] = useState<number>(0);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Return to route toast notification
  const [returnedToRouteNotice, setReturnedToRouteNotice] = useState<boolean>(false);
  const prevOutOfRouteRef = useRef<boolean>(false);

  // Modals
  const [isCheckpointsOpen, setIsCheckpointsOpen] = useState<boolean>(false);
  const [isGasModalOpen, setIsGasModalOpen] = useState<boolean>(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [selectedWaypointForMap, setSelectedWaypointForMap] = useState<RoutePoint | null>(null);

  const watchIdRef = useRef<number | null>(null);

  // Start GPS Geolocation Watcher
  const startGpsWatcher = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const geoOptions: PositionOptions = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000,
    };

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy, heading, speed, altitude } = position.coords;
      setUserLocation({
        lat: latitude,
        lng: longitude,
        accuracy: Math.round(accuracy),
        heading: heading !== null && !isNaN(heading) ? Math.round(heading) : null,
        speed: speed !== null && !isNaN(speed) ? speed : null,
        altitude: altitude !== null && !isNaN(altitude) ? Math.round(altitude) : null,
        timestamp: position.timestamp,
      });
      setGpsStatus('active');
      setGpsError(null);
    };

    const handleError = (error: GeolocationPositionError) => {
      if (error.code === error.PERMISSION_DENIED) {
        setGpsStatus('denied');
        setGpsError('Izin akses GPS belum diberikan. Silakan aktifkan layanan lokasi di pengaturan perangkat.');
      } else {
        setGpsStatus('searching');
        setGpsError('Sinyal GPS lemah atau timeout. Sedang mencari kembali...');
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, geoOptions);
  }, []);

  useEffect(() => {
    startGpsWatcher();

    return () => {
      if (watchIdRef.current !== null && typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [startGpsWatcher]);

  // Request GPS permission button trigger
  const handleRequestGps = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          startGpsWatcher();
        },
        () => {
          alert(
            'Untuk mengaktifkan GPS: Buka Pengaturan Perangkat > Lokasi / Izin Situs Browser > Izinkan Akses Lokasi untuk halaman ini.'
          );
        },
        { enableHighAccuracy: true }
      );
    }
  };

  // Distance from user to official route
  const distanceToRoute = userLocation
    ? getMinDistanceToPolyline(userLocation.lat, userLocation.lng, ROUTE_PATH_COORDINATES)
    : null;

  // Participant is outside route if distance to route > 40 meters with reliable GPS accuracy
  const isOutOfRoute = Boolean(
    userLocation &&
      userLocation.accuracy <= 45 &&
      distanceToRoute !== null &&
      distanceToRoute > 40
  );

  // Monitor off-route transitions and play voice warning (without screen blinking or blip noise)
  useEffect(() => {
    if (isOutOfRoute && !prevOutOfRouteRef.current) {
      if (soundEnabled) {
        speakIndonesian('Peringatan: Anda berada di luar jalur');
      }
    } else if (!isOutOfRoute && prevOutOfRouteRef.current) {
      // Returned back on route
      setReturnedToRouteNotice(true);
      if (soundEnabled) {
        speakIndonesian('Anda telah kembali ke jalur');
      }
      const timer = setTimeout(() => {
        setReturnedToRouteNotice(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
    prevOutOfRouteRef.current = isOutOfRoute;
  }, [isOutOfRoute, soundEnabled]);

  const handleToggleNavigation = () => {
    setIsNavigating((prev) => {
      const next = !prev;
      if (next && soundEnabled) {
        playAlertChime('pos');
        speakIndonesian(
          `Navigasi jalan santai dimulai. Menuju ${ROUTE_WAYPOINTS[targetWaypointIndex].name}`
        );
      }
      return next;
    });
  };

  const handleCenterUser = () => {
    const centerBtn = document.querySelector('[aria-label="Pusatkan Lokasi Saya"]') as HTMLButtonElement | null;
    if (centerBtn) centerBtn.click();
  };

  const handleFitRoute = () => {
    const fitBtn = document.querySelector('[aria-label="Lihat Seluruh Rute"]') as HTMLButtonElement | null;
    if (fitBtn) fitBtn.click();
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100">
      {/* Official Header */}
      <Header
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onOpenCheckpoints={() => setIsCheckpointsOpen(true)}
        onOpenGasModal={() => setIsGasModalOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* Main Content: Map & Navigation Panel */}
      <main className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Map View Area */}
        <div className="flex-1 relative w-full h-full min-h-[50vh] lg:min-h-0 overflow-hidden">
          {/* Solid Non-Flickering High-Priority Off-Route Alert (No screen blip or blinking) */}
          {isOutOfRoute && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[450] w-[94%] max-w-lg p-3 bg-rose-700 text-white rounded-2xl shadow-2xl border border-rose-500 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-xs sm:text-sm tracking-tight leading-tight uppercase text-white">
                    ANDA BERADA DI LUAR JALUR
                  </div>
                  <div className="text-[11px] text-rose-100 font-medium truncate mt-0.5">
                    Posisi Anda ±{distanceToRoute ? formatDistance(distanceToRoute) : '40m'} di luar rute resmi. Silakan ikuti garis biru.
                  </div>
                </div>
              </div>
              <button
                onClick={handleCenterUser}
                className="px-2.5 py-1.5 bg-white text-rose-800 hover:bg-rose-50 font-bold text-xs rounded-xl shadow shrink-0 flex items-center gap-1 active:scale-95 transition-transform"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Cek Peta</span>
              </button>
            </div>
          )}

          {/* Returned to Route Confirmation Banner */}
          {returnedToRouteNotice && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[450] w-[90%] max-w-md p-2.5 bg-emerald-600 text-white rounded-2xl shadow-xl border border-white/40 flex items-center justify-center gap-2 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>ANDA TELAH KEMBALI KE JALUR RUTE JALAN SANTAI</span>
            </div>
          )}

          <MapView
            userLocation={userLocation}
            targetWaypointIndex={targetWaypointIndex}
            onSelectTargetWaypoint={(idx) => setTargetWaypointIndex(idx)}
            isNavigating={isNavigating}
            selectedWaypointFromDrawer={selectedWaypointForMap}
          />
        </div>

        {/* Navigation Dashboard (Mobile Bottom HUD / Desktop Sidebar) */}
        <NavDashboard
          userLocation={userLocation}
          gpsStatus={gpsStatus}
          gpsError={gpsError}
          targetWaypointIndex={targetWaypointIndex}
          onSetTargetWaypointIndex={(idx) => setTargetWaypointIndex(idx)}
          isNavigating={isNavigating}
          onToggleNavigation={handleToggleNavigation}
          onCenterUser={handleCenterUser}
          onFitRoute={handleFitRoute}
          onRequestGps={handleRequestGps}
          soundEnabled={soundEnabled}
          onOpenCheckpoints={() => setIsCheckpointsOpen(true)}
        />
      </main>

      {/* Checkpoints Modal */}
      <CheckpointsModal
        isOpen={isCheckpointsOpen}
        onClose={() => setIsCheckpointsOpen(false)}
        currentTargetIndex={targetWaypointIndex}
        onSelectWaypoint={(wp, idx) => {
          setTargetWaypointIndex(idx);
          setSelectedWaypointForMap(wp);
        }}
        userLat={userLocation?.lat}
        userLng={userLocation?.lng}
      />

      {/* Google Apps Script Modal */}
      <GoogleAppsScriptModal
        isOpen={isGasModalOpen}
        onClose={() => setIsGasModalOpen(false)}
      />

      {/* Emergency & Medical Support Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />
    </div>
  );
}

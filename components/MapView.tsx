'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Map as LeafletMap, Polyline as LeafletPolyline, Marker as LeafletMarker, Circle as LeafletCircle } from 'leaflet';
import { RoutePoint, ROUTE_WAYPOINTS, ROUTE_PATH_COORDINATES } from '@/lib/route-data';
import { UserLocation, getGoogleMapsWalkingUrl } from '@/lib/geo-utils';
import { Layers, Crosshair, Map as MapIcon, Compass, ZoomIn, ZoomOut, Navigation } from 'lucide-react';

interface MapViewProps {
  userLocation: UserLocation | null;
  targetWaypointIndex: number;
  onSelectTargetWaypoint: (index: number) => void;
  isNavigating: boolean;
  selectedWaypointFromDrawer?: RoutePoint | null;
}

export default function MapView({
  userLocation,
  targetWaypointIndex,
  onSelectTargetWaypoint,
  isNavigating,
  selectedWaypointFromDrawer,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const userMarkerRef = useRef<LeafletMarker | null>(null);
  const userCircleRef = useRef<LeafletCircle | null>(null);
  const routePolylineRef = useRef<LeafletPolyline | null>(null);
  const waypointsMarkersRef = useRef<LeafletMarker[]>([]);

  const [mapLayer, setMapLayer] = useState<'osm' | 'satellite' | 'topo'>('osm');
  const [autoFollow, setAutoFollow] = useState<boolean>(true);
  const [mapReady, setMapReady] = useState<boolean>(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Safe patch for Leaflet _leaflet_pos error during unmount / zoom transitions in React
      if (L.DomUtil && L.DomUtil.getPosition) {
        const originalGetPosition = L.DomUtil.getPosition;
        L.DomUtil.getPosition = function (el: HTMLElement) {
          if (!el) return new L.Point(0, 0);
          return originalGetPosition.call(L.DomUtil, el);
        };
      }

      if (L.Map && L.Map.prototype) {
        const proto = L.Map.prototype as unknown as {
          _getMapPanePos?: () => unknown;
          _onZoomTransitionEnd?: () => void;
          _catchTransitionEnd?: (e: TransitionEvent) => void;
        };

        if (proto._getMapPanePos) {
          const originalGetMapPanePos = proto._getMapPanePos;
          proto._getMapPanePos = function (this: { _mapPane?: HTMLElement }) {
            if (!this._mapPane) return new L.Point(0, 0);
            return originalGetMapPanePos.call(this);
          };
        }

        if (proto._onZoomTransitionEnd) {
          const originalZoomEnd = proto._onZoomTransitionEnd;
          proto._onZoomTransitionEnd = function (this: { _mapPane?: HTMLElement }) {
            if (!this._mapPane) return;
            originalZoomEnd.call(this);
          };
        }

        if (proto._catchTransitionEnd) {
          const originalCatch = proto._catchTransitionEnd;
          proto._catchTransitionEnd = function (this: { _mapPane?: HTMLElement }, e: TransitionEvent) {
            if (!this._mapPane) return;
            originalCatch.call(this, e);
          };
        }
      }

      // Cleanup existing leaflet id if container was previously mounted
      const containerWithId = mapContainerRef.current as unknown as { _leaflet_id?: number };
      if (containerWithId._leaflet_id) {
        delete containerWithId._leaflet_id;
      }

      // Fix default leaflet icons path
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Default center around Pasirwangi route
      const initialMap = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([-7.2172, 107.8035], 15);

      // Tile layers
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      });

      const satelliteLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      );

      const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
      });

      // Attach layers object to map instance for switching
      (initialMap as unknown as { tileLayers: Record<string, unknown> }).tileLayers = {
        osm: osmLayer,
        satellite: satelliteLayer,
        topo: topoLayer,
      };

      osmLayer.addTo(initialMap);

      // Polyline glow effect (cyan halo)
      L.polyline(ROUTE_PATH_COORDINATES, {
        color: '#38bdf8',
        weight: 12,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(initialMap);

      // Primary bright blue route line
      const polyline = L.polyline(ROUTE_PATH_COORDINATES, {
        color: '#0284c7',
        weight: 6,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(initialMap);

      routePolylineRef.current = polyline;

      // Add Waypoint Markers
      const markers: LeafletMarker[] = [];
      ROUTE_WAYPOINTS.forEach((wp, index) => {
        let iconHtml = '';
        if (wp.category === 'start') {
          // Bendera Hijau
          iconHtml = `
            <div style="background-color: #16a34a; width: 38px; height: 38px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                <line x1="4" y1="22" x2="4" y2="15"></line>
              </svg>
            </div>
            <div style="background: rgba(15,23,42,0.85); color: white; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px; white-space: nowrap; margin-top: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); text-align: center;">
              START
            </div>
          `;
        } else if (wp.category === 'pos') {
          // Rumah (POS 1, POS 2, POS 3, POS 4)
          iconHtml = `
            <div style="background-color: #2563eb; width: 38px; height: 38px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <div style="background: rgba(15,23,42,0.85); color: white; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px; white-space: nowrap; margin-top: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); text-align: center;">
              ${wp.shortLabel}
            </div>
          `;
        } else if (wp.category === 'jalur') {
          // Bendera Kuning
          iconHtml = `
            <div style="background-color: #eab308; width: 38px; height: 38px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #713f12;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                <line x1="4" y1="22" x2="4" y2="15"></line>
              </svg>
            </div>
            <div style="background: rgba(15,23,42,0.85); color: white; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 6px; white-space: nowrap; margin-top: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); text-align: center;">
              ${wp.shortLabel}
            </div>
          `;
        } else {
          // FINISH (Bendera Putih / Checkered)
          iconHtml = `
            <div style="background-color: #0f172a; width: 40px; height: 40px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: #ffffff;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <div style="background: #0f172a; color: white; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; white-space: nowrap; margin-top: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); text-align: center;">
              FINISH
            </div>
          `;
        }

        const customIcon = L.divIcon({
          html: `<div class="flex flex-col items-center">${iconHtml}</div>`,
          className: '',
          iconSize: [40, 60],
          iconAnchor: [20, 20],
          popupAnchor: [0, -20],
        });

        const marker = L.marker([wp.lat, wp.lng], { icon: customIcon }).addTo(initialMap);

        const popupContent = `
          <div class="p-2 text-slate-800" style="min-width: 220px;">
            <div class="text-[10px] font-bold text-sky-600 tracking-wider uppercase mb-1 flex items-center justify-between">
              <span>TITIK ${index + 1} DARI ${ROUTE_WAYPOINTS.length}</span>
              <span class="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">${wp.category.toUpperCase()}</span>
            </div>
            <h4 class="font-extrabold text-sm text-slate-900 leading-tight">${wp.name}</h4>
            <p class="text-xs text-slate-600 mt-1 leading-relaxed">${wp.description}</p>
            <div class="mt-2 p-2 bg-sky-50 rounded-lg border border-sky-100 text-[11px] text-sky-900 font-medium">
              🧭 <strong>Arah:</strong> ${wp.instruction}
            </div>
            ${wp.coordinator ? `
              <div class="mt-2 p-2 bg-rose-50 rounded-lg border border-rose-100 flex items-center justify-between gap-1.5">
                <div class="min-w-0">
                  <div class="text-[9px] font-extrabold text-rose-600 uppercase">Koordinator POS:</div>
                  <div class="text-[11px] font-extrabold text-slate-900 truncate">${wp.coordinator.name}</div>
                  <div class="text-[10px] font-bold text-rose-700 font-mono">${wp.coordinator.phone}</div>
                </div>
                <a href="tel:${wp.coordinator.phone}" class="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold shrink-0 shadow-sm transition-colors">
                  📞 Panggil
                </a>
              </div>
            ` : ''}
            <div class="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
              <button id="btn-popup-nav-${index}" class="w-full py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1">
                <span>🎯</span> Jadikan Tujuan Navigasi
              </button>
              <a href="${getGoogleMapsWalkingUrl(wp.lat, wp.lng)}" target="_blank" rel="noopener noreferrer" class="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 border border-slate-200">
                <span>📍</span> Buka di Google Maps
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-popup-nav-${index}`);
          if (btn) {
            btn.onclick = () => {
              onSelectTargetWaypoint(index);
              marker.closePopup();
            };
          }
        });

        markers.push(marker);
      });

      waypointsMarkersRef.current = markers;

      // Fit bounds without animation on initial load to prevent zoom transition race conditions
      try {
        initialMap.fitBounds(polyline.getBounds(), { padding: [50, 50], animate: false });
      } catch (err) {
        console.debug('fitBounds handled:', err);
      }

      mapInstanceRef.current = initialMap;
      setMapReady(true);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop();
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (e) {
          console.debug('Safe map cleanup:', e);
        }
        mapInstanceRef.current = null;
      }
    };
  }, [onSelectTargetWaypoint]);

  // Handle Layer Changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const layers = (map as unknown as { tileLayers: Record<string, unknown> }).tileLayers;
    if (!layers) return;

    try {
      // Remove existing
      Object.values(layers).forEach((layer) => {
        if (map.hasLayer(layer as never)) {
          map.removeLayer(layer as never);
        }
      });

      // Add selected layer
      if (layers[mapLayer]) {
        map.addLayer(layers[mapLayer] as never);
      }
    } catch (e) {
      console.debug('Layer switch handled:', e);
    }
  }, [mapLayer]);

  // Handle User Location Updates
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !userLocation) return;

    const L = window.L || (globalThis as unknown as { L: typeof import('leaflet') }).L;
    if (!L) return;

    const map = mapInstanceRef.current;
    const { lat, lng, accuracy, heading } = userLocation;

    // Heading indicator style if compass heading exists
    const headingCone =
      heading !== null && heading !== undefined
        ? `<div class="user-heading-pointer" style="transform: rotate(${heading}deg);"></div>`
        : '';

    const userHtml = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        ${headingCone}
        <div class="user-pulse-marker"></div>
      </div>
    `;

    const userIcon = L.divIcon({
      html: userHtml,
      className: '',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    try {
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker([lat, lng], {
          icon: userIcon,
          zIndexOffset: 1000,
        }).addTo(map);

        userCircleRef.current = L.circle([lat, lng], {
          radius: Math.max(accuracy, 5),
          color: '#0284c7',
          fillColor: '#38bdf8',
          fillOpacity: 0.15,
          weight: 1,
        }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng([lat, lng]);
        userMarkerRef.current.setIcon(userIcon);

        if (userCircleRef.current) {
          userCircleRef.current.setLatLng([lat, lng]);
          userCircleRef.current.setRadius(Math.max(accuracy, 5));
        }
      }

      // Auto follow if enabled and navigation is active
      if (autoFollow && isNavigating && map.getContainer()) {
        map.panTo([lat, lng], { animate: true, duration: 0.5 });
      }
    } catch (e) {
      console.debug('User marker update handled:', e);
    }
  }, [userLocation, autoFollow, isNavigating, mapReady]);

  // Center on user position
  const handleCenterUser = useCallback(() => {
    if (!mapInstanceRef.current) return;
    if (!userLocation) {
      alert('Sinyal GPS belum terdeteksi. Pastikan GPS perangkat Anda telah diaktifkan.');
      return;
    }
    setAutoFollow(true);
    try {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 17, {
        animate: true,
        duration: 0.8,
      });
    } catch (e) {
      console.debug('Center user handled:', e);
    }
  }, [userLocation]);

  // Fit full route bounds
  const handleFitRoute = useCallback(() => {
    if (!mapInstanceRef.current || !routePolylineRef.current) return;
    setAutoFollow(false);
    try {
      mapInstanceRef.current.fitBounds(routePolylineRef.current.getBounds(), {
        padding: [45, 45],
        animate: true,
        duration: 0.8,
      });
    } catch (e) {
      console.debug('Fit route handled:', e);
    }
  }, []);

  // Zoom controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.zoomIn();
      } catch (e) {
        console.debug('Zoom in handled:', e);
      }
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.zoomOut();
      } catch (e) {
        console.debug('Zoom out handled:', e);
      }
    }
  };

  // Fly to selected waypoint from external drawer
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedWaypointFromDrawer) return;
    setAutoFollow(false);
    try {
      mapInstanceRef.current.flyTo(
        [selectedWaypointFromDrawer.lat, selectedWaypointFromDrawer.lng],
        17,
        { animate: true, duration: 0.8 }
      );
      // Find marker and open popup
      const idx = ROUTE_WAYPOINTS.findIndex((wp) => wp.id === selectedWaypointFromDrawer.id);
      if (idx !== -1 && waypointsMarkersRef.current[idx]) {
        setTimeout(() => {
          if (waypointsMarkersRef.current[idx] && mapInstanceRef.current) {
            waypointsMarkersRef.current[idx].openPopup();
          }
        }, 800);
      }
    } catch (e) {
      console.debug('Fly to waypoint handled:', e);
    }
  }, [selectedWaypointFromDrawer]);

  return (
    <div className="relative w-full h-full min-h-[360px] flex-1 bg-slate-100 overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" id="leaflet-map-element" />

      {/* Floating Map Controls - Right Column */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
        {/* Layer Mode Switcher */}
        <div className="relative group">
          <button
            onClick={() => {
              setMapLayer((prev) => (prev === 'osm' ? 'satellite' : prev === 'satellite' ? 'topo' : 'osm'));
            }}
            aria-label="Ganti Jenis Peta"
            title={`Mode Peta: ${mapLayer === 'osm' ? 'Jalan Normal' : mapLayer === 'satellite' ? 'Satelit Pasirwangi' : 'Topografi'}`}
            className="w-11 h-11 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl shadow-lg border border-slate-200/80 flex items-center justify-center transition-transform active:scale-95"
          >
            {mapLayer === 'osm' ? (
              <Layers className="w-5 h-5 text-sky-600" />
            ) : mapLayer === 'satellite' ? (
              <MapIcon className="w-5 h-5 text-emerald-600" />
            ) : (
              <Compass className="w-5 h-5 text-amber-600" />
            )}
          </button>
          <span className="absolute right-12 top-2 bg-slate-900/90 text-white text-[10px] font-semibold px-2 py-1 rounded shadow hidden group-hover:block whitespace-nowrap">
            {mapLayer === 'osm' ? 'Jalan' : mapLayer === 'satellite' ? 'Satelit' : 'Topografi'}
          </span>
        </div>

        {/* Center My Location */}
        <button
          onClick={handleCenterUser}
          aria-label="Pusatkan Lokasi Saya"
          title="Pusatkan Lokasi Saya"
          className="w-11 h-11 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl shadow-lg border border-slate-200/80 flex items-center justify-center transition-transform active:scale-95"
        >
          <Crosshair className={`w-5 h-5 ${userLocation ? 'text-sky-600' : 'text-slate-400'}`} />
        </button>

        {/* Auto Follow Toggle */}
        <button
          onClick={() => setAutoFollow((prev) => !prev)}
          aria-label={autoFollow ? 'Matikan Ikuti Pengguna' : 'Nyalakan Ikuti Pengguna'}
          title={autoFollow ? 'Kamera Mengikuti Lokasi Anda' : 'Kamera Bebas'}
          className={`w-11 h-11 rounded-2xl shadow-lg border transition-transform active:scale-95 flex items-center justify-center ${
            autoFollow
              ? 'bg-sky-600 text-white border-sky-500 ring-2 ring-sky-300'
              : 'bg-white text-slate-600 border-slate-200'
          }`}
        >
          <Navigation className="w-5 h-5" />
        </button>

        {/* Fit Route Bounds */}
        <button
          onClick={handleFitRoute}
          aria-label="Lihat Seluruh Rute"
          title="Tampilkan Seluruh Rute Pasirwangi"
          className="w-11 h-11 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl shadow-lg border border-slate-200/80 flex items-center justify-center transition-transform active:scale-95"
        >
          <span className="text-xs font-bold text-sky-700">RUTE</span>
        </button>

        {/* Zoom In & Out */}
        <div className="flex flex-col bg-white rounded-2xl shadow-lg border border-slate-200/80 overflow-hidden">
          <button
            onClick={handleZoomIn}
            aria-label="Perbesar Peta"
            className="w-11 h-10 hover:bg-slate-50 text-slate-700 flex items-center justify-center active:bg-slate-100 border-b border-slate-100"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            aria-label="Perkecil Peta"
            className="w-11 h-10 hover:bg-slate-50 text-slate-700 flex items-center justify-center active:bg-slate-100"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Active Target Card (Top-Left on Map) */}
      <div className="absolute top-3 left-3 z-[400] max-w-[260px] sm:max-w-xs">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-lg border border-slate-200/80 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
            {targetWaypointIndex + 1}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold text-sky-600 tracking-wider uppercase">
              MENUJU {ROUTE_WAYPOINTS[targetWaypointIndex].category.toUpperCase()}
            </div>
            <div className="text-xs font-extrabold text-slate-900 truncate">
              {ROUTE_WAYPOINTS[targetWaypointIndex].name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

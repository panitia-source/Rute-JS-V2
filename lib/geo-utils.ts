// Geodesic and Navigation Utilities for Jalan Santai PGRI Pasirwangi 2026

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  altitude: number | null;
  timestamp: number;
}

/**
 * Calculates distance between two coordinates in meters using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Calculates bearing from start to target in degrees (0 - 360)
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return Math.round((brng + 360) % 360);
}

/**
 * Calculates minimum perpendicular distance from a point to a line segment in meters
 */
function distanceToSegment(
  pLat: number,
  pLng: number,
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): number {
  // Convert lat/lng delta to approximate local Cartesian meters
  const midLat = ((aLat + bLat) / 2) * (Math.PI / 180);
  const mPerLat = 111132.95;
  const mPerLng = 111412.84 * Math.cos(midLat);

  const px = (pLng - aLng) * mPerLng;
  const py = (pLat - aLat) * mPerLat;
  const bx = (bLng - aLng) * mPerLng;
  const by = (bLat - aLat) * mPerLat;

  const dot = px * bx + py * by;
  const lenSq = bx * bx + by * by;

  let param = -1;
  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx: number;
  let yy: number;

  if (param < 0) {
    xx = 0;
    yy = 0;
  } else if (param > 1) {
    xx = bx;
    yy = by;
  } else {
    xx = param * bx;
    yy = param * by;
  }

  const dx = px - xx;
  const dy = py - yy;
  return Math.round(Math.sqrt(dx * dx + dy * dy));
}

/**
 * Calculates shortest distance from a GPS point to the entire route polyline
 */
export function getMinDistanceToPolyline(
  lat: number,
  lng: number,
  polyline: [number, number][]
): number {
  if (polyline.length === 0) return 0;
  if (polyline.length === 1) return calculateDistance(lat, lng, polyline[0][0], polyline[0][1]);

  let minDistance = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const dist = distanceToSegment(
      lat,
      lng,
      polyline[i][0],
      polyline[i][1],
      polyline[i + 1][0],
      polyline[i + 1][1]
    );
    if (dist < minDistance) {
      minDistance = dist;
    }
  }

  return minDistance;
}

/**
 * Formats distance into readable Indonesian units (m or km)
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Formats estimated walking time based on average walking pace (approx 4.5 km/h = 75 m/min)
 */
export function formatEstimatedTime(meters: number, speedMps?: number | null): string {
  const paceMetersPerMinute = speedMps && speedMps > 0.5 ? speedMps * 60 : 75;
  const minutes = Math.max(1, Math.round(meters / paceMetersPerMinute));

  if (minutes < 60) {
    return `~${minutes} mnt`;
  }
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return remMinutes > 0 ? `~${hours} jam ${remMinutes} mnt` : `~${hours} jam`;
}

/**
 * Plays a pleasant audio alert chime using Web Audio API
 */
export function playAlertChime(type: "pos" | "warning" | "finish" | "success") {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === "pos") {
      // Pleasant double chime: C5 -> G5
      const notes = [523.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + idx * 0.15 + 0.4);
      });
    } else if (type === "warning") {
      // Urgent soft pulse: 440 -> 370
      const notes = [440, 370];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = "triangle";
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.3);
      });
    } else if (type === "finish") {
      // Fanfare notes: C5, E5, G5, C6
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = "triangle";
        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.45);
      });
    }
  } catch (e) {
    console.debug("Audio cue omitted:", e);
  }
}

/**
 * Text-to-speech announcement in Indonesian
 */
export function speakIndonesian(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech synthesis failures
  }
}

/**
 * Generate Google Maps navigation link
 */
export function getGoogleMapsWalkingUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
}

/**
 * Generate Google Maps multi-waypoint route overview link
 */
export function getGoogleMapsFullRouteUrl(
  waypoints: { lat: number; lng: number }[]
): string {
  if (waypoints.length === 0) return "https://www.google.com/maps";
  const origin = `${waypoints[0].lat},${waypoints[0].lng}`;
  const destination = `${waypoints[waypoints.length - 1].lat},${waypoints[waypoints.length - 1].lng}`;
  const intermediates = waypoints
    .slice(1, -1)
    .map((w) => `${w.lat},${w.lng}`)
    .join("|");
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${encodeURIComponent(
    intermediates
  )}&travelmode=walking`;
}

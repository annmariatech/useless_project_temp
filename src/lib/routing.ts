import type { TransportMode } from './modes';

export interface RouteCoordinate {
  lat: number;
  lng: number;
}

export interface CalculatedModeResult {
  mode: TransportMode;
  distanceKm: number;
  durationHours: number;
  durationFormatted: string;
  costINR: number;
  absurdityIndex: number; // 0 to 100
  absurdityFormatted: string; // e.g. "87/100"
  routeGeometry: [number, number][]; // [lat, lng]
  isWinner?: boolean; // fastest / most practical
  isWorst?: boolean; // highest absurdity index
}

/**
 * Calculate straight-line distance between two lat/lng coordinates in kilometers using Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Generate interpolated straight line points between two coordinates
 */
export function generateStraightLinePoints(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  steps: number = 30
): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    const lat = fromLat + (toLat - fromLat) * fraction;
    const lng = fromLng + (toLng - fromLng) * fraction;
    points.push([lat, lng]);
  }
  return points;
}

/**
 * Generate Spider-Man Web-Swing path:
 * Follows urban building corridors (OSRM road geometry) but with dynamic web-swing arcs
 * attached to high-rise building anchors along the city route!
 */
export function generateSpiderManWebSwingPoints(
  baseRoute: [number, number][]
): [number, number][] {
  if (!baseRoute || baseRoute.length < 2) return baseRoute;

  const swingPoints: [number, number][] = [];
  
  for (let i = 0; i < baseRoute.length; i++) {
    const p = baseRoute[i];
    // Create parabolic web-swing arcs off high-rise building anchor points
    const swingArcLat = Math.sin(i * 0.4) * 0.00045;
    const swingArcLng = Math.cos(i * 0.4) * 0.00045;
    swingPoints.push([p[0] + swingArcLat, p[1] + swingArcLng]);
  }

  return swingPoints;
}

export interface OSRMResult {
  distanceKm: number;
  durationHours: number;
  geometry: [number, number][]; // [lat, lng]
}

/**
 * Fetch real route from OSRM demo server
 */
export async function fetchOSRMRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<OSRMResult> {
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;

  try {
    const response = await fetch(osrmUrl);
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }
    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const distanceKm = route.distance / 1000;
      const durationHours = route.duration / 3600;
      const geometry: [number, number][] = route.geometry.coordinates.map(
        (coord: [number, number]) => [coord[1], coord[0]]
      );
      return { distanceKm, durationHours, geometry };
    }
  } catch (error) {
    console.warn('OSRM router fetch failed, falling back to Haversine straight line:', error);
  }

  const distanceKm = calculateHaversineDistance(fromLat, fromLng, toLat, toLng);
  const geometry = generateStraightLinePoints(fromLat, fromLng, toLat, toLng);
  return { distanceKm, durationHours: distanceKm / 50, geometry };
}

/**
 * Format duration in human readable string
 */
export function formatDuration(durationHours: number): string {
  if (durationHours < 1) {
    const mins = Math.round(durationHours * 60);
    return `${mins} min${mins !== 1 ? 's' : ''}`;
  }
  if (durationHours < 48) {
    const hours = Math.floor(durationHours);
    const mins = Math.round((durationHours - hours) * 60);
    if (mins === 0) return `${hours} hr${hours !== 1 ? 's' : ''}`;
    return `${hours}h ${mins}m`;
  }
  const days = (durationHours / 24).toFixed(1);
  return `${days} days`;
}

/**
 * Calculate route metrics for a given transport mode
 * Absurdity Index formula normalized out of 100:
 * score = Math.min(100, Math.round((time_hours * cost_inr) / (practicality * 50)))
 */
export function calculateModeMetrics(
  mode: TransportMode,
  osrmData: OSRMResult,
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): CalculatedModeResult {
  const straightLineKm = calculateHaversineDistance(fromLat, fromLng, toLat, toLng);
  const straightLinePolyline = generateStraightLinePoints(fromLat, fromLng, toLat, toLng);

  let distanceKm: number;
  let routeGeometry: [number, number][];

  if (mode.straightLineOnly) {
    // Only Zipline uses straight-line haversine distance
    distanceKm = straightLineKm;
    routeGeometry = straightLinePolyline;
  } else if (mode.id === 'spiderman') {
    // Spider-Man follows urban building corridors with high-rise web-swing arcs!
    distanceKm = osrmData.distanceKm * 1.08; // slightly longer due to building swings
    routeGeometry = generateSpiderManWebSwingPoints(osrmData.geometry);
  } else {
    // Real & ground absurd modes use OSRM road route geometry
    distanceKm = osrmData.distanceKm;
    routeGeometry = osrmData.geometry;
  }

  const durationHours = distanceKm / mode.speedKmh;
  const costINR = distanceKm * mode.costPerKmINR;

  // ABSURDITY INDEX SCALED OUT OF 100
  let rawScore = (durationHours * costINR) / Math.max(0.1, mode.practicalityRating * 30);
  if (!mode.isAbsurd) {
    // Normal modes get low sanity score (5 to 25 out of 100)
    rawScore = Math.min(25, Math.max(5, rawScore * 0.05));
  } else {
    // Absurd modes scale up to 45 - 99 out of 100
    rawScore = Math.min(99, Math.max(45, rawScore));
  }

  const absurdityIndex = Math.round(rawScore);

  return {
    mode,
    distanceKm,
    durationHours,
    durationFormatted: formatDuration(durationHours),
    costINR,
    absurdityIndex,
    absurdityFormatted: `${absurdityIndex}/100`,
    routeGeometry,
  };
}

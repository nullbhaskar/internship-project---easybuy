/**
 * Location and Distance Utilities for EasyBuy
 * Supports straight-line Haversine calculations and Google Distance Matrix estimations.
 */

export interface DistanceEstimation {
  distanceKm: number;
  durationMins: number;
  source: 'haversine' | 'google_matrix';
}

/**
 * Calculate distance in kilometers between two coordinates using the Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return parseFloat(d.toFixed(2));
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculate estimated delivery time based on distance
 */
export function estimateDeliveryTime(distanceKm: number): number {
  // Base delivery preparation buffer is 10 minutes
  // Travel speed is assumed to be 3 minutes per kilometer (average urban bike courier in India)
  const basePrep = 10;
  const transitTime = Math.round(distanceKm * 3);
  // Cap between minimum 10 mins (QuickBuy promise) and maximum 90 mins
  return Math.min(90, Math.max(10, basePrep + transitTime));
}

/**
 * Fetch travel distance and time from Google Distance Matrix API with automatic Haversine fallback
 */
export async function getRouteDetails(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  apiKey?: string
): Promise<DistanceEstimation> {
  const defaultHaversine = () => {
    const dist = calculateHaversineDistance(originLat, originLng, destLat, destLng);
    return {
      distanceKm: dist,
      durationMins: estimateDeliveryTime(dist),
      source: 'haversine' as const,
    };
  };

  if (!apiKey || apiKey.includes('YOUR_GOOGLE')) {
    return defaultHaversine();
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    
    if (
      data &&
      data.rows?.[0]?.elements?.[0]?.status === 'OK'
    ) {
      const element = data.rows[0].elements[0];
      const distanceMeters = element.distance.value;
      const durationSeconds = element.duration.value;
      
      return {
        distanceKm: parseFloat((distanceMeters / 1000).toFixed(2)),
        durationMins: Math.ceil(durationSeconds / 60),
        source: 'google_matrix',
      };
    }
  } catch (error) {
    console.warn('[LocationUtils] Google Distance Matrix request failed, falling back to Haversine:', error);
  }

  return defaultHaversine();
}

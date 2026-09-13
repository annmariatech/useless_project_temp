export interface LocationResult {
  placeId: string;
  displayName: string;
  shortName: string;
  lat: number;
  lng: number;
}

// Throttle queue timestamp tracking to honor 1 req/sec Nominatim usage policy
let lastNominatimRequestTime = 0;

/**
 * Throttle helper to ensure we never query Nominatim faster than once per 1000ms
 */
async function enforceNominatimThrottle(): Promise<void> {
  const now = Date.now();
  const timeSinceLast = now - lastNominatimRequestTime;
  if (timeSinceLast < 1050) {
    const delay = 1050 - timeSinceLast;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  lastNominatimRequestTime = Date.now();
}

/**
 * Search Nominatim for places matching query string
 */
export async function searchLocations(query: string): Promise<LocationResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  await enforceNominatimThrottle();

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}&limit=5&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'GooberMaps/1.0 (Hackathon-Demo-App)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.statusText}`);
    }

    const data = await response.json();

    return data.map((item: any) => {
      const parts = item.display_name.split(',');
      const shortName = parts.slice(0, 2).join(',').trim();
      return {
        placeId: item.place_id?.toString() || Math.random().toString(),
        displayName: item.display_name,
        shortName: shortName || item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      };
    });
  } catch (error) {
    console.error('Failed to geocode location:', error);
    return [];
  }
}

/**
 * Reverse geocode lat/lng into LocationResult
 */
export async function reverseGeocode(lat: number, lng: number): Promise<LocationResult> {
  await enforceNominatimThrottle();
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'GooberMaps/1.0 (Hackathon-Demo-App)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const parts = (data.display_name || '').split(',');
      const shortName = parts.slice(0, 2).join(',').trim() || 'Your Location';
      return {
        placeId: data.place_id?.toString() || 'user-location',
        displayName: data.display_name || 'Your Current Location',
        shortName,
        lat,
        lng,
      };
    }
  } catch (e) {
    console.warn('Reverse geocoding failed, using coordinates fallback:', e);
  }

  return {
    placeId: 'user-location',
    displayName: `Current Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
    shortName: 'Your Location',
    lat,
    lng,
  };
}

/**
 * Preset famous location pairs for quick testing and instant fun
 */
export const PRESET_ROUTES = [
  {
    name: 'Fort Kochi 🌴 (Kochi, Kerala)',
    from: {
      placeId: 'preset-kochi-user',
      displayName: 'Your Location, Ernakulam, Kochi',
      shortName: 'Your location',
      lat: 9.9816,
      lng: 76.2999,
    },
    to: {
      placeId: 'preset-fk',
      displayName: 'Fort Kochi, Kochi, Kerala',
      shortName: 'Fort Kochi, Kochi, Kerala',
      lat: 9.9658,
      lng: 76.2421,
    },
  },
  {
    name: 'NYC: Times Square 🗽 ➔ Central Park 🌳',
    from: {
      placeId: 'preset-ts',
      displayName: 'Times Square, New York, NY, USA',
      shortName: 'Times Square, NYC',
      lat: 40.758,
      lng: -73.9855,
    },
    to: {
      placeId: 'preset-cp',
      displayName: 'Central Park, New York, NY, USA',
      shortName: 'Central Park, NYC',
      lat: 40.7829,
      lng: -73.9654,
    },
  },
  {
    name: 'Paris: Eiffel Tower 🗼 ➔ Colosseum 🏛️',
    from: {
      placeId: 'preset-et',
      displayName: 'Eiffel Tower, Paris, France',
      shortName: 'Eiffel Tower, Paris',
      lat: 48.8584,
      lng: 2.2945,
    },
    to: {
      placeId: 'preset-col',
      displayName: 'Colosseum, Rome, Italy',
      shortName: 'Colosseum, Rome',
      lat: 41.8902,
      lng: 12.4922,
    },
  },
  {
    name: 'London: Big Ben 🕰️ ➔ Stonehenge 🪨',
    from: {
      placeId: 'preset-bb',
      displayName: 'Big Ben, London, UK',
      shortName: 'Big Ben, London',
      lat: 51.5007,
      lng: -0.1246,
    },
    to: {
      placeId: 'preset-sh',
      displayName: 'Stonehenge, Salisbury, UK',
      shortName: 'Stonehenge, UK',
      lat: 51.1789,
      lng: -1.8262,
    },
  },
];

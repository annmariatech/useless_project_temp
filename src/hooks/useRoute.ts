import { create } from 'zustand';
import type { LocationResult } from '../lib/geocode';
import { reverseGeocode, PRESET_ROUTES } from '../lib/geocode';
import { TRANSPORT_MODES } from '../lib/modes';
import type { CalculatedModeResult } from '../lib/routing';
import { calculateModeMetrics, fetchOSRMRoute } from '../lib/routing';

interface SavedRouteEntry {
  id: string;
  from: LocationResult;
  to: LocationResult;
  createdAt: number;
}

interface RouteState {
  fromLocation: LocationResult | null;
  toLocation: LocationResult | null;
  selectedCurrencyId: string;
  selectedModeId: string;
  modeResults: CalculatedModeResult[];
  isCalculating: boolean;
  error: string | null;
  hasSearched: boolean; // false = landing page with full map; true = directions sidebar view
  isLocatingUser: boolean;
  userLocation: { lat: number; lng: number } | null;
  activeNav: 'saved' | 'recents' | null;
  savedRoutes: SavedRouteEntry[];
  recentRoutes: SavedRouteEntry[];
  
  // Actions
  setFromLocation: (loc: LocationResult | null) => void;
  setToLocation: (loc: LocationResult | null) => void;
  setSelectedCurrency: (currId: string) => void;
  setSelectedMode: (modeId: string) => void;
  setHasSearched: (searched: boolean) => void;
  setActiveNav: (nav: 'saved' | 'recents' | null) => void;
  swapLocations: () => void;
  loadPresetRoute: (presetIndex: number) => void;
  saveCurrentRoute: () => void;
  addRecentSearch: () => void;
  loadSavedRoute: (id: string) => void;
  loadRecentRoute: (id: string) => void;
  requestUserLocation: () => Promise<void>;
  calculateRoutes: () => Promise<void>;
}

const readStoredRoutes = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const useRouteStore = create<RouteState>((set, get) => ({
  fromLocation: PRESET_ROUTES[0].from,
  toLocation: null, // Start with null destination on landing page
  selectedCurrencyId: 'apples',
  selectedModeId: 'driving',
  modeResults: [],
  isCalculating: false,
  error: null,
  hasSearched: false,
  isLocatingUser: false,
  userLocation: null,
  activeNav: null,
  savedRoutes: readStoredRoutes<SavedRouteEntry[]>('goober-saved-routes', []),
  recentRoutes: readStoredRoutes<SavedRouteEntry[]>('goober-recent-routes', []),

  setFromLocation: (loc) => {
    set({ fromLocation: loc });
    if (get().toLocation) {
      get().calculateRoutes();
    }
  },

  setToLocation: (loc) => {
    set({ toLocation: loc });
    if (loc) {
      set({ hasSearched: true });
      get().addRecentSearch();
      get().calculateRoutes();
    }
  },

  setSelectedCurrency: (currId) => set({ selectedCurrencyId: currId }),

  setSelectedMode: (modeId) => set({ selectedModeId: modeId }),

  setHasSearched: (searched) => set({ hasSearched: searched }),

  setActiveNav: (nav) => set({ activeNav: nav }),

  swapLocations: () => {
    const { fromLocation, toLocation } = get();
    set({ fromLocation: toLocation, toLocation: fromLocation });
    if (get().fromLocation && get().toLocation) {
      get().calculateRoutes();
    }
  },

  loadPresetRoute: (presetIndex) => {
    const preset = PRESET_ROUTES[presetIndex] || PRESET_ROUTES[0];
    set({ fromLocation: preset.from, toLocation: preset.to, hasSearched: true });
    get().addRecentSearch();
    get().calculateRoutes();
  },

  saveCurrentRoute: () => {
    const { fromLocation, toLocation } = get();
    if (!fromLocation || !toLocation) {
      return;
    }

    const entry: SavedRouteEntry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      from: fromLocation,
      to: toLocation,
      createdAt: Date.now(),
    };

    const nextSavedRoutes = [entry, ...get().savedRoutes].slice(0, 8);
    set({ savedRoutes: nextSavedRoutes });

    if (typeof window !== 'undefined') {
      localStorage.setItem('goober-saved-routes', JSON.stringify(nextSavedRoutes));
    }
  },

  addRecentSearch: () => {
    const { fromLocation, toLocation } = get();
    if (!fromLocation || !toLocation) {
      return;
    }

    const entry: SavedRouteEntry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      from: fromLocation,
      to: toLocation,
      createdAt: Date.now(),
    };

    const deduped = get().recentRoutes.filter(
      (route) =>
        !(route.from.placeId === fromLocation.placeId && route.to.placeId === toLocation.placeId)
    );

    const nextRecentRoutes = [entry, ...deduped].slice(0, 8);
    set({ recentRoutes: nextRecentRoutes });

    if (typeof window !== 'undefined') {
      localStorage.setItem('goober-recent-routes', JSON.stringify(nextRecentRoutes));
    }
  },

  loadSavedRoute: (id) => {
    const target = get().savedRoutes.find((route) => route.id === id);
    if (!target) {
      return;
    }

    set({ fromLocation: target.from, toLocation: target.to, hasSearched: true });
    get().calculateRoutes();
  },

  loadRecentRoute: (id) => {
    const target = get().recentRoutes.find((route) => route.id === id);
    if (!target) {
      return;
    }

    set({ fromLocation: target.from, toLocation: target.to, hasSearched: true });
    get().calculateRoutes();
  },

  requestUserLocation: async () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      return;
    }

    set({ isLocatingUser: true });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        set({ userLocation: { lat: latitude, lng: longitude } });

        const userLocResult = await reverseGeocode(latitude, longitude);
        set({ fromLocation: userLocResult, isLocatingUser: false });

        // If toLocation is already set, recalculate
        if (get().toLocation) {
          get().calculateRoutes();
        }
      },
      (error) => {
        console.warn('User denied or error in geolocation:', error.message);
        set({ isLocatingUser: false });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  },

  calculateRoutes: async () => {
    const { fromLocation, toLocation } = get();
    if (!fromLocation || !toLocation) {
      set({ modeResults: [] });
      return;
    }

    set({ isCalculating: true, error: null, hasSearched: true });

    try {
      const osrmData = await fetchOSRMRoute(
        fromLocation.lat,
        fromLocation.lng,
        toLocation.lat,
        toLocation.lng
      );

      const results: CalculatedModeResult[] = TRANSPORT_MODES.map((mode) =>
        calculateModeMetrics(
          mode,
          osrmData,
          fromLocation.lat,
          fromLocation.lng,
          toLocation.lat,
          toLocation.lng
        )
      );

      let fastestDuration = Infinity;
      let highestAbsurdity = -1;
      let winnerId = '';
      let worstId = '';

      results.forEach((res) => {
        if (res.durationHours < fastestDuration) {
          fastestDuration = res.durationHours;
          winnerId = res.mode.id;
        }
        if (res.absurdityIndex > highestAbsurdity) {
          highestAbsurdity = res.absurdityIndex;
          worstId = res.mode.id;
        }
      });

      const updatedResults = results.map((res) => ({
        ...res,
        isWinner: res.mode.id === winnerId,
        isWorst: res.mode.id === worstId,
      }));

      set({ modeResults: updatedResults, isCalculating: false });
    } catch (err: any) {
      console.error('Error calculating routes:', err);
      set({
        error: 'Failed to calculate travel route. Try another location.',
        isCalculating: false,
      });
    }
  },
}));

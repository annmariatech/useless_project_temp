import { create } from 'zustand';
import type { LocationResult } from '../lib/geocode';
import { reverseGeocode, PRESET_ROUTES } from '../lib/geocode';
import { TRANSPORT_MODES } from '../lib/modes';
import type { CalculatedModeResult } from '../lib/routing';
import { calculateModeMetrics, fetchOSRMRoute } from '../lib/routing';

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
  
  // Actions
  setFromLocation: (loc: LocationResult | null) => void;
  setToLocation: (loc: LocationResult | null) => void;
  setSelectedCurrency: (currId: string) => void;
  setSelectedMode: (modeId: string) => void;
  setHasSearched: (searched: boolean) => void;
  swapLocations: () => void;
  loadPresetRoute: (presetIndex: number) => void;
  requestUserLocation: () => Promise<void>;
  calculateRoutes: () => Promise<void>;
}

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
      get().calculateRoutes();
    }
  },

  setSelectedCurrency: (currId) => set({ selectedCurrencyId: currId }),

  setSelectedMode: (modeId) => set({ selectedModeId: modeId }),

  setHasSearched: (searched) => set({ hasSearched: searched }),

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

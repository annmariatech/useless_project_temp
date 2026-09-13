import React, { useState, useRef } from 'react';
import { useRouteStore } from '../hooks/useRoute';
import { searchLocations, PRESET_ROUTES } from '../lib/geocode';
import type { LocationResult } from '../lib/geocode';
import { Search, MapPin, Navigation, Loader2 } from 'lucide-react';

export const GoogleMapsHeader: React.FC = () => {
  const {
    setToLocation,
    loadPresetRoute,
    requestUserLocation,
    isLocatingUser,
  } = useRouteStore();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (val.trim().length >= 2) {
      setIsSearching(true);
      timeoutRef.current = setTimeout(async () => {
        const results = await searchLocations(val);
        setSuggestions(results);
        setIsSearching(false);
        setShowDropdown(true);
      }, 600);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  return (
    <div className="absolute top-4 left-20 right-4 z-[1000] max-w-2xl pointer-events-auto">
      <div
        className="relative glass-panel rounded-2xl shadow-2xl p-2.5 flex items-center gap-3"
        style={{ backgroundColor: 'rgba(11, 46, 56, 0.92)', border: '2px solid rgba(34, 211, 238, 0.3)' }}
      >
        {/* GooberMaps Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <img
            src="/goobermaps-logo.png"
            alt="GooberMaps logo"
            className="w-11 h-11 rounded-xl object-cover shadow-md"
          />
          <span className="hidden sm:inline text-sm font-black tracking-tight" style={{ color: '#facc15' }}>
            GooberMaps
          </span>
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder="Search destination in GooberMaps..."
            className="w-full text-sm rounded-xl px-4 py-2.5 focus:outline-none"
            style={{
              backgroundColor: '#0a2630',
              color: '#e2f5f1',
              border: '2px solid #164e5e',
            }}
          />
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-3" style={{ color: '#22d3ee' }} />
          ) : (
            <Search className="w-4 h-4 absolute right-3 top-3" style={{ color: '#67b5c5' }} />
          )}

          {/* Search Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div
              className="absolute z-50 left-0 right-0 mt-2 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
              style={{ backgroundColor: '#0b3542', border: '2px solid #1a6070' }}
            >
              {suggestions.map((item) => (
                <button
                  key={item.placeId}
                  onClick={() => {
                    setToLocation(item);
                    setQuery(item.shortName);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs transition flex flex-col gap-0.5"
                  style={{ color: '#c8eee6', borderBottom: '1px solid #164e5e' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#134050')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span className="font-semibold" style={{ color: '#facc15' }}>{item.shortName}</span>
                  <span className="text-[10px] truncate" style={{ color: '#67b5c5' }}>{item.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* My Location Button */}
        <button
          onClick={requestUserLocation}
          title="Detect My Location"
          disabled={isLocatingUser}
          className="p-2.5 rounded-xl transition shrink-0 flex items-center gap-1.5 text-xs font-semibold"
          style={{
            backgroundColor: '#0f4a5a',
            color: '#22d3ee',
            border: '2px solid #22d3ee60',
          }}
        >
          {isLocatingUser ? (
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#22d3ee' }} />
          ) : (
            <Navigation className="w-4 h-4" style={{ color: '#22d3ee', fill: '#22d3ee' }} />
          )}
          <span className="hidden sm:inline">My Location</span>
        </button>
      </div>

      {/* Quick Presets Row */}
      <div className="mt-2 flex flex-wrap gap-2 pointer-events-auto">
        {PRESET_ROUTES.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => loadPresetRoute(idx)}
            className="text-xs px-3 py-1.5 rounded-xl shadow-md backdrop-blur-md transition flex items-center gap-1"
            style={{
              backgroundColor: 'rgba(11, 46, 56, 0.9)',
              color: '#c8eee6',
              border: '1px solid #1a5568',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#facc15')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1a5568')}
          >
            <MapPin className="w-3 h-3" style={{ color: '#facc15' }} /> {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
};

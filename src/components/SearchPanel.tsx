import React, { useState, useEffect, useRef } from 'react';
import { useRouteStore } from '../hooks/useRoute';
import { searchLocations, PRESET_ROUTES } from '../lib/geocode';
import type { LocationResult } from '../lib/geocode';
import { ArrowRightLeft, MapPin, Sparkles, Loader2 } from 'lucide-react';

export const SearchPanel: React.FC = () => {
  const {
    fromLocation,
    toLocation,
    setFromLocation,
    setToLocation,
    swapLocations,
    loadPresetRoute,
  } = useRouteStore();

  const [fromQuery, setFromQuery] = useState(fromLocation?.shortName || '');
  const [toQuery, setToQuery] = useState(toLocation?.shortName || '');

  const [fromSuggestions, setFromSuggestions] = useState<LocationResult[]>([]);
  const [toSuggestions, setToSuggestions] = useState<LocationResult[]>([]);

  const [isSearchingFrom, setIsSearchingFrom] = useState(false);
  const [isSearchingTo, setIsSearchingTo] = useState(false);

  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const fromTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  // Sync state if locations change externally (e.g. presets or swap)
  useEffect(() => {
    if (fromLocation) setFromQuery(fromLocation.shortName);
  }, [fromLocation]);

  useEffect(() => {
    if (toLocation) setToQuery(toLocation.shortName);
  }, [toLocation]);

  // Handle autocomplete search for "From" field with 600ms debounce
  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromQuery(value);

    if (fromTimeoutRef.current) clearTimeout(fromTimeoutRef.current);

    if (value.trim().length >= 2) {
      setIsSearchingFrom(true);
      fromTimeoutRef.current = setTimeout(async () => {
        const results = await searchLocations(value);
        setFromSuggestions(results);
        setIsSearchingFrom(false);
        setShowFromDropdown(true);
      }, 600);
    } else {
      setFromSuggestions([]);
      setShowFromDropdown(false);
    }
  };

  // Handle autocomplete search for "To" field with 600ms debounce
  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setToQuery(value);

    if (toTimeoutRef.current) clearTimeout(toTimeoutRef.current);

    if (value.trim().length >= 2) {
      setIsSearchingTo(true);
      toTimeoutRef.current = setTimeout(async () => {
        const results = await searchLocations(value);
        setToSuggestions(results);
        setIsSearchingTo(false);
        setShowToDropdown(true);
      }, 600);
    } else {
      setToSuggestions([]);
      setShowToDropdown(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 shadow-2xl border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
          <h2 className="text-lg font-bold text-white tracking-wide">Route Constructor</h2>
        </div>
        <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Nominatim Throttled (1 req/s)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-center">
        {/* From Input */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Start Point
          </label>
          <div className="relative">
            <input
              type="text"
              value={fromQuery}
              onChange={handleFromChange}
              onFocus={() => fromSuggestions.length > 0 && setShowFromDropdown(true)}
              placeholder="Search origin city, address..."
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
            />
            {isSearchingFrom && (
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin absolute right-3 top-3" />
            )}
          </div>

          {/* From Dropdown */}
          {showFromDropdown && fromSuggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
              {fromSuggestions.map((item) => (
                <button
                  key={item.placeId}
                  onClick={() => {
                    setFromLocation(item);
                    setFromQuery(item.shortName);
                    setShowFromDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-purple-900/40 hover:text-purple-200 border-b border-slate-700/50 last:border-0 transition flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-white">{item.shortName}</span>
                  <span className="text-[10px] text-slate-400 truncate">{item.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center md:pt-5">
          <button
            onClick={swapLocations}
            title="Swap Origin & Destination"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-purple-600/30 text-purple-300 border border-slate-700 hover:border-purple-500/50 transition transform active:scale-95"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* To Input */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400" /> Destination
          </label>
          <div className="relative">
            <input
              type="text"
              value={toQuery}
              onChange={handleToChange}
              onFocus={() => toSuggestions.length > 0 && setShowToDropdown(true)}
              placeholder="Search destination..."
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
            />
            {isSearchingTo && (
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin absolute right-3 top-3" />
            )}
          </div>

          {/* To Dropdown */}
          {showToDropdown && toSuggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
              {toSuggestions.map((item) => (
                <button
                  key={item.placeId}
                  onClick={() => {
                    setToLocation(item);
                    setToQuery(item.shortName);
                    setShowToDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-purple-900/40 hover:text-purple-200 border-b border-slate-700/50 last:border-0 transition flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-white">{item.shortName}</span>
                  <span className="text-[10px] text-slate-400 truncate">{item.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Presets Row */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-medium mr-1">Quick Presets:</span>
        {PRESET_ROUTES.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => loadPresetRoute(idx)}
            className="text-xs bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700/80 transition flex items-center gap-1 hover:border-purple-500/50"
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
};

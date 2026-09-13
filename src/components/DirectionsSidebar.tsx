import React, { useState, useRef } from 'react';
import { useRouteStore } from '../hooks/useRoute';
import { TRANSPORT_MODES } from '../lib/modes';
import { SILLY_CURRENCIES, convertFromINR } from '../lib/currencies';
import { searchLocations } from '../lib/geocode';
import type { LocationResult } from '../lib/geocode';
import {
  ArrowRightLeft,
  X,
  Plus,
  AlertTriangle,
  Navigation,
  Loader2,
} from 'lucide-react';

export const DirectionsSidebar: React.FC = () => {
  const {
    fromLocation,
    toLocation,
    setFromLocation,
    setToLocation,
    swapLocations,
    modeResults,
    selectedModeId,
    setSelectedMode,
    selectedCurrencyId,
    setSelectedCurrency,
    setHasSearched,
    isCalculating,
    requestUserLocation,
    isLocatingUser,
    saveCurrentRoute,
  } = useRouteStore();

  const [fromQuery, setFromQuery] = useState(fromLocation?.shortName || 'Your location');
  const [toQuery, setToQuery] = useState(toLocation?.shortName || '');

  const [fromSuggestions, setFromSuggestions] = useState<LocationResult[]>([]);
  const [toSuggestions, setToSuggestions] = useState<LocationResult[]>([]);

  const [isSearchingFrom, setIsSearchingFrom] = useState(false);
  const [isSearchingTo, setIsSearchingTo] = useState(false);

  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const fromTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFromQuery(val);
    if (fromTimeoutRef.current) clearTimeout(fromTimeoutRef.current);
    if (val.trim().length >= 2) {
      setIsSearchingFrom(true);
      fromTimeoutRef.current = setTimeout(async () => {
        const results = await searchLocations(val);
        setFromSuggestions(results);
        setIsSearchingFrom(false);
        setShowFromDropdown(true);
      }, 600);
    } else {
      setFromSuggestions([]);
      setShowFromDropdown(false);
    }
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setToQuery(val);
    if (toTimeoutRef.current) clearTimeout(toTimeoutRef.current);
    if (val.trim().length >= 2) {
      setIsSearchingTo(true);
      toTimeoutRef.current = setTimeout(async () => {
        const results = await searchLocations(val);
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
    <div
      className="w-full md:w-[410px] flex flex-col h-full overflow-y-auto select-none shrink-0 z-20 shadow-2xl"
      style={{ backgroundColor: '#092630', borderRight: '2px solid #164e5e' }}
    >
      {/* Top Mode Selection Bar */}
      <div className="p-3" style={{ backgroundColor: '#071e28', borderBottom: '2px solid #164e5e' }}>
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 scrollbar-none">
          {/* Best button */}
          <button
            onClick={() => setSelectedMode(modeResults[0]?.mode.id || 'driving')}
            className="flex flex-col items-center min-w-[44px] py-1.5 px-1 rounded-xl transition"
            style={{ color: '#67b5c5' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0f3d4d')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: '#0f4a5a', color: '#22d3ee' }}
            >
              ↗️
            </div>
            <span className="text-[10px] font-semibold mt-1" style={{ color: '#67b5c5' }}>Best</span>
          </button>

          {/* Mode icons row */}
          {TRANSPORT_MODES.slice(0, 7).map((mode) => {
            const res = modeResults.find((r) => r.mode.id === mode.id);
            const isSelected = selectedModeId === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className="relative flex flex-col items-center min-w-[48px] py-1 px-1 rounded-xl transition"
                style={{
                  backgroundColor: isSelected ? '#0f4a5aaa' : 'transparent',
                  border: isSelected ? '2px solid #22d3ee' : '2px solid transparent',
                  boxShadow: isSelected ? '0 0 12px rgba(34, 211, 238, 0.2)' : 'none',
                }}
              >
                {res && (
                  <span
                    className="text-[9px] font-bold tracking-tighter"
                    style={{ color: res.isWinner ? '#34d399' : '#c8eee6' }}
                  >
                    {res.durationFormatted}
                  </span>
                )}
                <span className="text-lg my-0.5">{mode.emoji}</span>
              </button>
            );
          })}

          {/* Close Directions Panel */}
          <button
            onClick={() => setHasSearched(false)}
            title="Close directions"
            className="p-1.5 rounded-full transition shrink-0 ml-1"
            style={{ color: '#67b5c5' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Fields Box */}
        <div className="mt-2 rounded-2xl p-3 relative" style={{ backgroundColor: '#0b3542', border: '2px solid #164e5e' }}>
          <div className="absolute left-6 top-8 bottom-8 w-0.5 z-0" style={{ backgroundColor: '#1a5568' }}></div>

          {/* Origin Input */}
          <div className="relative z-10 flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#34d39930', border: '2px solid #34d399' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#34d399' }}></div>
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                value={fromQuery}
                onChange={handleFromChange}
                onFocus={() => fromSuggestions.length > 0 && setShowFromDropdown(true)}
                placeholder="Choose starting point..."
                className="w-full rounded-xl px-3 py-2 text-xs focus:outline-none"
                style={{ backgroundColor: '#0a2630', color: '#e2f5f1', border: '2px solid #164e5e' }}
              />
              {isSearchingFrom && (
                <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-2.5 top-2.5" style={{ color: '#22d3ee' }} />
              )}
              {showFromDropdown && fromSuggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto" style={{ backgroundColor: '#0b3542', border: '2px solid #1a6070' }}>
                  {fromSuggestions.map((item) => (
                    <button
                      key={item.placeId}
                      onClick={() => { setFromLocation(item); setFromQuery(item.shortName); setShowFromDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-xs transition"
                      style={{ color: '#c8eee6', borderBottom: '1px solid #164e5e' }}
                    >
                      <div className="font-semibold" style={{ color: '#facc15' }}>{item.shortName}</div>
                      <div className="text-[10px] truncate" style={{ color: '#67b5c5' }}>{item.displayName}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={requestUserLocation}
              title="Detect My Location"
              disabled={isLocatingUser}
              className="p-1.5 rounded-lg transition shrink-0"
              style={{ backgroundColor: '#0f4a5a', border: '1px solid #1a6070', color: '#22d3ee' }}
            >
              {isLocatingUser ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" style={{ color: '#34d399' }} />}
            </button>
          </div>

          {/* Destination Input */}
          <div className="relative z-10 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#f4364c30', border: '2px solid #f4364c' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#f4364c' }}></div>
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                value={toQuery}
                onChange={handleToChange}
                onFocus={() => toSuggestions.length > 0 && setShowToDropdown(true)}
                placeholder="Choose destination..."
                className="w-full rounded-xl px-3 py-2 text-xs focus:outline-none"
                style={{ backgroundColor: '#0a2630', color: '#e2f5f1', border: '2px solid #164e5e' }}
              />
              {isSearchingTo && (
                <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-2.5 top-2.5" style={{ color: '#22d3ee' }} />
              )}
              {showToDropdown && toSuggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto" style={{ backgroundColor: '#0b3542', border: '2px solid #1a6070' }}>
                  {toSuggestions.map((item) => (
                    <button
                      key={item.placeId}
                      onClick={() => { setToLocation(item); setToQuery(item.shortName); setShowToDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-xs transition"
                      style={{ color: '#c8eee6', borderBottom: '1px solid #164e5e' }}
                    >
                      <div className="font-semibold" style={{ color: '#facc15' }}>{item.shortName}</div>
                      <div className="text-[10px] truncate" style={{ color: '#67b5c5' }}>{item.displayName}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={swapLocations}
              title="Swap origin & destination"
              className="p-1.5 rounded-lg transition shrink-0"
              style={{ backgroundColor: '#0f4a5a', border: '1px solid #1a6070', color: '#22d3ee' }}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-2.5 pt-2 flex items-center justify-between text-[11px]" style={{ borderTop: '1px solid #164e5e', color: '#22d3ee' }}>
            <button className="flex items-center gap-1 hover:underline font-medium">
              <Plus className="w-3.5 h-3.5" /> Add destination
            </button>
            <button
              onClick={saveCurrentRoute}
              className="px-2 py-1 rounded-lg text-[10px] font-semibold transition"
              style={{ backgroundColor: '#0f4a5a', border: '1px solid #1a6070', color: '#facc15' }}
            >
              Save route
            </button>
          </div>
        </div>

        {/* Silly Currency Selection Bar */}
        <div className="mt-3 flex items-center justify-between text-xs px-1">
          <span className="text-xs font-bold" style={{ color: '#facc15' }}>Travel Options</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px]" style={{ color: '#67b5c5' }}>Pay in:</span>
            <select
              value={selectedCurrencyId}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="font-semibold text-[11px] rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
              style={{ backgroundColor: '#0a2630', color: '#facc15', border: '1px solid #1a5568' }}
            >
              {SILLY_CURRENCIES.map((curr) => (
                <option key={curr.id} value={curr.id}>
                  {curr.emoji} {curr.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Results List Container */}
      <div className="flex-1 p-3 space-y-3">
        {isCalculating ? (
          <div className="p-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: '#22d3ee' }} />
            <p className="text-xs" style={{ color: '#67b5c5' }}>Calculating Goober transport vectors...</p>
          </div>
        ) : (
          modeResults.map((result) => {
            const { mode, durationFormatted, costINR, distanceKm, isWinner, absurdityFormatted } = result;
            const isSelected = selectedModeId === mode.id;
            const converted = convertFromINR(costINR, selectedCurrencyId);

            return (
              <div
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className="p-3.5 rounded-2xl transition cursor-pointer text-left"
                style={{
                  backgroundColor: isSelected ? '#0b3d4d' : '#0a2e38',
                  border: isSelected
                    ? '2px solid #22d3ee'
                    : isWinner
                    ? '2px solid #34d39960'
                    : '2px solid #164e5e',
                  boxShadow: isSelected ? '0 0 16px rgba(34, 211, 238, 0.15)' : 'none',
                }}
              >
                {/* Header: Mode Icon + Route Title + Duration & Distance */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xl shrink-0">{mode.emoji}</span>
                    <div>
                      <h4 className="text-xs font-bold flex items-center gap-1.5" style={{ color: '#facc15' }}>
                        via {mode.label}
                        {mode.straightLineOnly && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: '#facc1520', color: '#facc15' }}>
                            Zipline Straight
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] leading-snug" style={{ color: '#67b5c5' }}>
                        {mode.isAbsurd
                          ? `Absurdity Score: ${absurdityFormatted}`
                          : 'Fastest route now due to traffic conditions'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className="text-sm font-black"
                      style={{ color: isWinner ? '#34d399' : '#e2f5f1' }}
                    >
                      {durationFormatted}
                    </div>
                    <div className="text-[10px] font-mono" style={{ color: '#67b5c5' }}>
                      {distanceKm.toFixed(1)} km
                    </div>
                  </div>
                </div>

                {/* Subtitle / Warning info */}
                {mode.id === 'cycling' && (
                  <div className="mt-2 text-[10px] px-2 py-1 rounded-lg flex items-center gap-1" style={{ color: '#facc15', backgroundColor: '#facc1510', border: '1px solid #facc1530' }}>
                    <AlertTriangle className="w-3 h-3 shrink-0" style={{ color: '#facc15' }} />
                    <span>This route includes a ferry & steep hills.</span>
                  </div>
                )}
                {mode.id === 'spiderman' && (
                  <div className="mt-2 text-[10px] px-2 py-1 rounded-lg flex items-center gap-1" style={{ color: '#f4364c', backgroundColor: '#f4364c10', border: '1px solid #f4364c30' }}>
                    <AlertTriangle className="w-3 h-3 shrink-0" style={{ color: '#f4364c' }} />
                    <span>⚠️ Web-swinging via high-rise building corridors & ₹1,250/km web fluid.</span>
                  </div>
                )}
                {mode.id === 'pogostick' && (
                  <div className="mt-2 text-[10px] px-2 py-1 rounded-lg flex items-center gap-1" style={{ color: '#f472b6', backgroundColor: '#f472b610', border: '1px solid #f472b630' }}>
                    <AlertTriangle className="w-3 h-3 shrink-0" style={{ color: '#f472b6' }} />
                    <span>⚠️ ~12,400 pogo hops required. Chiropractic alignment included.</span>
                  </div>
                )}

                {/* Silly Price Row */}
                <div className="mt-2.5 pt-2 flex items-center justify-between text-[11px]" style={{ borderTop: '1px solid #164e5e' }}>
                  <div className="font-bold font-mono" style={{ color: '#facc15' }}>
                    {converted.formatted}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

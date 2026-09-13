import React, { useState } from 'react';
import { useRouteStore } from '../hooks/useRoute';
import { ModeCard } from './ModeCard';
import { ArrowUpDown, SlidersHorizontal, Loader2 } from 'lucide-react';

export const ComparisonGrid: React.FC = () => {
  const { modeResults, isCalculating } = useRouteStore();
  const [filter, setFilter] = useState<'all' | 'normal' | 'absurd'>('all');
  const [sortBy, setSortBy] = useState<'time' | 'cost' | 'absurdity'>('time');

  if (isCalculating) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
        <h3 className="text-lg font-bold text-white">Simulating Travel Absurdities...</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Calculating OSRM road vectors & running straight-line haversine trigonometry for ziplines and spider webs.
        </p>
      </div>
    );
  }

  if (!modeResults || modeResults.length === 0) {
    return null;
  }

  // Filter modes
  const filtered = modeResults.filter((res) => {
    if (filter === 'normal') return !res.mode.isAbsurd;
    if (filter === 'absurd') return res.mode.isAbsurd;
    return true;
  });

  // Sort modes
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'time') return a.durationHours - b.durationHours;
    if (sortBy === 'cost') return a.costINR - b.costINR;
    if (sortBy === 'absurdity') return b.absurdityIndex - a.absurdityIndex;
    return 0;
  });

  return (
    <div className="space-y-4">
      {/* Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 rounded-2xl p-3 border border-slate-800">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-4 h-4 text-purple-400 mr-1" />
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filter === 'all'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All Modes ({modeResults.length})
          </button>
          <button
            onClick={() => setFilter('normal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filter === 'normal'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Normal (3)
          </button>
          <button
            onClick={() => setFilter('absurd')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filter === 'absurd'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Absurd (6)
          </button>
        </div>

        {/* Sort Select */}
        <div className="flex items-center space-x-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="time">Travel Time (Fastest First)</option>
            <option value="cost">Cost (Cheapest First)</option>
            <option value="absurdity">Absurdity Index (Highest First)</option>
          </select>
        </div>
      </div>

      {/* Mode Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((res) => (
          <ModeCard key={res.mode.id} result={res} />
        ))}
      </div>
    </div>
  );
};

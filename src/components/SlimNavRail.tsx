import React from 'react';
import { useRouteStore } from '../hooks/useRoute';
import { Menu, Compass, Bookmark, Clock } from 'lucide-react';

export const SlimNavRail: React.FC = () => {
  const { hasSearched, setHasSearched, loadPresetRoute } = useRouteStore();

  return (
    <aside
      className="w-16 flex flex-col items-center py-3 justify-between z-30 select-none shrink-0 h-full"
      style={{ backgroundColor: '#082028', borderRight: '2px solid #164e5e' }}
    >
      <div className="flex flex-col items-center space-y-5 w-full">
        {/* Top Hamburger / Logo */}
        <button
          onClick={() => setHasSearched(!hasSearched)}
          title="Toggle Directions"
          className="p-2.5 rounded-full hover:bg-cyan-900/40 text-cyan-300 hover:text-yellow-300 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Goober Maps Home Icon */}
        <button
          onClick={() => setHasSearched(false)}
          title="GooberMaps Home"
          className="w-10 h-10 rounded-full border-2 flex items-center justify-center hover:scale-110 transition"
          style={{ backgroundColor: '#0f4a5a', borderColor: '#22d3ee', color: '#22d3ee' }}
        >
          <Compass className="w-5 h-5" />
        </button>

        <hr style={{ borderColor: '#164e5e' }} className="w-8" />

        {/* Saved */}
        <button
          title="Saved Places"
          className="flex flex-col items-center text-[10px] transition space-y-1"
          style={{ color: '#67b5c5' }}
        >
          <Bookmark className="w-5 h-5" />
          <span>Saved</span>
        </button>

        {/* Recents */}
        <button
          title="Recent Searches"
          className="flex flex-col items-center text-[10px] transition space-y-1"
          style={{ color: '#67b5c5' }}
        >
          <Clock className="w-5 h-5" />
          <span>Recents</span>
        </button>

        <hr style={{ borderColor: '#164e5e' }} className="w-8" />

        {/* Preset Location Thumbnails */}
        <button
          onClick={() => loadPresetRoute(0)}
          title="Fort Kochi, Kerala"
          className="group relative flex flex-col items-center"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-md group-hover:scale-110 transition"
            style={{ background: 'linear-gradient(135deg, #0d9488, #22d3ee)' }}
          >
            🌴
          </div>
          <span className="text-[9px] mt-0.5 max-w-[50px] truncate" style={{ color: '#67b5c5' }}>Kochi</span>
        </button>

        <button
          onClick={() => loadPresetRoute(1)}
          title="NYC Times Square"
          className="group relative flex flex-col items-center"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-md group-hover:scale-110 transition"
            style={{ background: 'linear-gradient(135deg, #facc15, #f97316)' }}
          >
            🗽
          </div>
          <span className="text-[9px] mt-0.5 max-w-[50px] truncate" style={{ color: '#67b5c5' }}>NYC</span>
        </button>
      </div>
    </aside>
  );
};

import React from 'react';
import { useRouteStore } from '../hooks/useRoute';
import { Menu, Compass, Bookmark, Clock } from 'lucide-react';

export const SlimNavRail: React.FC = () => {
  const {
    hasSearched,
    setHasSearched,
    loadPresetRoute,
    activeNav,
    setActiveNav,
    savedRoutes,
    recentRoutes,
    loadSavedRoute,
    loadRecentRoute,
  } = useRouteStore();

  const items = activeNav === 'saved' ? savedRoutes : recentRoutes;

  return (
    <aside
      className={`flex flex-col items-center py-3 justify-between z-30 select-none shrink-0 h-full transition-all duration-200 ${activeNav ? 'w-56' : 'w-16'}`}
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
          onClick={() => setActiveNav(activeNav === 'saved' ? null : 'saved')}
          className="flex flex-col items-center text-[10px] transition space-y-1"
          style={{ color: activeNav === 'saved' ? '#a7f3d0' : '#67b5c5' }}
        >
          <Bookmark className="w-5 h-5" />
          <span>Saved</span>
        </button>

        {/* Recents */}
        <button
          title="Recent Searches"
          onClick={() => setActiveNav(activeNav === 'recents' ? null : 'recents')}
          className="flex flex-col items-center text-[10px] transition space-y-1"
          style={{ color: activeNav === 'recents' ? '#a7f3d0' : '#67b5c5' }}
        >
          <Clock className="w-5 h-5" />
          <span>Recents</span>
        </button>

        <hr style={{ borderColor: '#164e5e' }} className="w-8" />

        {activeNav && (
          <div className="w-full px-2 pb-2">
            <div className="rounded-xl border p-2" style={{ backgroundColor: '#0b3542', borderColor: '#164e5e' }}>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#67b5c5' }}>
                {activeNav === 'saved' ? 'Saved routes' : 'Recent searches'}
              </div>

              {items.length === 0 ? (
                <div className="text-[10px] leading-relaxed" style={{ color: '#67b5c5' }}>
                  {activeNav === 'saved' ? 'No saved routes yet.' : 'No recent searches yet.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((route) => (
                    <button
                      key={route.id}
                      onClick={() => {
                        if (activeNav === 'saved') {
                          loadSavedRoute(route.id);
                        } else {
                          loadRecentRoute(route.id);
                        }
                      }}
                      className="w-full rounded-lg px-2 py-2 text-left transition"
                      style={{ backgroundColor: '#0a2630', border: '1px solid #164e5e' }}
                    >
                      <div className="text-[10px] font-semibold truncate" style={{ color: '#facc15' }}>
                        {route.from.shortName}
                      </div>
                      <div className="text-[9px] mt-0.5 truncate" style={{ color: '#67b5c5' }}>
                        to {route.to.shortName}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

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

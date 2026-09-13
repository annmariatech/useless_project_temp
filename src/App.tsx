import { useEffect } from 'react';
import { useRouteStore } from './hooks/useRoute';
import { SlimNavRail } from './components/SlimNavRail';
import { GoogleMapsHeader } from './components/GoogleMapsHeader';
import { DirectionsSidebar } from './components/DirectionsSidebar';
import { MapView } from './components/MapView';

export function App() {
  const { hasSearched, requestUserLocation } = useRouteStore();

  // On initial website load: ask for location access
  useEffect(() => {
    requestUserLocation();
  }, [requestUserLocation]);

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans" style={{ backgroundColor: '#0b2e38', color: '#e2f5f1' }}>
      {/* Slim Icon Navigation Rail */}
      <SlimNavRail />

      {/* Conditional Layout: Landing Page vs Directions */}
      {!hasSearched ? (
        <div className="relative flex-1 h-full w-full">
          <GoogleMapsHeader />
          <MapView />
        </div>
      ) : (
        <div className="flex flex-1 h-full w-full overflow-hidden">
          <DirectionsSidebar />
          <div className="flex-1 h-full relative">
            <MapView />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

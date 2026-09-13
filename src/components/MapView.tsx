import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useRouteStore } from '../hooks/useRoute';
import { TRANSPORT_MODES } from '../lib/modes';
import { Navigation } from 'lucide-react';

// Custom Leaflet Icons — wacky teal theme
function createEmojiIcon(emoji: string, bgClass: string, isBig: boolean = false) {
  return L.divIcon({
    className: 'custom-emoji-icon',
    html: `<div style="
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${isBig ? '24px' : '18px'};
      width: ${isBig ? '44px' : '36px'};
      height: ${isBig ? '44px' : '36px'};
      background: ${bgClass};
      border: 3px solid #22d3ee;
      border-radius: 50%;
      box-shadow: 0 4px 14px rgba(0,0,0,0.6);
      transform: translate(-50%, -50%);
    ">${emoji}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

// Route Duration Callout Badges — wacky teal + yellow
function createRouteCalloutIcon(durationText: string, distanceKmText: string, emoji: string, isSelected: boolean) {
  return L.divIcon({
    className: 'custom-route-callout',
    html: `<div style="
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      background: ${isSelected ? '#facc15' : 'rgba(11, 46, 56, 0.92)'};
      color: ${isSelected ? '#0b2e38' : '#e2f5f1'};
      border: 2px solid ${isSelected ? '#f97316' : '#22d3ee'};
      border-radius: 12px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.5);
      font-family: 'Outfit', system-ui, sans-serif;
      font-size: 11px;
      font-weight: 800;
      white-space: nowrap;
      transform: translate(-50%, -100%);
    ">
      <span style="font-size: 14px;">${emoji}</span>
      <span style="color: ${isSelected ? '#0b2e38' : '#facc15'}; font-weight: 900;">${durationText}</span>
      <span style="opacity: 0.75; font-size: 10px; font-weight: 500;">${distanceKmText}</span>
    </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

// Map bounds adjuster
const MapBoundsAdjuster: React.FC<{
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
}> = ({ fromLat, fromLng, toLat, toLng }) => {
  const map = useMap();

  useEffect(() => {
    if (fromLat && fromLng && toLat && toLng) {
      const bounds = L.latLngBounds([fromLat, fromLng], [toLat, toLng]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    } else if (fromLat && fromLng) {
      map.setView([fromLat, fromLng], 13);
    }
  }, [fromLat, fromLng, toLat, toLng, map]);

  return null;
};

// Animated Emoji Avatar along route
const AnimatedEmojiAvatar: React.FC<{
  routeGeometry: [number, number][];
  emoji: string;
}> = ({ routeGeometry, emoji }) => {
  const [currentLatLng, setCurrentLatLng] = useState<[number, number] | null>(null);
  const animRef = useRef<number | null>(null);
  const progressRef = useRef<number>(0);

  useEffect(() => {
    if (!routeGeometry || routeGeometry.length < 2) return;
    progressRef.current = 0;
    let lastTime: number | null = null;
    const animationDuration = 8000;

    const animate = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const delta = timestamp - lastTime;
      lastTime = timestamp;
      progressRef.current += delta / animationDuration;
      if (progressRef.current >= 1) progressRef.current = 0;

      const totalSegments = routeGeometry.length - 1;
      const exactIndex = progressRef.current * totalSegments;
      const segIndex = Math.min(Math.floor(exactIndex), totalSegments - 1);
      const segFraction = exactIndex - segIndex;
      const p1 = routeGeometry[segIndex];
      const p2 = routeGeometry[segIndex + 1] || p1;
      const currentLat = p1[0] + (p2[0] - p1[0]) * segFraction;
      const currentLng = p1[1] + (p2[1] - p1[1]) * segFraction;
      setCurrentLatLng([currentLat, currentLng]);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [routeGeometry]);

  if (!currentLatLng) return null;

  return (
    <Marker
      position={currentLatLng}
      icon={createEmojiIcon(emoji, '#0f4a5a', true)}
      zIndexOffset={2000}
    >
      <Popup>
        <div className="text-xs font-semibold flex items-center gap-1" style={{ color: '#e2f5f1' }}>
          <span>{emoji}</span> Goober Avatar in Motion!
        </div>
      </Popup>
    </Marker>
  );
};

export const MapView: React.FC = () => {
  const {
    fromLocation,
    toLocation,
    modeResults,
    selectedModeId,
    setSelectedMode,
    requestUserLocation,
  } = useRouteStore();

  const selectedResult = modeResults.find((r) => r.mode.id === selectedModeId) || modeResults[0];
  const selectedMode = TRANSPORT_MODES.find((m) => m.id === selectedModeId) || TRANSPORT_MODES[0];
  const defaultCenter: [number, number] = fromLocation ? [fromLocation.lat, fromLocation.lng] : [9.9816, 76.2999];
  const routePolyline = selectedResult?.routeGeometry || [];
  const midIndex = Math.floor(routePolyline.length / 2);
  const routeMidPoint = routePolyline[midIndex];

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden select-none">
      <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsAdjuster
          fromLat={fromLocation?.lat}
          fromLng={fromLocation?.lng}
          toLat={toLocation?.lat}
          toLng={toLocation?.lng}
        />

        {fromLocation && (
          <Marker position={[fromLocation.lat, fromLocation.lng]} icon={createEmojiIcon('🟢', '#0d9488')}>
            <Popup>
              <div className="text-xs">
                <strong style={{ color: '#34d399' }}>Start:</strong> {fromLocation.shortName}
              </div>
            </Popup>
          </Marker>
        )}

        {toLocation && (
          <Marker position={[toLocation.lat, toLocation.lng]} icon={createEmojiIcon('🔴', '#dc2626')}>
            <Popup>
              <div className="text-xs">
                <strong style={{ color: '#f4364c' }}>Destination:</strong> {toLocation.shortName}
              </div>
            </Popup>
          </Marker>
        )}

        {routePolyline.length > 0 && (
          <Polyline
            positions={routePolyline}
            pathOptions={{
              color: selectedMode.straightLineOnly ? '#facc15' : '#22d3ee',
              weight: 6,
              opacity: 0.9,
              dashArray: selectedMode.straightLineOnly ? '8, 8' : undefined,
            }}
          />
        )}

        {routeMidPoint && selectedResult && (
          <Marker
            position={routeMidPoint}
            icon={createRouteCalloutIcon(
              selectedResult.durationFormatted,
              `${selectedResult.distanceKm.toFixed(1)} km`,
              selectedMode.emoji,
              true
            )}
            zIndexOffset={1500}
          />
        )}

        {modeResults.slice(0, 3).map((res) => {
          if (res.mode.id === selectedModeId || !res.routeGeometry.length) return null;
          const mid = res.routeGeometry[Math.floor(res.routeGeometry.length / 2)];
          if (!mid) return null;
          return (
            <Marker
              key={`callout-${res.mode.id}`}
              position={mid}
              eventHandlers={{ click: () => setSelectedMode(res.mode.id) }}
              icon={createRouteCalloutIcon(res.durationFormatted, `${res.distanceKm.toFixed(1)} km`, res.mode.emoji, false)}
              zIndexOffset={1200}
            />
          );
        })}

        {routePolyline.length > 1 && (
          <AnimatedEmojiAvatar routeGeometry={routePolyline} emoji={selectedMode.emoji} />
        )}
      </MapContainer>

      {/* Bottom Right Re-center Button */}
      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={requestUserLocation}
          title="Re-center to my location"
          className="w-11 h-11 rounded-full shadow-2xl transition flex items-center justify-center backdrop-blur-md"
          style={{ backgroundColor: 'rgba(11, 46, 56, 0.9)', border: '2px solid #22d3ee' }}
        >
          <Navigation className="w-5 h-5" style={{ color: '#22d3ee', fill: '#22d3ee' }} />
        </button>
      </div>
    </div>
  );
};

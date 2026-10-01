import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { rivergateWards } from '../../data/rivergate';
import { ExternalLink, Satellite, Radio, MapPin } from 'lucide-react';
import { playClickSound } from '../../utils/soundEffects';

const wardCoordinates: Record<string, { lat: number; lng: number }> = {
  ward_1: { lat: 18.9220, lng: 72.8347 },
  ward_2: { lat: 18.9280, lng: 72.8310 },
  ward_3: { lat: 18.9340, lng: 72.8360 },
  ward_4: { lat: 18.9400, lng: 72.8390 },
  ward_5: { lat: 18.9450, lng: 72.8420 },
  ward_6: { lat: 18.9500, lng: 72.8460 },
  ward_7: { lat: 18.9550, lng: 72.8500 },
  ward_8: { lat: 18.9600, lng: 72.8550 },
  ward_9: { lat: 18.9650, lng: 72.8590 },
  ward_10: { lat: 18.9700, lng: 72.8630 },
  ward_11: { lat: 18.9750, lng: 72.8670 },
  ward_12: { lat: 18.9800, lng: 72.8710 },
};

export const GoogleMapsView: React.FC = () => {
  const { selectedWardId, setSelectedWardId, graph } = useAppStore();
  const [mapType, setMapType] = useState<'k' | 'm'>('k'); // k: satellite, m: map/terrain

  const ward = rivergateWards.find(w => w.id === selectedWardId) || rivergateWards[0];
  const coords = wardCoordinates[ward.id] || { lat: 18.9220, lng: 72.8347 };

  const embedUrl = `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&t=${mapType}&z=15&ie=UTF8&iwloc=&output=embed`;
  const externalUrl = `https://www.google.com/maps/@${coords.lat},${coords.lng},15z`;

  return (
    <div className="space-y-3">
      {/* Sub-toolbar for map controls and ward quick select */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Satellite className="w-4 h-4 text-accent animate-pulse" />
          <span className="text-text font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-accent" />
            Ward {ward.number}: {ward.name}
          </span>
          <span className="text-text-2 text-[11px] font-mono">
            ({coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Ward Jump Selector */}
          <select
            value={ward.id}
            onChange={(e) => {
              playClickSound();
              setSelectedWardId(e.target.value);
            }}
            className="px-2 py-1 rounded-control bg-surface-2 border border-line text-text text-xs focus:outline-none"
            aria-label="Select ward for satellite view"
          >
            {rivergateWards.map(w => (
              <option key={w.id} value={w.id}>
                W{w.number} - {w.name}
              </option>
            ))}
          </select>

          {/* Satellite vs Terrain toggle */}
          <div className="flex bg-surface-2 p-0.5 rounded-pill border border-line text-[11px]">
            <button
              onClick={() => { playClickSound(); setMapType('k'); }}
              className={`px-2.5 py-1 rounded-pill transition-colors ${
                mapType === 'k' ? 'bg-accent text-bg font-semibold' : 'text-text-2 hover:text-text'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => { playClickSound(); setMapType('m'); }}
              className={`px-2.5 py-1 rounded-pill transition-colors ${
                mapType === 'm' ? 'bg-accent text-bg font-semibold' : 'text-text-2 hover:text-text'
              }`}
            >
              Terrain
            </button>
          </div>

          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-control bg-surface-2 hover:bg-surface border border-line text-text-2 hover:text-text text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Google Maps</span>
          </a>
        </div>
      </div>

      {/* Embedded Satellite Map Container */}
      <div className="relative aspect-[4/3] w-full rounded-control overflow-hidden border border-line bg-surface-2">
        <iframe
          key={`${ward.id}-${mapType}`}
          title={`Google Maps Satellite View of ${ward.name}`}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={embedUrl}
          className="w-full h-full opacity-95 hover:opacity-100 transition-opacity"
        />

        {/* Live Satellite Feed Badge */}
        <div className="absolute top-3 left-3 p-2.5 rounded-control bg-surface/90 backdrop-blur-md border border-line text-xs space-y-1 max-w-xs shadow-calm pointer-events-none">
          <div className="flex items-center gap-1.5 text-accent font-semibold text-[11px]">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Satellite Feed Active</span>
          </div>
          <p className="text-[11px] text-text-2">
            Inspecting <strong className="text-text">{ward.name}</strong> • Elevation: {ward.elevation}m • Water level:{' '}
            <strong className="text-text">{graph.wardRisks[selectedWardId]?.waterLevelMeters || 0.3}m</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

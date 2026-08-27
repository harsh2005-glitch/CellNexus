import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fly to selected tower
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0]) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
};

const STATUS_CFG = {
  GOOD:     { color: '#059669', glow: 'rgba(5,150,105,0.55)',   ring: 'rgba(5,150,105,0.25)'   },
  DEGRADED: { color: '#D97706', glow: 'rgba(217,119,6,0.55)',   ring: 'rgba(217,119,6,0.25)'   },
  OFFLINE:  { color: '#DC2626', glow: 'rgba(220,38,38,0.55)',   ring: 'rgba(220,38,38,0.25)'   },
};

const getStatusCfg = (status) => STATUS_CFG[status] || STATUS_CFG.GOOD;

// Cell-tower SVG icon — matches landing page style
const createCustomIcon = (status, isSelected) => {
  const { color } = getStatusCfg(status);
  const size = isSelected ? 56 : 48;
  const half = size / 2;

  const html = `
    <div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;">
      <!-- Ring 3 -->
      <span style="position:absolute;width:${size}px;height:${size}px;border-radius:50%;border:1.5px solid ${color};opacity:0.20;animation:landingRing3 3s ease-out infinite;"></span>
      <!-- Ring 2 -->
      <span style="position:absolute;width:${size * 0.67}px;height:${size * 0.67}px;border-radius:50%;border:1.5px solid ${color};opacity:0.35;animation:landingRing2 3s ease-out 0.6s infinite;"></span>
      <!-- Inner glow -->
      <span style="position:absolute;width:${size * 0.42}px;height:${size * 0.42}px;border-radius:50%;background:${color};opacity:0.18;animation:landingPing 2s cubic-bezier(0,0,0.2,1) infinite;"></span>
      <!-- Tower SVG -->
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="position:relative;filter:drop-shadow(0 0 5px ${color});">
        <path d="M12 2 L10 22 L14 22 Z" fill="${color}" opacity="0.95"/>
        <line x1="8" y1="8" x2="16" y2="8" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="9" y1="13" x2="15" y2="13" stroke="${color}" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M5 5 Q12 1 19 5" stroke="${color}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.75"/>
        <path d="M3 3 Q12 -1 21 3" stroke="${color}" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.40"/>
        <circle cx="12" cy="22" r="1.5" fill="${color}"/>
      </svg>
      ${isSelected ? `<span style="position:absolute;inset:-4px;border-radius:50%;border:2px solid ${color};opacity:0.60;"></span>` : ''}
    </div>
  `;

  return L.divIcon({
    className: 'bg-transparent',
    html,
    iconSize: [size, size],
    iconAnchor: [half, half],
  });
};

const MapView = ({ towers, selectedTower, onSelectTower }) => {
  const defaultCenter = [20.5937, 78.9629];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={5}
        style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
      >
        {/* ── CartoDB Dark Matter — 100% free, no API key needed ── */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
        />

        {towers.map(tower => {
          const isSelected = selectedTower?.id === tower.id;
          const cfg = getStatusCfg(tower.status);

          return (
            <React.Fragment key={tower.id}>
              {/* Outer faint coverage zone */}
              <Circle
                center={[Number(tower.latitude), Number(tower.longitude)]}
                pathOptions={{
                  color: cfg.color,
                  fillColor: cfg.color,
                  fillOpacity: isSelected ? 0.12 : 0.06,
                  weight: isSelected ? 2 : 1.5,
                  dashArray: '6 4',
                }}
                radius={
                  tower.status === 'GOOD'     ? tower.coverageRadius :
                  tower.status === 'DEGRADED' ? tower.coverageRadius * 0.6 :
                  tower.coverageRadius * 0.15
                }
              />
              {/* Inner solid core zone */}
              <Circle
                center={[Number(tower.latitude), Number(tower.longitude)]}
                pathOptions={{
                  color: cfg.color,
                  fillColor: cfg.color,
                  fillOpacity: isSelected ? 0.22 : 0.14,
                  weight: isSelected ? 2.5 : 1.5,
                }}
                radius={
                  (tower.status === 'GOOD'     ? tower.coverageRadius :
                   tower.status === 'DEGRADED' ? tower.coverageRadius * 0.6 :
                   tower.coverageRadius * 0.15) * 0.40
                }
              />

              {/* Tower Marker */}
              <Marker
                position={[Number(tower.latitude), Number(tower.longitude)]}
                icon={createCustomIcon(tower.status, isSelected)}
                eventHandlers={{ click: () => onSelectTower(tower) }}
              >
                {isSelected && (
                  <Popup className="glass-popup">
                    <div style={{ fontWeight: '700', color: '#1E1B4B', fontSize: '0.85rem' }}>
                      {tower.locationName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#6B7DB3', marginTop: '3px' }}>
                      {tower.operatorName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#6B7DB3' }}>
                      Radius: {tower.coverageRadius}m
                    </div>
                  </Popup>
                )}
              </Marker>
            </React.Fragment>
          );
        })}

        {/* Fly to selected tower */}
        {selectedTower && (
          <ChangeView
            center={[selectedTower.latitude, selectedTower.longitude]}
            zoom={14}
          />
        )}
      </MapContainer>

      {/* Keyframes for marker animations */}
      <style>{`
        @keyframes landingPing {
          0%   { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes landingRing2 {
          0%   { transform: scale(0.6); opacity: 0.5; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes landingRing3 {
          0%   { transform: scale(0.4); opacity: 0.3; }
          100% { transform: scale(2.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default MapView;

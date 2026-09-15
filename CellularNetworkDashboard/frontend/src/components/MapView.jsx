import React, { useCallback, useRef, useEffect, useState } from 'react';
import {
  GoogleMap,
  OverlayView,
  Circle,
  InfoWindow,
} from '@react-google-maps/api';

// ─── Config ────────────────────────────────────────────────────────────────
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };

const STATUS_CFG = {
  GOOD:     { color: '#059669', glow: 'rgba(5,150,105,0.55)',  ring: 'rgba(5,150,105,0.25)'  },
  DEGRADED: { color: '#D97706', glow: 'rgba(217,119,6,0.55)',  ring: 'rgba(217,119,6,0.25)'  },
  OFFLINE:  { color: '#DC2626', glow: 'rgba(220,38,38,0.55)',  ring: 'rgba(220,38,38,0.25)'  },
};

const getStatusCfg = (status) => STATUS_CFG[status] || STATUS_CFG.GOOD;

// ─── Dark Map Style ─────────────────────────────────────────────────────────
const DARK_STYLE = [
  { elementType: 'geometry',           stylers: [{ color: '#0f0f1a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f0f1a' }] },
  { elementType: 'labels.text.fill',   stylers: [{ color: '#4a5568' }] },
  { featureType: 'administrative',       elementType: 'geometry.stroke',    stylers: [{ color: '#1e2040' }] },
  { featureType: 'administrative.country', elementType: 'geometry',         stylers: [{ color: '#2d3561' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#6b7db3' }] },
  { featureType: 'poi',                  elementType: 'labels',             stylers: [{ visibility: 'off' }] },
  { featureType: 'road',                 elementType: 'geometry',           stylers: [{ color: '#1a1f3a' }] },
  { featureType: 'road',                 elementType: 'geometry.stroke',    stylers: [{ color: '#212a45' }] },
  { featureType: 'road',                 elementType: 'labels.text.fill',   stylers: [{ color: '#3d4f7c' }] },
  { featureType: 'road.highway',         elementType: 'geometry',           stylers: [{ color: '#1e2a4a' }] },
  { featureType: 'road.highway',         elementType: 'geometry.stroke',    stylers: [{ color: '#2a3a6a' }] },
  { featureType: 'road.highway',         elementType: 'labels.text.fill',   stylers: [{ color: '#5a6ea0' }] },
  { featureType: 'transit',             elementType: 'geometry',           stylers: [{ color: '#141824' }] },
  { featureType: 'transit.station',     elementType: 'labels.text.fill',   stylers: [{ color: '#4a5a8a' }] },
  { featureType: 'water',               elementType: 'geometry',           stylers: [{ color: '#070b14' }] },
  { featureType: 'water',               elementType: 'labels.text.fill',   stylers: [{ color: '#1a2a4a' }] },
  { featureType: 'water',               elementType: 'labels.text.stroke', stylers: [{ color: '#070b14' }] },
];

const MAP_OPTIONS = {
  styles: DARK_STYLE,
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
};

// ─── Animated SVG Tower Marker (rendered via OverlayView) ──────────────────
const TowerMarker = ({ tower, isSelected, onClick }) => {
  const { color } = getStatusCfg(tower.status);
  const size = isSelected ? 56 : 48;
  const half = size / 2;

  return (
    <OverlayView
      position={{ lat: Number(tower.latitude), lng: Number(tower.longitude) }}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={() => ({ x: -half, y: -half })}
    >
      <div
        onClick={onClick}
        style={{
          width: size,
          height: size,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        {/* Ring 3 */}
        <span style={{
          position: 'absolute', width: size, height: size, borderRadius: '50%',
          border: `1.5px solid ${color}`, opacity: 0.20,
          animation: 'landingRing3 3s ease-out infinite',
        }} />
        {/* Ring 2 */}
        <span style={{
          position: 'absolute', width: size * 0.67, height: size * 0.67, borderRadius: '50%',
          border: `1.5px solid ${color}`, opacity: 0.35,
          animation: 'landingRing2 3s ease-out 0.6s infinite',
        }} />
        {/* Inner glow */}
        <span style={{
          position: 'absolute', width: size * 0.42, height: size * 0.42, borderRadius: '50%',
          background: color, opacity: 0.18,
          animation: 'landingPing 2s cubic-bezier(0,0,0.2,1) infinite',
        }} />
        {/* Tower SVG */}
        <svg
          width="22" height="22" viewBox="0 0 24 24" fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'relative', filter: `drop-shadow(0 0 5px ${color})` }}
        >
          <path d="M12 2 L10 22 L14 22 Z" fill={color} opacity="0.95" />
          <line x1="8" y1="8" x2="16" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="9" y1="13" x2="15" y2="13" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M5 5 Q12 1 19 5" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.75" />
          <path d="M3 3 Q12 -1 21 3" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.40" />
          <circle cx="12" cy="22" r="1.5" fill={color} />
        </svg>
        {/* Selected ring */}
        {isSelected && (
          <span style={{
            position: 'absolute', inset: -4, borderRadius: '50%',
            border: `2px solid ${color}`, opacity: 0.60,
          }} />
        )}
      </div>
    </OverlayView>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const MapView = ({ towers, selectedTower, onSelectTower, isLoaded }) => {
  const mapRef = useRef(null);
  const [infoTower, setInfoTower] = useState(null);

  // Pan / zoom to selected tower
  useEffect(() => {
    if (selectedTower && mapRef.current) {
      mapRef.current.panTo({ lat: Number(selectedTower.latitude), lng: Number(selectedTower.longitude) });
      mapRef.current.setZoom(14);
      setInfoTower(selectedTower);
    }
  }, [selectedTower]);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handleMarkerClick = (tower) => {
    onSelectTower(tower);
    setInfoTower(tower);
  };

  if (!isLoaded) {
    return (
      <div style={{
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0f0f1a', borderRadius: '0.75rem', color: '#6b7db3',
        fontSize: '0.85rem', flexDirection: 'column', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid #2d3561', borderTopColor: '#6366f1',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span>Loading Google Maps…</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', zIndex: 0, borderRadius: '0.75rem', overflow: 'hidden' }}>
      {/* Keyframe styles */}
      <style>{`
        @keyframes landingPing  { 0%{transform:scale(0.8);opacity:0.6} 100%{transform:scale(2.2);opacity:0} }
        @keyframes landingRing2 { 0%{transform:scale(0.6);opacity:0.5} 100%{transform:scale(1.8);opacity:0} }
        @keyframes landingRing3 { 0%{transform:scale(0.4);opacity:0.3} 100%{transform:scale(2.4);opacity:0} }
        @keyframes spin         { to{transform:rotate(360deg)} }
        .gm-info-window-content { background:transparent!important; padding:0!important; border:none!important; box-shadow:none!important; }
        .gm-style-iw-d          { overflow:hidden!important; }
        .gm-style-iw-c          { background:rgba(15,15,30,0.92)!important; border:1px solid rgba(99,102,241,0.3)!important; border-radius:12px!important; padding:0!important; box-shadow:0 8px 32px rgba(0,0,0,0.6)!important; }
        .gm-style-iw-t::after   { background:rgba(15,15,30,0.92)!important; }
        .gm-style-iw-tc::after  { background:rgba(15,15,30,0.92)!important; }
        button.gm-ui-hover-effect { top:4px!important; right:4px!important; }
        button.gm-ui-hover-effect img { filter:invert(1)!important; }
      `}</style>

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={INDIA_CENTER}
        zoom={5}
        options={MAP_OPTIONS}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {towers.map((tower) => {
          const isSelected = selectedTower?.id === tower.id;
          const cfg = getStatusCfg(tower.status);
          const coverageActual =
            tower.status === 'GOOD'     ? tower.coverageRadius :
            tower.status === 'DEGRADED' ? tower.coverageRadius * 0.6 :
            tower.coverageRadius * 0.15;

          return (
            <React.Fragment key={tower.id}>
              {/* Outer faint coverage zone */}
              <Circle
                center={{ lat: Number(tower.latitude), lng: Number(tower.longitude) }}
                radius={coverageActual}
                options={{
                  strokeColor: cfg.color,
                  strokeOpacity: isSelected ? 0.6 : 0.4,
                  strokeWeight: isSelected ? 2 : 1.5,
                  fillColor: cfg.color,
                  fillOpacity: isSelected ? 0.12 : 0.06,
                  strokeDasharray: '6 4',
                }}
              />
              {/* Inner solid core zone */}
              <Circle
                center={{ lat: Number(tower.latitude), lng: Number(tower.longitude) }}
                radius={coverageActual * 0.40}
                options={{
                  strokeColor: cfg.color,
                  strokeOpacity: isSelected ? 0.8 : 0.5,
                  strokeWeight: isSelected ? 2.5 : 1.5,
                  fillColor: cfg.color,
                  fillOpacity: isSelected ? 0.22 : 0.14,
                }}
              />
              {/* Animated tower marker */}
              <TowerMarker
                tower={tower}
                isSelected={isSelected}
                onClick={() => handleMarkerClick(tower)}
              />
            </React.Fragment>
          );
        })}

        {/* Info window for selected tower */}
        {infoTower && (
          <InfoWindow
            position={{ lat: Number(infoTower.latitude), lng: Number(infoTower.longitude) }}
            onCloseClick={() => setInfoTower(null)}
          >
            <div style={{
              padding: '12px 16px',
              minWidth: 160,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: getStatusCfg(infoTower.status).color,
                  boxShadow: `0 0 6px ${getStatusCfg(infoTower.status).color}`,
                  flexShrink: 0,
                }} />
                <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.88rem' }}>
                  {infoTower.locationName}
                </span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: 4 }}>
                📡 {infoTower.operatorName}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: 4 }}>
                📶 Status: <span style={{ color: getStatusCfg(infoTower.status).color, fontWeight: 600 }}>
                  {infoTower.status}
                </span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                🔵 Radius: {infoTower.coverageRadius}m
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 24, right: 12, zIndex: 10,
        background: 'rgba(15,15,30,0.88)',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: 10, padding: '8px 14px',
        display: 'flex', flexDirection: 'column', gap: 6,
        backdropFilter: 'blur(12px)',
      }}>
        {Object.entries(STATUS_CFG).map(([label, { color }]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 9, height: 9, borderRadius: '50%',
              background: color, boxShadow: `0 0 6px ${color}`,
            }} />
            <span style={{ color: '#cbd5e1', fontSize: '0.70rem', fontWeight: 600, letterSpacing: '0.05em' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapView;

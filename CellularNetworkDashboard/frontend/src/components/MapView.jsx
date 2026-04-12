import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// A custom component to fly the map to the selected tower
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0]) {
      map.flyTo(center, zoom, {
        duration: 1.5,
      });
    }
  }, [center, zoom, map]);
  return null;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'GOOD': return '#10B981'; // Emerald
    case 'DEGRADED': return '#F59E0B'; // Amber
    case 'OFFLINE': return '#EF4444'; // Red
    default: return '#3B82F6';
  }
};

const MapView = ({ towers, selectedTower, onSelectTower }) => {
  const defaultCenter = [20.5937, 78.9629]; // Center of India for widespread towers

  // Custom HTML Icon for Map Markers (giving it a premium look)
  const createCustomIcon = (status, isSelected) => {
    const color = getStatusColor(status);
    const scale = isSelected ? 'scale-125 select-glow' : '';
    const html = `
      <div class="relative flex items-center justify-center w-6 h-6 ${scale} transition-transform duration-300">
        <span class="absolute inline-flex h-full w-full rounded-full opacity-30 animate-ping saturate-200" style="background-color: ${color}"></span>
        <span class="relative inline-flex rounded-full h-4 w-4 border-2 border-white/80 shadow-lg" style="background-color: ${color}"></span>
      </div>
    `;

    return L.divIcon({
      className: 'bg-transparent',
      html,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={5}
        style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
      >
        {/* Dark theme map tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {towers.map(tower => {
          const isSelected = selectedTower?.id === tower.id;
          const statusIcon = createCustomIcon(tower.status, isSelected);

          return (
            <React.Fragment key={tower.id}>
              {/* Coverage Radius Circle / Heatmap Effect */}
              <Circle
                center={[Number(tower.latitude), Number(tower.longitude)]}
                pathOptions={{
                  color: tower.status === 'GOOD' ? '#10b981' : (tower.status === 'DEGRADED' ? '#f59e0b' : '#ef4444'),
                  fillColor: tower.status === 'GOOD' ? '#10b981' : (tower.status === 'DEGRADED' ? '#f59e0b' : '#ef4444'),
                  fillOpacity: isSelected ? 0.3 : 0.1,
                  weight: isSelected ? 2 : 1,
                  className: 'transition-all duration-1000 ease-in-out'
                }}
                radius={
                  tower.status === 'GOOD' 
                    ? tower.coverageRadius 
                    : tower.status === 'DEGRADED' 
                      ? tower.coverageRadius * 0.6 
                      : tower.coverageRadius * 0.15
                }
              />

              {/* Tower Marker */}
              <Marker
                position={[Number(tower.latitude), Number(tower.longitude)]}
                icon={createCustomIcon(tower.status, isSelected)}
                eventHandlers={{
                  click: () => onSelectTower(tower),
                }}
              >
                {isSelected && (
                  <Popup className="glass-popup">
                    <div className="font-semibold text-slate-100">{tower.locationName}</div>
                    <div className="text-xs text-slate-400 mt-1">Operator: {tower.operatorName}</div>
                    <div className="text-xs text-slate-400">Radius: {tower.coverageRadius}m</div>
                  </Popup>
                )}
              </Marker>
            </React.Fragment>
          );
        })}

        {/* Change view on select */}
        {selectedTower && (
          <ChangeView
            center={[selectedTower.latitude, selectedTower.longitude]}
            zoom={14}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;

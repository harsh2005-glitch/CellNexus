import React from 'react';
import { motion } from 'framer-motion';
import { SignalHigh, SignalMedium, SignalLow, RadioTower } from 'lucide-react';

const TowerList = ({ towers, selectedTower, onSelectTower }) => {

  const getSignalIcon = (status) => {
    switch (status) {
      case 'GOOD':     return <SignalHigh   size={17} color="#059669" />;
      case 'DEGRADED': return <SignalMedium size={17} color="#D97706" />;
      case 'OFFLINE':  return <SignalLow    size={17} color="#DC2626" />;
      default:         return <SignalHigh   size={17} color="#059669" />;
    }
  };

  const getStatusBadge = (status) => {
    const cfg = {
      GOOD:     { bg: 'rgba(5,150,105,0.12)',  border: 'rgba(5,150,105,0.28)',  color: '#065F46', label: 'Good'     },
      DEGRADED: { bg: 'rgba(217,119,6,0.10)',  border: 'rgba(217,119,6,0.28)',  color: '#92400E', label: 'Degraded' },
      OFFLINE:  { bg: 'rgba(220,38,38,0.10)',  border: 'rgba(220,38,38,0.25)',  color: '#7F1D1D', label: 'Offline'  },
    };
    const s = cfg[status];
    if (!s) return null;
    return (
      <span style={{
        background: s.bg, border: `1px solid ${s.border}`, color: s.color,
        padding: '2px 9px', borderRadius: '999px', fontSize: '0.65rem', fontWeight: '700',
      }}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search Input */}
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Search tower ID or location..."
          style={{
            width: '100%', padding: '8px 12px', borderRadius: '10px', fontSize: '0.82rem',
            background: 'rgba(255,255,255,0.80)', border: '1px solid rgba(99,102,241,0.22)',
            color: '#1E1B4B', outline: 'none', transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = '#4F46E5'}
          onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.22)'}
        />
      </div>

      <div className="overflow-y-auto flex-1 pr-1" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {towers.length === 0 && (
          <div style={{ textAlign: 'center', color: '#6B7DB3', padding: '16px', fontSize: '0.82rem' }}>
            Loading towers...
          </div>
        )}

        {towers.map((tower, idx) => {
          const isSelected = selectedTower?.id === tower.id;
          return (
            <motion.div
              key={tower.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
              onClick={() => onSelectTower(tower)}
              style={{
                padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(79,70,229,0.14) 0%, rgba(124,58,237,0.10) 100%)'
                  : 'rgba(255,255,255,0.70)',
                border: isSelected
                  ? '1px solid rgba(79,70,229,0.40)'
                  : '1px solid rgba(99,102,241,0.14)',
                boxShadow: isSelected
                  ? '0 2px 12px rgba(79,70,229,0.15)'
                  : '0 1px 4px rgba(79,70,229,0.05)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.28)';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.70)';
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.14)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                  background: isSelected ? 'rgba(79,70,229,0.15)' : 'rgba(99,102,241,0.08)',
                  border: `1px solid ${isSelected ? 'rgba(79,70,229,0.40)' : 'rgba(99,102,241,0.20)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <RadioTower size={15} color={isSelected ? '#4F46E5' : '#8B84B8'} />
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#1E1B4B', fontSize: '0.83rem' }}>{tower.locationName}</div>
                  <div style={{ fontSize: '0.70rem', color: '#6B7DB3', marginTop: '1px' }}>{tower.operatorName}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getSignalIcon(tower.status)}
                {getStatusBadge(tower.status)}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TowerList;

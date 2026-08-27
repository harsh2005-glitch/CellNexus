import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RadioTower, MapPin, Activity, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';

const TowerDetail = ({ tower, onBack }) => {
  if (!tower) return null;

  const statusConfig = {
    GOOD:     { icon: <CheckCircle2 size={18} color="#059669" />, label: 'Good',     bg: 'rgba(5,150,105,0.10)',  border: 'rgba(5,150,105,0.30)',  text: '#065F46' },
    DEGRADED: { icon: <Activity    size={18} color="#D97706" />, label: 'Degraded', bg: 'rgba(217,119,6,0.10)',  border: 'rgba(217,119,6,0.30)',  text: '#92400E' },
    OFFLINE:  { icon: <ShieldAlert  size={18} color="#DC2626" />, label: 'Offline',  bg: 'rgba(220,38,38,0.10)', border: 'rgba(220,38,38,0.30)', text: '#7F1D1D' },
  };
  const s = statusConfig[tower.status] || statusConfig.GOOD;

  const Row = ({ label, value, icon }) => (
    <div style={{
      padding: '12px 16px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      borderBottom: '1px solid rgba(99,102,241,0.12)',
    }}>
      <span style={{ color: '#6B7DB3', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
        {icon}{label}
      </span>
      <span style={{ color: '#1E1B4B', fontSize: '0.85rem', fontWeight: '600', textAlign: 'right' }}>{value}</span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      {/* Header with Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <button
          onClick={onBack}
          style={{
            padding: '7px', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.25)',
            background: 'rgba(99,102,241,0.08)', color: '#4F46E5', cursor: 'pointer',
            display: 'flex', alignItems: 'center', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.18)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
        >
          <ArrowLeft size={16} />
        </button>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#4F46E5', margin: 0 }}>
          Tower Details
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-1" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Core Info */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(255,255,255,0.85) 100%)',
          border: '1px solid rgba(99,102,241,0.22)', borderRadius: '12px', padding: '14px 16px',
          boxShadow: '0 2px 10px rgba(79,70,229,0.07)',
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(124,58,237,0.18))',
            border: '1.5px solid rgba(99,102,241,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(99,102,241,0.15)',
          }}>
            <RadioTower size={22} color="#4F46E5" />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1E1B4B' }}>{tower.locationName}</div>
            <div style={{ fontSize: '0.78rem', color: '#6B7DB3', fontWeight: '500', marginTop: '2px' }}>{tower.operatorName} Network</div>
          </div>
        </div>

        {/* Status */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(255,255,255,0.85) 100%)',
          border: '1px solid rgba(99,102,241,0.18)', borderRadius: '12px', padding: '12px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ color: '#6B7DB3', fontSize: '0.82rem', fontWeight: '600' }}>Operational Status</span>
          <span style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 14px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: '700',
            background: s.bg, border: `1px solid ${s.border}`, color: s.text,
          }}>
            {s.icon}{s.label}
          </span>
        </div>

        {/* Details List */}
        <div style={{
          background: 'rgba(255,255,255,0.80)',
          border: '1px solid rgba(99,102,241,0.18)', borderRadius: '12px', overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(79,70,229,0.06)',
        }}>
          <Row label="Tower ID" value={
            <span style={{ fontFamily: 'monospace', background: 'rgba(79,70,229,0.10)', color: '#4F46E5', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700' }}>
              T-{tower.cid}
            </span>
          } />
          <Row
            label="Coordinates" icon={<MapPin size={14} color="#6B7DB3" />}
            value={`${Number(tower.latitude).toFixed(4)}, ${Number(tower.longitude).toFixed(4)}`}
          />
          {tower.radio && <Row label="Radio Technology" value={
            <span style={{ background: 'rgba(8,145,178,0.12)', color: '#0E7490', padding: '2px 10px', borderRadius: '6px', fontWeight: '700', fontSize: '0.8rem' }}>
              {tower.radio}
            </span>
          } />}
          {(tower.mcc || tower.mnc) && (
            <Row label="Network Code" value={`MCC ${tower.mcc || 'N/A'}, MNC ${tower.mnc || 'N/A'}`} />
          )}
          <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#6B7DB3', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={14} color="#6B7DB3" />Coverage Radius
            </span>
            <span style={{ color: '#1E1B4B', fontSize: '0.85rem', fontWeight: '600' }}>{tower.coverageRadius} m</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default TowerDetail;

import React from 'react';
import { Activity, Upload, ArrowDown, Radio, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const CARD_STYLES = {
  indigo: {
    iconColor: '#4F46E5',
    gradientBg: 'linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(255,255,255,0.85) 100%)',
    borderColor: 'rgba(99,102,241,0.30)',
    glowColor: 'rgba(99,102,241,0.12)',
    shadowColor: 'rgba(99,102,241,0.18)',
    valueColor: '#1E1B4B',
  },
  emerald: {
    iconColor: '#059669',
    gradientBg: 'linear-gradient(135deg, rgba(5,150,105,0.09) 0%, rgba(255,255,255,0.85) 100%)',
    borderColor: 'rgba(5,150,105,0.28)',
    glowColor: 'rgba(5,150,105,0.12)',
    shadowColor: 'rgba(5,150,105,0.18)',
    valueColor: '#064E3B',
  },
  cyan: {
    iconColor: '#0891B2',
    gradientBg: 'linear-gradient(135deg, rgba(8,145,178,0.10) 0%, rgba(255,255,255,0.85) 100%)',
    borderColor: 'rgba(8,145,178,0.28)',
    glowColor: 'rgba(8,145,178,0.12)',
    shadowColor: 'rgba(8,145,178,0.18)',
    valueColor: '#164E63',
  },
  violet: {
    iconColor: '#7C3AED',
    gradientBg: 'linear-gradient(135deg, rgba(124,58,237,0.10) 0%, rgba(255,255,255,0.85) 100%)',
    borderColor: 'rgba(124,58,237,0.28)',
    glowColor: 'rgba(124,58,237,0.12)',
    shadowColor: 'rgba(124,58,237,0.18)',
    valueColor: '#2E1065',
  },
  blue: {
    iconColor: '#2563EB',
    gradientBg: 'linear-gradient(135deg, rgba(37,99,235,0.09) 0%, rgba(255,255,255,0.85) 100%)',
    borderColor: 'rgba(37,99,235,0.25)',
    glowColor: 'rgba(37,99,235,0.12)',
    shadowColor: 'rgba(37,99,235,0.18)',
    valueColor: '#1E3A8A',
  },
};

const MetricCard = ({ title, value, icon: Icon, delay, color = 'blue', isTesting = false }) => {
  const s = CARD_STYLES[color] || CARD_STYLES.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '1.25rem',
        borderRadius: '1rem',
        background: s.gradientBg,
        border: `1px solid ${isTesting ? s.borderColor : 'rgba(99,102,241,0.14)'}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: isTesting
          ? `0 8px 32px rgba(0,0,0,0.08), 0 0 20px ${s.glowColor}`
          : '0 2px 12px rgba(79,70,229,0.06), 0 0 0 1px rgba(255,255,255,0.80) inset',
        transition: 'all 0.3s ease',
        cursor: 'default',
      }}
      whileHover={{
        boxShadow: `0 6px 28px rgba(79,70,229,0.12), 0 0 20px ${s.glowColor}`,
        borderColor: s.borderColor,
        y: -2,
      }}
    >
      {/* Background icon watermark */}
      <div style={{
        position: 'absolute', right: '-6px', bottom: '-6px',
        opacity: 0.06, color: s.iconColor,
        transform: 'scale(3.5)',
        pointerEvents: 'none',
      }}>
        <Icon size={24} />
      </div>

      {/* Testing pulse overlay */}
      {isTesting && (
        <motion.div
          style={{
            position: 'absolute', inset: 0, background: s.glowColor,
            pointerEvents: 'none', borderRadius: 'inherit',
          }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
        />
      )}

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
        <h3 style={{ color: '#6B7DB3', fontSize: '0.72rem', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0 }}>
          {title}
        </h3>
        <div style={{
          width: '34px', height: '34px', borderRadius: '10px',
          background: `rgba(${s.iconColor === '#00E5FF' ? '0,229,255' : s.iconColor === '#818CF8' ? '129,140,248' : s.iconColor === '#34D399' ? '52,211,153' : s.iconColor === '#C084FC' ? '192,132,252' : '96,165,250'},0.15)`,
          border: `1px solid ${s.borderColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={17} color={s.iconColor} style={isTesting ? { animation: 'spin 2s linear infinite' } : {}} />
        </div>
      </div>

      {/* Value */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {isTesting ? (
          <span style={{ fontSize: '1.85rem', fontWeight: '800', color: 'rgba(30,27,75,0.30)', letterSpacing: '-0.03em', animation: 'pulse 1.5s infinite' }}>
            — — —
          </span>
        ) : (
          <motion.span
            key={value}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              fontSize: '1.85rem', fontWeight: '800',
              color: s.valueColor || '#1E1B4B', letterSpacing: '-0.03em',
              textShadow: `0 0 20px ${s.shadowColor}`,
              display: 'block',
            }}
          >
            {value}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
};

const MetricsGrid = ({ metrics, isTesting = false }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-2">
      <MetricCard title="Towers Online"      value={metrics.onlineTowers}                  icon={Radio}    delay={0.05} color="indigo"  />
      <MetricCard title="Connected Users"    value={metrics.connectedUsers.toLocaleString()} icon={Users}    delay={0.1}  color="emerald" />
      <MetricCard title="Avg Download"       value={`${metrics.avgDownload} Mbps`}           icon={ArrowDown} delay={0.15} color="cyan"   isTesting={isTesting} />
      <MetricCard title="Avg Upload"         value={`${metrics.avgUpload} Mbps`}             icon={Upload}   delay={0.2}  color="blue"   isTesting={isTesting} />
      <MetricCard title="Avg Latency"        value={`${metrics.avgLatency} ms`}              icon={Activity} delay={0.25} color="violet" isTesting={isTesting} />
    </div>
  );
};

export default MetricsGrid;

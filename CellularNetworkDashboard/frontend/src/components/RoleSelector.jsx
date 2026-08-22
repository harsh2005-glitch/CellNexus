import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Code2, Radio, ChevronRight } from 'lucide-react';
import { MapContainer, TileLayer, Circle, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

/* ── Static sample towers for the landing map ── */
const SAMPLE_TOWERS = [
  { id: 1, latitude: 28.6139, longitude: 77.2090, status: 'GOOD',     coverageRadius: 60000 },
  { id: 2, latitude: 19.0760, longitude: 72.8777, status: 'GOOD',     coverageRadius: 55000 },
  { id: 3, latitude: 12.9716, longitude: 77.5946, status: 'DEGRADED', coverageRadius: 50000 },
  { id: 4, latitude: 22.5726, longitude: 88.3639, status: 'GOOD',     coverageRadius: 48000 },
  { id: 5, latitude: 17.3850, longitude: 78.4867, status: 'OFFLINE',  coverageRadius: 45000 },
  { id: 6, latitude: 13.0827, longitude: 80.2707, status: 'GOOD',     coverageRadius: 50000 },
  { id: 7, latitude: 23.0225, longitude: 72.5714, status: 'DEGRADED', coverageRadius: 42000 },
  { id: 8, latitude: 26.9124, longitude: 75.7873, status: 'GOOD',     coverageRadius: 40000 },
];

const getStatusColorLanding = (status) => {
  switch (status) {
    case 'GOOD':     return '#10B981';
    case 'DEGRADED': return '#F59E0B';
    case 'OFFLINE':  return '#EF4444';
    default:         return '#3B82F6';
  }
};

const createLandingIcon = (status) => {
  const color = getStatusColorLanding(status);
  const html = `<div style="position:relative;width:20px;height:20px;display:flex;align-items:center;justify-content:center;"><span style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.3;animation:landingPing 2s cubic-bezier(0,0,0.2,1) infinite;"></span><span style="position:relative;width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:block;"></span></div>`;
  return L.divIcon({ className: 'bg-transparent', html, iconSize: [20, 20], iconAnchor: [10, 10] });
};

/* ── Role card data ── */
const ROLES = [
  {
    id: 'admin',
    label: 'Admin',
    icon: Shield,
    iconBg: 'rgba(255,255,255,0.25)',
    iconColor: '#FFFFFF',
    cardBg: 'linear-gradient(145deg, #7C3AED 0%, #4C1D95 100%)',
    cardBgHover: 'linear-gradient(145deg, #8B5CF6 0%, #5B21B6 100%)',
    borderColor: 'rgba(167,139,250,0.4)',
    borderHover: 'rgba(196,181,253,0.7)',
    badge: 'Requires Login',
    badgeBg: 'rgba(255,255,255,0.18)',
    badgeText: '#EDE9FE',
    subText: 'admin@cellnexus.com',
    subColor: '#C4B5FD',
    description: '',
    btnBg: 'rgba(255,255,255,0.22)',
    btnBgHover: 'rgba(255,255,255,0.35)',
    shadowColor: 'rgba(124, 58, 237, 0.45)',
    labelColor: '#FFFFFF',
    subTextColor: '#C4B5FD',
  },
  {
    id: 'developer',
    label: 'Developer',
    icon: Code2,
    iconBg: 'rgba(255,255,255,0.25)',
    iconColor: '#FFFFFF',
    cardBg: 'linear-gradient(145deg, #0EA5E9 0%, #1E40AF 100%)',
    cardBgHover: 'linear-gradient(145deg, #38BDF8 0%, #2563EB 100%)',
    borderColor: 'rgba(125,211,252,0.4)',
    borderHover: 'rgba(147,197,253,0.7)',
    badge: 'Dev Access',
    badgeBg: 'rgba(255,255,255,0.18)',
    badgeText: '#DBEAFE',
    subText: 'System & API Info',
    subColor: '#BAE6FD',
    description: '',
    btnBg: 'rgba(255,255,255,0.22)',
    btnBgHover: 'rgba(255,255,255,0.35)',
    shadowColor: 'rgba(14, 165, 233, 0.45)',
    labelColor: '#FFFFFF',
    subTextColor: '#BAE6FD',
  },
  {
    id: 'network_operator',
    label: 'Network Operator',
    icon: Radio,
    iconBg: 'rgba(255,255,255,0.25)',
    iconColor: '#FFFFFF',
    cardBg: 'linear-gradient(145deg, #10B981 0%, #065F46 100%)',
    cardBgHover: 'linear-gradient(145deg, #34D399 0%, #047857 100%)',
    borderColor: 'rgba(110,231,183,0.4)',
    borderHover: 'rgba(110,231,183,0.7)',
    badge: 'Full Dashboard',
    badgeBg: 'rgba(255,255,255,0.18)',
    badgeText: '#D1FAE5',
    subText: 'Real-time Monitoring',
    subColor: '#A7F3D0',
    description: '',
    btnBg: 'rgba(255,255,255,0.22)',
    btnBgHover: 'rgba(255,255,255,0.35)',
    shadowColor: 'rgba(16, 185, 129, 0.45)',
    labelColor: '#FFFFFF',
    subTextColor: '#A7F3D0',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.13, delayChildren: 0.25 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 240, damping: 22 } },
};

/* ── Compact role card ── */
/* ── Horizontal role card (Option 2: icon left, text right) ── */
const RoleCard = ({ role, isHovered, onHover, onLeave, onClick }) => {
  const Icon = role.icon;
  return (
    <motion.button
      variants={cardVariants}
      onHoverStart={onHover}
      onHoverEnd={onLeave}
      onClick={onClick}
      whileHover={{ scale: 1.025, x: 6 }}
      whileTap={{ scale: 0.97 }}
      style={{
        background: isHovered ? role.cardBgHover : role.cardBg,
        border: `1.5px solid ${isHovered ? role.borderHover : role.borderColor}`,
        borderRadius: '20px',
        padding: '1.1rem 1.3rem',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '1rem',
        textAlign: 'left',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.3s, border-color 0.3s, transform 0.25s',
        boxShadow: isHovered
          ? `0 16px 48px ${role.shadowColor}, 0 4px 16px rgba(0,0,0,0.12)`
          : `0 4px 24px ${role.shadowColor}`,
        width: '100%',
      }}
    >
      {/* Shine overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.13) 0%, transparent 100%)',
        borderRadius: '20px 20px 0 0',
        pointerEvents: 'none',
      }} />

      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
        background: 'rgba(255,255,255,0.4)',
        borderRadius: '20px 0 0 20px',
        opacity: isHovered ? 1 : 0.5,
        transition: 'opacity 0.3s',
      }} />

      {/* Icon box */}
      <div style={{
        width: '58px', height: '58px', borderRadius: '16px', flexShrink: 0,
        background: role.iconBg,
        backdropFilter: 'blur(8px)',
        border: '1.5px solid rgba(255,255,255,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        transition: 'transform 0.25s',
        transform: isHovered ? 'scale(1.1) rotate(-4deg)' : 'scale(1) rotate(0deg)',
      }}>
        <Icon size={26} color={role.iconColor} strokeWidth={1.8} />
      </div>

      {/* Text group */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Badge */}
        <span style={{
          display: 'inline-block',
          background: role.badgeBg,
          backdropFilter: 'blur(8px)',
          color: role.badgeText,
          fontSize: '0.55rem', fontWeight: '700',
          letterSpacing: '0.07em', textTransform: 'uppercase',
          padding: '2px 8px', borderRadius: '999px',
          border: '1px solid rgba(255,255,255,0.3)',
          marginBottom: '5px',
        }}>
          {role.badge}
        </span>
        <h2 style={{
          fontSize: '1.05rem', fontWeight: '800',
          color: role.labelColor, margin: '0 0 2px 0',
          letterSpacing: '-0.02em', lineHeight: 1.2,
        }}>
          {role.label}
        </h2>
        <span style={{
          fontSize: '0.68rem', fontWeight: '600',
          color: role.subTextColor, opacity: 0.85,
        }}>
          {role.subText}
        </span>
      </div>

      {/* Arrow CTA */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '36px', height: '36px', flexShrink: 0,
        background: isHovered ? role.btnBgHover : role.btnBg,
        backdropFilter: 'blur(8px)',
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.35)',
        transition: 'background 0.25s',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}>
        <ChevronRight
          size={18}
          color="#FFFFFF"
          style={{
            transform: isHovered ? 'translateX(2px)' : 'translateX(0)',
            transition: 'transform 0.2s',
          }}
        />
      </div>
    </motion.button>
  );
};

const RoleSelector = ({ onSelectRole }) => {
  const [hoveredRole, setHoveredRole] = useState(null);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #F8FAFC 0%, #F1F5F9 50%, #EFF6FF 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>

      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-80px', width: '360px', height: '360px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-60px', left: '-60px', width: '320px', height: '320px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* ── Header ── */}
      <motion.div
        style={{ textAlign: 'center', marginBottom: '1.2rem', position: 'relative', zIndex: 1 }}
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >

        <h1 style={{
          fontSize: '2.6rem', fontWeight: '800', letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #1E40AF, #0891B2)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '0.3rem', lineHeight: 1.1,
        }}>
          User Panel
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.85rem' }}>
          Network Intelligence Platform
        </p>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: '#ECFDF5', border: '1px solid #A7F3D0',
          borderRadius: '999px', padding: '4px 14px',
          color: '#059669', fontSize: '0.68rem', fontWeight: '700',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#10B981', display: 'inline-block',
            animation: 'landingPulse 2s infinite',
          }} />
          System Online
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          marginTop: '1.5rem', justifyContent: 'center',
        }}>
          <div style={{ height: '1px', width: '64px', background: 'linear-gradient(to right, transparent, #CBD5E1)' }} />
          <span style={{ color: '#94A3B8', fontSize: '0.78rem', fontWeight: '500' }}>Select your access role</span>
          <div style={{ height: '1px', width: '64px', background: 'linear-gradient(to left, transparent, #CBD5E1)' }} />
        </div>
      </motion.div>

      {/* ── Option 2 Layout: Left stack cards | Right big map ── */}
      <motion.div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: '1.4rem',
          width: '100%',
          maxWidth: '1020px',
          position: 'relative',
          zIndex: 1,
          alignItems: 'stretch',
        }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* LEFT — 3 cards stacked vertically */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {ROLES.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              isHovered={hoveredRole === role.id}
              onHover={() => setHoveredRole(role.id)}
              onLeave={() => setHoveredRole(null)}
              onClick={() => onSelectRole(role.id)}
            />
          ))}
        </div>

        {/* RIGHT — Live Network Map filling remaining space */}
        <motion.div
          variants={cardVariants}
          style={{
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 10px 50px rgba(0,0,0,0.14)',
            border: '1.5px solid #E2E8F0',
            position: 'relative',
            minHeight: '480px',
          }}
        >
          {/* Live label */}
          <div style={{
            position: 'absolute', top: '14px', left: '14px', zIndex: 500,
            background: 'rgba(15,23,42,0.80)',
            backdropFilter: 'blur(10px)',
            borderRadius: '10px',
            padding: '6px 14px',
            color: '#E2E8F0',
            fontSize: '0.68rem', fontWeight: '700',
            letterSpacing: '0.07em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: '7px',
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: '#10B981', display: 'inline-block',
              animation: 'landingPulse 2s infinite',
            }} />
            Live Network Map
          </div>

          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={4}
            style={{ height: '100%', width: '100%', minHeight: '480px' }}
            zoomControl={true}
            attributionControl={false}
            scrollWheelZoom={true}
            dragging={true}
            doubleClickZoom={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {SAMPLE_TOWERS.map(tower => (
              <React.Fragment key={tower.id}>
                <Circle
                  center={[tower.latitude, tower.longitude]}
                  radius={tower.coverageRadius}
                  pathOptions={{
                    color: getStatusColorLanding(tower.status),
                    fillColor: getStatusColorLanding(tower.status),
                    fillOpacity: 0.13,
                    weight: 1.2,
                  }}
                />
                <Marker
                  position={[tower.latitude, tower.longitude]}
                  icon={createLandingIcon(tower.status)}
                />
              </React.Fragment>
            ))}
          </MapContainer>

          {/* Legend */}
          <div style={{
            position: 'absolute', bottom: '14px', right: '14px', zIndex: 500,
            background: 'rgba(15,23,42,0.80)',
            backdropFilter: 'blur(10px)',
            borderRadius: '10px',
            padding: '8px 14px',
            display: 'flex', flexDirection: 'column', gap: '5px',
          }}>
            {[['GOOD', '#10B981'], ['DEGRADED', '#F59E0B'], ['OFFLINE', '#EF4444']].map(([label, color]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: color, display: 'inline-block' }} />
                <span style={{ color: '#CBD5E1', fontSize: '0.63rem', fontWeight: '600' }}>{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.p
        style={{ marginTop: '2rem', color: '#94A3B8', fontSize: '0.7rem', position: 'relative', zIndex: 1 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        CellNexus v2.0 · Cellular Network Intelligence Dashboard · All rights reserved
      </motion.p>

      {/* Keyframes */}
      <style>{`
        @keyframes landingPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.82); }
        }
        @keyframes landingPing {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default RoleSelector;

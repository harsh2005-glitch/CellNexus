import React, { useState } from 'react';
import { Activity, Radio, MapPin, Network, Shield, LogIn, LogOut, UserCheck, ArrowLeft, Gauge } from 'lucide-react';
import MyNetworkModal from './MyNetworkModal';

const Header = ({ towers = [], operatorFilter, setOperatorFilter, cityFilter, setCityFilter, onAdminOpen, currentUser, onAuthOpen, onLogout, onOpenRecommender, onBackToRoles, onRunSpeedTest, isTesting = false }) => {
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);

  const operators = ['All Operators', ...new Set(towers.map(t => t.operatorName))].filter(Boolean);
  const cities = ['All Cities', ...new Set(towers.map(t => t.locationName))].filter(Boolean);

  return (
    <div
      className="glass-panel flex flex-col md:flex-row items-center justify-between px-5 py-3 mb-2 mt-2 gap-4"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Subtle top-edge glow bar */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(79,70,229,0.5), rgba(6,182,212,0.5), transparent)',
        borderRadius: '999px',
      }} />

      {/* ── Brand ── */}
      <div className="flex items-center gap-3 w-full md:w-auto" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(79,70,229,0.15) 0%, rgba(6,182,212,0.18) 100%)',
          border: '1.5px solid rgba(79,70,229,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(79,70,229,0.18)',
        }}>
          <Radio size={22} color="#4F46E5" />
        </div>
        <div>
          <h1 style={{
            fontSize: '1.45rem', fontWeight: '800', letterSpacing: '-0.03em',
            margin: 0, display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span style={{ color: '#4F46E5' }}>User</span>
            <span style={{ color: '#7C3AED' }}>Panel</span>
          </h1>
          <p style={{ color: '#6B7DB3', fontSize: '0.7rem', fontWeight: '500', margin: 0 }}>
            Network Intelligence Dashboard
          </p>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto" style={{ position: 'relative', zIndex: 1 }}>
        {/* Back to Role Selection */}
        {onBackToRoles && (
          <button
            onClick={onBackToRoles}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '600',
              background: 'rgba(79,102,241,0.10)', border: '1px solid rgba(79,70,229,0.30)',
              color: '#4F46E5', cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,70,229,0.18)'; e.currentTarget.style.color = '#1E1B4B'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(79,70,229,0.10)'; e.currentTarget.style.color = '#4F46E5'; }}
          >
            <ArrowLeft size={13} />
            Switch Role
          </button>
        )}

        <select
          value={operatorFilter || 'All Operators'}
          onChange={(e) => setOperatorFilter && setOperatorFilter(e.target.value)}
          style={{ padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer' }}
        >
          {operators.map(op => <option key={op} value={op}>{op}</option>)}
        </select>

        <select
          value={cityFilter || 'All Cities'}
          onChange={(e) => setCityFilter && setCityFilter(e.target.value)}
          style={{ padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer' }}
        >
          {cities.map(city => <option key={city} value={city}>{city}</option>)}
        </select>

        <div style={{ width: '1px', height: '28px', background: 'rgba(99,102,241,0.25)' }} className="hidden md:block" />

        <button
          onClick={() => setIsNetworkModalOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '6px 16px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600',
            background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.35)',
            color: '#7C3AED', cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.22)'; e.currentTarget.style.color = '#5B21B6'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.12)'; e.currentTarget.style.color = '#7C3AED'; }}
        >
          <Network size={15} />
          My Network
        </button>

        {/* User Auth Controls */}
        {currentUser ? (
          <div className="flex items-center gap-2">
            {currentUser.role === 'admin' && (
              <button
                onClick={onAdminOpen}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '700',
                  background: 'rgba(168,85,247,0.18)', border: '1px solid rgba(168,85,247,0.45)',
                  color: '#D8B4FE', cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <Shield size={13} />
                Admin Panel
              </button>
            )}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(99,102,241,0.20)',
              borderRadius: '1rem',
              boxShadow: '0 4px 24px rgba(79,70,229,0.08), 0 0 0 1px rgba(255,255,255,0.85) inset',
              padding: '4px 12px',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4F46E5', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1E1B4B' }}>{currentUser.username}</span>
              <span style={{ fontSize: '0.62rem', background: 'rgba(79,70,229,0.12)', color: '#4F46E5', padding: '1px 7px', borderRadius: '4px', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                {currentUser.role}
              </span>
              <button
                onClick={onLogout}
                title="Sign Out"
                style={{ color: '#6B7DB3', cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
                onMouseLeave={e => e.currentTarget.style.color = '#6B7DB3'}
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onRunSpeedTest}
            disabled={isTesting}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '7px 18px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '700',
              background: isTesting
                ? 'rgba(79,70,229,0.08)'
                : 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              border: isTesting ? '1px solid rgba(79,70,229,0.25)' : 'none',
              color: isTesting ? 'rgba(79,70,229,0.5)' : '#FFFFFF',
              cursor: isTesting ? 'not-allowed' : 'pointer',
              boxShadow: isTesting ? 'none' : '0 4px 20px rgba(79,70,229,0.35)',
              transition: 'all 0.25s',
            }}
          >
            {isTesting ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                Testing...
              </>
            ) : (
              <>
                <Gauge size={14} />
                Run Speed Test
              </>
            )}
          </button>
        )}

        {/* Live badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '5px 14px', borderRadius: '999px',
          background: 'rgba(5,150,105,0.10)', border: '1px solid rgba(5,150,105,0.28)',
          color: '#059669', fontSize: '0.75rem', fontWeight: '700',
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          Live
        </div>
      </div>

      <MyNetworkModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
      />
    </div>
  );
};

export default Header;

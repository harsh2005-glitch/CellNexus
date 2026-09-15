import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Code2, Server, Database, Globe, Wifi, Activity,
  Radio, Terminal, ArrowLeft, RefreshCw, CheckCircle2,
  AlertCircle, Clock, Layers, Cpu, BarChart2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const endpoints = [
  { method: 'GET',    path: '/api/towers',                  desc: 'Fetch all towers' },
  { method: 'GET',    path: '/api/towers/:id',              desc: 'Get single tower by ID' },
  { method: 'POST',   path: '/api/towers',                  desc: 'Create a new tower' },
  { method: 'PUT',    path: '/api/towers/:id',              desc: 'Update tower details' },
  { method: 'DELETE', path: '/api/towers/:id',              desc: 'Delete a tower' },
  { method: 'GET',    path: '/api/alerts',                  desc: 'Fetch all fault alerts (newest first)' },
  { method: 'POST',   path: '/api/alerts',                  desc: 'Create a manual alert' },
  { method: 'PATCH',  path: '/api/alerts/:id/acknowledge',  desc: 'Acknowledge an active alert' },
  { method: 'PATCH',  path: '/api/alerts/:id/resolve',      desc: 'Mark alert as resolved' },
  { method: 'DELETE', path: '/api/alerts/:id',              desc: 'Delete an alert record' },
  { method: 'GET',    path: '/api/speed-tests',             desc: 'Fetch speed test results' },
  { method: 'POST',   path: '/api/speed-tests',             desc: 'Submit new speed test' },
  { method: 'POST',   path: '/api/auth/login',              desc: 'User authentication' },
  { method: 'POST',   path: '/api/auth/register',           desc: 'User registration' },
  { method: 'GET',    path: '/api/health',                  desc: 'API health check' },
];

const techStack = [
  { name: 'React 18',      category: 'Frontend',    color: '#06B6D4', icon: '⚛️' },
  { name: 'Vite',          category: 'Build Tool',  color: '#F59E0B', icon: '⚡' },
  { name: 'Tailwind CSS',  category: 'Styling',     color: '#38BDF8', icon: '🎨' },
  { name: 'Framer Motion', category: 'Animation',   color: '#EC4899', icon: '🎬' },
  { name: 'Node.js',       category: 'Backend',     color: '#10B981', icon: '🟢' },
  { name: 'Express.js',    category: 'Framework',   color: '#6B7DB3', icon: '🚀' },
  { name: 'Socket.IO',     category: 'Real-time',   color: '#F97316', icon: '⚡' },
  { name: 'MySQL / Aiven', category: 'Database',    color: '#4F46E5', icon: '🗄️' },
  { name: 'Google Maps',   category: 'Maps',        color: '#059669', icon: '🗺️' },
  { name: 'Axios',         category: 'HTTP Client', color: '#7C3AED', icon: '📡' },
];

const METHOD_CFG = {
  GET:    { bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.30)',  color: '#059669' },
  POST:   { bg: 'rgba(79,70,229,0.10)',   border: 'rgba(79,70,229,0.28)',   color: '#4F46E5' },
  PUT:    { bg: 'rgba(245,158,11,0.10)',  border: 'rgba(245,158,11,0.28)',  color: '#D97706' },
  PATCH:  { bg: 'rgba(124,58,237,0.10)', border: 'rgba(124,58,237,0.28)', color: '#7C3AED' },
  DELETE: { bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.28)',   color: '#DC2626' },
};

// ── Shared card style ──
const card = {
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(99,102,241,0.18)',
  borderRadius: '1rem',
  boxShadow: '0 4px 24px rgba(79,70,229,0.08), 0 1px 4px rgba(99,102,241,0.06), 0 0 0 1px rgba(255,255,255,0.85) inset',
};

const DeveloperPanel = ({ onBack }) => {
  const [apiHealth, setApiHealth]       = useState(null);
  const [towerCount, setTowerCount]     = useState(null);
  const [checkingHealth, setChecking]   = useState(true);
  const [activeTab, setActiveTab]       = useState('overview');
  const [lastChecked, setLastChecked]   = useState(new Date());

  const checkHealth = async () => {
    setChecking(true);
    try {
      const [, towersRes] = await Promise.all([
        axios.get(`${API_URL}/api/health`),
        axios.get(`${API_URL}/api/towers`),
      ]);
      setApiHealth('online');
      setTowerCount(towersRes.data.length);
    } catch {
      setApiHealth('offline');
    } finally {
      setChecking(false);
      setLastChecked(new Date());
    }
  };

  useEffect(() => { checkHealth(); }, []);

  const tabs = [
    { id: 'overview',   label: 'Overview',       icon: Layers },
    { id: 'endpoints',  label: 'API Endpoints',  icon: Globe },
    { id: 'techstack',  label: 'Tech Stack',     icon: Code2 },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base, #F5F3FF)',
      backgroundImage: `
        radial-gradient(ellipse 70% 45% at 10% 5%,  rgba(139,92,246,0.14) 0%, transparent 65%),
        radial-gradient(ellipse 55% 35% at 90% 95%,  rgba(6,182,212,0.12)  0%, transparent 60%),
        radial-gradient(ellipse 45% 30% at 55% 45%,  rgba(79,70,229,0.07)  0%, transparent 55%),
        radial-gradient(ellipse 40% 25% at 80% 10%,  rgba(168,85,247,0.08) 0%, transparent 50%)
      `,
      backgroundAttachment: 'fixed',
      fontFamily: "'Inter','Segoe UI',sans-serif",
      color: '#1E1B4B',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* dot grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* ── Header ── */}
      <div style={{
        ...card,
        position: 'sticky', top: 0, zIndex: 50,
        borderRadius: 0,
        borderBottom: '1px solid rgba(99,102,241,0.18)',
        borderLeft: 'none', borderRight: 'none', borderTop: 'none',
        background: 'rgba(255,255,255,0.88)',
      }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', paddingBottom: '0' }}>
            {/* Left */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={onBack}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600',
                  background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.22)',
                  color: '#4F46E5', cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <ArrowLeft size={13} /> Back
              </button>

              <div style={{ width: '1px', height: '24px', background: 'rgba(99,102,241,0.22)' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(6,182,212,0.18))',
                  border: '1.5px solid rgba(79,70,229,0.32)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(79,70,229,0.15)',
                }}>
                  <Code2 size={18} color="#4F46E5" />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#1E1B4B', letterSpacing: '-0.02em' }}>
                    Developer Panel
                  </h1>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: '#6B7DB3', fontWeight: '500' }}>
                    CellNexus · System &amp; API Documentation
                  </p>
                </div>
              </div>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '5px 14px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '700',
                background: checkingHealth
                  ? 'rgba(99,102,241,0.08)'
                  : apiHealth === 'online'
                    ? 'rgba(5,150,105,0.10)'
                    : 'rgba(239,68,68,0.10)',
                border: checkingHealth
                  ? '1px solid rgba(99,102,241,0.25)'
                  : apiHealth === 'online'
                    ? '1px solid rgba(5,150,105,0.30)'
                    : '1px solid rgba(239,68,68,0.30)',
                color: checkingHealth ? '#6B7DB3'
                  : apiHealth === 'online' ? '#059669' : '#DC2626',
              }}>
                {checkingHealth
                  ? <RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} />
                  : apiHealth === 'online'
                    ? <CheckCircle2 size={11} />
                    : <AlertCircle size={11} />}
                {checkingHealth ? 'Checking…' : apiHealth === 'online' ? 'API Online' : 'API Offline'}
              </div>

              <button
                onClick={checkHealth}
                disabled={checkingHealth}
                style={{
                  width: '32px', height: '32px', borderRadius: '9px',
                  background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.20)',
                  color: '#4F46E5', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <RefreshCw size={13} style={{ animation: checkingHealth ? 'spin 1s linear infinite' : 'none' }} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '2px', marginTop: '10px' }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', fontSize: '0.78rem', fontWeight: '600',
                    background: 'none', border: 'none', cursor: 'pointer',
                    borderBottom: active ? '2px solid #4F46E5' : '2px solid transparent',
                    color: active ? '#4F46E5' : '#6B7DB3',
                    marginBottom: '-1px', transition: 'all 0.2s',
                  }}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, maxWidth: '1080px', width: '100%', margin: '0 auto', padding: '28px 24px', position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">

          {/* ─── OVERVIEW ─── */}
          {activeTab === 'overview' && (
            <motion.div key="overview"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.22 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                {[
                  { label: 'API Base URL',    value: API_URL,   icon: Globe,     color: '#4F46E5' },
                  { label: 'Active Towers',   value: towerCount ?? '—', icon: Radio, color: '#059669' },
                  { label: 'API Status',      value: apiHealth === 'online' ? 'Online' : 'Offline', icon: Activity, color: apiHealth === 'online' ? '#059669' : '#DC2626' },
                  { label: 'Last Checked',    value: lastChecked.toLocaleTimeString(), icon: Clock, color: '#7C3AED' },
                ].map(stat => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} style={{ ...card, padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                        <Icon size={13} color={stat.color} />
                        <span style={{ fontSize: '0.65rem', color: '#6B7DB3', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#1E1B4B', wordBreak: 'break-all' }}>{stat.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Architecture */}
              <div style={{ ...card, padding: '22px 24px' }}>
                <h2 style={{ margin: '0 0 20px', fontSize: '0.95rem', fontWeight: '800', color: '#1E1B4B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={15} color="#4F46E5" /> System Architecture
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Browser Client', sub: 'React + Vite',       bg: 'rgba(79,70,229,0.10)',  border: 'rgba(79,70,229,0.28)',  color: '#4F46E5' },
                    { arrow: '↔ REST/WS ↔' },
                    { label: 'Express API',    sub: 'Node.js + Socket.IO', bg: 'rgba(6,182,212,0.10)',  border: 'rgba(6,182,212,0.28)',  color: '#0891B2' },
                    { arrow: '↔ SQL ↔' },
                    { label: 'Aiven MySQL',    sub: 'Cloud Database',      bg: 'rgba(124,58,237,0.10)', border: 'rgba(124,58,237,0.28)', color: '#7C3AED' },
                  ].map((item, i) =>
                    item.arrow ? (
                      <span key={i} style={{ color: '#6B7DB3', fontSize: '0.75rem', fontWeight: '600', padding: '0 10px', whiteSpace: 'nowrap' }}>{item.arrow}</span>
                    ) : (
                      <div key={i} style={{
                        background: item.bg, border: `1.5px solid ${item.border}`,
                        borderRadius: '12px', padding: '10px 18px', textAlign: 'center', minWidth: '130px',
                      }}>
                        <p style={{ margin: '0 0 2px', fontWeight: '800', fontSize: '0.8rem', color: item.color }}>{item.label}</p>
                        <p style={{ margin: 0, fontSize: '0.62rem', color: '#6B7DB3' }}>{item.sub}</p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Real-time + Status Algorithm */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ ...card, padding: '20px 22px' }}>
                  <h3 style={{ margin: '0 0 14px', fontWeight: '800', color: '#1E1B4B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Wifi size={14} color="#F97316" /> Real-time Engine
                  </h3>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '9px' }}>
                    {[
                      <><code style={{ background: 'rgba(79,70,229,0.10)', border: '1px solid rgba(79,70,229,0.20)', color: '#4F46E5', borderRadius: '5px', padding: '1px 6px', fontFamily: 'monospace', fontSize: '0.72rem' }}>telemetry_update</code> socket event every 3s</>,
                      <><code style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.22)', color: '#D97706', borderRadius: '5px', padding: '1px 6px', fontFamily: 'monospace', fontSize: '0.72rem' }}>new_alerts</code> event on fault detection</>,
                      'Tower statuses via call-drop probability thresholds',
                      '900-row CSV replayed in rotating windows per tower',
                      '60s dedup prevents alert storm per tower+type',
                    ].map((item, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', color: '#4B5563', lineHeight: '1.45' }}>
                        <span style={{ color: '#F97316', marginTop: '1px', flexShrink: 0 }}>▸</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ ...card, padding: '20px 22px' }}>
                  <h3 style={{ margin: '0 0 14px', fontWeight: '800', color: '#1E1B4B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <BarChart2 size={14} color="#7C3AED" /> Status Algorithm
                  </h3>
                  <div style={{
                    background: 'rgba(249,247,255,0.8)', border: '1px solid rgba(99,102,241,0.16)',
                    borderRadius: '10px', padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.76rem', lineHeight: '1.8',
                  }}>
                    <p style={{ margin: '0 0 4px', color: '#9CA3AF', fontSize: '0.7rem' }}>{'// Tower health logic'}</p>
                    <p style={{ margin: 0, color: '#6B7DB3' }}>dropProb = dropped / incoming</p>
                    <p style={{ margin: 0, color: '#059669', fontWeight: '700' }}>if dropProb ≤ 0.07 → <strong>GOOD</strong></p>
                    <p style={{ margin: 0, color: '#D97706', fontWeight: '700' }}>if dropProb ≤ 0.10 → <strong>DEGRADED</strong></p>
                    <p style={{ margin: 0, color: '#DC2626', fontWeight: '700' }}>if dropProb &gt;  0.10 → <strong>OFFLINE</strong></p>
                  </div>
                </div>
              </div>

              {/* Environment */}
              <div style={{ ...card, padding: '20px 22px' }}>
                <h3 style={{ margin: '0 0 14px', fontWeight: '800', color: '#1E1B4B', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Terminal size={14} color="#6B7DB3" /> Environment Configuration
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '10px' }}>
                  {[
                    { key: 'VITE_API_URL',      value: API_URL,        desc: 'Backend API base URL' },
                    { key: 'PORT',              value: '5000',         desc: 'Express server port' },
                    { key: 'SOCKET_INTERVAL',   value: '3000ms',       desc: 'Telemetry broadcast interval' },
                    { key: 'DB_ENGINE',         value: 'MySQL (Aiven)',desc: 'Database engine' },
                  ].map(env => (
                    <div key={env.key} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                      background: 'rgba(249,247,255,0.8)', border: '1px solid rgba(99,102,241,0.14)',
                      borderRadius: '9px', padding: '10px 14px',
                    }}>
                      <div>
                        <p style={{ margin: '0 0 2px', fontFamily: 'monospace', fontSize: '0.72rem', color: '#4F46E5', fontWeight: '700' }}>{env.key}</p>
                        <p style={{ margin: 0, fontSize: '0.62rem', color: '#9CA3AF' }}>{env.desc}</p>
                      </div>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#059669', fontWeight: '700', whiteSpace: 'nowrap' }}>{env.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── ENDPOINTS ─── */}
          {activeTab === 'endpoints' && (
            <motion.div key="endpoints"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.22 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Globe size={15} color="#4F46E5" />
                <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#1E1B4B' }}>REST API Endpoints</h2>
                <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#6B7DB3', fontFamily: 'monospace' }}>Base: {API_URL}</span>
              </div>

              {endpoints.map((ep, i) => {
                const mc = METHOD_CFG[ep.method] || METHOD_CFG.GET;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      ...card,
                      padding: '12px 18px',
                      display: 'flex', alignItems: 'center', gap: '14px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{
                      flexShrink: 0, minWidth: '58px', textAlign: 'center',
                      padding: '3px 8px', borderRadius: '7px', fontSize: '0.65rem', fontWeight: '800',
                      fontFamily: 'monospace', letterSpacing: '0.04em',
                      background: mc.bg, border: `1px solid ${mc.border}`, color: mc.color,
                    }}>
                      {ep.method}
                    </span>
                    <code style={{ flex: 1, fontSize: '0.82rem', color: '#1E1B4B', fontFamily: 'monospace', fontWeight: '600' }}>
                      {ep.path}
                    </code>
                    <span style={{ fontSize: '0.72rem', color: '#6B7DB3', whiteSpace: 'nowrap' }}>{ep.desc}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* ─── TECH STACK ─── */}
          {activeTab === 'techstack' && (
            <motion.div key="techstack"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.22 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <Code2 size={15} color="#4F46E5" />
                <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '800', color: '#1E1B4B' }}>Technology Stack</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '14px' }}>
                {techStack.map((tech, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.04, y: -3 }}
                    style={{
                      ...card,
                      padding: '18px 14px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      textAlign: 'center', cursor: 'default', transition: 'all 0.25s',
                    }}
                  >
                    <span style={{ fontSize: '2rem' }}>{tech.icon}</span>
                    <p style={{ margin: 0, fontWeight: '800', fontSize: '0.82rem', color: tech.color }}>{tech.name}</p>
                    <span style={{
                      fontSize: '0.58rem', color: '#6B7DB3', fontWeight: '700',
                      background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
                      borderRadius: '999px', padding: '2px 9px', textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {tech.category}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default DeveloperPanel;

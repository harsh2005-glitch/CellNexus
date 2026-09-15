import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import {
  Bell, X, AlertTriangle, AlertOctagon, Info,
  CheckCircle, Clock, WifiOff, Signal, PhoneMissed, Activity,
  RefreshCw
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Severity Config ─────────────────────────────────────────────────────────
const SEVERITY = {
  CRITICAL: {
    label: 'CRITICAL',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.10)',
    border: 'rgba(239,68,68,0.35)',
    icon: AlertOctagon,
    glow: '0 0 18px rgba(239,68,68,0.25)',
    dot: '#EF4444',
  },
  WARNING: {
    label: 'WARNING',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.10)',
    border: 'rgba(245,158,11,0.35)',
    icon: AlertTriangle,
    glow: '0 0 18px rgba(245,158,11,0.20)',
    dot: '#F59E0B',
  },
  INFO: {
    label: 'INFO',
    color: '#6366F1',
    bg: 'rgba(99,102,241,0.10)',
    border: 'rgba(99,102,241,0.30)',
    icon: Info,
    glow: '0 0 12px rgba(99,102,241,0.15)',
    dot: '#6366F1',
  },
};

// ─── Alert Type Labels & Icons ────────────────────────────────────────────────
const ALERT_TYPE = {
  TOWER_OFFLINE:    { label: 'Tower OFFLINE',       Icon: WifiOff },
  SIGNAL_DEGRADED:  { label: 'Signal DEGRADED',     Icon: Signal },
  HIGH_CALL_DROP:   { label: 'High Call-Drop Rate', Icon: PhoneMissed },
  LATENCY_SPIKE:    { label: 'Latency Spike',        Icon: Activity },
};

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  ACTIVE:       { color: '#EF4444', label: 'Active' },
  ACKNOWLEDGED: { color: '#F59E0B', label: 'Acknowledged' },
  RESOLVED:     { color: '#10B981', label: 'Resolved' },
};

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}

function SeverityBadge({ severity }) {
  const cfg = SEVERITY[severity] || SEVERITY.INFO;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 8px', borderRadius: '6px',
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      color: cfg.color, fontSize: '0.62rem', fontWeight: '800',
      letterSpacing: '0.07em', textTransform: 'uppercase',
      fontFamily: 'monospace',
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
}

function AlertCard({ alert, onAcknowledge, onResolve }) {
  const cfg       = SEVERITY[alert.severity]   || SEVERITY.INFO;
  const typeCfg   = ALERT_TYPE[alert.type]     || { label: alert.type, Icon: Bell };
  const statusCfg = STATUS_CONFIG[alert.status] || STATUS_CONFIG.ACTIVE;
  const TypeIcon  = typeCfg.Icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: '0.85rem',
        padding: '12px 14px',
        marginBottom: '8px',
        boxShadow: alert.status === 'ACTIVE' ? cfg.glow : 'none',
        opacity: alert.status === 'RESOLVED' ? 0.6 : 1,
        transition: 'opacity 0.3s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        {/* Icon */}
        <div style={{
          width: '34px', height: '34px', flexShrink: 0,
          borderRadius: '10px', background: cfg.bg,
          border: `1.5px solid ${cfg.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TypeIcon size={16} color={cfg.color} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '3px' }}>
            <span style={{ fontWeight: '700', fontSize: '0.82rem', color: '#1E1B4B' }}>
              {typeCfg.label}
            </span>
            <SeverityBadge severity={alert.severity} />
            <span style={{
              fontSize: '0.6rem', fontWeight: '700', letterSpacing: '0.05em',
              color: statusCfg.color, textTransform: 'uppercase',
              border: `1px solid ${statusCfg.color}33`,
              background: `${statusCfg.color}12`,
              borderRadius: '5px', padding: '1px 6px',
            }}>
              {statusCfg.label}
            </span>
          </div>

          {/* Tower name */}
          <p style={{ fontSize: '0.75rem', color: '#4F46E5', fontWeight: '600', margin: '0 0 4px' }}>
            {alert.towerName || `Tower #${alert.towerId}`}
          </p>

          {/* Message */}
          {alert.message && (
            <p style={{ fontSize: '0.72rem', color: '#6B7DB3', margin: '0 0 6px', lineHeight: '1.4' }}>
              {alert.message}
            </p>
          )}

          {/* Timestamps */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: '#8B84B8' }}>
              <Clock size={10} />
              {timeAgo(alert.timestamp)}
            </span>
            {alert.acknowledgedAt && (
              <span style={{ fontSize: '0.65rem', color: '#F59E0B' }}>
                Ack&apos;d {timeAgo(alert.acknowledgedAt)}
              </span>
            )}
            {alert.resolvedAt && (
              <span style={{ fontSize: '0.65rem', color: '#10B981' }}>
                Resolved {timeAgo(alert.resolvedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
          {alert.status === 'ACTIVE' && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 9px', borderRadius: '7px', fontSize: '0.63rem', fontWeight: '700',
                background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)',
                color: '#D97706', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
            >
              <Clock size={10} /> Acknowledge
            </button>
          )}
          {alert.status !== 'RESOLVED' && (
            <button
              onClick={() => onResolve(alert.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 9px', borderRadius: '7px', fontSize: '0.63rem', fontWeight: '700',
                background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.30)',
                color: '#059669', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
            >
              <CheckCircle size={10} /> Resolve
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main AlertsPanel ─────────────────────────────────────────────────────────
export default function AlertsPanel({ isOpen, onClose, newAlerts = [], selectedTower = null }) {
  const [alerts, setAlerts]               = useState([]);
  const [loading, setLoading]             = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus]   = useState('ALL');
  const [filterType, setFilterType]       = useState('ALL');

  const fetchAlerts = async () => {
    if (!selectedTower) { setAlerts([]); return; }
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/alerts`);
      setAlerts(data.filter(a => a.towerId === selectedTower.id));
    } catch (e) {
      console.error('Failed to load alerts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchAlerts();
    if (!selectedTower) setAlerts([]);
  }, [isOpen, selectedTower]);

  // Merge real-time socket alerts — only when a tower is selected
  useEffect(() => {
    if (!newAlerts.length || !selectedTower) return;
    const relevant = newAlerts.filter(a => a.towerId === selectedTower.id);
    if (!relevant.length) return;
    setAlerts(prev => {
      const existingIds = new Set(prev.map(a => a.id));
      const fresh = relevant.filter(a => !existingIds.has(a.id));
      return fresh.length ? [...fresh, ...prev] : prev;
    });
  }, [newAlerts, selectedTower]);

  const handleAcknowledge = async (id) => {
    try {
      const { data } = await axios.patch(`${API_URL}/api/alerts/${id}/acknowledge`);
      setAlerts(prev => prev.map(a => a.id === id ? data : a));
    } catch (e) { console.error(e); }
  };

  const handleResolve = async (id) => {
    try {
      const { data } = await axios.patch(`${API_URL}/api/alerts/${id}/resolve`);
      setAlerts(prev => prev.map(a => a.id === id ? data : a));
    } catch (e) { console.error(e); }
  };

  const filtered = alerts.filter(a => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (filterStatus   !== 'ALL' && a.status   !== filterStatus)   return false;
    if (filterType     !== 'ALL' && a.type     !== filterType)     return false;
    return true;
  });

  const activeCount   = alerts.filter(a => a.status === 'ACTIVE').length;
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="alerts-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15,10,40,0.45)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
          padding: '20px',
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          key="alerts-panel"
          initial={{ x: 420, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 420, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 32 }}
          style={{
            width: '420px', maxWidth: '100vw',
            height: 'calc(100vh - 40px)',
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(99,102,241,0.22)',
            borderRadius: '1.2rem',
            boxShadow: '0 24px 80px rgba(79,70,229,0.18), 0 0 0 1px rgba(255,255,255,0.9) inset',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* ── Panel Header ── */}
          <div style={{
            padding: '16px 18px 12px',
            borderBottom: '1px solid rgba(99,102,241,0.14)',
            background: 'linear-gradient(135deg, rgba(79,70,229,0.05) 0%, rgba(124,58,237,0.04) 100%)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.12))',
                  border: '1.5px solid rgba(79,70,229,0.30)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}>
                  <Bell size={18} color="#4F46E5" />
                  {activeCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '-5px', right: '-5px',
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: criticalCount > 0 ? '#EF4444' : '#F59E0B',
                      color: '#fff', fontSize: '0.6rem', fontWeight: '800',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid #fff',
                    }}>
                      {activeCount > 99 ? '99+' : activeCount}
                    </span>
                  )}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#1E1B4B' }}>
                    {selectedTower
                      ? `${selectedTower.operatorName} \u2013 ${selectedTower.locationName}`
                      : 'Fault \u0026 Alert Feed'
                    }
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: '#6B7DB3' }}>
                    {selectedTower
                      ? `Tower #${selectedTower.id} \u00b7 ${alerts.length} alert${alerts.length !== 1 ? 's' : ''}`
                      : `Live NOC Monitoring \u2014 ${alerts.length} total alerts`
                    }
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={fetchAlerts}
                  disabled={loading}
                  style={{
                    width: '30px', height: '30px', borderRadius: '8px',
                    background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.20)',
                    color: '#4F46E5', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                </button>
                <button
                  onClick={onClose}
                  style={{
                    width: '30px', height: '30px', borderRadius: '8px',
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)',
                    color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Summary chips */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { label: `${criticalCount} Critical`, color: '#EF4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.30)' },
                { label: `${alerts.filter(a => a.severity === 'WARNING' && a.status === 'ACTIVE').length} Warning`, color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.28)' },
                { label: `${alerts.filter(a => a.status === 'RESOLVED').length} Resolved`, color: '#10B981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.28)' },
              ].map(({ label, color, bg, border }) => (
                <span key={label} style={{
                  padding: '3px 10px', borderRadius: '999px',
                  background: bg, border: `1px solid ${border}`,
                  color, fontSize: '0.65rem', fontWeight: '700',
                }}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* ── Filters ── */}
          <div style={{
            padding: '10px 14px',
            borderBottom: '1px solid rgba(99,102,241,0.10)',
            display: 'flex', gap: '7px', flexWrap: 'wrap', flexShrink: 0,
            background: 'rgba(249,247,255,0.7)',
          }}>
            <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
              style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '7px', flex: 1, minWidth: '90px' }}>
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Info</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '7px', flex: 1, minWidth: '90px' }}>
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '7px', flex: 1, minWidth: '110px' }}>
              <option value="ALL">All Types</option>
              <option value="TOWER_OFFLINE">Tower Offline</option>
              <option value="SIGNAL_DEGRADED">Signal Degraded</option>
              <option value="HIGH_CALL_DROP">High Call-Drop</option>
              <option value="LATENCY_SPIKE">Latency Spike</option>
            </select>
          </div>

          {/* ── Alert List ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
            {/* No tower selected — prompt */}
            {!selectedTower && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6B7DB3' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(79,70,229,0.12), rgba(124,58,237,0.10))',
                  border: '1.5px solid rgba(79,70,229,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <Bell size={24} color="#4F46E5" />
                </div>
                <p style={{ fontWeight: '700', color: '#1E1B4B', margin: '0 0 6px', fontSize: '0.9rem' }}>
                  No Tower Selected
                </p>
                <p style={{ margin: 0, fontSize: '0.73rem', lineHeight: '1.5', color: '#8B84B8' }}>
                  Click on a tower from the list or map<br />to view its fault &amp; alert history.
                </p>
              </div>
            )}

            {/* Loading */}
            {selectedTower && loading && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B7DB3', fontSize: '0.8rem' }}>
                <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 8px' }} />
                Loading alerts&hellip;
              </div>
            )}

            {/* Empty — tower selected but no alerts */}
            {selectedTower && !loading && filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: '#6B7DB3' }}>
                <CheckCircle size={36} color="#10B981" style={{ display: 'block', margin: '0 auto 12px' }} />
                <p style={{ fontWeight: '700', color: '#1E1B4B', margin: '0 0 4px', fontSize: '0.85rem' }}>All Clear</p>
                <p style={{ margin: 0, fontSize: '0.72rem' }}>
                  {`No alerts for ${selectedTower.operatorName} \u2013 ${selectedTower.locationName}.`}
                </p>
              </div>
            )}


            <AnimatePresence mode="popLayout">
              {filtered.map(alert => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={handleAcknowledge}
                  onResolve={handleResolve}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* ── Footer ── */}
          <div style={{
            padding: '10px 16px',
            borderTop: '1px solid rgba(99,102,241,0.10)',
            background: 'rgba(249,247,255,0.7)',
            flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '0.65rem', color: '#8B84B8' }}>
              Showing {filtered.length} of {alerts.length} alerts
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.65rem', color: '#059669', fontWeight: '600' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              Live Feed Active
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

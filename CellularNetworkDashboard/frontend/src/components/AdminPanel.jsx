import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plus, Edit2, Trash2, Search, RadioTower,
  CheckCircle2, AlertTriangle, WifiOff, RefreshCw,
  Save, XCircle, Shield, ChevronUp, ChevronDown
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const STATUS_OPTIONS   = ['GOOD', 'DEGRADED', 'OFFLINE'];
const OPERATOR_OPTIONS = ['Jio', 'Airtel', 'Vi', 'BSNL', 'Other'];
const RADIO_OPTIONS    = ['2G', '3G', '4G', '5G'];

const EMPTY_FORM = {
  locationName: '', operatorName: 'Jio', radio: '4G', status: 'GOOD',
  latitude: '', longitude: '', coverageRadius: 1000,
  cid: '', mcc: 404, mnc: 5,
};

const STATUS_CONFIG = {
  GOOD:     { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', Icon: CheckCircle2 },
  DEGRADED: { color: 'text-amber-400',   bg: 'bg-amber-500/10  border-amber-500/30',   Icon: AlertTriangle },
  OFFLINE:  { color: 'text-red-400',     bg: 'bg-red-500/10    border-red-500/30',     Icon: WifiOff },
};

const inputCls  = 'w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500/70 transition-colors';
const selectCls = inputCls + ' cursor-pointer';

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs text-slate-400 font-medium mb-1.5">{label}</label>
    {children}
  </div>
);

/* ══════════════════════════════════════════════════════════════════ */
const AdminPanel = ({ onClose, onTowersChanged, embedded = false }) => {
  const [towers, setTowers]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [filterStatus, setFilterStatus]   = useState('All');
  const [filterOp, setFilterOp]           = useState('All');
  const [sortKey, setSortKey]             = useState('id');
  const [sortDir, setSortDir]             = useState('asc');
  const [modalMode, setModalMode]         = useState(null);
  const [selected, setSelected]           = useState(null);
  const [formData, setFormData]           = useState(EMPTY_FORM);
  const [formLoading, setFormLoading]     = useState(false);
  const [formError, setFormError]         = useState('');
  const [toast, setToast]                 = useState(null);

  /* ── Fetch ─────────────────────────────────────────────────────── */
  const fetchTowers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/towers`);
      setTowers(res.data);
    } catch {
      showToast('Failed to load towers', 'error');
    }
    setLoading(false);
  };
  useEffect(() => { fetchTowers(); }, []);

  /* ── Toast ─────────────────────────────────────────────────────── */
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Modal helpers ──────────────────────────────────────────────── */
  const openAdd = () => {
    setFormData({ ...EMPTY_FORM, cid: Math.floor(Math.random() * 9000000) + 1000000 });
    setFormError('');
    setModalMode('add');
  };
  const openEdit = (tower) => {
    setSelected(tower);
    setFormData({
      locationName: tower.locationName || '', operatorName: tower.operatorName || 'Jio',
      radio: tower.radio || '4G',            status: tower.status || 'GOOD',
      latitude: tower.latitude || '',        longitude: tower.longitude || '',
      coverageRadius: tower.coverageRadius || 1000,
      cid: tower.cid || '',                 mcc: tower.mcc || 404, mnc: tower.mnc || 5,
    });
    setFormError('');
    setModalMode('edit');
  };
  const openDelete = (tower) => { setSelected(tower); setModalMode('delete'); };
  const closeModal = () => { setModalMode(null); setSelected(null); setFormError(''); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  /* ── Validation ─────────────────────────────────────────────────── */
  const validate = () => {
    if (!formData.locationName.trim()) return 'City / Location name is required';
    if (!formData.latitude  || isNaN(formData.latitude))  return 'Valid latitude is required';
    if (!formData.longitude || isNaN(formData.longitude)) return 'Valid longitude is required';
    if (formData.latitude  < -90  || formData.latitude  > 90)  return 'Latitude must be between -90 and 90';
    if (formData.longitude < -180 || formData.longitude > 180) return 'Longitude must be between -180 and 180';
    return null;
  };

  /* ── CRUD ───────────────────────────────────────────────────────── */
  const handleCreate = async () => {
    const err = validate(); if (err) { setFormError(err); return; }
    setFormLoading(true);
    try {
      await axios.post(`${API_URL}/api/towers`, formData);
      await fetchTowers(); onTowersChanged?.(); closeModal();
      showToast('✅ Tower created successfully!');
    } catch { setFormError('Failed to create tower. Check the server and try again.'); }
    setFormLoading(false);
  };

  const handleUpdate = async () => {
    const err = validate(); if (err) { setFormError(err); return; }
    setFormLoading(true);
    try {
      await axios.put(`${API_URL}/api/towers/${selected.id}`, formData);
      await fetchTowers(); onTowersChanged?.(); closeModal();
      showToast('✅ Tower updated successfully!');
    } catch { setFormError('Failed to update tower. Try again.'); }
    setFormLoading(false);
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await axios.delete(`${API_URL}/api/towers/${selected.id}`);
      await fetchTowers(); onTowersChanged?.(); closeModal();
      showToast('🗑️ Tower deleted.');
    } catch { showToast('Failed to delete tower', 'error'); }
    setFormLoading(false);
  };

  /* ── Sort helper ────────────────────────────────────────────────── */
  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  /* ── Filtered + sorted data ─────────────────────────────────────── */
  const filtered = towers
    .filter(t => {
      const q = search.toLowerCase();
      return (
        (!search || t.locationName?.toLowerCase().includes(q) ||
          t.operatorName?.toLowerCase().includes(q) ||
          String(t.cid).includes(q) || String(t.id).includes(q)) &&
        (filterStatus === 'All' || t.status === filterStatus) &&
        (filterOp === 'All' || t.operatorName === filterOp)
      );
    })
    .sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      return va < vb ? (sortDir === 'asc' ? -1 : 1) : va > vb ? (sortDir === 'asc' ? 1 : -1) : 0;
    });

  const stats = {
    total:    towers.length,
    good:     towers.filter(t => t.status === 'GOOD').length,
    degraded: towers.filter(t => t.status === 'DEGRADED').length,
    offline:  towers.filter(t => t.status === 'OFFLINE').length,
  };

  const SortTh = ({ label, col }) => (
    <th className="py-3 pr-4 cursor-pointer select-none group" onClick={() => handleSort(col)}>
      <span className="flex items-center gap-1 text-slate-500 text-xs uppercase tracking-wider group-hover:text-slate-300 transition-colors">
        {label}
        {sortKey === col
          ? (sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)
          : <ChevronUp size={11} className="opacity-20" />}
      </span>
    </th>
  );

  /* ════════════════════════════════════════════════════════════════ */
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className={embedded
        ? "relative z-0 bg-slate-950/97 flex flex-col min-h-screen"
        : "fixed inset-0 z-50 bg-slate-950/97 backdrop-blur-md flex flex-col"
      }
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -24, x: '-50%' }}
            animate={{ opacity: 1, y: 0,   x: '-50%' }}
            exit={{   opacity: 0, y: -24,  x: '-50%' }}
            className={`fixed top-4 left-1/2 z-[100] px-5 py-3 rounded-xl font-medium text-sm shadow-xl border pointer-events-none ${
              toast.type === 'error'
                ? 'bg-red-950/95 border-red-500/50 text-red-200'
                : 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/70 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <Shield size={20} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Admin Panel</h1>
            <p className="text-xs text-slate-500">Tower Management — Full CRUD</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchTowers} title="Refresh"
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors border border-slate-700/50">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={onClose} title="Close"
            className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors border border-slate-700/50">
            <X size={17} />
          </button>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3 px-6 py-4 border-b border-slate-800/60 shrink-0">
        {[
          { label: 'Total Towers', value: stats.total,    color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'GOOD',         value: stats.good,     color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'DEGRADED',     value: stats.degraded, color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'OFFLINE',      value: stats.offline,  color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
        ].map(s => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`${s.bg} border rounded-xl p-3 flex flex-col items-center justify-center`}>
            <span className={`text-3xl font-bold ${s.color}`}>{s.value}</span>
            <span className="text-xs text-slate-500 mt-0.5">{s.label}</span>
          </motion.div>
        ))}
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800/60 gap-3 flex-wrap shrink-0">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search city, operator, CID…"
              className="bg-slate-800/60 border border-slate-700/50 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 w-60 transition-colors" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/60 cursor-pointer">
            <option value="All">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} className="bg-slate-900">{s}</option>)}
          </select>
          <select value={filterOp} onChange={e => setFilterOp(e.target.value)}
            className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/60 cursor-pointer">
            <option value="All">All Operators</option>
            {OPERATOR_OPTIONS.map(o => <option key={o} className="bg-slate-900">{o}</option>)}
          </select>
          <span className="text-slate-600 text-xs">{filtered.length} / {towers.length} towers</span>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-violet-500/25 border border-violet-500/50">
          <Plus size={15} /> Add Tower
        </button>
      </div>

      {/* ── Table ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-500 gap-2">
            <RefreshCw size={18} className="animate-spin" /> Loading towers…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-600 gap-3">
            <RadioTower size={36} />
            <p className="text-sm">No towers match your filters</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <SortTh label="ID"       col="id" />
                <SortTh label="Location" col="locationName" />
                <SortTh label="Operator" col="operatorName" />
                <SortTh label="Radio"    col="radio" />
                <th className="py-3 pr-4 text-left text-slate-500 text-xs uppercase tracking-wider">Coordinates</th>
                <SortTh label="Coverage" col="coverageRadius" />
                <SortTh label="Status"   col="status" />
                <th className="py-3 text-left text-slate-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.map((tower, i) => {
                const sc  = STATUS_CONFIG[tower.status] || STATUS_CONFIG.GOOD;
                const Ico = sc.Icon;
                return (
                  <motion.tr key={tower.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.015, 0.3) }}
                    className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 pr-4 text-slate-500 font-mono text-xs">#{tower.id}</td>
                    <td className="py-3 pr-4">
                      <div className="text-white font-medium">{tower.locationName}</div>
                      <div className="text-slate-500 text-xs font-mono">CID: {tower.cid}</div>
                    </td>
                    <td className="py-3 pr-4 text-slate-300">{tower.operatorName}</td>
                    <td className="py-3 pr-4">
                      <span className="bg-blue-500/10 border border-blue-500/25 text-blue-400 px-2 py-0.5 rounded text-xs font-mono">
                        {tower.radio}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-slate-400">
                      {Number(tower.latitude).toFixed(4)}, {Number(tower.longitude).toFixed(4)}
                    </td>
                    <td className="py-3 pr-4 text-slate-400 text-xs">{tower.coverageRadius}m</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${sc.bg} ${sc.color}`}>
                        <Ico size={11} /> {tower.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(tower)} title="Edit"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/25 transition-all">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => openDelete(tower)} title="Delete"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/25 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ════ ADD / EDIT MODAL ════════════════════════════════════ */}
      <AnimatePresence>
        {(modalMode === 'add' || modalMode === 'edit') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1,    opacity: 1, y:  0 }}
              exit={{   scale: 0.94, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="bg-[#0f172a] border border-slate-700/60 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">

              {/* Modal header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-800 shrink-0">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  {modalMode === 'add'
                    ? <><Plus  size={17} className="text-violet-400" /> Add New Tower</>
                    : <><Edit2 size={17} className="text-blue-400"   /> Edit — {selected?.locationName}</>}
                </h2>
                <button onClick={closeModal} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <X size={15} />
                </button>
              </div>

              {/* Scrollable form */}
              <div className="overflow-y-auto flex-1 p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Field label="City / Location Name *">
                      <input name="locationName" value={formData.locationName} onChange={handleChange}
                        placeholder="e.g. Mumbai, Delhi, Bangalore" className={inputCls} />
                    </Field>
                  </div>
                  <Field label="Operator">
                    <select name="operatorName" value={formData.operatorName} onChange={handleChange} className={selectCls}>
                      {OPERATOR_OPTIONS.map(o => <option key={o} className="bg-slate-900">{o}</option>)}
                    </select>
                  </Field>
                  <Field label="Radio Technology">
                    <select name="radio" value={formData.radio} onChange={handleChange} className={selectCls}>
                      {RADIO_OPTIONS.map(r => <option key={r} className="bg-slate-900">{r}</option>)}
                    </select>
                  </Field>
                  <Field label="Operational Status">
                    <select name="status" value={formData.status} onChange={handleChange} className={selectCls}>
                      {STATUS_OPTIONS.map(s => <option key={s} className="bg-slate-900">{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Coverage Radius (meters)">
                    <input name="coverageRadius" value={formData.coverageRadius} onChange={handleChange}
                      type="number" placeholder="1000" className={inputCls} />
                  </Field>
                  <Field label="Latitude *">
                    <input name="latitude" value={formData.latitude} onChange={handleChange}
                      type="number" step="0.00001" placeholder="e.g. 19.0760" className={inputCls} />
                  </Field>
                  <Field label="Longitude *">
                    <input name="longitude" value={formData.longitude} onChange={handleChange}
                      type="number" step="0.00001" placeholder="e.g. 72.8777" className={inputCls} />
                  </Field>
                  <Field label="Cell ID (CID)">
                    <input name="cid" value={formData.cid} onChange={handleChange}
                      type="number" placeholder="Auto-generated if blank" className={inputCls} />
                  </Field>
                  <Field label="MCC (India = 404)">
                    <input name="mcc" value={formData.mcc} onChange={handleChange}
                      type="number" placeholder="404" className={inputCls} />
                  </Field>
                  <Field label="MNC">
                    <input name="mnc" value={formData.mnc} onChange={handleChange}
                      type="number" placeholder="5" className={inputCls} />
                  </Field>
                </div>

                {formError && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-2 mt-4 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 text-red-400 text-sm">
                    <XCircle size={14} className="shrink-0" /> {formError}
                  </motion.div>
                )}
              </div>

              {/* Modal footer */}
              <div className="flex gap-3 p-5 border-t border-slate-800 shrink-0">
                <button onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors text-sm font-medium">
                  Cancel
                </button>
                <button onClick={modalMode === 'add' ? handleCreate : handleUpdate} disabled={formLoading}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800/60 disabled:cursor-not-allowed text-white transition-colors text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20">
                  {formLoading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  {modalMode === 'add' ? 'Create Tower' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════ DELETE MODAL ═══════════════════════════════════════ */}
      <AnimatePresence>
        {modalMode === 'delete' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              exit={{   scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="bg-[#0f172a] border border-red-500/20 rounded-2xl w-full max-w-sm shadow-2xl p-7">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center">
                  <Trash2 size={26} className="text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Delete Tower?</h2>
                  <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                    Permanently deleting <span className="text-white font-semibold">{selected?.locationName}</span>{' '}
                    ({selected?.operatorName} · {selected?.radio}).
                  </p>
                  <p className="text-red-400/70 text-xs mt-3 leading-relaxed">
                    ⚠️ All telemetry history for this tower will be deleted too.<br />
                    This action <strong>cannot be undone</strong>.
                  </p>
                </div>
                <div className="flex gap-3 w-full mt-1">
                  <button onClick={closeModal}
                    className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors text-sm font-medium">
                    Cancel
                  </button>
                  <button onClick={handleDelete} disabled={formLoading}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-red-900/60 disabled:cursor-not-allowed text-white transition-colors text-sm font-semibold flex items-center justify-center gap-2">
                    {formLoading ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Yes, Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminPanel;

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
  { method: 'GET', path: '/api/towers', desc: 'Fetch all towers' },
  { method: 'GET', path: '/api/towers/:id', desc: 'Get single tower by ID' },
  { method: 'POST', path: '/api/towers', desc: 'Create a new tower' },
  { method: 'PUT', path: '/api/towers/:id', desc: 'Update tower details' },
  { method: 'DELETE', path: '/api/towers/:id', desc: 'Delete a tower' },
  { method: 'GET', path: '/api/speed-tests', desc: 'Fetch speed test results' },
  { method: 'POST', path: '/api/speed-tests', desc: 'Submit new speed test' },
  { method: 'POST', path: '/api/auth/login', desc: 'User authentication' },
  { method: 'POST', path: '/api/auth/register', desc: 'User registration' },
  { method: 'GET', path: '/api/health', desc: 'API health check' },
];

const techStack = [
  { name: 'React 18', category: 'Frontend', color: 'text-cyan-400', icon: '⚛️' },
  { name: 'Vite', category: 'Build Tool', color: 'text-yellow-400', icon: '⚡' },
  { name: 'Tailwind CSS', category: 'Styling', color: 'text-sky-400', icon: '🎨' },
  { name: 'Framer Motion', category: 'Animation', color: 'text-pink-400', icon: '🎬' },
  { name: 'Node.js', category: 'Backend', color: 'text-green-400', icon: '🟢' },
  { name: 'Express.js', category: 'Framework', color: 'text-slate-300', icon: '🚀' },
  { name: 'Socket.IO', category: 'Real-time', color: 'text-orange-400', icon: '⚡' },
  { name: 'MySQL / Aiven', category: 'Database', color: 'text-blue-400', icon: '🗄️' },
  { name: 'Leaflet.js', category: 'Maps', color: 'text-emerald-400', icon: '🗺️' },
  { name: 'Axios', category: 'HTTP Client', color: 'text-purple-400', icon: '📡' },
];

const methodColors = {
  GET: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  POST: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  PUT: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  DELETE: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const DeveloperPanel = ({ onBack }) => {
  const [apiHealth, setApiHealth] = useState(null);
  const [towerCount, setTowerCount] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastChecked, setLastChecked] = useState(new Date());

  const checkHealth = async () => {
    setCheckingHealth(true);
    try {
      const [healthRes, towersRes] = await Promise.all([
        axios.get(`${API_URL}/api/health`),
        axios.get(`${API_URL}/api/towers`),
      ]);
      setApiHealth('online');
      setTowerCount(towersRes.data.length);
    } catch {
      setApiHealth('offline');
    } finally {
      setCheckingHealth(false);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'endpoints', label: 'API Endpoints', icon: Globe },
    { id: 'techstack', label: 'Tech Stack', icon: Code2 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header */}
      <div className="relative z-10 border-b border-slate-800/60 backdrop-blur-sm bg-slate-950/80 sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group text-sm"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <div className="h-5 w-px bg-slate-700" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Code2 size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Developer Panel</h1>
                <p className="text-xs text-slate-500">CellNexus · System & API Documentation</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Health badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold
              ${checkingHealth ? 'bg-slate-800 border-slate-700 text-slate-400'
                : apiHealth === 'online' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
            >
              {checkingHealth ? (
                <div className="w-3 h-3 border border-slate-500 border-t-white rounded-full animate-spin" />
              ) : apiHealth === 'online' ? (
                <CheckCircle2 size={12} />
              ) : (
                <AlertCircle size={12} />
              )}
              {checkingHealth ? 'Checking...' : apiHealth === 'online' ? 'API Online' : 'API Offline'}
            </div>

            <button
              onClick={checkHealth}
              disabled={checkingHealth}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={checkingHealth ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-6 flex gap-1 pb-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px
                  ${activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <AnimatePresence mode="wait">

          {/* ─── OVERVIEW TAB ─── */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-6"
            >
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'API Base URL', value: API_URL, icon: Globe, color: 'text-cyan-400' },
                  { label: 'Active Towers', value: towerCount !== null ? towerCount : '—', icon: Radio, color: 'text-emerald-400' },
                  { label: 'API Status', value: apiHealth === 'online' ? 'Online' : 'Offline', icon: Activity, color: apiHealth === 'online' ? 'text-emerald-400' : 'text-red-400' },
                  { label: 'Last Checked', value: lastChecked.toLocaleTimeString(), icon: Clock, color: 'text-violet-400' },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={14} className={stat.color} />
                        <span className="text-xs text-slate-500 font-medium">{stat.label}</span>
                      </div>
                      <p className="text-sm font-bold text-white break-all">{stat.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Architecture Diagram */}
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                  <Cpu size={16} className="text-cyan-400" /> System Architecture
                </h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 text-xs font-mono text-center overflow-x-auto">
                  {[
                    { label: 'Browser Client', sub: 'React + Vite', color: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' },
                    { arrow: '↔ REST/WS ↔' },
                    { label: 'Express API', sub: 'Node.js + Socket.IO', color: 'bg-blue-500/10 border-blue-500/30 text-blue-300' },
                    { arrow: '↔ SQL Queries ↔' },
                    { label: 'Aiven MySQL', sub: 'Cloud Database', color: 'bg-violet-500/10 border-violet-500/30 text-violet-300' },
                  ].map((item, i) => (
                    item.arrow ? (
                      <span key={i} className="text-slate-600 mx-3 text-base hidden md:block">{item.arrow}</span>
                    ) : (
                      <div key={i} className={`flex-shrink-0 border rounded-xl px-5 py-3 ${item.color}`}>
                        <p className="font-bold">{item.label}</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">{item.sub}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Real-time info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
                  <h3 className="font-bold text-white flex items-center gap-2 mb-3">
                    <Wifi size={15} className="text-orange-400" /> Real-time Engine
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">▸</span> Socket.IO broadcasts <code className="text-orange-300 bg-slate-800 px-1 rounded">telemetry_update</code> events every 3s</li>
                    <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">▸</span> Tower statuses computed dynamically via call-drop probability thresholds</li>
                    <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">▸</span> 900-row CSV dataset replayed in rotating windows per tower</li>
                  </ul>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
                  <h3 className="font-bold text-white flex items-center gap-2 mb-3">
                    <BarChart2 size={15} className="text-pink-400" /> Status Algorithm
                  </h3>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="bg-slate-800/60 rounded-lg p-3 text-slate-300 leading-relaxed">
                      <p className="text-slate-500 mb-1">// Tower health logic</p>
                      <p>dropProb = dropped / incoming</p>
                      <p className="text-emerald-400">if dropProb &lt;= 0.07 → <strong>GOOD</strong></p>
                      <p className="text-amber-400">if dropProb &lt;= 0.10 → <strong>DEGRADED</strong></p>
                      <p className="text-red-400">if dropProb &gt;  0.10 → <strong>OFFLINE</strong></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Environment */}
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
                <h3 className="font-bold text-white flex items-center gap-2 mb-3">
                  <Terminal size={15} className="text-slate-400" /> Environment Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                  {[
                    { key: 'VITE_API_URL', value: API_URL, desc: 'Backend API base URL' },
                    { key: 'PORT', value: '5000', desc: 'Express server port' },
                    { key: 'SOCKET_INTERVAL', value: '3000ms', desc: 'Telemetry broadcast interval' },
                    { key: 'DB_ENGINE', value: 'MySQL (Aiven)', desc: 'Database engine' },
                  ].map(env => (
                    <div key={env.key} className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2.5 gap-4">
                      <div>
                        <p className="text-cyan-400">{env.key}</p>
                        <p className="text-slate-500 text-[10px]">{env.desc}</p>
                      </div>
                      <span className="text-emerald-300 shrink-0">{env.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── ENDPOINTS TAB ─── */}
          {activeTab === 'endpoints' && (
            <motion.div
              key="endpoints"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 mb-5">
                <Globe size={16} className="text-cyan-400" />
                <h2 className="font-bold text-white">REST API Endpoints</h2>
                <span className="ml-auto text-xs text-slate-500 font-mono">Base: {API_URL}</span>
              </div>

              {endpoints.map((ep, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 bg-slate-900/60 border border-slate-800/60 rounded-xl px-5 py-3.5 hover:border-slate-600/60 transition-colors"
                >
                  <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg border font-mono ${methodColors[ep.method]}`}>
                    {ep.method}
                  </span>
                  <code className="text-slate-200 text-sm font-mono flex-1">{ep.path}</code>
                  <span className="text-slate-500 text-xs hidden md:block">{ep.desc}</span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ─── TECH STACK TAB ─── */}
          {activeTab === 'techstack' && (
            <motion.div
              key="techstack"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <div className="flex items-center gap-2 mb-5">
                <Code2 size={16} className="text-cyan-400" />
                <h2 className="font-bold text-white">Technology Stack</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {techStack.map((tech, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ scale: 1.04, y: -3 }}
                    className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 flex flex-col items-center gap-2 text-center hover:border-slate-600/60 transition-all cursor-default"
                  >
                    <span className="text-3xl">{tech.icon}</span>
                    <p className={`font-bold text-sm ${tech.color}`}>{tech.name}</p>
                    <span className="text-[10px] text-slate-600 bg-slate-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {tech.category}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default DeveloperPanel;

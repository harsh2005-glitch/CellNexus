import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { AnimatePresence, motion } from 'framer-motion';

import Header from './components/Header';
import MapView from './components/MapView';
import MetricsGrid from './components/MetricsGrid';
import TowerList from './components/TowerList';
import TowerDetail from './components/TowerDetail';
import CallStatsChart from './components/CallStatsChart';
import SpeedTestModule from './components/SpeedTestModule'; // kept for reference, not rendered
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import NetworkRecommenderModal from './components/NetworkRecommenderModal';
import RoleSelector from './components/RoleSelector';
import DeveloperPanel from './components/DeveloperPanel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_URL);

// Possible views:
//   'role_select'       → Landing screen with 3 role buttons
//   'admin_only'        → Only the AdminPanel (after admin login)
//   'network_operator'  → Full dashboard
//   'developer'         → Developer panel
//   'admin_pending'     → Waiting for admin login (shows auth modal + role screen)

function App() {
  const [currentView, setCurrentView] = useState('role_select');
  const [isTesting, setIsTesting] = useState(false);

  const [towers, setTowers] = useState([]);
  const [selectedTower, setSelectedTower] = useState(null);
  const [operatorFilter, setOperatorFilter] = useState('All Operators');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [showRecommenderModal, setShowRecommenderModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [globalMetrics, setGlobalMetrics] = useState({
    onlineTowers: 0,
    connectedUsers: 0,
    avgDownload: 0,
    avgUpload: 0,
    avgLatency: 0
  });

  const fetchTowers = () => {
    axios.get(`${API_URL}/api/towers`).then(res => {
      setTowers(res.data);
      setGlobalMetrics(prev => ({ ...prev, onlineTowers: res.data.length }));

      if (selectedTower) {
        const updatedSelected = res.data.find(t => t.id === selectedTower.id);
        if (updatedSelected) setSelectedTower(updatedSelected);
      }
    });
  };

  useEffect(() => {
    fetchTowers();

    socket.on('telemetry_update', (updates) => {
      setTowers(prevTowers => {
        const newTowers = [...prevTowers];
        let needsUpdate = false;

        updates.forEach(update => {
          const towerIndex = newTowers.findIndex(t => t.id === update.towerId);
          if (towerIndex !== -1) {
            const tel = update.telemetry;
            const totalIncoming = tel.callTotal || 0;
            const totalAnswered = tel.callAccepted || 0;

            const answerRate = totalIncoming > 0 ? totalAnswered / totalIncoming : 1;
            const incomingHandoff = totalIncoming * 0.3;
            const answeredHandoff = Math.round(incomingHandoff * answerRate);
            const droppedHandoff = Math.max(0, Math.round(incomingHandoff) - answeredHandoff);
            const droppingProb = Math.min(1, Math.max(0, incomingHandoff > 0 ? droppedHandoff / incomingHandoff : 0));

            let newStatus = 'GOOD';
            if (droppingProb > 0.10) newStatus = 'OFFLINE';
            else if (droppingProb > 0.07) newStatus = 'DEGRADED';

            if (newTowers[towerIndex].status !== newStatus) {
              newTowers[towerIndex] = { ...newTowers[towerIndex], status: newStatus };
              needsUpdate = true;

              setSelectedTower(currentSelected => {
                if (currentSelected && currentSelected.id === update.towerId) {
                  return { ...currentSelected, status: newStatus };
                }
                return currentSelected;
              });
            }
          }
        });

        return needsUpdate ? newTowers : prevTowers;
      });
    });

    setGlobalMetrics({
      onlineTowers: 30,
      connectedUsers: 8432,
      avgDownload: 45.5,
      avgUpload: 12.2,
      avgLatency: 42
    });

    return () => {
      socket.off('telemetry_update');
    };
  }, []);

  useEffect(() => {
    if (selectedTower) {
      const matchOp = operatorFilter === 'All Operators' || selectedTower.operatorName === operatorFilter;
      const matchCity = cityFilter === 'All Cities' || selectedTower.locationName === cityFilter;
      if (!matchOp || !matchCity) {
        setSelectedTower(null);
      }
    }
  }, [operatorFilter, cityFilter, selectedTower]);

  const filteredTowers = towers.filter(tower => {
    const matchOperator = operatorFilter === 'All Operators' || tower.operatorName === operatorFilter;
    const matchCity = cityFilter === 'All Cities' || tower.locationName === cityFilter;
    return matchOperator && matchCity;
  });

  // ── Role selection handler ──
  const handleRoleSelect = (roleId) => {
    if (roleId === 'admin') {
      // Check if already logged in as admin
      const savedUser = localStorage.getItem('cellnexus_user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          if (user.role === 'admin') {
            setCurrentUser(user);
            setCurrentView('admin_only');
            return;
          }
        } catch { }
      }
      // Otherwise show auth modal
      setShowAuthModal(true);
      setCurrentView('admin_pending');
    } else if (roleId === 'network_operator') {
      setCurrentView('network_operator');
    } else if (roleId === 'developer') {
      // Coming soon — no action for now
      return;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cellnexus_token');
    localStorage.removeItem('cellnexus_user');
    setCurrentUser(null);
    setCurrentView('role_select');
  };

  // ── Embedded Speed Test logic ──
  const runSpeedTest = async () => {
    if (isTesting) return;
    setIsTesting(true);

    try {
      // Phase 1: Ping
      const pingStart = performance.now();
      await axios.get(`${API_URL}/api/speed-tests/ping`);
      const latencyMs = Math.round(performance.now() - pingStart);

      // Phase 2: Download (20 MB)
      const dlSize = 20 * 1024 * 1024;
      const dlStart = performance.now();
      const response = await fetch(`${API_URL}/api/speed-tests/download?size=${dlSize}`);
      const reader = response.body.getReader();
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }
      const dlDuration = (performance.now() - dlStart) / 1000;
      const downloadSpeedMbps = parseFloat(((dlSize * 8) / dlDuration / 1_000_000).toFixed(2));

      // Phase 3: Upload (5 MB)
      const ulSize = 5 * 1024 * 1024;
      const dummyData = new Uint8Array(ulSize);
      const ulStart = performance.now();
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}/api/speed-tests/upload`, true);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
        xhr.onload = resolve;
        xhr.onerror = reject;
        xhr.send(dummyData);
      });
      const ulDuration = (performance.now() - ulStart) / 1000;
      const uploadSpeedMbps = parseFloat(((ulSize * 8) / ulDuration / 1_000_000).toFixed(2));

      // Save to DB
      await axios.post(`${API_URL}/api/speed-tests`, {
        downloadSpeedMbps,
        uploadSpeedMbps,
        latencyMs,
      });

      // Update the top metric cards
      setGlobalMetrics(prev => ({
        ...prev,
        avgDownload: downloadSpeedMbps,
        avgUpload: uploadSpeedMbps,
        avgLatency: latencyMs,
      }));
    } catch (err) {
      console.error('Speed test failed:', err);
    }

    setIsTesting(false);
  };

  // ── ROLE SELECT SCREEN ──
  if (currentView === 'role_select' || currentView === 'admin_pending') {
    return (
      <>
        <RoleSelector onSelectRole={handleRoleSelect} />

        {/* Auth Modal for Admin Login */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            setCurrentView('role_select');
          }}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setShowAuthModal(false);
            if (user.role === 'admin') {
              setCurrentView('admin_only');
            } else {
              // Non-admin logged in via admin button — redirect to dashboard
              setCurrentView('network_operator');
            }
          }}
        />
      </>
    );
  }

  // ── DEVELOPER VIEW ──
  if (currentView === 'developer') {
    return (
      <DeveloperPanel onBack={() => setCurrentView('role_select')} />
    );
  }

  // ── ADMIN ONLY VIEW ──
  if (currentView === 'admin_only') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        {/* Slim top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
            <div>
              <span className="font-bold text-white text-sm">Admin Panel</span>
              <p className="text-xs text-slate-500">CellNexus · Tower Management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 rounded-full px-3 py-1">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-xs font-semibold text-slate-200">{currentUser.username}</span>
                <span className="text-[10px] bg-slate-800 text-violet-400 px-1.5 py-0.5 rounded font-mono uppercase">admin</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 transition-all text-xs font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              Logout
            </button>
          </div>
        </div>

        {/* Full-screen Admin Panel */}
        <div className="flex-1 overflow-auto">
          <AdminPanel
            onClose={handleLogout}
            onTowersChanged={fetchTowers}
            embedded={true}
          />
        </div>
      </div>
    );
  }

  // ── NETWORK OPERATOR — FULL DASHBOARD ──
  return (
    <motion.div
      className="min-h-screen flex flex-col p-4 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Header
        towers={towers}
        operatorFilter={operatorFilter}
        setOperatorFilter={setOperatorFilter}
        cityFilter={cityFilter}
        setCityFilter={setCityFilter}
        onAdminOpen={() => { }}
        currentUser={currentUser}
        onAuthOpen={() => { }}
        onLogout={handleLogout}
        onOpenRecommender={() => setShowRecommenderModal(true)}
        onBackToRoles={() => setCurrentView('role_select')}
        onRunSpeedTest={runSpeedTest}
        isTesting={isTesting}
      />

      <MetricsGrid metrics={globalMetrics} isTesting={isTesting} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Left Column: Map */}
        <div className="glass-panel overflow-hidden relative h-[450px] lg:h-[480px]">
          <MapView
            towers={filteredTowers}
            selectedTower={selectedTower}
            onSelectTower={setSelectedTower}
          />
        </div>

        {/* Middle Column: Tower List or Details */}
        <div className="glass-panel p-4 h-[450px] lg:h-[480px] flex flex-col">
          {selectedTower ? (
            <TowerDetail
              tower={selectedTower}
              onBack={() => setSelectedTower(null)}
            />
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-4 text-white">Towers</h2>
              <div className="flex-1 overflow-hidden">
                <TowerList
                  towers={filteredTowers}
                  selectedTower={selectedTower}
                  onSelectTower={setSelectedTower}
                />
              </div>
            </>
          )}
        </div>

        {/* Right Column: Call Statistics */}
        <div className="glass-panel p-4 h-[450px] lg:h-[480px] flex flex-col">
          <h2 className="text-xl font-semibold mb-2 text-white">Call Statistics</h2>
          <div className="flex-1 overflow-hidden">
            {selectedTower ? (
              <CallStatsChart towerId={selectedTower.id} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                Select a tower to see stats
              </div>
            )}
          </div>
        </div>

      </div>


      {/* Network Recommender Modal */}
      <NetworkRecommenderModal
        isOpen={showRecommenderModal}
        onClose={() => setShowRecommenderModal(false)}
        towers={towers}
        onSelectTower={(tower) => {
          setSelectedTower(tower);
        }}
      />
    </motion.div>
  );
}

export default App;

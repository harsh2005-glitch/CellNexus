import React, { useState } from 'react';
import { Activity, Radio, MapPin, Network, Shield, LogIn, LogOut, UserCheck, ArrowLeft, Gauge } from 'lucide-react';
import MyNetworkModal from './MyNetworkModal';

const Header = ({ towers = [], operatorFilter, setOperatorFilter, cityFilter, setCityFilter, onAdminOpen, currentUser, onAuthOpen, onLogout, onOpenRecommender, onBackToRoles, onRunSpeedTest, isTesting = false }) => {
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);

  // Derive unique options directly from loaded tower data
  const operators = ['All Operators', ...new Set(towers.map(t => t.operatorName))].filter(Boolean);
  const cities = ['All Cities', ...new Set(towers.map(t => t.locationName))].filter(Boolean);

  return (
    <div className="glass-panel flex flex-col md:flex-row items-center justify-between p-4 px-4 sm:px-6 mb-2 mt-2 gap-4">
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
          <Radio className="text-blue-400" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            User Panel
          </h1>
          <p className="text-xs text-slate-400">Network Intelligence Dashboard</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
        {/* Back to Role Selection */}
        {onBackToRoles && (
          <button
            onClick={onBackToRoles}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-all text-xs font-medium"
          >
            <ArrowLeft size={13} />
            Switch Role
          </button>
        )}

        <select
          value={operatorFilter || 'All Operators'}
          onChange={(e) => setOperatorFilter && setOperatorFilter(e.target.value)}
          className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500 transition-colors"
        >
          {operators.map(op => (
            <option key={op} value={op}>{op}</option>
          ))}
        </select>

        <select
          value={cityFilter || 'All Cities'}
          onChange={(e) => setCityFilter && setCityFilter(e.target.value)}
          className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500 transition-colors"
        >
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <div className="hidden md:block h-8 w-[1px] bg-slate-700 mx-1"></div>


        <button
          onClick={() => setIsNetworkModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 text-slate-300 transition-all text-sm font-medium"
        >
          <Network size={16} className="text-indigo-400" />
          My Network
        </button>

        {/* User Auth Controls */}
        {currentUser ? (
          <div className="flex items-center gap-2">
            {currentUser.role === 'admin' && (
              <button
                onClick={onAdminOpen}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/40 hover:border-violet-400/70 text-violet-300 hover:text-violet-200 transition-all text-xs font-semibold"
              >
                <Shield size={14} className="text-violet-400" />
                Admin Panel
              </button>
            )}
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-200">{currentUser.username}</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono uppercase">
                {currentUser.role}
              </span>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="ml-1 text-slate-400 hover:text-red-400 p-1 rounded-full transition-colors flex items-center gap-1 text-xs"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onRunSpeedTest}
            disabled={isTesting}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-white transition-all text-sm font-semibold shadow-md ${
              isTesting
                ? 'bg-cyan-700/60 cursor-not-allowed shadow-none'
                : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/25'
            }`}
          >
            {isTesting ? (
              <>
                <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                Testing...
              </>
            ) : (
              <>
                <Gauge size={15} />
                Run Speed Test
              </>
            )}
          </button>
        )}

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
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

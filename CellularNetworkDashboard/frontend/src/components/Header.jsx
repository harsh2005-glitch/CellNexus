import React, { useState } from 'react';
import { Activity, Radio, MapPin, Network } from 'lucide-react';
import MyNetworkModal from './MyNetworkModal';

const Header = ({ towers = [], operatorFilter, setOperatorFilter, cityFilter, setCityFilter }) => {
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
            CellNexus
          </h1>
          <p className="text-xs text-slate-400">Network Intelligence Dashboard</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
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

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Sync
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

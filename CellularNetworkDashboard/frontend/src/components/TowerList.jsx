import React from 'react';
import { motion } from 'framer-motion';
import { SignalHigh, SignalMedium, SignalLow, RadioTower } from 'lucide-react';

const TowerList = ({ towers, selectedTower, onSelectTower }) => {

  const getSignalIcon = (status) => {
    switch (status) {
      case 'GOOD': return <SignalHigh className="text-emerald-500" size={18} />;
      case 'DEGRADED': return <SignalMedium className="text-amber-500" size={18} />;
      case 'OFFLINE': return <SignalLow className="text-red-500" size={18} />;
      default: return <SignalHigh className="text-emerald-500" size={18} />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'GOOD': return <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-xs">Good</span>;
      case 'DEGRADED': return <span className="text-amber-400 bg-amber-500/10 px-2 py-1 rounded text-xs">Degraded</span>;
      case 'OFFLINE': return <span className="text-red-400 bg-red-500/10 px-2 py-1 rounded text-xs">Offline</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search tower ID or location..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-500 text-slate-200"
        />
      </div>

      <div className="overflow-y-auto flex-1 pr-2 space-y-2 custom-scrollbar">
        {towers.length === 0 && (
          <div className="text-center text-slate-500 py-4 text-sm">Loading towers...</div>
        )}

        {towers.map((tower, idx) => (
          <motion.div
            key={tower.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            onClick={() => onSelectTower(tower)}
            className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 flex items-center justify-between
              ${selectedTower?.id === tower.id
                ? 'bg-blue-600/20 border-blue-500/50'
                : 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700 text-slate-400">
                <RadioTower size={14} />
              </div>
              <div>
                <div className="font-medium text-slate-200 text-sm">{tower.locationName}</div>
                <div className="text-xs text-slate-400">{tower.operatorName}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {getSignalIcon(tower.status)}
              {getStatusBadge(tower.status)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TowerList;

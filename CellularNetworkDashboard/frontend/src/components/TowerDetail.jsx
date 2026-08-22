import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RadioTower, MapPin, Activity, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';

const TowerDetail = ({ tower, onBack }) => {
  if (!tower) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'GOOD': return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'DEGRADED': return <Activity className="text-amber-500" size={20} />;
      case 'OFFLINE': return <ShieldAlert className="text-red-500" size={20} />;
      default: return <CheckCircle2 className="text-emerald-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'GOOD': return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
      case 'DEGRADED': return 'text-amber-400 bg-amber-500/10 border border-amber-500/20';
      case 'OFFLINE': return 'text-red-400 bg-red-500/10 border border-red-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border border-slate-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full"
    >
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-xl font-semibold text-white">Tower Details</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
        {/* Core Info Row */}
        <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-600 text-slate-300 shrink-0">
            <RadioTower size={24} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">{tower.locationName}</h3>
            <div className="text-sm text-slate-400">{tower.operatorName} Network</div>
          </div>
        </div>

        {/* Status Box */}
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 flex items-center justify-between">
          <span className="text-slate-400 text-sm font-medium">Operational Status</span>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(tower.status)}`}>
            {getStatusIcon(tower.status)}
            {tower.status}
          </div>
        </div>

        {/* Details List */}
        <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden text-sm">
          <div className="border-b border-slate-700/50 p-4 flex justify-between items-center">
            <span className="text-slate-400 font-medium">Tower ID</span>
            <span className="text-slate-200 font-mono bg-slate-800 px-2 py-1 rounded text-xs">T-{tower.cid}</span>
          </div>
          <div className="border-b border-slate-700/50 p-4 flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-2 font-medium"><MapPin size={16} /> Coordinates</span>
            <span className="text-slate-200 text-right">{Number(tower.latitude).toFixed(4)},<br />{Number(tower.longitude).toFixed(4)}</span>
          </div>

          {tower.radio && (
            <div className="border-b border-slate-700/50 p-4 flex justify-between items-center">
              <span className="text-slate-400 font-medium">Radio Technology</span>
              <span className="text-slate-200">{tower.radio}</span>
            </div>
          )}
          {(tower.mcc || tower.mnc) && (
            <div className="border-b border-slate-700/50 p-4 flex justify-between items-center">
              <span className="text-slate-400 font-medium">Network Code</span>
              <span className="text-slate-200">MCC {tower.mcc || 'N/A'}, MNC {tower.mnc || 'N/A'}</span>
            </div>
          )}
          <div className="p-4 flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-2 font-medium"><Zap size={16} /> Coverage Radius</span>
            <span className="text-slate-200">{tower.coverageRadius} meters</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TowerDetail;

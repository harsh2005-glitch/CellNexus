import React from 'react';
import { Activity, Upload, ArrowDown, Radio, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const MetricCard = ({ title, value, icon: Icon, delay, color = 'blue', isTesting = false }) => {
  const colorMap = {
    blue:    { icon: 'text-blue-400/80',    ring: 'ring-blue-500/40',    glow: 'bg-blue-500/10'    },
    cyan:    { icon: 'text-cyan-400/80',    ring: 'ring-cyan-500/40',    glow: 'bg-cyan-500/10'    },
    violet:  { icon: 'text-violet-400/80',  ring: 'ring-violet-500/40',  glow: 'bg-violet-500/10'  },
    emerald: { icon: 'text-emerald-400/80', ring: 'ring-emerald-500/40', glow: 'bg-emerald-500/10' },
    indigo:  { icon: 'text-indigo-400/80',  ring: 'ring-indigo-500/40',  glow: 'bg-indigo-500/10'  },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      className={`glass-panel-hover p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${isTesting ? `ring-1 ${c.ring}` : ''}`}
    >
      {isTesting && (
        <motion.div
          className={`absolute inset-0 ${c.glow} pointer-events-none`}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
        />
      )}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        <div
          className={`${c.icon} ${isTesting ? 'animate-spin' : ''}`}
          style={isTesting ? { animationDuration: '2s' } : {}}
        >
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-baseline gap-2 relative z-10">
        {isTesting ? (
          <span className="text-3xl font-bold tracking-tight text-slate-400 animate-pulse">
            — — —
          </span>
        ) : (
          <motion.span
            key={value}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl font-bold text-white tracking-tight"
          >
            {value}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
};

const MetricsGrid = ({ metrics, isTesting = false }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-2">
      <MetricCard
        title="Total Towers Online"
        value={metrics.onlineTowers}
        icon={Radio}
        delay={0.05}
        color="indigo"
      />
      <MetricCard
        title="Total Connected Users"
        value={metrics.connectedUsers.toLocaleString()}
        icon={Users}
        delay={0.1}
        color="emerald"
      />
      <MetricCard
        title="Avg Download Speed"
        value={`${metrics.avgDownload} Mbps`}
        icon={ArrowDown}
        delay={0.15}
        color="blue"
        isTesting={isTesting}
      />
      <MetricCard
        title="Avg Upload Speed"
        value={`${metrics.avgUpload} Mbps`}
        icon={Upload}
        delay={0.2}
        color="cyan"
        isTesting={isTesting}
      />
      <MetricCard
        title="Average Latency"
        value={`${metrics.avgLatency} ms`}
        icon={Activity}
        delay={0.25}
        color="violet"
        isTesting={isTesting}
      />
    </div>
  );
};

export default MetricsGrid;

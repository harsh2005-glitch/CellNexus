import React from 'react';
import { Radio, Users, Activity, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const MetricCard = ({ title, value, icon: Icon, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="glass-panel-hover p-5 flex flex-col justify-between"
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
      <div className="text-blue-400/80">
        <Icon size={20} />
      </div>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
    </div>
  </motion.div>
);

const MetricsGrid = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
      <MetricCard 
        title="Total Towers Online" 
        value={metrics.onlineTowers} 
        icon={Radio} 
        delay={0.1} 
      />
      <MetricCard 
        title="Total Connected Users" 
        value={metrics.connectedUsers.toLocaleString()} 
        icon={Users} 
        delay={0.2} 
      />
      <MetricCard 
        title="Avg Download Speed" 
        value={`${metrics.avgDownload} Mbps`} 
        icon={Zap} 
        delay={0.3} 
      />
      <MetricCard 
        title="Average Latency" 
        value={`${metrics.avgLatency} ms`} 
        icon={Activity} 
        delay={0.4} 
      />
    </div>
  );
};

export default MetricsGrid;

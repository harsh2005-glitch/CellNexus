import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Custom Tooltip for advanced telecom metrics
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-600 p-2 rounded-lg shadow-xl text-xs z-50 min-w-[130px]">
        <p className="text-blue-400 font-bold mb-1 border-b border-slate-700 pb-1">Connects</p>
        <p className="text-blue-300 ml-1">New: {dataPoint.answeredNew}</p>
        <p className="text-cyan-300 ml-1 mb-1">Handoff: {dataPoint.answeredHandoff}</p>

        <p className="text-red-400 font-bold mt-1 mb-1 border-b border-slate-700 pb-1">Failures</p>
        <p className="text-orange-400 ml-1">Blocked: {dataPoint.blockedNew}</p>
        <p className="text-red-500 ml-1">Dropped: {dataPoint.droppedHandoff}</p>
      </div>
    );
  }
  return null;
};

const CallStatsChart = ({ towerId }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Clear data when switching towers
    setData([]);

    const fetchTelemetries = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/towers/${towerId}/telemetry`);

        // Map MySQL telemetry data to chart format
        const formattedData = res.data.map((t, i) => {
          const date = new Date(t.timestamp);
          const timeLabel = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

          const totalIncoming = t.callTotal || 0;
          const totalAnswered = t.callAccepted || 0;

          // Apply mathematical split derived directly from the Telecom CSV logic
          const answerRate = totalIncoming > 0 ? totalAnswered / totalIncoming : 1;
          const incomingNew = totalIncoming * 0.7;
          const incomingHandoff = totalIncoming * 0.3;

          const answeredNew = Math.round(incomingNew * answerRate);
          const answeredHandoff = Math.round(incomingHandoff * answerRate);

          const blockedNew = Math.max(0, Math.round(incomingNew) - answeredNew);
          const droppedHandoff = Math.max(0, Math.round(incomingHandoff) - answeredHandoff);

          const blockingProb = incomingNew > 0 ? blockedNew / incomingNew : 0;
          const droppingProb = Math.min(1, Math.max(0, incomingHandoff > 0 ? droppedHandoff / incomingHandoff : 0));

          return {
            answeredNew,
            answeredHandoff,
            blockedNew,
            droppedHandoff,
            blockingProb,
            droppingProb,
            responseTime: t.latency || 0,
            timeFormatted: timeLabel
          };
        });

        setData(formattedData);
      } catch (error) {
        console.error("Failed to fetch telemetries", error);
      }
    };

    // Fetch immediately
    fetchTelemetries();

    // Poll every 3 seconds to sync with the backend traffic simulator
    const interval = setInterval(fetchTelemetries, 3000);

    return () => clearInterval(interval);
  }, [towerId]);

  if (data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm">
        Initializing 60s stream...
      </div>
    );
  }

  const latestPoint = data[data.length - 1] || {};
  const blockingPercent = ((latestPoint.blockingProb || 0) * 100).toFixed(1);
  const droppingPercent = ((latestPoint.droppingProb || 0) * 100).toFixed(1);
  // Raw 0–1 probability values for the probability cards
  const blockingRaw = (latestPoint.blockingProb || 0).toFixed(4);
  const droppingRaw = (latestPoint.droppingProb || 0).toFixed(4);
  const isDangerDrop = (latestPoint.droppingProb || 0) > 0.10;

  return (
    <div className="h-full w-full mt-4 flex flex-col">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 10, left: 15, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorAccepted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis
              dataKey="timeFormatted"
              stroke="#94A3B8"
              fontSize={10}
              tickMargin={10}
              minTickGap={30}
              label={{ value: 'Timestamp', position: 'insideBottom', offset: -10, fill: '#94A3B8', fontSize: 12 }}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={10}
              label={{ value: 'Number of Calls', angle: -90, position: 'insideLeft', offset: 12, fill: '#94A3B8', fontSize: 11, style: { textAnchor: 'middle' } }}
            />
            <Tooltip
              content={<CustomTooltip />}
              offset={40}
              cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '3 3' }}
            />

            <Area stackId="connects" type="monotone" dataKey="answeredNew" name="Ans New" stroke="#3B82F6" fillOpacity={1} fill="url(#colorAccepted)" isAnimationActive={false} />
            <Area stackId="connects" type="monotone" dataKey="answeredHandoff" name="Ans Handoff" stroke="#22D3EE" fillOpacity={0.6} fill="url(#colorAccepted)" isAnimationActive={false} />

            <Area stackId="failures" type="monotone" dataKey="blockedNew" name="Blocked" stroke="#F97316" fillOpacity={0.8} fill="url(#colorBlocked)" isAnimationActive={false} />
            <Area stackId="failures" type="monotone" dataKey="droppedHandoff" name="Dropped" stroke="#EF4444" fillOpacity={1} fill="url(#colorBlocked)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Live KPI Cards — 2×2 grid */}
      <div className="shrink-0 mt-2 px-2 pb-2 grid grid-cols-2 gap-2">

        {/* Row 1 — Blocking Probability */}
        <div className="bg-slate-900 border border-amber-500/40 rounded-lg flex flex-col items-center justify-center p-2 relative overflow-hidden">
          <div className="text-xs text-amber-400 font-semibold z-10">Blocking Probability</div>
          <div className="text-xl font-bold font-mono text-amber-400 z-10">{blockingRaw}</div>
          <div className="absolute bottom-0 left-0 h-1 bg-amber-500/60 transition-all duration-300" style={{ width: `${(latestPoint.blockingProb || 0) * 100}%` }}></div>
        </div>

        {/* Row 1 — Dropping Probability */}
        <div className={`border rounded-lg flex flex-col items-center justify-center p-2 relative overflow-hidden transition-colors ${isDangerDrop ? 'bg-red-900/30 border-red-400/60' : 'bg-slate-900 border-red-500/30'}`}>
          <div className="text-xs text-red-400 font-semibold z-10 flex items-center gap-1">
            Dropping Probability
            {isDangerDrop && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>}
          </div>
          <div className="text-xl font-bold font-mono text-red-400 z-10">
            {droppingRaw}
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-red-500/60 transition-all duration-300" style={{ width: `${(latestPoint.droppingProb || 0) * 100}%` }}></div>
        </div>

        {/* Row 2 — End-to-End Delay */}
        <div className="bg-slate-900 border border-orange-500/30 rounded-lg flex flex-col items-center justify-center p-2 relative overflow-hidden">
          <div className="text-xs text-slate-400 font-medium z-10">End-to-End Delay</div>
          <div className="text-xl font-bold font-mono text-orange-400 z-10">{latestPoint.responseTime || 0} ms</div>
          <div className="absolute bottom-0 left-0 h-1 bg-orange-500/50 transition-all duration-300" style={{ width: `${Math.min((latestPoint.responseTime || 0) / 2, 100)}%` }}></div>
        </div>

        {/* Row 2 — Throughput */}
        <div className={`border rounded-lg flex flex-col items-center justify-center p-2 relative overflow-hidden transition-colors ${isDangerDrop ? 'bg-red-500/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-slate-900 border-slate-700/50'}`}>
          <div className="text-xs text-slate-400 font-medium z-10 flex items-center gap-1">
            Throughput
            {isDangerDrop && <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>}
          </div>
          <div className={`text-xl font-bold font-mono z-10 ${isDangerDrop ? 'text-red-400 scale-110 transition-transform' : 'text-rose-400'}`}>
            {droppingPercent}%
          </div>
          <div className={`absolute bottom-0 left-0 h-1 transition-all duration-300 ${isDangerDrop ? 'bg-red-500' : 'bg-rose-500/50'}`} style={{ width: `${(latestPoint.droppingProb || 0) * 100}%` }}></div>
        </div>

      </div>
    </div>
  );
};

export default CallStatsChart;

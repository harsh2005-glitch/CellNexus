import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Custom Tooltip to display Response Time alongside accepted/dropped calls
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="bg-slate-800 border border-slate-600 p-3 rounded-lg shadow-xl text-sm">
        <p className="text-blue-400">Calls Accepted : {dataPoint.answered}</p>
        <p className="text-red-400">Calls Dropped : {dataPoint.abandoned}</p>
        <p className="text-indigo-400 mt-1 pt-1 border-t border-slate-700">Response Time : {dataPoint.responseTime}s</p>
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
          
          return {
            answered: t.callAccepted || 0,
            abandoned: (t.callTotal || 0) - (t.callAccepted || 0),
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

  return (
    <div className="h-full w-full mt-4">
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 20 }}
        >
          <defs>
            <linearGradient id="colorAccepted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="timeFormatted" 
            stroke="#94A3B8" 
            fontSize={10} 
            tickMargin={10}
            minTickGap={30}
            label={{ value: 'Time (sec)', position: 'insideBottom', offset: -10, fill: '#94A3B8', fontSize: 12 }}
          />
          <YAxis 
            stroke="#94A3B8" 
            fontSize={10} 
            label={{ value: 'Number of calls', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 12, offset: -10 }} 
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Top Line: Total Calls accepted */}
          <Area 
            type="monotone" 
            dataKey="answered" 
            name="Calls Accepted"
            stroke="#3B82F6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorAccepted)" 
            isAnimationActive={false} // Disable animation for smoother socket updates
          />
          
          {/* Bottom Line: Blocked/Dropped calls */}
          <Area 
            type="monotone" 
            dataKey="abandoned" 
            name="Calls Dropped"
            stroke="#EF4444" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorBlocked)" 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CallStatsChart;

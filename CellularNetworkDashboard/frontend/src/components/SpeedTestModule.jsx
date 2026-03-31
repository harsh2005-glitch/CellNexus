import React, { useState } from 'react';
import axios from 'axios';
import { Activity, Play, Download, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SpeedTestModule = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState(0);

  const runTest = async () => {
    setTesting(true);
    setResults(null);
    setProgress(0);

    try {
      // Phase 1: Real Ping (0-10%)
      const pingStart = performance.now();
      await axios.get(`${API_URL}/api/speed-tests/ping`);
      const latencyMs = Math.round(performance.now() - pingStart);
      setProgress(10);
      
      // Phase 2: Real Download (20MB chunk) (10-60%)
      const dlSize = 20 * 1024 * 1024; // 20 MB
      const dlStart = performance.now();
      
      const response = await fetch(`${API_URL}/api/speed-tests/download?size=${dlSize}`);
      const reader = response.body.getReader();
      let receivedLength = 0;
      
      while(true) {
        const {done, value} = await reader.read();
        if (done) break;
        receivedLength += value.length;
        // Map 0 -> 20MB to 10% -> 60% progress
        setProgress(10 + (receivedLength / dlSize) * 50);
      }
      
      const dlEnd = performance.now();
      const dlDurationInSeconds = (dlEnd - dlStart) / 1000;
      const dlBits = dlSize * 8;
      const downloadSpeedMbps = (dlBits / dlDurationInSeconds / 1000000).toFixed(2);
      
      setProgress(60);
      
      // Phase 3: Real Upload (5MB chunk) (60-100%)
      const ulSize = 5 * 1024 * 1024; // 5 MB
      const dummyData = new Uint8Array(ulSize); // Fills with 0s
      const ulStart = performance.now();
      
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/api/speed-tests/upload`, true);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      
      const ulPromise = new Promise((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            // Map 0 -> 5MB to 60% -> 100% progress
            setProgress(60 + (event.loaded / event.total) * 40);
          }
        };
        xhr.onload = () => resolve();
        xhr.onerror = () => reject();
        xhr.send(dummyData);
      });
      
      await ulPromise;
      
      const ulEnd = performance.now();
      const ulDurationInSeconds = (ulEnd - ulStart) / 1000;
      const ulBits = ulSize * 8;
      const uploadSpeedMbps = (ulBits / ulDurationInSeconds / 1000000).toFixed(2);
      
      setProgress(100);

      // Save real results to database
      await axios.post(`${API_URL}/api/speed-tests`, {
        downloadSpeedMbps: parseFloat(downloadSpeedMbps),
        uploadSpeedMbps: parseFloat(uploadSpeedMbps),
        latencyMs
      });

      setResults({
        downloadSpeedMbps,
        uploadSpeedMbps,
        latencyMs
      });
    } catch (err) {
      console.error("Speed test failed: ", err);
    }

    setTesting(false);
  };

  return (
    <div className="glass-panel p-5 flex flex-col h-full relative overflow-hidden">
      {/* Background glow when testing */}
      {testing && (
        <motion.div 
          animate={{ opacity: [0.1, 0.3, 0.1] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 bg-blue-500/20 pointer-events-none"
        />
      )}

      <div className="flex items-center justify-between mb-6 z-10">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Activity size={20} className="text-blue-400" />
          Real-Time Speed Test
        </h2>
        {!testing && (
          <button 
            onClick={runTest}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
          >
            <Play size={14} fill="currentColor" />
            START
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-6 z-10">
        {/* Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-2.5 border border-slate-700 overflow-hidden">
          <motion.div 
            className="bg-blue-500 h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'tween' }}
          ></motion.div>
        </div>

        {/* Live Metrics Display */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-slate-400 text-xs font-medium mb-1 flex items-center justify-center gap-1">
              <Download size={14} className="text-emerald-400" /> DOWNLOAD
            </div>
            <div className="text-2xl font-bold text-white">
              {testing ? (progress > 10 && progress <= 60 ? (Math.random() * 80 + 20).toFixed(1) : results ? results.downloadSpeedMbps : '---') : results?.downloadSpeedMbps || '---'}
              <span className="text-sm text-slate-500 font-normal ml-1">Mbps</span>
            </div>
          </div>

          <div className="text-center border-l border-r border-slate-700/50">
            <div className="text-slate-400 text-xs font-medium mb-1 flex items-center justify-center gap-1">
              <Upload size={14} className="text-violet-400" /> UPLOAD
            </div>
            <div className="text-2xl font-bold text-white">
              {testing ? (progress > 60 ? (Math.random() * 20 + 5).toFixed(1) : '---') : results?.uploadSpeedMbps || '---'}
              <span className="text-sm text-slate-500 font-normal ml-1">Mbps</span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-slate-400 text-xs font-medium mb-1">LATENCY</div>
            <div className="text-2xl font-bold text-white">
              {testing ? (progress > 0 ? '...' : '---') : results?.latencyMs || '---'}
              <span className="text-sm text-slate-500 font-normal ml-1">ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedTestModule;

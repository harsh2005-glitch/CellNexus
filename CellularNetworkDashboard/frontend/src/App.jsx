import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

import Header from './components/Header';
import MapView from './components/MapView';
import MetricsGrid from './components/MetricsGrid';
import TowerList from './components/TowerList';
import TowerDetail from './components/TowerDetail';
import CallStatsChart from './components/CallStatsChart';
import SpeedTestModule from './components/SpeedTestModule';

const socket = io('http://localhost:5000');

function App() {
  const [towers, setTowers] = useState([]);
  const [selectedTower, setSelectedTower] = useState(null);
  const [operatorFilter, setOperatorFilter] = useState('All Operators');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [globalMetrics, setGlobalMetrics] = useState({
    onlineTowers: 0,
    connectedUsers: 0,
    avgDownload: 0,
    avgUpload: 0,
    avgLatency: 0
  });

  const fetchTowers = () => {
    axios.get('http://localhost:5000/api/towers').then(res => {
      setTowers(res.data);
      setGlobalMetrics(prev => ({ ...prev, onlineTowers: res.data.length }));
      
      // Update selected tower if it exists
      if(selectedTower) {
        const updatedSelected = res.data.find(t => t.id === selectedTower.id);
        if(updatedSelected) setSelectedTower(updatedSelected);
      }
    });
  };

  useEffect(() => {
    // 1. Fetch initial towers
    fetchTowers();

    // 2. Listen for real-time telemetry updates (Disabled user increment)
    socket.on('telemetry_update', (updates) => {
      // We are intentionally keeping Total Connected Users constant for the demo.
      // If needed, we could still update other metrics here.
    });

    // 3. Fake initial global metrics for design
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

  // Clear selection if it gets filtered out
  useEffect(() => {
    if (selectedTower) {
      const matchOp = operatorFilter === 'All Operators' || selectedTower.operatorName === operatorFilter;
      const matchCity = cityFilter === 'All Cities' || selectedTower.locationName === cityFilter;
      if (!matchOp || !matchCity) {
        setSelectedTower(null);
      }
    }
  }, [operatorFilter, cityFilter, selectedTower]);

  // Compute filtered towers for Map and List
  const filteredTowers = towers.filter(tower => {
    const matchOperator = operatorFilter === 'All Operators' || tower.operatorName === operatorFilter;
    const matchCity = cityFilter === 'All Cities' || tower.locationName === cityFilter;
    return matchOperator && matchCity;
  });

  return (
    <div className="min-h-screen flex flex-col p-4 gap-4">
      <Header 
        towers={towers}
        operatorFilter={operatorFilter}
        setOperatorFilter={setOperatorFilter}
        cityFilter={cityFilter}
        setCityFilter={setCityFilter}
      />
      
      <MetricsGrid metrics={globalMetrics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        
        {/* Left Column: Map */}
        <div className="glass-panel overflow-hidden relative h-[400px] lg:h-[450px]">
          <MapView 
            towers={filteredTowers} 
            selectedTower={selectedTower} 
            onSelectTower={setSelectedTower} 
          />
        </div>

        {/* Middle Column: Tower List or Details */}
        <div className="glass-panel p-4 h-[400px] lg:h-[450px] flex flex-col">
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
        
        {/* Right Column: Tower Details / Call Stats */}
        <div className="glass-panel p-4 h-[400px] lg:h-[450px] flex flex-col">
           <h2 className="text-xl font-semibold mb-2 text-white">Call Stats (Interval)</h2>
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

      {/* Bottom Full-width Row: Speed Test */}
      <div className="w-full h-48 mb-4">
        <SpeedTestModule />
      </div>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Navigation, Award, Signal, MapPin, Zap, CheckCircle2, Radio, Compass, RefreshCw, ArrowRight } from 'lucide-react';

// Haversine formula to calculate distance between two coordinates in kilometers
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

const PRESET_CITIES = [
  { name: 'Kolkata (Esplanade / Salt Lake / Park St)', lat: 22.5726, lon: 88.3639 },
  { name: 'Howrah (Railway Station / Shibpur / Belur)', lat: 22.5839, lon: 88.3426 },
  { name: 'Mumbai (Dharavi/Dadar)', lat: 19.0760, lon: 72.8777 },
  { name: 'Delhi NCR (CP/Noida)', lat: 28.6139, lon: 77.2090 },
  { name: 'Bangalore (MG Road/Koramangala)', lat: 12.9716, lon: 77.5946 },
  { name: 'Chennai (Central/Tambaram)', lat: 13.0827, lon: 80.2707 },
  { name: 'Hyderabad (HITECH City)', lat: 17.4486, lon: 78.3908 },
  { name: 'Pune (Hinjewadi/Kothrud)', lat: 18.5634, lon: 73.7807 },
  { name: 'Ahmedabad & Rajkot', lat: 23.0211, lon: 72.5997 },
];

const NetworkRecommenderModal = ({ isOpen, onClose, towers = [], onSelectTower }) => {
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Process recommendation algorithm given user coordinates
  const calculateBestNetwork = (lat, lon, name = 'Current Location') => {
    setUserLocation({ lat, lon });
    setLocationName(name);
    setErrorMsg('');

    if (!towers || towers.length === 0) {
      setErrorMsg('No towers available to analyze.');
      return;
    }

    // Calculate distance to all towers
    const towersWithDistance = towers.map(t => {
      const distKm = getHaversineDistance(lat, lon, Number(t.latitude), Number(t.longitude));
      return { ...t, distKm };
    });

    // Group towers by Operator
    const operators = ['Jio', 'Airtel', 'Vi', 'BSNL'];
    const operatorStats = operators.map(opName => {
      const opTowers = towersWithDistance.filter(t => t.operatorName.toLowerCase() === opName.toLowerCase());

      if (opTowers.length === 0) return null;

      // Find nearest tower for this operator
      opTowers.sort((a, b) => a.distKm - b.distKm);
      const nearest = opTowers[0];

      // Score calculation (closer distance + better status + 5G bonus)
      const distanceScore = Math.max(0, 100 - (nearest.distKm * 5)); // penalize distance
      const statusScore = nearest.status === 'GOOD' ? 100 : (nearest.status === 'DEGRADED' ? 50 : 0);
      const techBonus = nearest.radio === '5G' ? 15 : 0;

      const totalScore = Math.round((distanceScore * 0.5) + (statusScore * 0.4) + techBonus);

      return {
        operatorName: opName,
        nearestTower: nearest,
        totalScore,
        distanceKm: nearest.distKm.toFixed(2),
        distanceMeters: Math.round(nearest.distKm * 1000),
        status: nearest.status,
        radio: nearest.radio,
        towerCount: opTowers.length
      };
    }).filter(Boolean);

    // Sort operators by totalScore descending
    operatorStats.sort((a, b) => b.totalScore - a.totalScore);

    setRecommendations(operatorStats);
  };

  // Locate via Browser GPS
  const handleLocateMe = () => {
    setLoading(true);
    setErrorMsg('');

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        calculateBestNetwork(pos.coords.latitude, pos.coords.longitude, 'Your GPS Location');
        setLoading(false);
      },
      (err) => {
        console.warn('GPS failed or denied:', err.message);
        setErrorMsg('Could not fetch GPS location. Please pick a city below.');
        // Fallback to Mumbai
        calculateBestNetwork(19.0760, 72.8777, 'Mumbai (Default Location)');
        setLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const bestOperator = recommendations && recommendations[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 280, damping: 25 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/70 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Top Glow Accent */}
          <div className="absolute -top-16 -left-16 w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3.5 mb-6 shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
              <Navigation size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Locate Me & Best Network Recommender
                <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono px-2 py-0.5 rounded-full">
                  AI Recommendation Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Calculates real-time distance to cell towers and recommends the best operator for your location.
              </p>
            </div>
          </div>

          {/* Location Trigger Controls */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl mb-6 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleLocateMe}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Compass size={16} />
              )}
              Detect My GPS Location
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Or select City:</span>
              <select
                onChange={(e) => {
                  const city = PRESET_CITIES.find(c => c.name === e.target.value);
                  if (city) calculateBestNetwork(city.lat, city.lon, city.name);
                }}
                className="w-full sm:w-auto bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="">Select City Hub...</option>
                {PRESET_CITIES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
              <MapPin size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Results Display */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            {recommendations ? (
              <>
                {/* Winner Card */}
                {bestOperator && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-gradient-to-r from-emerald-950/60 to-slate-900 border-2 border-emerald-500/60 p-5 rounded-2xl shadow-xl overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase px-3 py-1 rounded-bl-xl tracking-wider flex items-center gap-1">
                      <Award size={12} /> #1 Recommended Network
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-2xl font-bold text-white tracking-tight">
                            {bestOperator.operatorName}
                          </h3>
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold px-2 py-0.5 rounded-full">
                            {bestOperator.radio} Network
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 flex items-center gap-1.5">
                          <MapPin size={13} className="text-emerald-400" />
                          Nearest Tower in <strong className="text-white">{locationName}</strong> is only{' '}
                          <span className="text-emerald-400 font-bold font-mono">
                            {bestOperator.distanceMeters < 1000 ? `${bestOperator.distanceMeters}m` : `${bestOperator.distanceKm}km`}
                          </span> away.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          onSelectTower(bestOperator.nearestTower);
                          onClose();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg"
                      >
                        Fly to Tower on Map
                        <ArrowRight size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-emerald-500/20 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Signal Quality</span>
                        <div className="text-sm font-bold text-emerald-400 font-mono">Excellent (100%)</div>
                      </div>
                      <div className="border-l border-r border-emerald-500/20">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Tower Status</span>
                        <div className="text-sm font-bold text-emerald-300 font-mono">{bestOperator.status}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Distance</span>
                        <div className="text-sm font-bold text-white font-mono">{bestOperator.distanceKm} km</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Operator Comparison List */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Full Operator Comparison Matrix for {locationName}:
                  </h4>
                  <div className="space-y-2.5">
                    {recommendations.map((op, idx) => (
                      <div
                        key={op.operatorName}
                        className={`p-4 rounded-xl border flex items-center justify-between transition-all ${idx === 0
                            ? 'bg-slate-800/80 border-emerald-500/40'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs font-mono ${idx === 0 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}>
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{op.operatorName}</span>
                              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
                                {op.radio}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400">
                              Tower location: {op.nearestTower.locationName} ({op.distanceKm} km away)
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <div className="text-xs font-bold text-slate-200 font-mono">{op.totalScore} / 100</div>
                            <div className="text-[10px] text-slate-500">Overall Rating</div>
                          </div>
                          <button
                            onClick={() => {
                              onSelectTower(op.nearestTower);
                              onClose();
                            }}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                            title="View on Map"
                          >
                            <Radio size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3 text-center">
                <Radio size={40} className="text-slate-600 animate-pulse" />
                <p className="text-sm">
                  Click <strong>"Detect My GPS Location"</strong> or select a city above to analyze nearby cell towers and get your real-time network recommendation!
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NetworkRecommenderModal;

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Network, Globe, Zap, Activity, MapPin } from 'lucide-react';

const MyNetworkModal = ({ isOpen, onClose }) => {
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      // Fetch user's IP info using a free public API
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.reason || 'Failed to fetch network data');
          setNetworkData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError('Could not retrieve network status');
          setLoading(false);
        });
    }
  }, [isOpen]);

  // Attempt to get connection info if available in browser
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const downlink = connection ? `${connection.downlink} Mbps` : '--';
  const rtt = connection ? `${connection.rtt} ms` : '--';
  const effectiveType = connection ? connection.effectiveType.toUpperCase() : '--';

  // Wrap the entire modal in a portal to break out of any parent backdrop-filters or transforms
  // which can break `position: fixed` and prevent true viewport centering.
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[1000]"
          >
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-blue-900/20 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500/20 rounded-md">
                    <Network size={18} className="text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-white">My Device Network Status</h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4 text-sm">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-6 text-slate-400 space-y-3">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p>Detecting network...</p>
                  </div>
                ) : error ? (
                  <div className="text-center text-red-400 py-4">{error}</div>
                ) : (
                  <React.Fragment>
                    <div className="space-y-3">
                      
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-slate-400">Operator</span>
                        <span className="font-medium text-slate-100 text-right">{networkData?.org || 'Unknown'}</span>
                      </div>

                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-slate-400">Type</span>
                        <span className="font-medium text-slate-300">{effectiveType}</span>
                      </div>

                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-slate-400">Est. Speed</span>
                        <span className="font-medium text-slate-300">{downlink}</span>
                      </div>

                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-slate-400">Est. Latency</span>
                        <span className="font-medium text-slate-300">{rtt}</span>
                      </div>

                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-slate-400">Public IP</span>
                        <span className="font-medium font-mono text-blue-300">{networkData?.ip || '--'}</span>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <span className="text-slate-400">Location</span>
                        <span className="font-medium text-slate-300 text-right">
                          {networkData?.city ? `${networkData.city}, ${networkData.region}` : '--'}
                        </span>
                      </div>

                    </div>
                  </React.Fragment>
                )}
              </div>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );

  return document.body ? createPortal(modalContent, document.body) : null;
};

export default MyNetworkModal;

import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import API from '../services/api.js';

const Home = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pingTime, setPingTime] = useState(0);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const data = await API.get('/health');
      const end = performance.now();
      setPingTime(Math.round(end - start));
      setHealthData(data);
    } catch (err) {
      console.error('Error fetching health status:', err);
      setError(err.message || 'Unable to connect to the backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16 text-left">
      {/* Hero Header */}
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary-600 text-[10px] font-bold tracking-wider uppercase animate-pulse">
          <Activity size={12} /> MERN monorepo initialized
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-800">
          Custom Merchandise <span className="text-primary-500 font-extrabold">Platform</span>
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
          A premium full-stack merchandise e-commerce and automated order management system.
        </p>
      </div>

      {/* Health Status Dashboard */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <Server className="text-primary-500" size={22} />
            <div>
              <h2 className="text-lg font-bold text-slate-800">API Health Assessment</h2>
              <p className="text-xs text-slate-450 mt-0.5">Real-time gateway connectivity logs</p>
            </div>
          </div>
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95 cursor-pointer shadow-sm"
            title="Refresh Status"
          >
            <RefreshCw size={15} className={`group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="animate-spin text-primary-500" size={28} />
            <p className="text-xs text-slate-450 animate-pulse">Querying server credentials...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-xl bg-red-50 border border-red-200 flex gap-4 items-start shadow-sm">
            <XCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <div className="space-y-1.5 text-xs text-red-750">
              <h3 className="font-bold">Connection Failed</h3>
              <p className="text-slate-600">{error}</p>
              <p className="text-slate-450 text-[10px]">
                Please make sure your backend server is running on port 5000 and that MongoDB is connected.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Status overview */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Connection Status</div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="text-green-500" size={20} />
                  <div>
                    <div className="font-bold text-slate-700 text-xs">Online & Operational</div>
                    <div className="text-[10px] text-slate-450">Ping: {pingTime}ms</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Database Status</div>
                <div className="flex items-center gap-2.5">
                  <Database className="text-primary-500" size={20} />
                  <div>
                    <div className="font-bold text-slate-700 text-xs">MongoDB Connected</div>
                    <div className="text-[10px] text-slate-450">Host: Localhost / Atlas</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Server specs details */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-3">API Metadata</div>
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Environment</span>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-primary-100 text-primary-600 capitalize">{healthData.env || 'development'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">Uptime</span>
                    <span className="font-mono font-medium text-slate-700">{(healthData.uptime || 0).toFixed(1)}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Response</span>
                    <span className="text-green-600 font-bold">HTTP 200 OK</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-450 mt-4 leading-relaxed border-t border-slate-200/60 pt-3">
                Message: <span className="text-slate-600 font-medium">"{healthData.message}"</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Directory architecture mapping */}
      <div className="mt-12 text-center text-xs text-slate-450 font-medium">
        Monorepo Structure: <code className="text-slate-500">/server</code> (Express + Mongoose) • <code className="text-slate-500">/client</code> (Vite + Tailwind v3)
      </div>
    </div>
  );
};

export default Home;

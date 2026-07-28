import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, Server, Database, RefreshCw, CheckCircle2, XCircle, 
  ArrowRight, ShieldCheck, ShoppingBag, UploadCloud, Cpu, Sparkles 
} from 'lucide-react';
import API from '../services/api.js';

const Home = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pingTime, setPingTime] = useState(0);
  const [showDiagnostics, setShowDiagnostics] = useState(true);

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
    <div className="w-full max-w-5xl mx-auto space-y-20 py-6 text-left">
      
      {/* 1. Stunning Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-white border border-slate-200/50 p-8 md:p-14 shadow-card flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        <div className="space-y-6 max-w-xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-650 text-[10px] font-bold tracking-wider uppercase animate-pulse">
            <Sparkles size={11} /> Custom Merch Engine Active
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-800 leading-tight">
            Design & Print <br />
            Your Custom <span className="text-gradient font-black">Merchandise</span>
          </h1>
          
          <p className="text-sm md:text-base text-slate-450 leading-relaxed max-w-md">
            Configure premium clothing, customize sizes, choose print specifications, upload custom designs, and track order lifecycles in real-time.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/products"
              className="btn-primary inline-flex items-center gap-2 group text-xs font-bold uppercase tracking-wider"
            >
              Explore Catalog <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/tracking"
              className="btn-secondary text-xs font-bold uppercase tracking-wider"
            >
              Track Order
            </Link>
          </div>
        </div>

        {/* Visual Mockup representation */}
        <div className="relative w-full md:w-80 h-80 shrink-0 flex items-center justify-center bg-slate-50 border border-slate-200/40 rounded-2xl p-6 overflow-hidden group shadow-inner">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <img 
            src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800" 
            alt="Merch Custom Mockup" 
            className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-103 transition-transform duration-500"
          />
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 border border-slate-100 shadow-xs rounded-lg text-[9px] font-bold text-slate-600 flex items-center gap-1">
            <ShieldCheck size={11} className="text-green-500" /> Premium T-Shirt Canvas
          </div>
        </div>
      </section>

      {/* 2. Features Grid */}
      <section className="space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">Advanced Print Capabilities</h2>
          <p className="text-xs text-slate-450 max-w-md mx-auto">Our custom processing line handles standard apparel customizations effortlessly.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-card hover:-translate-y-1 transition-transform duration-300">
            <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
              <ShoppingBag size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1.5">Apparel Selection</h3>
            <p className="text-[11px] text-slate-450 leading-relaxed">Choose from premium heavy-weight tees, hoodies, and jackets in multiple colors and sizes.</p>
          </div>

          <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-card hover:-translate-y-1 transition-transform duration-300">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center mb-4">
              <UploadCloud size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1.5">Artwork Upload</h3>
            <p className="text-[11px] text-slate-450 leading-relaxed">Directly upload customized logos or print graphics with transparent backgrounds.</p>
          </div>

          <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-card hover:-translate-y-1 transition-transform duration-300">
            <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-650 flex items-center justify-center mb-4">
              <Cpu size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1.5">Multi-Print Formats</h3>
            <p className="text-[11px] text-slate-450 leading-relaxed">Support for Screen Printing, DTF, Sublimation, and detailed embroidery styles.</p>
          </div>

          <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-card hover:-translate-y-1 transition-transform duration-300">
            <div className="h-10 w-10 rounded-xl bg-fuchsia-50 text-fuchsia-650 flex items-center justify-center mb-4">
              <Activity size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1.5">Lifecycle Tracking</h3>
            <p className="text-[11px] text-slate-450 leading-relaxed">Follow your custom merchandise from quality check to shipping logistics updates.</p>
          </div>
        </div>
      </section>

      {/* 3. collapsible Developer Diagnostics Dashboard */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2">
            <Server className="text-slate-500" size={18} />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Developer Diagnostics</h2>
          </div>
          <button 
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="text-xs font-bold text-primary-600 hover:text-primary-750 cursor-pointer uppercase select-none"
          >
            {showDiagnostics ? 'Collapse' : 'Expand Status Monitor'}
          </button>
        </div>

        {showDiagnostics && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-800">API Health Assessment</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Real-time database and routing validation log</p>
              </div>
              <button
                onClick={fetchHealth}
                disabled={loading}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95 cursor-pointer shadow-xs"
                title="Refresh Status"
              >
                <RefreshCw size={13} className={`group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="py-10 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="animate-spin text-primary-500" size={24} />
                <p className="text-[10px] text-slate-400 animate-pulse">Querying server credentials...</p>
              </div>
            ) : error ? (
              <div className="mt-5 p-5 rounded-xl bg-red-50 border border-red-200 flex gap-3 items-start text-left shadow-xs">
                <XCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                <div className="space-y-1 text-xs text-red-800">
                  <h4 className="font-bold">Connection Failed</h4>
                  <p className="text-slate-655">{error}</p>
                  <p className="text-slate-400 text-[10px]">
                    Please make sure your backend server environment variable is active and database is accessible.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                {/* Status overview */}
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-left">
                    <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Connection Status</div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="text-green-500" size={16} />
                      <div>
                        <div className="font-bold text-slate-700 text-xs">Online & Operational</div>
                        <div className="text-[9px] text-slate-400">Ping: {pingTime}ms</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-left">
                    <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Database Status</div>
                    <div className="flex items-center gap-2">
                      <Database className="text-primary-500" size={16} />
                      <div>
                        <div className="font-bold text-slate-700 text-xs">MongoDB Connected</div>
                        <div className="text-[9px] text-slate-400">Host: Remote Atlas Cluster</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Server specs details */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between text-left">
                  <div>
                    <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-2">API Metadata</div>
                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex justify-between items-center border-b border-slate-200/60 pb-1">
                        <span className="text-slate-500">Environment</span>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-primary-100 text-primary-650 capitalize">{healthData.env || 'development'}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-200/60 pb-1">
                        <span className="text-slate-500">Uptime</span>
                        <span className="font-mono font-medium text-slate-700">{(healthData.uptime || 0).toFixed(1)}s</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Response</span>
                        <span className="text-green-600 font-bold">HTTP 200 OK</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 mt-3 leading-relaxed border-t border-slate-200/60 pt-2">
                    Message: <span className="text-slate-550 font-medium">"{healthData.message}"</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Directory architecture mapping */}
      <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        MERN Architecture: <code className="text-slate-500 font-mono bg-slate-100 px-1 py-0.5 rounded">/server</code> API Hub • <code className="text-slate-500 font-mono bg-slate-100 px-1 py-0.5 rounded">/client</code> React SPA
      </div>
    </div>
  );
};

export default Home;

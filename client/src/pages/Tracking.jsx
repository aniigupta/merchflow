import React, { useState } from 'react';
import { Search, Loader2, Truck, Calendar, AlertCircle } from 'lucide-react';
import API from '../services/api.js';

const TRACKING_STATES = ['Packed', 'Shipment Created', 'Shipped', 'Out for Delivery', 'Delivered'];

const Tracking = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingInfo, setShippingInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError(null);
    setShippingInfo(null);
    try {
      const response = await API.get(`/shipping/track/${trackingNumber.trim()}`);
      setShippingInfo(response.data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Tracking number not found. Verify details and retry.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusNodeColor = (step, currentStatus) => {
    const stepIdx = TRACKING_STATES.indexOf(step);
    const currentIdx = TRACKING_STATES.indexOf(currentStatus);

    if (stepIdx < currentIdx) {
      return 'bg-green-50 border-green-500 text-green-600 font-extrabold';
    } else if (stepIdx === currentIdx) {
      return 'bg-primary-50 border-primary-500 text-primary-600 scale-105 animate-pulse font-extrabold';
    } else {
      return 'bg-white border-slate-200 text-slate-350';
    }
  };

  const getStatusTextLabel = (step, currentStatus) => {
    const stepIdx = TRACKING_STATES.indexOf(step);
    const currentIdx = TRACKING_STATES.indexOf(currentStatus);
    if (stepIdx > currentIdx) return 'text-slate-400 font-normal';
    if (stepIdx === currentIdx) return 'text-primary-600 font-bold';
    return 'text-slate-700 font-semibold';
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full space-y-8 text-left">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <Truck className="mx-auto text-primary-500 animate-bounce" size={36} />
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Track Shipment</h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Enter your logistics tracking code to inspect real-time courier assignments and estimated delivery dates
        </p>
      </div>

      {/* Search Input bar */}
      <form onSubmit={handleTrackSubmit} className="relative w-full max-w-md mx-auto">
        <input
          type="text"
          placeholder="e.g. TRK1234567890"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          className="form-input w-full pl-12 pr-28 py-3 text-sm tracking-wide font-mono uppercase bg-white border-slate-200 shadow-sm"
          required
        />
        <Truck className="absolute left-4 inset-y-0 h-full flex items-center text-slate-400" size={16} />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-primary-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-primary-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={13} /> : <Search size={13} />}
          Track
        </button>
      </form>

      {/* Error Banners */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-650 flex items-center gap-2 max-w-md mx-auto shadow-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Display */}
      {shippingInfo && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 max-w-md mx-auto">
          
          {/* Top details block */}
          <div className="flex justify-between items-start pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-450">Logistics Partner</span>
              <h3 className="text-sm font-bold text-slate-800 mt-0.5">{shippingInfo.courierName}</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-450">Shipment Code</span>
              <span className="block font-mono text-xs text-primary-600 font-bold mt-0.5">{shippingInfo.shipmentId}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-xs text-slate-500">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-450 block">Est. Delivery Date</span>
              <div className="flex items-center gap-1 text-slate-700 font-medium font-mono">
                <Calendar size={13} className="text-slate-400" />
                {new Date(shippingInfo.estimatedDeliveryDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-450 block">Linked Order Number</span>
              <span className="font-mono font-bold text-slate-700">{shippingInfo.order?.orderNumber || '—'}</span>
            </div>
          </div>

          {/* Delivery progression timeline */}
          <div className="space-y-4 text-left">
            <span className="text-[10px] uppercase font-bold text-slate-450 block mb-2">Delivery Progress</span>
            <div className="relative pl-6 space-y-4.5 border-l border-slate-200 ml-2 text-xs">
              
              {TRACKING_STATES.map((step) => {
                const isCurrent = shippingInfo.shippingStatus === step;
                const isPassed = TRACKING_STATES.indexOf(step) < TRACKING_STATES.indexOf(shippingInfo.shippingStatus);
                return (
                  <div key={step} className="relative group">
                    <span className={`absolute -left-[30px] top-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center border text-[8px] font-bold shadow-sm transition-all ${
                      getStatusNodeColor(step, shippingInfo.shippingStatus)
                    }`}>
                      {isPassed ? '✓' : isCurrent ? '●' : '○'}
                    </span>
                    <span className={`font-bold leading-none capitalize ${getStatusTextLabel(step, shippingInfo.shippingStatus)}`}>
                      {step.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}

            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Tracking;

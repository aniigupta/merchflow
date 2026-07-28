import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Loader2, AlertTriangle, TrendingUp, ShoppingBag, FolderKanban, Activity, Edit, ShieldCheck } from 'lucide-react';
import API from '../services/api.js';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/admin/dashboard');
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not load administrative sales report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="animate-spin text-primary-500" size={32} />
        <p className="text-sm text-slate-455">Aggregating inventory indices and sales ledgers...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-6">
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-655 text-sm">
          {error || 'Failed to aggregate administrative workspace summary.'}
        </div>
        <button onClick={fetchDashboardStats} className="btn-primary py-2.5 px-5 text-xs font-bold uppercase tracking-wider">
          Retry Query
        </button>
      </div>
    );
  }

  const { metrics, lowStockProducts, statusDistribution } = data;

  // Process data for the SVG status chart
  const ORDER_STATUS_LABELS = [
    'Order Placed',
    'Payment Verified',
    'Design Approved',
    'Printing In Progress',
    'Quality Check',
    'Packed',
    'Shipment Created',
    'Shipped',
    'Out for Delivery',
    'Delivered',
  ];

  const chartData = ORDER_STATUS_LABELS.map((status) => {
    const found = statusDistribution.find((s) => s._id === status);
    return {
      status,
      count: found ? found.count : 0,
    };
  });

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 w-full space-y-6 text-left">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
          <LayoutDashboard className="text-primary-500" size={24} /> Sales & Print Hub
        </h1>
        <p className="text-sm text-slate-450 mt-1">Administrative operational metrics, stock warnings, and revenue logs</p>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-indigo-50 border border-indigo-200/60 p-4 rounded-xl flex flex-col justify-between shadow-xs hover:shadow-sm transition-all hover:scale-[1.01]">
          <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider block">Total Revenue</span>
          <div>
            <h3 className="text-base font-extrabold text-indigo-900 block mt-1">₹{metrics.totalRevenue.toFixed(2)}</h3>
            <span className="text-[9px] text-indigo-650 font-bold flex items-center gap-0.5 mt-0.5">
              <TrendingUp size={10} /> Verified Sales
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between shadow-xs hover:shadow-sm transition-all hover:scale-[1.01]">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Orders</span>
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 mt-1">{metrics.totalOrders}</h3>
            <span className="text-[9px] text-slate-450 block mt-0.5">Customer checkouts</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between shadow-xs hover:shadow-sm transition-all hover:scale-[1.01]">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Active Products</span>
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 mt-1">{metrics.totalProducts}</h3>
            <span className="text-[9px] text-slate-450 block mt-0.5">In active catalog</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-xl flex flex-col justify-between shadow-xs hover:shadow-sm transition-all hover:scale-[1.01]">
          <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">Unverified Orders</span>
          <div>
            <h3 className="text-lg font-extrabold text-amber-900 mt-1">{metrics.pendingOrders}</h3>
            <span className="text-[9px] text-amber-650 block mt-0.5">Awaiting gateway verify</span>
          </div>
        </div>

        {/* Printing Orders */}
        <div className="bg-blue-50 border border-blue-200/60 p-4 rounded-xl flex flex-col justify-between shadow-xs hover:shadow-sm transition-all hover:scale-[1.01]">
          <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block">In Production</span>
          <div>
            <h3 className="text-lg font-extrabold text-blue-900 mt-1">{metrics.printingOrders}</h3>
            <span className="text-[9px] text-blue-650 block mt-0.5">Printing in progress</span>
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="bg-green-50 border border-green-200/60 p-4 rounded-xl flex flex-col justify-between shadow-xs hover:shadow-sm transition-all hover:scale-[1.01]">
          <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider block">Delivered Orders</span>
          <div>
            <h3 className="text-lg font-extrabold text-green-900 mt-1">{metrics.deliveredOrders}</h3>
            <span className="text-[9px] text-green-650 block mt-0.5">Completed workflows</span>
          </div>
        </div>

      </div>

      {/* Main Grid: SVG Chart & Low Stock List */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* SVG Chart visualization Column */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-sm text-slate-700 border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <Activity size={16} className="text-primary-500" /> Active Workflow Status Distributions
          </h3>

          {/* Simple Custom SVG Bar Chart */}
          <div className="relative pt-2">
            <div className="flex flex-col gap-4">
              {chartData.map((d) => {
                const percent = (d.count / maxCount) * 100;
                return (
                  <div key={d.status} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">{d.status}</span>
                      <span className="font-bold text-primary-600">{d.count} {d.count === 1 ? 'order' : 'orders'}</span>
                    </div>
                    {/* Responsive Progress Bar */}
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-gradient-to-r from-primary-500 to-indigo-400 rounded-full transition-all duration-300 shadow-xs"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Low Stock Alerts Column */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-sm text-slate-700 border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <AlertTriangle size={16} className="text-red-500" /> Low Stock Inventory Alert
          </h3>

          {lowStockProducts.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-lg border border-slate-200 p-4">
              <ShieldCheck className="mx-auto text-green-500 mb-2" size={32} />
              <p className="text-xs text-slate-500">All products have healthy inventory levels (stock &gt;= 10).</p>
            </div>
          ) : (
            <div className="space-y-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                Products Awaiting Restock ({lowStockProducts.length})
              </span>
              <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto pr-1">
                {lowStockProducts.map((p) => (
                  <div key={p._id} className="py-3 flex justify-between items-center text-xs first:pt-0">
                    <div className="min-w-0 pr-2">
                      <h4 className="font-bold text-slate-800 truncate">{p.name}</h4>
                      <span className="font-mono text-[9px] text-slate-400 uppercase block mt-0.5">{p.sku}</span>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div>
                        <span className="block font-bold text-red-600">{p.stockQuantity} left</span>
                        <span className="block text-[9px] text-slate-400">₹{p.price.toFixed(2)}</span>
                      </div>
                      <Link
                        to="/admin/products"
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-450 hover:text-slate-850 hover:bg-slate-50 hover:border-slate-350 transition-all inline-flex cursor-pointer shadow-sm"
                        title="Edit Product Stock"
                      >
                        <Edit size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;

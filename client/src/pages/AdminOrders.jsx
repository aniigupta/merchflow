import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Loader2, AlertCircle, Calendar, Eye, Filter, ArrowRight, User } from 'lucide-react';
import API from '../services/api.js';
import { getStatusBadgeStyles } from './Orders.jsx';

const ORDER_STEPS = [
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

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await API.get('/orders', { params });
      setOrders(response.data || []);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve orders workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, startDate, endDate]);

  const handleAdvanceStatus = async (orderId, currentStatus) => {
    const currentIdx = ORDER_STEPS.indexOf(currentStatus);
    if (currentIdx === -1 || currentIdx >= ORDER_STEPS.length - 1) return;

    const nextStatus = ORDER_STEPS[currentIdx + 1];

    if (!window.confirm(`Are you sure you want to advance this order's status to "${nextStatus}"?`)) return;

    setActionLoading(true);
    setError(null);
    try {
      await API.patch(`/orders/${orderId}/status`, { status: nextStatus });
      fetchOrders();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to advance order status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateShipment = async (orderId) => {
    if (!window.confirm('Assign logistics partner and create shipment tracking number?')) return;

    setActionLoading(true);
    setError(null);
    try {
      await API.post('/shipping/create', { orderId });
      fetchOrders();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to generate shipment parameters');
    } finally {
      setActionLoading(false);
    }
  };

  const getNextStatusText = (currentStatus) => {
    if (currentStatus === 'Cancelled') return null;
    const currentIdx = ORDER_STEPS.indexOf(currentStatus);
    if (currentIdx === -1 || currentIdx >= ORDER_STEPS.length - 1) return null;
    return ORDER_STEPS[currentIdx + 1];
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 w-full space-y-6 text-left">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
          <ShoppingBag className="text-primary-500" size={24} /> Orders Workspace
        </h1>
        <p className="text-sm text-slate-450 mt-1">Advance printing workflows, logistics tracking, and order states</p>
      </div>

      {/* Main filters box */}
      <div className="grid md:grid-cols-4 gap-4 items-end bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Status Filter</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input text-xs py-2 w-full bg-white border-slate-200 text-slate-700"
          >
            <option value="">All Orders</option>
            {ORDER_STEPS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-input text-xs py-2 w-full text-slate-750 border-slate-200 bg-white font-medium"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-input text-xs py-2 w-full text-slate-750 border-slate-200 bg-white font-medium"
          />
        </div>

        <button
          onClick={() => {
            setStatusFilter('');
            setStartDate('');
            setEndDate('');
          }}
          className="btn-secondary py-2 text-xs font-bold w-full h-9 flex items-center justify-center cursor-pointer shadow-sm border border-slate-200"
        >
          Reset Filters
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-650 flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Orders Inventory Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary-500" size={32} />
          <p className="text-sm text-slate-455 animate-pulse">Retrieving user orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <ShoppingBag className="mx-auto text-slate-350 mb-4 animate-bounce" size={44} />
          <h3 className="text-base font-bold text-slate-800">No Matching Orders</h3>
          <p className="text-xs text-slate-450 max-w-sm mx-auto mt-1">
            No orders match the filtered constraints or dates. Try resetting filters.
          </p>
        </div>
      ) : (
        /* Table content */
        <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-slate-50">
                <th className="py-4 px-6">Order Code</th>
                <th className="py-4 px-6">Customer Info</th>
                <th className="py-4 px-6">Placed Date</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Order Status</th>
                <th className="py-4 px-6 text-right">Advancement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-655">
              {orders.map((ord) => {
                const nextStatus = getNextStatusText(ord.status);
                return (
                  <tr key={ord._id} className="hover:bg-slate-50/45 transition-all border-b border-slate-100">
                    <td className="py-4.5 px-6 font-mono text-xs font-bold text-primary-600">
                      <Link to={`/orders/${ord._id}`} className="hover:text-primary-750 hover:underline">
                        {ord.orderNumber}
                      </Link>
                    </td>
                    <td className="py-4.5 px-6 font-medium text-slate-600">
                      <div className="text-xs text-slate-800 font-bold">{ord.user?.name || 'Guest User'}</div>
                      <div className="text-[10px] text-slate-450 font-mono mt-0.5">{ord.user?.email || '—'}</div>
                    </td>
                    <td className="py-4.5 px-6 text-slate-550 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        {new Date(ord.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="py-4.5 px-6 font-bold text-slate-800">
                      ₹{ord.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-4.5 px-6">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeStyles(ord.status)}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-right space-x-2">
                      {nextStatus ? (
                        <button
                          onClick={() => {
                            if (ord.status === 'Packed') {
                              handleCreateShipment(ord._id);
                            } else {
                              handleAdvanceStatus(ord._id, ord.status);
                            }
                          }}
                          disabled={actionLoading}
                          className="px-2.5 py-1.5 rounded-lg bg-primary-50 border border-primary-200 text-primary-600 hover:bg-primary-100 text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          {ord.status === 'Packed' ? 'Create Shipment' : `Next: ${nextStatus}`} <ArrowRight size={12} />
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-450 uppercase tracking-wider pr-4">Workflow Done</span>
                      )}
                      
                      <Link
                        to={`/orders/${ord._id}`}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-450 hover:text-slate-850 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all inline-flex cursor-pointer"
                        title="View Details"
                      >
                        <Eye size={13} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default AdminOrders;

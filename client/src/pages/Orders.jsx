import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertCircle, ShoppingBag, Calendar, Eye, ShieldAlert } from 'lucide-react';
import API from '../services/api.js';

// Status color helper suited for light airy theme
export const getStatusBadgeStyles = (status) => {
  switch (status) {
    case 'Order Placed':
      return 'bg-blue-50 text-blue-650 border-blue-200/60';
    case 'Payment Verified':
      return 'bg-indigo-50 text-indigo-650 border-indigo-200/60';
    case 'Design Approved':
      return 'bg-purple-50 text-purple-650 border-purple-200/60';
    case 'Printing In Progress':
      return 'bg-amber-50 text-amber-650 border-amber-200/60';
    case 'Quality Check':
      return 'bg-yellow-50 text-yellow-650 border-yellow-200/60';
    case 'Packed':
      return 'bg-cyan-50 text-cyan-650 border-cyan-200/60';
    case 'Shipment Created':
    case 'Shipped':
      return 'bg-teal-50 text-teal-650 border-teal-200/60';
    case 'Out for Delivery':
      return 'bg-orange-50 text-orange-650 border-orange-200/60';
    case 'Delivered':
      return 'bg-green-50 text-green-650 border-green-200/60';
    case 'Cancelled':
      return 'bg-red-50 text-red-650 border-red-200/60';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200/60';
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.get('/orders');
        setOrders(response.data || []);
      } catch (err) {
        console.error(err);
        setError('Could not retrieve order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="animate-spin text-primary-500" size={32} />
        <p className="text-sm text-slate-455">Loading order history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 w-full space-y-6 text-left">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
          <ShoppingBag className="text-primary-500" size={24} /> Order History
        </h1>
        <p className="text-sm text-slate-450 mt-1">Track and manage your custom merchandise purchases</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-650 flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <ShoppingBag className="mx-auto text-slate-350 mb-4 animate-bounce" size={44} />
          <h3 className="text-base font-bold text-slate-850">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-450 max-w-sm mx-auto mt-1.5 mb-6">
            You have not placed any orders yet. Visit the catalog to customize and place your first order.
          </p>
          <Link to="/products" className="btn-primary py-2.5 px-6 text-xs font-bold uppercase tracking-wider inline-block shadow-sm">
            Explore Store Catalog
          </Link>
        </div>
      ) : (
        /* Orders list data grid */
        <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-slate-50">
                <th className="py-4 px-6">Order Code</th>
                <th className="py-4 px-6">Purchase Date</th>
                <th className="py-4 px-6">Custom items</th>
                <th className="py-4 px-6">Total Amount</th>
                <th className="py-4 px-6">Current Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {orders.map((ord) => (
                <tr key={ord._id} className="hover:bg-slate-50/45 transition-all">
                  <td className="py-4.5 px-6 font-mono text-xs font-bold text-primary-600">
                    <Link to={`/orders/${ord._id}`} className="hover:text-primary-750 hover:underline">
                      {ord.orderNumber}
                    </Link>
                  </td>
                  <td className="py-4.5 px-6 text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      {new Date(ord.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </td>
                  <td className="py-4.5 px-6 text-slate-700 font-medium max-w-xs truncate">
                    {ord.items.map((item) => `${item.name} (${item.quantity})`).join(', ')}
                  </td>
                  <td className="py-4.5 px-6 font-bold text-slate-800">
                    ₹{ord.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-4.5 px-6">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeStyles(ord.status)}`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-4.5 px-6 text-center">
                    <Link
                      to={`/orders/${ord._id}`}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-450 hover:text-slate-850 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all inline-flex cursor-pointer"
                      title="Inspect Order Details"
                    >
                      <Eye size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default Orders;

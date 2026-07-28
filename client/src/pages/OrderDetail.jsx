import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Loader2, ArrowLeft, Calendar, User, MapPin, AlertTriangle, ShieldCheck, Check, Info, Truck } from 'lucide-react';
import API from '../services/api.js';
import { getStatusBadgeStyles } from './Orders.jsx';

const TIMELINE_STEPS = [
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

const OrderDetail = () => {
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [shipping, setShipping] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // UI Messages (e.g. redirected success state)
  const [successMsg, setSuccessMsg] = useState(location.state?.message || null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get(`/orders/${id}`);
      setOrder(response.data);

      // Attempt to load payment record
      try {
        const payResponse = await API.get(`/payments/order/${id}`);
        setPayment(payResponse.data);
      } catch (payErr) {
        console.warn('Payment record lookup returned empty/404', payErr);
        setPayment(null);
      }

      // Attempt to load shipping record
      try {
        const shipResponse = await API.get(`/shipping/order/${id}`);
        setShipping(shipResponse.data);
      } catch (shipErr) {
        console.warn('Shipping record lookup returned empty/404', shipErr);
        setShipping(null);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not retrieve order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to cancel this order? This will restock items and cannot be undone.')) return;

    setActionLoading(true);
    setError(null);
    try {
      await API.patch(`/orders/${id}/cancel`, { cancelReason });
      setSuccessMsg('Order has been cancelled successfully.');
      setShowCancelPrompt(false);
      
      // Re-fetch updated details
      const response = await API.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to cancel the order');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="animate-spin text-primary-500" size={32} />
        <p className="text-sm text-slate-455">Loading order tracking details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-6">
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-650 text-sm">
          {error || 'Order record not found'}
        </div>
        <Link to="/orders" className="btn-secondary py-2.5 px-6 text-xs font-bold uppercase tracking-wider inline-block">
          View History
        </Link>
      </div>
    );
  }

  // Find index of current status in timeline steps
  const currentStatusIdx = TIMELINE_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'Cancelled';

  // Determine if order is still in cancelable stage (Placed or Payment Verified)
  const isCancelable = ['Order Placed', 'Payment Verified'].includes(order.status);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 w-full space-y-6 text-left">
      
      {/* Return Navigation */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <Link to="/orders" className="text-xs font-bold text-slate-450 hover:text-slate-800 flex items-center gap-1.5 transition-all">
          <ArrowLeft size={13} /> Back to History
        </Link>
        <span className="font-mono text-[10px] text-slate-400">ID: {order._id}</span>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-650 font-medium">
          {successMsg}
        </div>
      )}

      {/* Payment warning banner if unpaid */}
      {(!payment || payment.status !== 'Successful') && !isCancelled && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-750 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-amber-500 shrink-0 animate-bounce" size={17} />
            <div>
              <span className="font-bold">Awaiting Payment Verification</span>
              <p className="text-xs text-slate-500 mt-0.5">Please complete payment simulation to activate custom merchandise printing.</p>
            </div>
          </div>
          <Link
            to={`/checkout/payment/${order._id}`}
            className="px-4 py-2 rounded-lg bg-amber-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-amber-600 transition-all shrink-0 shadow-sm"
          >
            Complete Payment Now
          </Link>
        </div>
      )}

      {/* Order Top Summary Card */}
      <div className="grid md:grid-cols-3 gap-6 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-455">Order Number</span>
          <h2 className="text-xl font-extrabold text-slate-800 mt-1 font-mono">{order.orderNumber}</h2>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-455">Purchase Date</span>
          <div className="flex items-center gap-1.5 text-slate-650 font-medium mt-2 text-xs">
            <Calendar size={13} className="text-slate-450" />
            {new Date(order.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-455">Order Status</span>
          <div className="mt-1.5">
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeStyles(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>
      </div>

      {/* Main Sections grid */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* Left/Middle Column: Items list & shipping address details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order Snapshot Items List */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-700 border-b border-slate-100 pb-3">Purchased Merchandise</h3>
            <div className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <div key={item._id || idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <img
                    src={item.product?.images?.[0]?.url || 'https://placehold.co/80x80'}
                    alt={item.name}
                    className="h-16 w-16 object-cover rounded-lg border border-slate-200 bg-slate-50 shrink-0"
                  />
                  <div className="min-w-0 flex-grow text-left space-y-1.5">
                    <h4 className="font-bold text-sm text-slate-800 truncate">{item.name}</h4>
                    <div className="flex flex-wrap gap-2 text-[9px] text-slate-500">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50">Size: <strong>{item.size}</strong></span>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50">Color: <strong>{item.color}</strong></span>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50 capitalize">Location: <strong>{item.printLocation}</strong></span>
                    </div>

                    {/* Print Artwork Design preview */}
                    {item.designImage && (
                      <div className="flex items-center gap-1.5 mt-2 p-1 bg-slate-50 border border-slate-200/70 rounded w-fit shadow-sm">
                        <img src={item.designImage} alt="Artwork" className="h-6 w-6 object-contain rounded bg-white border border-slate-100" />
                        <span className="text-[9px] text-slate-450 font-bold pr-1">Graphic Applied</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block text-sm font-bold text-slate-800">₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
                    <span className="text-[9px] text-slate-400">{item.quantity} x ₹{item.unitPrice}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address, notes, and Payment details */}
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Address */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-left space-y-3.5">
              <h3 className="font-bold text-xs text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                <MapPin size={15} className="text-primary-500" /> Shipping Address
              </h3>
              <div className="text-xs text-slate-500 space-y-1">
                <span className="block font-bold text-slate-800 text-sm mb-1 leading-none">{order.shippingAddress?.fullName}</span>
                <span className="block">Ph: {order.shippingAddress?.phone}</span>
                <span className="block">{order.shippingAddress?.line1}</span>
                {order.shippingAddress?.line2 && <span className="block">{order.shippingAddress?.line2}</span>}
                <span className="block">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}</span>
              </div>
            </div>

            {/* Note specifications */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-left space-y-3.5">
              <h3 className="font-bold text-xs text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                <Info size={15} className="text-primary-500" /> Instructions
              </h3>
              <p className="text-xs text-slate-550 leading-relaxed">
                {order.notes || 'No delivery instructions provided.'}
              </p>
            </div>

            {/* Payment Info Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-left space-y-3.5">
              <h3 className="font-bold text-xs text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck size={15} className="text-primary-500" /> Payment Info
              </h3>
              {payment ? (
                <div className="text-xs text-slate-500 space-y-1">
                  <div className="flex justify-between items-center pb-1 border-b border-slate-100 mb-1">
                    <span className="font-bold text-slate-600">Status:</span>
                    <span className={`font-bold uppercase text-[9px] ${
                      payment.status === 'Successful' ? 'text-green-600 bg-green-50 px-1 rounded' : payment.status === 'Failed' ? 'text-red-600 bg-red-50 px-1 rounded' : 'text-amber-600 bg-amber-50 px-1 rounded'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                  <span className="block truncate">TX: <strong className="font-mono text-[9px] text-slate-750">{payment.transactionId}</strong></span>
                  <span className="block">Ref: <strong className="font-mono text-[9px] text-slate-750">{payment.paymentId}</strong></span>
                  {payment.paymentDate && (
                    <span className="block text-[9px] text-slate-400">
                      Paid: {new Date(payment.paymentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-xs text-red-650 font-bold flex flex-col gap-2">
                  <span>No payment record.</span>
                  <Link to={`/checkout/payment/${order._id}`} className="text-[10px] text-primary-500 hover:underline">
                    Pay Now →
                  </Link>
                </div>
              )}
            </div>

          </div>

          {/* Logistics Tracking Card if Shipment registered */}
          {shipping && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-left space-y-4">
              <h3 className="font-bold text-xs text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                <Truck size={15} className="text-primary-500" /> Logistics Tracking
              </h3>
              <div className="grid sm:grid-cols-4 gap-4 text-xs text-slate-500">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Courier Partner</span>
                  <span className="font-semibold text-slate-700 block mt-0.5">{shipping.courierName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Tracking Code</span>
                  <Link to={`/tracking`} className="font-mono text-primary-600 hover:underline block mt-0.5 font-bold">
                    {shipping.trackingNumber}
                  </Link>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Est. Delivery</span>
                  <span className="font-semibold text-slate-700 block mt-0.5 font-mono">
                    {new Date(shipping.estimatedDeliveryDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Shipment Status</span>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary-50 text-primary-600 border border-primary-200 mt-0.5">
                    {shipping.shippingStatus}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pricing totals */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-left space-y-4">
            <h3 className="font-bold text-sm text-slate-700 border-b border-slate-100 pb-3">Financial Details</h3>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 max-w-xs">
              <span>Items Subtotal:</span>
              <span className="font-semibold text-slate-700 text-right">₹{order.subtotal.toFixed(2)}</span>
              <span>GST Tax (18%):</span>
              <span className="font-semibold text-slate-700 text-right">₹{order.tax.toFixed(2)}</span>
              <span>Shipping Charges:</span>
              <span className="font-semibold text-slate-700 text-right">₹{order.shippingCharge.toFixed(2)}</span>
              <span className="text-xs font-bold text-slate-700 pt-2 border-t border-slate-200">Estimated Total:</span>
              <span className="text-sm font-extrabold text-primary-600 pt-2 border-t border-slate-200 text-right">₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Customer Cancellation Controls */}
          {isCancelable && !isCancelled && (
            <div className="p-5 rounded-xl bg-red-50 border border-red-200/60 text-left space-y-3.5 shadow-sm">
              <div className="flex gap-2.5">
                <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-red-600">Order Cancellation Window Active</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">You can cancel your order before custom printing starts ("Printing In Progress").</p>
                </div>
              </div>
              
              {!showCancelPrompt ? (
                <button
                  onClick={() => setShowCancelPrompt(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-650 text-xs font-bold transition-all cursor-pointer border border-red-200/50"
                >
                  Cancel Order
                </button>
              ) : (
                <form onSubmit={handleCancelOrder} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Specify cancellation reason..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="form-input text-xs w-full py-2 border-slate-200 bg-white"
                    required
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="btn-danger py-1.5 px-3.5 text-xs font-bold transition-all cursor-pointer"
                    >
                      Confirm Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCancelPrompt(false)}
                      className="btn-secondary py-1.5 px-3.5 text-xs font-bold transition-all cursor-pointer"
                    >
                      Abort
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Visual Status Timeline */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-sm text-slate-700 border-b border-slate-100 pb-3">Tracking Timeline</h3>
          
          {isCancelled ? (
            <div className="p-4 rounded-xl bg-red-55 border border-red-205 text-xs text-red-650 space-y-1 shadow-sm">
              <span className="block font-bold">This order has been Cancelled</span>
              <p className="text-[10px] text-slate-500">Ordered items were restocked and payment refunds triggered.</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-5 text-left border-l border-slate-200">
              {TIMELINE_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStatusIdx;
                const isActive = idx === currentStatusIdx;
                const isRemaining = idx > currentStatusIdx;

                // Find timestamp if status exists in order history
                const hist = order.statusHistory?.find(h => h.status === step);

                return (
                  <div key={step} className="relative group">
                    
                    {/* Circle Node markers with ✓ / ○ style */}
                    <span className={`absolute -left-[31px] top-0.5 h-4.5 w-4.5 rounded-full flex items-center justify-center border font-bold text-[9px] transition-all shadow-sm ${
                      isCompleted 
                        ? 'bg-green-50 border-green-500 text-green-600 font-extrabold' 
                        : isActive 
                        ? 'bg-primary-50 border-primary-500 text-primary-600 ring-2 ring-primary-500/10 scale-105 animate-pulse font-extrabold'
                        : 'bg-white border-slate-200 text-slate-350'
                    }`}>
                      {isCompleted ? '✓' : isActive ? '●' : '○'}
                    </span>

                    {/* Step label text details */}
                    <div>
                      <h4 className={`text-xs font-bold leading-none ${
                        isRemaining ? 'text-slate-400' : isActive ? 'text-primary-600' : 'text-slate-700'
                      }`}>
                        {step}
                      </h4>
                      
                      {/* Timestamp labels */}
                      {hist && (
                        <span className="block text-[8px] text-slate-400 font-medium mt-1 font-mono">
                          {new Date(hist.timestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default OrderDetail;

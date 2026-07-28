import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck, Landmark, CheckCircle, XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import API from '../services/api.js';

const PaymentCheckout = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [paymentIntent, setPaymentIntent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Simulation Status States
  const [paymentResult, setPaymentResult] = useState(null); // 'success' | 'failure'

  // Card Form (simulated inputs)
  const [cardDetails, setCardDetails] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: '',
  });

  useEffect(() => {
    const createIntent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.post('/payments/create', { orderId });
        setPaymentIntent(response.data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Could not initiate payment transaction');
      } finally {
        setLoading(false);
      }
    };

    createIntent();
  }, [orderId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSimulatePayment = async (status) => {
    if (!paymentIntent) return;

    setActionLoading(true);
    setError(null);
    try {
      await API.post('/payments/verify', {
        paymentId: paymentIntent.paymentId,
        status: status, // 'Successful' or 'Failed'
      });

      if (status === 'Successful') {
        setPaymentResult('success');
        setTimeout(() => {
          navigate(`/orders/${orderId}`, {
            state: { message: 'Payment successfully processed! Order workflow active.' },
          });
        }, 2000);
      } else {
        setPaymentResult('failure');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Transaction verification rejected by backend gateway');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="animate-spin text-primary-500" size={32} />
        <p className="text-sm text-slate-455">Connecting to secure gateway portal...</p>
      </div>
    );
  }

  if (error && !paymentIntent) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-6">
        <div className="p-4 rounded-xl bg-red-50 border border-red-205 text-red-650 text-sm">
          {error}
        </div>
        <button onClick={() => navigate('/orders')} className="btn-secondary py-2.5 px-5 inline-flex items-center gap-1.5 text-xs font-bold">
          <ArrowLeft size={14} /> View Order History
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 w-full">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 relative shadow-md space-y-6 text-left">
        
        {/* Gateway Simulation Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Landmark className="text-primary-500" size={17} />
            <h2 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Mock Gateway Portal</h2>
          </div>
          <span className="text-[9px] bg-primary-50 text-primary-600 border border-primary-200/50 px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">
            Test Mode
          </span>
        </div>

        {/* Success/Failure States Overlays */}
        {paymentResult === 'success' && (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="mx-auto text-green-500 animate-bounce" size={48} />
            <h3 className="text-lg font-bold text-slate-800">Payment Successful!</h3>
            <p className="text-xs text-slate-450 max-w-xs mx-auto">
              Redirecting you back to your order details workspace...
            </p>
          </div>
        )}

        {paymentResult === 'failure' && (
          <div className="text-center py-8 space-y-4">
            <XCircle className="mx-auto text-red-500 animate-pulse" size={48} />
            <h3 className="text-lg font-bold text-red-600">Payment Failed</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              The transaction could not be processed. You can retry with a different configuration or simulated button.
            </p>
            <button
              onClick={() => setPaymentResult(null)}
              className="btn-secondary py-1.5 px-4 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer mt-2"
            >
              <RefreshCw size={12} /> Retry Payment
            </button>
          </div>
        )}

        {/* Regular Interactive payment form */}
        {!paymentResult && (
          <div className="space-y-5">
            
            {/* Amount details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider">Amount Due</span>
                <span className="block text-xl font-extrabold text-slate-800">₹{paymentIntent.amount.toFixed(2)}</span>
              </div>
              <div className="text-right text-[10px] text-slate-450">
                <span className="block">Ref ID:</span>
                <span className="font-mono font-bold text-primary-600">{paymentIntent.paymentId}</span>
              </div>
            </div>

            {/* Error alerts */}
            {error && (
              <div className="p-3 rounded-xl bg-red-55 border border-red-200 text-xs text-red-650 flex items-center gap-2">
                <XCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Simulated Inputs */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cardholder Name</label>
                <input
                  type="text"
                  name="name"
                  value={cardDetails.name}
                  onChange={handleInputChange}
                  placeholder="John Customer"
                  className="form-input w-full text-xs border-slate-200 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Card Number</label>
                <input
                  type="text"
                  name="number"
                  value={cardDetails.number}
                  onChange={handleInputChange}
                  placeholder="4111 2222 3333 4444"
                  className="form-input w-full text-xs font-mono border-slate-200 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expiry Date</label>
                  <input
                    type="text"
                    name="expiry"
                    value={cardDetails.expiry}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    className="form-input w-full text-xs text-center font-mono border-slate-200 bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CVV Code</label>
                  <input
                    type="password"
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleInputChange}
                    placeholder="•••"
                    maxLength="3"
                    className="form-input w-full text-xs text-center font-mono border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Simulated Action buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleSimulatePayment('Successful')}
                className="btn-primary py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer shadow-sm hover:shadow-md transition-all"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={13} /> : null}
                Pay Success
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleSimulatePayment('Failed')}
                className="btn-danger py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer shadow-sm hover:shadow-md transition-all"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={13} /> : null}
                Pay Fail
              </button>
            </div>

            {/* Securing tag */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-450 font-medium">
              <ShieldCheck className="text-primary-500" size={14} />
              <span>Simulated 256-bit encryption session</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentCheckout;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Loader2, ArrowLeft, ShieldCheck, CreditCard, Landmark, Check } from 'lucide-react';
import API from '../services/api.js';

const Checkout = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Address Form State
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState(null);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/cart');
      setCart(response.data);
      
      // Auto-fill address fields if user already has saved addresses
      setShippingAddress({
        fullName: response.data.user?.name || '',
        phone: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
      });
    } catch (err) {
      console.error(err);
      setError('Could not load shopping cart for checkout.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Form validations
    const required = ['fullName', 'phone', 'line1', 'city', 'state', 'postalCode'];
    const hasEmpty = required.some((field) => !shippingAddress[field].trim());
    if (hasEmpty) {
      setFormError('All address fields marked with an asterisk (*) are required');
      return;
    }

    setActionLoading(true);
    try {
      const response = await API.post('/orders', {
        shippingAddress,
        notes,
      });

      // Dispatch event to clear count
      window.dispatchEvent(new Event('cart-updated'));
      
      // Redirect to mock payment gateway
      navigate(`/checkout/payment/${response.data._id}`);
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Failed to place order. Try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="animate-spin text-primary-500" size={32} />
        <p className="text-sm text-slate-450">Loading checkout summary...</p>
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-6">
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-650 text-sm">
          No items in cart for checkout.
        </div>
        <Link to="/products" className="btn-secondary py-2.5 px-6 text-xs font-bold uppercase tracking-wider inline-block">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 w-full space-y-6">
      
      {/* Navigation Return */}
      <div>
        <Link to="/cart" className="text-xs font-bold text-slate-450 hover:text-slate-800 flex items-center gap-1.5 transition-all">
          <ArrowLeft size={13} /> Return to Cart
        </Link>
      </div>

      {/* Visual Multi-step progress indicator */}
      <div className="max-w-xl mx-auto pb-4">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-450">
          <div className="flex flex-col items-center gap-1.5 text-primary-600">
            <span className="h-6 w-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center border border-primary-300">1</span>
            <span>Address</span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-200 mx-4 -mt-4" />
          <div className="flex flex-col items-center gap-1.5 text-slate-400">
            <span className="h-6 w-6 rounded-full bg-white text-slate-400 flex items-center justify-center border border-slate-200">2</span>
            <span>Payment</span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-200 mx-4 -mt-4" />
          <div className="flex flex-col items-center gap-1.5 text-slate-400">
            <span className="h-6 w-6 rounded-full bg-white text-slate-400 flex items-center justify-center border border-slate-200">3</span>
            <span>Confirm</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* Checkout Address Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-left space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-850">Shipping Details</h2>
              <p className="text-xs text-slate-450 mt-1">Specify where should we deliver your custom merchandise</p>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-650">
                {formError}
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recipient Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="form-input w-full border-slate-200"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number *</label>
                  <input
                    type="text"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    placeholder="+91 9999999999"
                    className="form-input w-full border-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Address Line 1 *</label>
                <input
                  type="text"
                  name="line1"
                  value={shippingAddress.line1}
                  onChange={handleInputChange}
                  placeholder="Street address, company name, c/o"
                  className="form-input w-full border-slate-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Address Line 2</label>
                <input
                  type="text"
                  name="line2"
                  value={shippingAddress.line2}
                  onChange={handleInputChange}
                  placeholder="Apartment, suite, unit, building, floor"
                  className="form-input w-full border-slate-200"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    placeholder="Mumbai"
                    className="form-input w-full border-slate-200"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    placeholder="Maharashtra"
                    className="form-input w-full border-slate-200"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={handleInputChange}
                    placeholder="400001"
                    className="form-input w-full border-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Delivery Instructions / Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add custom notes for printers or delivery agents..."
                  rows="2"
                  className="form-input w-full resize-none border-slate-200"
                />
              </div>

              {/* Payment Method Selector */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payment Mode</label>
                <div className="p-4 rounded-xl border border-primary-200 bg-primary-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-primary-100 text-primary-600">
                      <Landmark size={18} />
                    </div>
                    <div className="text-left">
                      <span className="block text-xs font-bold text-slate-800">Mock Payment Integration</span>
                      <span className="text-[10px] text-slate-500">Order gets placed immediately for assessment testing</span>
                    </div>
                  </div>
                  <Check size={16} className="text-primary-600 font-extrabold" />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="btn-primary w-full py-2.5 flex justify-center items-center gap-1.5 text-xs font-bold uppercase tracking-wider mt-4 shadow-md hover:shadow-lg transition-all"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={14} /> : null}
                Place Order (₹{cart.total.toFixed(2)})
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-left space-y-6">
            <h3 className="font-bold text-sm text-slate-700 pb-3 border-b border-slate-100">Order Summary</h3>
            
            {/* Items List */}
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-3 pt-3 first:pt-0">
                  <img
                    src={item.product?.images?.[0]?.url || 'https://placehold.co/60x60'}
                    alt={item.product?.name}
                    className="h-12 w-12 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-50"
                  />
                  <div className="text-xs min-w-0 flex-grow">
                    <h4 className="font-bold text-slate-800 truncate">{item.product?.name}</h4>
                    <p className="text-[10px] text-slate-450 mt-0.5">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</p>
                    <div className="font-semibold text-slate-700 mt-1">₹{(item.unitPrice * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs text-slate-500 border-t border-slate-100 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (18%)</span>
                <span>₹{cart.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Charges</span>
                <span>{cart.shippingCharge === 0 ? 'Free' : `₹${cart.shippingCharge.toFixed(2)}`}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-700">Total Amount</span>
                <span className="text-base font-extrabold text-primary-600">₹{cart.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Safety tags */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-450 font-medium">
              <ShieldCheck className="text-primary-500 shrink-0" size={14} />
              <span>Protected checkout transaction</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Checkout;

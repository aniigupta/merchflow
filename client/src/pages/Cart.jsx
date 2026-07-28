import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Loader2, Trash2, ArrowRight, ShieldCheck, Truck, RefreshCw, AlertCircle, ShoppingCart } from 'lucide-react';
import API from '../services/api.js';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/cart');
      setCart(response.data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve shopping cart items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQtyChange = async (itemId, newQty) => {
    if (newQty < 1) return;
    setActionLoading(true);
    setError(null);
    try {
      const response = await API.put(`/cart/${itemId}`, { quantity: newQty });
      setCart(response.data);
      // Dispatch custom event to notify App header of cart change
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update item quantity');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this customized item from your cart?')) return;
    setActionLoading(true);
    setError(null);
    try {
      const response = await API.delete(`/cart/${itemId}`);
      setCart(response.data);
      // Dispatch custom event to notify App header of cart change
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to remove item from cart');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="animate-spin text-primary-500" size={32} />
        <p className="text-sm text-slate-450">Opening your shopping cart...</p>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 w-full space-y-6">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
          <ShoppingCart className="text-primary-500" size={24} /> Shopping Cart
        </h1>
        <p className="text-sm text-slate-450 mt-1">Review your customized selections and proceed to checkout</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-650 flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <ShoppingBag className="mx-auto text-slate-300 mb-4 animate-bounce" size={44} />
          <h3 className="text-base font-bold text-slate-800">Your Cart is Empty</h3>
          <p className="text-xs text-slate-450 max-w-sm mx-auto mt-1.5 mb-6">
            You have not added any customized merchandise yet. Explore our store catalog and design yours today.
          </p>
          <Link to="/products" className="btn-primary py-2.5 px-6 text-xs font-bold uppercase tracking-wider inline-block">
            Start Designing
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* Cart Table List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="min-w-[600px] divide-y divide-slate-200/60">
                
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 py-4 px-6 text-xs font-bold text-slate-450 uppercase bg-slate-50">
                  <div className="col-span-6">Customized Product</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Table Items */}
                {items.map((item) => {
                  const prod = item.product || {};
                  return (
                    <div key={item._id} className="grid grid-cols-12 gap-4 py-5 px-6 items-center hover:bg-slate-50/40 transition-all border-b border-slate-100">
                      
                      {/* Product specifications column */}
                      <div className="col-span-6 flex gap-4">
                        <img
                          src={prod.images?.[0]?.url || 'https://placehold.co/80x80/f1f5f9/0f172a?text=Product'}
                          alt={prod.name}
                          className="h-16 w-16 object-cover rounded-lg border border-slate-200 bg-slate-50"
                        />
                        <div className="space-y-1.5 text-left">
                          <Link to={`/products/${prod._id}`} className="font-bold text-slate-800 hover:text-primary-600 transition-colors block text-sm">
                            {prod.name}
                          </Link>
                          <div className="flex flex-wrap gap-1.5 text-[9px] text-slate-550">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50">Size: <strong>{item.size}</strong></span>
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50">Color: <strong>{item.color}</strong></span>
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50 capitalize">Location: <strong>{item.printLocation}</strong></span>
                          </div>
                          
                          {/* Design Graphic Preview */}
                          {item.designImage && (
                            <div className="flex items-center gap-1.5 mt-2 p-1 bg-slate-50 border border-slate-200/70 rounded w-fit">
                              <img src={item.designImage} alt="Artwork" className="h-6 w-6 object-contain rounded bg-white border border-slate-100" />
                              <span className="text-[9px] text-slate-450 font-medium pr-1.5">Custom Artwork</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity stepper column */}
                      <div className="col-span-2 flex justify-center">
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg">
                          <button
                            type="button"
                            disabled={actionLoading || item.quantity <= 1}
                            onClick={() => handleQtyChange(item._id, item.quantity - 1)}
                            className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer transition-colors"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-700 font-mono">{item.quantity}</span>
                          <button
                            type="button"
                            disabled={actionLoading || item.quantity >= (prod.stockQuantity || 100)}
                            onClick={() => handleQtyChange(item._id, item.quantity + 1)}
                            className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Price column */}
                      <div className="col-span-2 text-right space-y-0.5">
                        <div className="text-sm font-bold text-slate-800">₹{(item.unitPrice * item.quantity).toFixed(2)}</div>
                        <div className="text-[9px] text-slate-400">₹{item.unitPrice} each</div>
                      </div>

                      {/* Actions column */}
                      <div className="col-span-2 text-right">
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          disabled={actionLoading}
                          className="p-2 rounded-lg bg-red-50 border border-red-200/50 text-red-650 hover:bg-red-100/70 transition-all cursor-pointer inline-flex"
                          title="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                    </div>
                  );
                })}

              </div>
            </div>
          </div>

          {/* Cart Pricing Summary Panel */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 text-left">
              <h3 className="font-bold text-sm text-slate-700 pb-3 border-b border-slate-100">Pricing Breakdown</h3>
              
              <div className="space-y-2.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-slate-700">₹{cart.subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>GST (18% standard rate)</span>
                  <span>₹{cart.tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    Shipping Charges {cart.shippingCharge === 0 && <span className="text-[9px] bg-green-50 text-green-600 font-extrabold px-1 rounded border border-green-200/50">Free</span>}
                  </span>
                  <span>{cart.shippingCharge === 0 ? '₹0.00' : `₹${cart.shippingCharge.toFixed(2)}`}</span>
                </div>

                {cart.shippingCharge > 0 && (
                  <p className="text-[10px] text-primary-600 bg-primary-50 p-2 rounded border border-primary-100 text-center font-bold">
                    Add ₹{(999 - cart.subtotal).toFixed(2)} more to unlock FREE shipping!
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-700">Estimated Total</span>
                <span className="text-lg font-extrabold text-primary-600">₹{cart.total.toFixed(2)}</span>
              </div>

              <Link
                to="/checkout"
                className="btn-primary w-full py-2.5 mt-4 text-xs font-bold uppercase tracking-wider flex justify-center items-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg transition-all"
              >
                Checkout Details <ArrowRight size={13} />
              </Link>
            </div>

            {/* Quality Seals */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs text-slate-500 text-left">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="text-primary-500 shrink-0" size={15} />
                <span>100% Quality checked prints</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="text-primary-500 shrink-0" size={15} />
                <span>Fast express local delivery</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RefreshCw className="text-primary-500 shrink-0" size={15} />
                <span>Easy replacement for print defects</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Cart;

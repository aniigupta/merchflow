import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Heart, ShoppingBag, ShieldCheck, HelpCircle, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import API from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const PRINT_LOCATIONS = ['front', 'back', 'left_sleeve', 'right_sleeve', 'full'];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery Active Index
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Customization Form State
  const [customization, setCustomization] = useState({
    size: '',
    color: null,
    printType: '',
    printLocation: 'front',
    quantity: 1,
  });

  const [customDesignFile, setCustomDesignFile] = useState(null);
  const [customDesignPreview, setCustomDesignPreview] = useState(null);
  const [designImageUrl, setDesignImageUrl] = useState('');
  const [uploadingArtwork, setUploadingArtwork] = useState(false);
  const [cartAdding, setCartAdding] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.get(`/products/${id}`);
        const prod = response.data;
        setProduct(prod);

        // Pre-fill customization options with defaults
        setCustomization({
          size: prod.availableSizes?.[0] || '',
          color: prod.availableColors?.[0] || null,
          printType: prod.printTypes?.[0] || '',
          printLocation: 'front',
          quantity: 1,
        });
      } catch (err) {
        console.error(err);
        setError('Merchandise product details could not be retrieved.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleDesignFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}`, message: 'Please log in to design merchandise.' } });
      return;
    }

    setCustomDesignFile(file);
    setCustomDesignPreview(URL.createObjectURL(file));
    setUploadingArtwork(true);
    setActionError(null);

    const formData = new FormData();
    formData.append('designImage', file);

    try {
      const response = await API.post('/cart/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDesignImageUrl(response.data.url);
    } catch (err) {
      console.error(err);
      setActionError(err.message || 'Failed to upload artwork to the server');
      setCustomDesignFile(null);
      setCustomDesignPreview(null);
    } finally {
      setUploadingArtwork(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setActionError(null);

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}`, message: 'Please log in to add items to your cart.' } });
      return;
    }

    if (!customization.color) {
      setActionError('Please select a merchandise color option');
      return;
    }

    setCartAdding(true);
    setCartSuccess(false);

    try {
      const payload = {
        product: product._id,
        size: customization.size,
        color: customization.color.name,
        quantity: customization.quantity,
        printLocation: customization.printLocation,
        designImage: designImageUrl, // URL retrieved from backend
      };

      await API.post('/cart', payload);

      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3000);
      
      // Dispatch custom event to notify App header of cart change
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      console.error(err);
      setActionError(err.message || 'Failed to add item to your shopping cart');
    } finally {
      setCartAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-4">
        <Loader2 className="animate-spin text-primary-500" size={32} />
        <p className="text-sm text-slate-450">Loading merchandise canvas...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-6">
        <div className="p-4 rounded-xl bg-red-50 border border-red-205 text-red-650 text-sm">
          {error || 'Merchandise item not found'}
        </div>
        <Link to="/products" className="btn-secondary py-2.5 px-5 inline-flex items-center gap-1.5 text-xs font-bold">
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
      </div>
    );
  }

  const galleryImages = product.images?.length > 0
    ? product.images
    : [{ url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800', alt: 'Placeholder' }];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 w-full space-y-6">
      
      {/* Return link */}
      <div>
        <Link to="/products" className="text-xs font-bold text-slate-450 hover:text-slate-800 flex items-center gap-1.5 transition-all">
          <ArrowLeft size={13} /> BACK TO STORE CATALOG
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-start">
        
        {/* Left Side: Images Gallery */}
        <div className="space-y-4">
          <div className="relative pt-[100%] rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-50 shadow-sm">
            <img
              src={galleryImages[activeImageIdx]?.url}
              alt={galleryImages[activeImageIdx]?.alt || product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {galleryImages.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative pt-[100%] rounded-lg overflow-hidden border transition-all cursor-pointer ${
                    activeImageIdx === idx ? 'border-primary-500 ring-2 ring-primary-500/10' : 'border-slate-200 hover:border-slate-350'
                  }`}
                >
                  <img src={img.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Customizer Mock Form */}
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          
          {/* Header Specs */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200/80 px-2 py-0.5 rounded-full font-bold uppercase">
                {product.category?.name || 'General Merch'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">SKU: {product.sku}</span>
            </div>
            
            <h1 className="text-2xl font-extrabold text-slate-800 leading-tight">{product.name}</h1>
            
            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="text-xl font-extrabold text-primary-600">₹{product.price.toFixed(2)}</span>
              <span className="text-[10px] text-slate-400">includes GST / print setup</span>
            </div>
          </div>

          {/* Body Description */}
          <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
            {product.description}
          </p>

          {/* Form */}
          <form onSubmit={handleAddToCart} className="space-y-5 border-t border-slate-100 pt-5 text-left">
            
            {/* Customization Details Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              
              {/* Color Circles selection */}
              {product.availableColors?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Merch Color</span>
                  <div className="flex flex-wrap gap-2">
                    {product.availableColors.map((col, idx) => {
                      const isSelected = customization.color?.name === col.name;
                      return (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setCustomization(prev => ({ ...prev, color: col }))}
                          className={`h-7 w-7 rounded-full border flex items-center justify-center transition-all cursor-pointer relative shadow-sm ${
                            isSelected ? 'border-primary-500 ring-2 ring-primary-500/20 scale-105' : 'border-slate-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                        >
                          {isSelected && (
                            <Check size={11} className={col.hex.toLowerCase() === '#ffffff' ? 'text-slate-800' : 'text-white'} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizes Selection radio list */}
              {product.availableSizes?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Select Size</span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.availableSizes.map((sz) => {
                      const isSelected = customization.size === sz;
                      return (
                        <button
                          type="button"
                          key={sz}
                          onClick={() => setCustomization(prev => ({ ...prev, size: sz }))}
                          className={`px-3 py-1 rounded-md border text-[11px] font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-primary-50 border-primary-500 text-primary-600'
                              : 'bg-white border-slate-200 text-slate-655 hover:border-slate-350'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Print Type Selection dropdown */}
              {product.printTypes?.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Print Type</label>
                  <select
                    value={customization.printType}
                    onChange={(e) => setCustomization(prev => ({ ...prev, printType: e.target.value }))}
                    className="form-input text-xs w-full bg-white border-slate-200"
                  >
                    {product.printTypes.map((pt) => (
                      <option key={pt} value={pt}>{pt}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Print Location selection dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Print Location</label>
                <select
                  value={customization.printLocation}
                  onChange={(e) => setCustomization(prev => ({ ...prev, printLocation: e.target.value }))}
                  className="form-input text-xs w-full bg-white border-slate-200"
                >
                  {PRINT_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} className="capitalize">{loc.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Custom Design Graphic Uploader */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/85">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Upload Print Artwork</span>
              <p className="text-[10px] text-slate-450 mb-2">Upload your high-res design file (.png, .jpg, .jpeg) for print placement</p>
              
              <div className="flex items-center gap-3">
                <label className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer bg-white border border-slate-200 hover:bg-slate-50">
                  {uploadingArtwork ? <Loader2 className="animate-spin" size={13} /> : <ImageIcon size={13} />} 
                  {uploadingArtwork ? 'Uploading...' : 'Choose File'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDesignFileChange}
                    className="hidden"
                    disabled={uploadingArtwork}
                  />
                </label>
                
                {customDesignFile ? (
                  <span className="text-xs text-slate-600 truncate max-w-[150px] font-medium">{customDesignFile.name}</span>
                ) : (
                  <span className="text-xs text-slate-400">No artwork chosen</span>
                )}
              </div>

              {customDesignPreview && (
                <div className="mt-3 p-2 rounded-lg bg-white border border-slate-200 inline-block shadow-sm">
                  <span className="text-[9px] text-slate-450 block mb-1 font-bold">Artwork Preview</span>
                  <img src={customDesignPreview} alt="Art Preview" className="h-16 rounded object-contain border border-slate-100" />
                </div>
              )}
            </div>

            {/* Error alerts */}
            {actionError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-650 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Order Quantity selector & Submit trigger */}
            <div className="flex items-end gap-4">
              <div className="space-y-1.5 w-24">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={product.stockQuantity || 100}
                  value={customization.quantity}
                  onChange={(e) => setCustomization(prev => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value)) }))}
                  className="form-input text-center font-bold border-slate-200"
                />
              </div>

              <div className="flex-grow">
                {product.stockQuantity === 0 ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 font-bold text-xs uppercase cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={cartAdding || uploadingArtwork}
                    className="btn-primary w-full py-2.5 flex justify-center items-center gap-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
                  >
                    {cartAdding ? (
                      <>
                        <Loader2 className="animate-spin" size={14} /> Adding...
                      </>
                    ) : cartSuccess ? (
                      <>
                        <Check size={14} className="text-green-200" /> Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={14} /> Add to Cart
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

          </form>

          {/* Secure details tags */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-primary-500 shrink-0" size={15} />
              <span>Quality prints tested</span>
            </div>
            <div className="flex items-center gap-2">
              <HelpCircle className="text-primary-500 shrink-0" size={15} />
              <span>Bulk orders discounts</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ProductDetail;

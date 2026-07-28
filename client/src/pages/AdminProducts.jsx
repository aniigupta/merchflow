import React, { useState, useEffect } from 'react';
import { Shirt, Plus, Edit2, Trash2, Loader2, X, AlertCircle, Upload, Search, Check, Filter } from 'lucide-react';
import API from '../services/api.js';

const PRINT_OPTIONS = ['Screen Printing', 'DTF Printing', 'Sublimation', 'Embroidery', 'UV Printing'];
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size'];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination & Filter States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stockQuantity: '',
    sku: '',
    isFeatured: false,
    isActive: true,
  });

  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedPrintTypes, setSelectedPrintTypes] = useState([]);
  const [colorInput, setColorInput] = useState({ name: '', hex: '#000000' });
  const [colors, setColors] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [retainedImages, setRetainedImages] = useState([]); // for edit mode images list
  const [formError, setFormError] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await API.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 8,
        isAdminView: true,
      };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;

      const response = await API.get('/products', { params });
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve products catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: categories[0]?._id || '',
      price: '',
      stockQuantity: '',
      sku: '',
      isFeatured: false,
      isActive: true,
    });
    setSelectedSizes([]);
    setSelectedPrintTypes([]);
    setColors([]);
    setImageFiles([]);
    setImagePreviews([]);
    setRetainedImages([]);
    setFormError(null);
    setIsOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category?._id || product.category || '',
      price: product.price,
      stockQuantity: product.stockQuantity,
      sku: product.sku,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
    });
    setSelectedSizes(product.availableSizes || []);
    setSelectedPrintTypes(product.printTypes || []);
    setColors(product.availableColors || []);
    setImageFiles([]);
    setImagePreviews([]);
    setRetainedImages(product.images || []);
    setFormError(null);
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const toggleSize = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const togglePrintType = (type) => {
    setSelectedPrintTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const addColor = () => {
    if (!colorInput.name.trim()) return;
    setColors((prev) => [...prev, { ...colorInput }]);
    setColorInput({ name: '', hex: '#000000' });
  };

  const removeColor = (index) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImagePreview = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeRetainedImage = (index) => {
    setRetainedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Form Field Validations
    if (!formData.name.trim() || !formData.sku.trim() || !formData.description.trim() || !formData.price || !formData.category) {
      setFormError('All fields marked with an asterisk (*) are required');
      return;
    }

    if (Number(formData.stockQuantity) < 0) {
      setFormError('Stock quantity cannot be negative');
      return;
    }

    if (Number(formData.price) < 0) {
      setFormError('Price cannot be negative');
      return;
    }

    setActionLoading(true);

    // Build multi-part form payload for file upload
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('description', formData.description);
    payload.append('category', formData.category);
    payload.append('price', formData.price);
    payload.append('stockQuantity', formData.stockQuantity);
    payload.append('sku', formData.sku);
    payload.append('isFeatured', formData.isFeatured);
    payload.append('isActive', formData.isActive);

    payload.append('availableSizes', JSON.stringify(selectedSizes));
    payload.append('availableColors', JSON.stringify(colors));
    payload.append('printTypes', JSON.stringify(selectedPrintTypes));

    // Append newly selected files
    imageFiles.forEach((file) => {
      payload.append('images', file);
    });

    if (editingProduct) {
      // Retained server images
      payload.append('existingImages', JSON.stringify(retainedImages));
    }

    try {
      const headers = { 'Content-Type': 'multipart/form-data' };
      if (editingProduct) {
        await API.put(`/products/${editingProduct._id}`, payload, { headers });
      } else {
        await API.post('/products', payload, { headers });
      }
      setIsOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Failed to submit product data.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this merchandise product?')) return;
    setActionLoading(true);
    try {
      await API.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError('Failed to delete product.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 w-full space-y-6 text-left">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
            <Shirt className="text-primary-500" size={24} /> Products Workspace
          </h1>
          <p className="text-sm text-slate-450 mt-1">Design, inventory control, and merchandise details management</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center gap-1.5 py-2.5 text-xs shadow-sm hover:shadow-md cursor-pointer"
        >
          <Plus size={15} /> New Product
        </button>
      </div>

      {/* Main filtration bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search products by SKU or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input w-full pl-10 py-2 text-xs border-slate-200 bg-white"
          />
          <button type="submit" className="absolute left-3.5 inset-y-0 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer">
            <Search size={14} />
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="form-input text-xs py-2 w-full md:w-48 bg-white border-slate-200 text-slate-700"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-650 flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Products table list */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary-500" size={32} />
          <p className="text-sm text-slate-455 animate-pulse">Loading catalog inventory...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <Shirt className="mx-auto text-slate-350 mb-4 animate-pulse" size={44} />
          <h3 className="text-base font-bold text-slate-800">No Products Registered</h3>
          <p className="text-xs text-slate-450 max-w-sm mx-auto mt-1">
            Seeding helps set up the catalog. Or click "New Product" to build one manually.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-slate-50">
                  <th className="py-4 px-6">Merch Details</th>
                  <th className="py-4 px-6">SKU / Code</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6">Printers</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-655">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/45 transition-all border-b border-slate-100">
                    <td className="py-4 px-6 flex items-center gap-3.5">
                      <img
                        src={p.images?.[0]?.url || 'https://placehold.co/80x80/f1f5f9/0f172a?text=Image'}
                        alt={p.name}
                        className="h-10 w-10 object-cover rounded-lg border border-slate-200 bg-slate-50 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-800 text-xs leading-none">{p.name}</div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {p.isActive ? (
                            <span className="inline-flex h-2 w-2 rounded-full bg-green-500" title="Active"></span>
                          ) : (
                            <span className="inline-flex h-2 w-2 rounded-full bg-red-500" title="Inactive"></span>
                          )}
                          {p.isFeatured && (
                            <span className="text-[9px] bg-primary-50 text-primary-600 font-bold px-1.5 py-0.5 rounded border border-primary-200/50">Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs uppercase text-slate-700">{p.sku}</td>
                    <td className="py-4 px-6 text-slate-500 font-medium">{p.category?.name || '—'}</td>
                    <td className="py-4 px-6 font-bold text-slate-850">₹{p.price.toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span className={`font-mono text-xs ${p.stockQuantity <= 10 ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {p.printTypes.slice(0, 2).map((t, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200/60 shadow-xs">{t}</span>
                        ))}
                        {p.printTypes.length > 2 && <span className="text-[9px] text-slate-400">+{p.printTypes.length - 2} more</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-450 hover:bg-slate-50 hover:text-slate-850 hover:border-slate-350 shadow-sm transition-all cursor-pointer inline-flex"
                        title="Edit Details"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p._id)}
                        className="p-1.5 rounded-lg bg-red-50 border border-red-200/60 text-red-600 hover:bg-red-100 hover:text-red-750 transition-all cursor-pointer inline-flex shadow-sm"
                        title="Delete Product"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Simple pagination block */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
              >
                Previous
              </button>
              <span className="text-xs text-slate-500 font-bold">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Product Slide-out Form / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl p-6 relative shadow-lg my-8 max-h-[90vh] overflow-y-auto text-left">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-all cursor-pointer border border-transparent hover:border-slate-200"
            >
              <X size={16} />
            </button>

            <h2 className="text-xl font-bold mb-1 text-slate-800">
              {editingProduct ? 'Edit Product' : 'New Merchandise Item'}
            </h2>
            <p className="text-xs text-slate-450 mb-6">
              Add sizes, specifications, print techniques, and catalog visuals.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-650 flex items-center gap-2">
                <AlertCircle size={15} />
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              {/* Product Basic Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Classic Hoodie"
                    className="form-input w-full border-slate-200"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SKU Code *</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="HUD-CLASSIC-001"
                    className="form-input w-full border-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Product Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed layout specifications..."
                  rows="3"
                  className="form-input w-full resize-none border-slate-200"
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-input w-full bg-white border-slate-200 text-slate-700"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Price (INR) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="599"
                    className="form-input w-full border-slate-200"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Stock Qty *</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    placeholder="100"
                    className="form-input w-full border-slate-200"
                    required
                  />
                </div>
              </div>

              {/* Checkboxes & Configs */}
              <div className="flex items-center gap-6 py-3 border-y border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="accent-primary-500 rounded h-4 w-4 border-slate-350 bg-white"
                  />
                  <span>Active (Visible in Store)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="accent-primary-500 rounded h-4 w-4 border-slate-350 bg-white"
                  />
                  <span>Featured Placement</span>
                </label>
              </div>

              {/* Sizes Multi-select */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Available Sizes</label>
                <div className="flex flex-wrap gap-1.5">
                  {SIZE_OPTIONS.map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        type="button"
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary-50 border-primary-500 text-primary-600'
                            : 'bg-white border-slate-200 text-slate-550 hover:border-slate-350'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors Custom Input Tag */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Merchandise Colors</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="e.g. Navy Blue"
                    value={colorInput.name}
                    onChange={(e) => setColorInput((prev) => ({ ...prev, name: e.target.value }))}
                    className="form-input text-xs flex-grow border-slate-200 bg-white"
                  />
                  <input
                    type="color"
                    value={colorInput.hex}
                    onChange={(e) => setColorInput((prev) => ({ ...prev, hex: e.target.value }))}
                    className="h-9 w-12 rounded border border-slate-250 cursor-pointer bg-white"
                  />
                  <button
                    type="button"
                    onClick={addColor}
                    className="btn-secondary py-2 text-xs h-9 shrink-0 flex items-center justify-center font-bold border-slate-200 bg-white"
                  >
                    Add Color
                  </button>
                </div>
                {colors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {colors.map((col, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-xs text-slate-700 shadow-xs"
                      >
                        <span className="h-2 w-2 rounded-full border border-slate-300" style={{ backgroundColor: col.hex }}></span>
                        {col.name}
                        <button type="button" onClick={() => removeColor(index)} className="text-slate-450 hover:text-slate-700 cursor-pointer">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Print Techniques Multi-select */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Print Types</label>
                <div className="flex flex-wrap gap-1.5">
                  {PRINT_OPTIONS.map((type) => {
                    const isSelected = selectedPrintTypes.includes(type);
                    return (
                      <button
                        type="button"
                        key={type}
                        onClick={() => togglePrintType(type)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary-50 border-primary-500 text-primary-600'
                            : 'bg-white border-slate-200 text-slate-550 hover:border-slate-350'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visual Visuals (Images) Upload Pane */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Visual Assets (Max 5)</label>
                
                {/* Retained images (Server) */}
                {retainedImages.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-450 uppercase">Current Server Images</span>
                    <div className="grid grid-cols-5 gap-3">
                      {retainedImages.map((img, idx) => (
                        <div key={idx} className="relative group border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          <img src={img.url} alt="Server Retained" className="h-14 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeRetainedImage(idx)}
                            className="absolute top-1 right-1 p-0.5 rounded bg-black/60 hover:bg-black text-red-200 cursor-pointer"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload drag block */}
                <div className="flex justify-center items-center w-full">
                  <label className="flex flex-col justify-center items-center w-full h-32 bg-slate-50 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer hover:border-primary-500/50 hover:bg-slate-100/40 transition-all p-4">
                    <div className="flex flex-col justify-center items-center pt-3 pb-4 text-center">
                      <Upload className="text-slate-450 mb-1" size={20} />
                      <p className="mb-0.5 text-xs text-slate-600 font-bold"><span className="text-primary-600">Click to upload</span> or drag files</p>
                      <p className="text-[9px] text-slate-400 font-medium">PNG, JPG, JPEG, WEBP or GIF (max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Local Previews */}
                {imagePreviews.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-455 uppercase">Newly Selected (Local Preview)</span>
                    <div className="grid grid-cols-5 gap-3">
                      {imagePreviews.map((previewUrl, idx) => (
                        <div key={idx} className="relative group border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          <img src={previewUrl} alt="Preview" className="h-14 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImagePreview(idx)}
                            className="absolute top-1 right-1 p-0.5 rounded bg-black/60 hover:bg-black text-red-200 cursor-pointer"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit panel */}
              <button
                type="submit"
                disabled={actionLoading}
                className="btn-primary w-full mt-4 flex justify-center items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={14} /> : null}
                {editingProduct ? 'Save Product Details' : 'Create Merchandise Product'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Loader2, ArrowUpDown, Grid, BookOpen } from 'lucide-react';
import API from '../services/api.js';

const PRINT_TYPES = ['Screen Printing', 'DTF Printing', 'Sublimation', 'Embroidery', 'UV Printing'];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedPrintType, setSelectedPrintType] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Toggle Filters sidebar on small viewports
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await API.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 9,
      };

      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (selectedPrintType) params.printType = selectedPrintType;
      if (sort) params.sort = sort;

      const response = await API.get('/products', { params });
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve product catalog. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, selectedPrintType, sort]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinPrice('');
    maxPrice && setMaxPrice('');
    minPrice && setMinPrice('');
    setSelectedPrintType('');
    setSort('');
    setPage(1);
    // Explicit call to fetch clean list
    setTimeout(() => {
      fetchProducts();
    }, 50);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 w-full space-y-6">
      
      {/* Search and Title Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Store Merchandise</h1>
          <p className="text-sm text-slate-450 mt-1">Discover premium customize-ready products for your brand or event</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <form onSubmit={handleFilterSubmit} className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search merchandise catalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-10 py-2.5 text-xs w-full border-slate-200 bg-white"
            />
            <button type="submit" className="absolute left-3.5 inset-y-0 flex items-center text-slate-450 hover:text-slate-700 cursor-pointer">
              <Search size={14} />
            </button>
          </form>

          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="md:hidden p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 flex items-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0"
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        {/* Sidebar Filters */}
        <aside className={`w-full md:w-64 space-y-6 shrink-0 bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:block ${showFiltersMobile ? 'block' : 'hidden'}`}>
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-750">Catalog Filters</h2>
            <button onClick={clearFilters} className="text-[10px] font-bold text-primary-600 hover:text-primary-750 cursor-pointer uppercase">Clear All</button>
          </div>

          <form onSubmit={handleFilterSubmit} className="space-y-5">
            {/* Categories */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold text-slate-450 uppercase tracking-wider">Category</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                <label className="flex items-center gap-2 text-xs text-slate-650 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === ''}
                    onChange={() => { setSelectedCategory(''); setPage(1); }}
                    className="accent-primary-500 rounded h-3.5 w-3.5 border-slate-300"
                  />
                  <span>All Categories</span>
                </label>
                {categories.map((cat) => (
                  <label key={cat._id} className="flex items-center gap-2 text-xs text-slate-650 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="category"
                      value={cat._id}
                      checked={selectedCategory === cat._id}
                      onChange={() => { setSelectedCategory(cat._id); setPage(1); }}
                      className="accent-primary-500 rounded h-3.5 w-3.5 border-slate-300"
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Print Type */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold text-slate-450 uppercase tracking-wider">Print Technique</label>
              <select
                value={selectedPrintType}
                onChange={(e) => { setSelectedPrintType(e.target.value); setPage(1); }}
                className="form-input text-xs w-full border-slate-200"
              >
                <option value="">Any Print Type</option>
                {PRINT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Price Limit inputs */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold text-slate-450 uppercase tracking-wider">Price Range (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="form-input text-xs text-center py-1.5 border-slate-200"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="form-input text-xs text-center py-1.5 border-slate-200"
                />
              </div>
              <button
                type="submit"
                className="btn-secondary w-full py-2 text-xs font-bold mt-1.5 flex items-center justify-center gap-1 cursor-pointer"
              >
                Apply Range
              </button>
            </div>

            {/* Sorting */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold text-slate-450 uppercase tracking-wider">Sort By</label>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="form-input text-xs w-full border-slate-200"
              >
                <option value="">Newest Added</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
            </div>
          </form>
        </aside>

        {/* Products Grid Section */}
        <main className="flex-1 w-full space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-650">
              {error}
            </div>
          )}

          {loading ? (
            /* Skeleton Loading Grid Cards */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-pulse space-y-4">
                  <div className="bg-slate-200 pt-[100%] w-full" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-5/6" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="flex justify-between pt-2 border-t border-slate-100">
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                      <div className="h-4 bg-slate-200 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State Container */
            <div className="text-center py-20 bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
              <Grid className="mx-auto text-slate-300 mb-4" size={44} />
              <h3 className="text-base font-bold text-slate-800">No Products Found</h3>
              <p className="text-xs text-slate-450 max-w-xs mx-auto mt-1.5 mb-6">
                We couldn't find any items matching your active query criteria. Try adjusting the toggles or values.
              </p>
              <button onClick={clearFilters} className="btn-secondary py-2 text-xs">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Product Cards Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <Link
                    key={p._id}
                    to={`/products/${p._id}`}
                    className="group flex flex-col bg-white border border-slate-200 hover:border-primary-300 rounded-xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {/* Visual Container */}
                    <div className="relative pt-[100%] overflow-hidden bg-slate-100/50">
                      <img
                        src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'}
                        alt={p.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-all duration-300"
                        loading="lazy"
                      />
                      {p.isFeatured && (
                        <span className="absolute top-3 left-3 text-[9px] bg-primary-500 text-white font-extrabold px-2 py-0.5 rounded-full shadow-sm tracking-wider uppercase">
                          Popular
                        </span>
                      )}
                      <span className="absolute bottom-3 right-3 text-[10px] bg-white/95 backdrop-blur-xs text-slate-600 font-bold px-2 py-1 rounded border border-slate-200/60 shadow-sm">
                        {p.category?.name || 'Catalog'}
                      </span>
                    </div>

                    {/* Meta details */}
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-3.5">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm group-hover:text-primary-600 line-clamp-1 transition-all">
                          {p.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {p.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div>
                          <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Price starting</span>
                          <span className="text-sm font-extrabold text-primary-600">₹{p.price.toFixed(2)}</span>
                        </div>
                        <span className="text-[10px] text-primary-500 font-bold flex items-center gap-1 group-hover:underline transition-all">
                          Customize →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-6 border-t border-slate-200">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-500 font-bold">Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

    </div>
  );
};

export default Products;

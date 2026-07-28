import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import AdminCategories from './pages/AdminCategories.jsx';
import AdminProducts from './pages/AdminProducts.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import PaymentCheckout from './pages/PaymentCheckout.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import AdminOrders from './pages/AdminOrders.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Tracking from './pages/Tracking.jsx';
import NotFound from './pages/NotFound.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import API from './services/api.js';
import { Shirt, Layers, LogIn, LogOut, UserPlus, FolderKanban, ShoppingCart, ClipboardList, Truck } from 'lucide-react';

const Header = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  const fetchCartCount = async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }
    try {
      const response = await API.get('/cart');
      const items = response?.data?.items || [];
      const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalQty);
    } catch (err) {
      console.error('Failed to load cart count', err);
    }
  };

  useEffect(() => {
    fetchCartCount();

    // Register event listener to reactively update count when added/updated
    window.addEventListener('cart-updated', fetchCartCount);
    return () => {
      window.removeEventListener('cart-updated', fetchCartCount);
    };
  }, [isAuthenticated]);

  // Active styles helper for main links
  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-150 whitespace-nowrap ${
      isActive 
        ? 'bg-slate-100 text-slate-800 shadow-sm border border-slate-200/50' 
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
    }`;
  };

  // Active styles helper for admin sub-links
  const getAdminLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
      isActive
        ? 'bg-primary-50 text-primary-600 shadow-xs border border-primary-100'
        : 'text-primary-600 hover:bg-primary-50/50'
    }`;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAFAFA]/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all duration-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo / Brand */}
        <Link to="/" className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity shrink-0">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center shadow-[0_4px_12px_rgba(99,102,241,0.25)]">
            <Shirt className="text-white animate-pulse" size={20} />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-800">
              MERCH<span className="text-primary-500">FLOW</span>
            </span>
            <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider -mt-1">
              Store & Admin Hub
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 md:gap-2">
          <Link
            to="/products"
            className={getLinkClass('/products')}
          >
            <Shirt size={13} /> Store Catalog
          </Link>
          <Link
            to="/tracking"
            className={getLinkClass('/tracking')}
          >
            <Truck size={13} /> Track
          </Link>

          {/* Customer Specific History Link */}
          {isAuthenticated && (
            <Link
              to="/orders"
              className={getLinkClass('/orders')}
            >
              <ClipboardList size={13} /> My Orders
            </Link>
          )}

          {/* Admin Specific Links */}
          {isAuthenticated && isAdmin && (
            <div className="hidden lg:flex items-center gap-1 border-l border-slate-200 pl-2 ml-1">
              <Link
                to="/admin/dashboard"
                className={getAdminLinkClass('/admin/dashboard')}
              >
                Admin Stats
              </Link>
              <Link
                to="/admin/products"
                className={getAdminLinkClass('/admin/products')}
              >
                Products
              </Link>
              <Link
                to="/admin/categories"
                className={getAdminLinkClass('/admin/categories')}
              >
                Categories
              </Link>
              <Link
                to="/admin/orders"
                className={getAdminLinkClass('/admin/orders')}
              >
                Orders
              </Link>
            </div>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-2 md:pl-3 ml-1 shrink-0">
              
              {/* Shopping Cart Icon Badge */}
              <Link
                to="/cart"
                className="relative p-2 text-slate-500 hover:text-slate-850 hover:bg-slate-100/60 rounded-lg transition-colors"
                title="View Shopping Cart"
              >
                <ShoppingCart size={17} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-primary-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold shadow-md animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-primary-100 text-primary-600 border border-primary-200/60 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <span className="block text-xs font-bold text-slate-700 leading-none">{user.name}</span>
                  <span className="text-[8px] font-extrabold text-primary-600 bg-primary-50 px-1 py-0.5 rounded uppercase mt-0.5 inline-block">{user.role}</span>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 border border-red-200/50 hover:bg-red-100/70 transition-all duration-150 cursor-pointer"
              >
                <LogOut size={12} /> <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-slate-200 pl-2 md:pl-3 ml-1 shrink-0">
              <Link
                to="/login"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-650 hover:text-slate-850 hover:bg-slate-50 transition-all duration-150 whitespace-nowrap"
              >
                <LogIn size={12} /> Login
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 border border-primary-200/60 transition-all duration-150 whitespace-nowrap"
              >
                <UserPlus size={12} /> Register
              </Link>
            </div>
          )}
        </nav>

      </div>
      {/* Mobile-Only Subheader for Admins */}
      {isAuthenticated && isAdmin && (
        <div className="lg:hidden border-t border-slate-200/60 bg-white/50 py-1.5 px-4 flex justify-center gap-4 text-[10px] font-bold uppercase tracking-wider text-primary-600">
          <Link to="/admin/dashboard" className="whitespace-nowrap">Stats</Link>
          <Link to="/admin/products" className="whitespace-nowrap">Products</Link>
          <Link to="/admin/categories" className="whitespace-nowrap">Categories</Link>
          <Link to="/admin/orders" className="whitespace-nowrap">Orders</Link>
        </div>
      )}
    </header>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-[#FAFAFA] text-slate-600">
          
          <Header />

          {/* Main Content Area */}
          <main className="flex-grow py-8 max-w-6xl mx-auto px-4 w-full flex justify-center">
            <ErrorBoundary>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/tracking" element={<Tracking />} />

                {/* Protected Customer Routes */}
                <Route
                  path="/customer/dashboard"
                  element={
                    <ProtectedRoute>
                      <div className="text-center p-8 bg-white border border-slate-200 rounded-2xl shadow-card max-w-sm mx-auto">
                        <h2 className="text-xl font-bold text-green-600 mb-2">Customer Space Active</h2>
                        <p className="text-sm text-slate-500">Authenticated customer session successfully protected.</p>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout/payment/:orderId"
                  element={
                    <ProtectedRoute>
                      <PaymentCheckout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <OrderDetail />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin/products"
                  element={
                    <AdminRoute>
                      <AdminProducts />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <AdminRoute>
                      <AdminCategories />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <AdminRoute>
                      <AdminOrders />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />

                {/* Catch-all 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200/80 py-8 bg-white mt-auto">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <div>
                © {new Date().getFullYear()} MerchFlow E-commerce. Built with the MERN Stack.
              </div>
              <div className="flex gap-6">
                <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
                <span className="text-slate-400 font-semibold select-none">MERN assessment build</span>
              </div>
            </div>
          </footer>

        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

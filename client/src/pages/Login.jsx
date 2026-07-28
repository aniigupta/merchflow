import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Shield } from 'lucide-react';

const Login = () => {
  const { login, user, loading, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState(null);

  // If already authenticated, redirect away
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error on type
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please provide a valid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      console.error('Login submit error:', err);
      setServerError(err.message || 'Incorrect email credentials or password.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 relative overflow-hidden shadow-md text-left">
        
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

        <div className="text-center mb-8 space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Welcome Back</h1>
          <p className="text-xs text-slate-450">Sign in to manage your custom merchandise dashboard</p>
        </div>

        {/* Global Error Banner */}
        {(serverError || authError) && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-650">
            {serverError || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Mail size={16} />
              </span>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`form-input w-full pl-10 border-slate-200 bg-white ${formErrors.email ? 'border-red-500 focus:ring-red-500/30' : ''}`}
                disabled={loading}
              />
            </div>
            {formErrors.email && (
              <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.email}</p>
            )}
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <a href="#" className="text-xs font-semibold text-primary-600 hover:text-primary-750 transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={`form-input w-full pl-10 pr-10 border-slate-200 bg-white ${formErrors.password ? 'border-red-500 focus:ring-red-500/30' : ''}`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {formErrors.password && (
              <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-1.5 group mt-6 shadow-md hover:shadow-lg transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Authenticating...
              </>
            ) : (
              <>
                Sign In <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 border-t border-slate-100 pt-6">
          New to MerchFlow?{' '}
          <Link to="/register" className="font-bold text-primary-600 hover:text-primary-750 transition-colors">
            Create an Account
          </Link>
        </div>

        {/* Demo Credentials Info Box */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Shield size={13} className="text-primary-500" /> Demo Credentials:
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-mono">
            <div>
              <span className="block font-bold text-slate-700">Admin Account</span>
              <span>admin@merchflow.com</span>
              <span className="block mt-0.5">Pass: AdminPassword123!</span>
            </div>
            <div>
              <span className="block font-bold text-slate-700">Customer Account</span>
              <span>customer@merchflow.com</span>
              <span className="block mt-0.5">Pass: CustomerPassword123!</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;

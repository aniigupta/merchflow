import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register, user, loading, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    }

    if (!formData.email) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please provide a valid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;

    try {
      await register(formData.name, formData.email, formData.password);
    } catch (err) {
      console.error('Registration submit error:', err);
      setServerError(err.message || 'Registration failed. The email address might already be in use.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 relative overflow-hidden shadow-md text-left">
        
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

        <div className="text-center mb-8 space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Create Account</h1>
          <p className="text-xs text-slate-455">Join MerchFlow to start customizing your merchandise</p>
        </div>

        {/* Global Error Banner */}
        {(serverError || authError) && (
          <div className="mb-6 p-4 rounded-xl bg-red-55 border border-red-200 text-sm text-red-650">
            {serverError || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <User size={16} />
              </span>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className={`form-input w-full pl-10 border-slate-200 bg-white ${formErrors.name ? 'border-red-500 focus:ring-red-500/30' : ''}`}
                disabled={loading}
              />
            </div>
            {formErrors.name && (
              <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.name}</p>
            )}
          </div>

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
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="At least 8 characters"
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

          {/* Confirm Password input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input w-full pl-10 pr-10 border-slate-200 bg-white ${formErrors.confirmPassword ? 'border-red-500 focus:ring-red-500/30' : ''}`}
                disabled={loading}
              />
            </div>
            {formErrors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.confirmPassword}</p>
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
                <Loader2 className="animate-spin" size={16} /> Creating account...
              </>
            ) : (
              <>
                Register Account <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 border-t border-slate-100 pt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-600 hover:text-primary-750 transition-colors">
            Sign In Instead
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;

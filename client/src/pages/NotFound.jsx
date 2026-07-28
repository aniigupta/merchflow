import React from 'react';
import { Link } from 'react-router-dom';
import { Shirt, HelpCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
      
      <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center shadow-lg animate-bounce">
        <HelpCircle className="text-white" size={32} />
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-white font-mono">404</h1>
        <h2 className="text-xl font-bold text-gradient">Page Not Found</h2>
        <p className="text-sm text-gray-400 max-w-xs mx-auto">
          The custom merchandise coordinate or workspace link you followed does not exist.
        </p>
      </div>

      <div className="pt-4">
        <Link
          to="/products"
          className="btn-primary py-2.5 px-6 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
      </div>

    </div>
  );
};

export default NotFound;

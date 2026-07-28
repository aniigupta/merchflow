import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <AlertOctagon size={28} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-red-400">Application Error</h2>
            <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
              Something went wrong while rendering this segment. You can try refreshing the page or clearing cache.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={13} /> Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

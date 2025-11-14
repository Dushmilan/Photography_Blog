import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFF5E1]">
          <div className="text-center p-8 max-w-md">
            <div className="text-5xl mb-4 text-[#FF6F61]">⚠️</div>
            <h2 className="text-2xl font-light text-[#001F3F] mb-2">Something went wrong</h2>
            <p className="text-[#001F3F]/80 mb-6">An unexpected error occurred. Our team has been notified.</p>
            <button
              className="bg-[#FF6F61] hover:bg-[#e56259] text-white px-6 py-3 rounded-full font-medium transition-colors"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
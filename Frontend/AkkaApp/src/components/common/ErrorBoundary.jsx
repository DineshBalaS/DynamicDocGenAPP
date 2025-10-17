import React from 'react';

// This is a standard, reusable Error Boundary component.
// It's a class component because functional components cannot yet be error boundaries.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex h-screen items-center justify-center bg-red-50 text-red-800">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Something went wrong.</h1>
            <p className="mt-2">There was an error loading this part of the application.</p>
            <pre className="mt-4 p-4 bg-red-100 rounded-md text-left text-sm overflow-auto">
              {this.state.error && this.state.error.toString()}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;

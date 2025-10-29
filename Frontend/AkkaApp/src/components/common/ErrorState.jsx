// src/components/common/ErrorState.jsx

import React from 'react';

function ErrorState({ message, onRetry }) {
  return (
    <div className="text-center mt-16 p-8 bg-red-50 rounded-lg border border-red-200">
      <h2 className="text-2xl font-semibold text-red-800">Something went wrong.</h2>
      <p className="mt-2 text-red-600">{message || 'We couldn’t load your templates. Please try again.'}</p>
      <div className="mt-6">
        <button
          onClick={onRetry}
          className="bg-red-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export default ErrorState;
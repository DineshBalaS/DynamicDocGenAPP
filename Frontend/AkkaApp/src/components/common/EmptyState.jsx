// src/components/common/EmptyState.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const PlusIcon = () => ( /* Using the same icon from your original DashboardPage */
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

function EmptyState() {
  return (
    <div className="text-center mt-16">
      <h2 className="text-2xl font-semibold text-gray-800">You don't have any templates yet.</h2>
      <p className="mt-2 text-gray-500">Upload your first PowerPoint template to get started.</p>
      <div className="mt-6">
        <Link
          to="/upload"
          className="inline-flex items-center space-x-2 bg-teal-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-teal-600 transition-all duration-300 transform hover:scale-105"
        >
          <PlusIcon />
          <span>Upload Template</span>
        </Link>
      </div>
    </div>
  );
}

export default EmptyState;
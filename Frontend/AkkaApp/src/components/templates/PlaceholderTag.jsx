// src/components/templates/PlaceholderTag.jsx

import React from 'react';

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

function PlaceholderTag({ name, onRemove }) {
  return (
    <span className="inline-flex items-center gap-x-2 rounded-md bg-teal-100 px-3 py-1.5 text-sm font-medium text-teal-700">
      {name}
      <button 
        type="button" 
        onClick={onRemove} 
        className="group relative -mr-1 h-5 w-5 rounded-sm hover:bg-teal-500/20"
      >
        <XIcon />
      </button>
    </span>
  );
}

export default PlaceholderTag;
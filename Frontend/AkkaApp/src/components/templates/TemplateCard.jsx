// src/components/templates/TemplateCard.jsx

import React from 'react';

// A placeholder icon component for actions like delete, edit, etc.
const MoreVerticalIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);


function TemplateCard({ template }) {
  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Placeholder for template thumbnail */}
      <div className="h-36 bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-sm">Template Preview</span>
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 truncate">{template.name}</h3>
        <p className="text-sm text-gray-500">{template.description}</p>
      </div>

      {/* Hover Actions Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button className="bg-teal-500 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-600 transition-colors">
          Use Template
        </button>
      </div>
      
      {/* More Options Button */}
      <button className="absolute top-2 right-2 p-1.5 rounded-full bg-gray-100 bg-opacity-50 text-gray-600 hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-all">
        <MoreVerticalIcon />
      </button>
    </div>
  );
}

export default TemplateCard;
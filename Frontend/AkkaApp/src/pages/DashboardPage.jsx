// src/pages/DashboardPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import TemplateCard from '../components/templates/TemplateCard';

// Hardcoded data for building the static UI. This will be replaced by API data later.
const mockTemplates = [
  { id: 1, name: 'Monthly Business Review', description: 'Used for QBRs' },
  { id: 2, name: 'Client Proposal V2', description: 'Standard client pitch' },
  { id: 3, name: 'Project Kickoff Deck', description: 'Onboarding new projects' },
  { id: 4, name: 'Internal Status Update', description: 'Weekly team sync' },
];

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);


function DashboardPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Your Templates</h1>
        <Link
          to="/upload"
          className="flex items-center space-x-2 bg-teal-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-teal-600 transition-all duration-300 transform hover:scale-105"
        >
          <PlusIcon />
          <span>Upload New Template</span>
        </Link>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mockTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;
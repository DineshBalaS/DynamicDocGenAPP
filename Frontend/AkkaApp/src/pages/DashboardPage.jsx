// src/pages/DashboardPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getTemplates } from '../api/templateService';
import TemplateCard from '../components/templates/TemplateCard';
import Spinner from '../components/ui/spinner';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

function DashboardPage() {
  const [templates, setTemplates] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'

  const fetchTemplates = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await getTemplates();
      setTemplates(data);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return <Spinner />;
      
      case 'error':
        return <ErrorState onRetry={fetchTemplates} />;

      case 'success':
        if (templates.length === 0) {
          return <EmptyState />;
        }
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Your Templates</h1>
        {/* Only show the upload button if not in the empty state */}
        {status === 'success' && templates.length > 0 && (
           <Link
            to="/upload"
            className="flex items-center space-x-2 bg-teal-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-teal-600 transition-all duration-300 transform hover:scale-105"
          >
            <PlusIcon />
            <span>Upload New Template</span>
          </Link>
        )}
      </div>

      {/* Main Content Area */}
      <div>{renderContent()}</div>
    </div>
  );
}

export default DashboardPage;
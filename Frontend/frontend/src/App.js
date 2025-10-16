// frontend/src/App.js (Updated)
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import the actual page components
import DashboardPage from './pages/DashboardPage';
import UploadWorkflowPage from './pages/UploadWorkflowPage';
import DataEntryFormPage from './pages/DataEntryFormPage';

function App() {
  return (
    <div>
      <main>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadWorkflowPage />} />
          <Route path="/generate/:templateId" element={<DataEntryFormPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
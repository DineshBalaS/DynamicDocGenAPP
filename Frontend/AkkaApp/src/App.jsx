// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import UploadWorkflowPage from './pages/UploadWorkflowPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes that use the MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadWorkflowPage />} />
        </Route>

        {/* Route for 404 page (doesn't use the layout) */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
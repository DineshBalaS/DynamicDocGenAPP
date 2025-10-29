import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import the new ErrorBoundary using the correct path
import ErrorBoundary from "./components/common/ErrorBoundary";

// Import your existing components using their original, correct paths
import MainLayout from "./components/layout/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import UploadWorkflowPage from "./pages/UploadWorkflowPage";
import NotFoundPage from "./pages/NotFoundPage";
import DataEntryPage from "./pages/DataEntryPage";
import ReviewPage from "./pages/ReviewPage";
import TrashPage from "./pages/TrashPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Wrap the entire MainLayout Route in the ErrorBoundary.
          If MainLayout or any of its children (Header, DashboardPage, UploadWorkflowPage)
          crashes during render, the ErrorBoundary will catch it and display a helpful message
          instead of a blank white screen.
        */}
        <Route
          path="/"
          element={
            <ErrorBoundary>
              <MainLayout />
            </ErrorBoundary>
          }
        >
          {/* These child routes render inside MainLayout's <Outlet /> */}
          <Route index element={<DashboardPage />} />
          <Route path="upload" element={<UploadWorkflowPage />} />
          <Route path="generate/:templateId" element={<DataEntryPage />} />
          <Route path="review" element={<ReviewPage />} />

          {/*route for the Trash page */}
          <Route path="trash" element={<div>Trash Page Content</div>} />
        </Route>

        {/* Route for 404 page (doesn't use the layout) */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;

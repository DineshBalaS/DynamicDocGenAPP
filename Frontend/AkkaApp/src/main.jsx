import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

// Import all your components and pages
import MainLayout from "./components/layout/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import UploadWorkflowPage from "./pages/UploadWorkflowPage";
import NotFoundPage from "./pages/NotFoundPage";
import ErrorBoundary from "./components/common/ErrorBoundary";
import DataEntryPage from "./pages/DataEntryPage";
import ReviewPage from "./pages/ReviewPage";
import TrashPage from "./pages/TrashPage";
import DownloadPage from "./pages/DownloadPage";

// This is the new, modern way to define your application's routes.
const router = createBrowserRouter([
  {
    // The MainLayout acts as the parent for all nested routes.
    // We attach the ErrorBoundary here to catch any errors within the layout or its children.
    element: <MainLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "/",
        element: <DashboardPage />,
      },
      {
        path: "/upload",
        element: <UploadWorkflowPage />,
      },
      {
        path: "/generate/:templateId",
        element: <DataEntryPage />,
      },
      {
        path: "/review/:templateId",
        element: <ReviewPage />,
      },
      {
        path: "/trash",
        element: <TrashPage />,
      },
    ],
  },
  {
    path: "/downloading",
    element: <DownloadPage />,
  },
  {
    // The 404 page is a separate route outside of the main layout.
    path: "*",
    element: <NotFoundPage />,
  },
]);

const root = createRoot(document.getElementById("root"));

root.render(
  <StrictMode>
    {/* RouterProvider replaces your old App component here */}
    <RouterProvider router={router} />
  </StrictMode>
);

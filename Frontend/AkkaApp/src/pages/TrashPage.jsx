// src/pages/TrashPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { getTrashedTemplates, restoreTemplate } from "../api/templateService";
import TemplateCard from "../components/templates/TemplateCard";
import Spinner from "../components/ui/spinner";
import ErrorState from "../components/common/ErrorState";
import Toast from "../components/ui/Toast";

// Simple component for the empty trash message
const EmptyTrashState = () => (
  <div className="text-center py-16">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto text-gray-400 mb-4"
    >
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
    <h3 className="text-xl font-semibold text-gray-700 mb-2">Trash is Empty</h3>
    <p className="text-gray-500">Deleted templates will appear here.</p>
  </div>
);

function TrashPage() {
  const [trashedTemplates, setTrashedTemplates] = useState([]);
  const [status, setStatus] = useState("loading"); // 'loading', 'success', 'error'
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success"); // 'success' or 'error'

  // Fetch trashed templates function
  const fetchTrashedTemplates = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await getTrashedTemplates();
      setTrashedTemplates(data);
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchTrashedTemplates();
  }, [fetchTrashedTemplates]);

  // Handle restoring a template
  const handleRestore = async (template) => {
    if (!template) return;

    try {
      await restoreTemplate(template.id);
      // Optimistically remove from local state for instant UI update
      setTrashedTemplates((currentTemplates) =>
        currentTemplates.filter((t) => t.id !== template.id)
      );
      setToastMessage(`Template "${template.name}" restored successfully!`);
      setToastType("success");
    } catch (error) {
      console.error("Restore failed:", error.response || error);
      // Check if this is the '410 Gone' error from the backend
      if (error.response && error.response.status === 410) {
        // The file was permanently deleted.
        setToastMessage(
          error.response.data?.error ||
            "Template permanently deleted and removed from trash."
        );
        setToastType("error");
        // Also remove it from the UI, as it's now gone from the DB
        setTrashedTemplates((currentTemplates) =>
          currentTemplates.filter((t) => t.id !== template.id)
        );
      } else {
        // Handle other errors (e.g., 500, network error)
        setToastMessage(
          error.response?.data?.error ||
            `Failed to restore template "${template.name}". Please try again.`
        );
        setToastType("error");
      }
    }
  };

  // Render content based on status
  const renderContent = () => {
    switch (status) {
      case "loading":
        return <Spinner />;
      case "error":
        return (
          <ErrorState
            onRetry={fetchTrashedTemplates}
            message="Could not load trashed items."
          />
        );
      case "success":
        if (trashedTemplates.length === 0) {
          return <EmptyTrashState />;
        }
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trashedTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isTrashContext={true} // Pass the context prop
                onRestore={handleRestore} // Pass the restore handler
                // No onDelete prop needed here
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onDismiss={() => setToastMessage(null)}
        />
      )}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Trash</h1>
        <p className="text-gray-500 mt-1">
          Items in trash are automatically deleted after 30 days.
        </p>
      </div>

      <div>{renderContent()}</div>
    </div>
  );
}

export default TrashPage;

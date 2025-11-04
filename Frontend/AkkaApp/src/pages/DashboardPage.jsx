// src/pages/DashboardPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getTemplates, deleteTemplate } from "../api/templateService";
import TemplateCard from "../components/templates/TemplateCard";
import Spinner from "../components/ui/spinner";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Modal from "../components/ui/Modal";
import Toast from "../components/ui/Toast";

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

function DashboardPage() {
  const [templates, setTemplates] = useState([]);
  const [status, setStatus] = useState("loading");
  const [toastMessage, setToastMessage] = useState(null); // 'loading', 'success', 'error'
  const [toastType, setToastType] = useState("success"); // Added state for toast type

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState([]);

  const fetchTemplates = useCallback(async () => {
    setStatus("loading");
    try {
      const data = await getTemplates();
      setTemplates(data);
      setFilteredTemplates(data);
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    // If there's no search query, show all templates
    if (!searchQuery) {
      setFilteredTemplates(templates);
    } else {
      // Filter the templates based on the search query (case-insensitive)
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = templates.filter((template) =>
        template.name.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredTemplates(filtered);
    }
    // Re-run this effect whenever the search query or the original templates list changes
  }, [searchQuery, templates]);

  const openDeleteModal = (template) => {
    setTemplateToDelete(template);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setTemplateToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;

    try {
      await deleteTemplate(templateToDelete.id);
      // On success, remove the template from the local state for an instant UI update
      setTemplates((currentTemplates) =>
        currentTemplates.filter((t) => t.id !== templateToDelete.id)
      );
      // Update success message and ensure type is success
      setToastMessage(`Template "${templateToDelete.name}" moved to trash.`);
      setToastType("success");
    } catch (error) {
      // Set error message and type
      setToastMessage(
        `Failed to move template "${templateToDelete.name}" to trash.`
      );
      setToastType("error");
      console.error(error);
    } finally {
      closeDeleteModal(); // Close the modal in either case
    }
  };

  const renderContent = () => {
    switch (status) {
      case "loading":
        return <Spinner />;

      case "error":
        return <ErrorState onRetry={fetchTemplates} />;

      case "success":
        if (templates.length === 0) {
          // Still show EmptyState if the user has no templates *at all*.
          return <EmptyState />;
        } else if (filteredTemplates.length === 0 && searchQuery) {
          // Show "No results" message only if a search was performed and yielded nothing.
          return (
            <div className="text-center text-gray-500 mt-8">
              No templates found matching "{searchQuery}".
            </div>
          );
        } else {
          // Otherwise, render the grid of filtered templates.
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onDelete={openDeleteModal}
                />
              ))}
            </div>
          );
        }
      // return (
      //   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      //     {filteredTemplates.map((template) => (
      //       <TemplateCard key={template.id} template={template} onDelete={openDeleteModal} />
      //     ))}
      //   </div>
      // );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Pass toastType to the Toast component */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onDismiss={() => setToastMessage(null)}
        />
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Template?"
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonVariant="danger"
      >
        Are you sure you want to move the template "{templateToDelete?.name}" to
        the trash? It will be permanently deleted after 30 days.
      </Modal>
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex-shrink-0">
          Your Templates
        </h1>
        {/* Search Input (visible on medium screens and up, grows but has max width) */}
        {/* Conditionally render the search bar only if templates exist */}
        {status === "success" && templates.length > 0 && (
          <div className="hidden md:flex flex-grow justify-center max-w-lg relative group">
            {" "}
            {/* Added 'group' */}
            {/* Search Icon (Added transition and group-hover effect) */}
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-teal-500 transition-colors duration-300 ease-in-out">
              {" "}
              {/* Added group-hover:text-teal-500 and transition classes */}
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              // Added hover effects (border, shadow) and transition classes
              className="p-2 pl-10 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent hover:border-teal-500 hover:shadow-md transition-all duration-300 ease-in-out" // Added hover:border-teal-500, hover:shadow-md, transition-all, duration-300, ease-in-out
            />
          </div>
        )}
        {/* Action Buttons Container (groups search icon and upload button) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {" "}
          {/* Use gap for spacing */}
          {/* Search Icon Button (visible only on small screens) */}
          {status === "success" && templates.length > 0 && (
            <button
              // Show only on small screens (hidden on md and up)
              className="md:hidden p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              onClick={() => {
                /* Add logic later if needed, e.g., open search modal/expand input */
              }}
              aria-label="Search"
            >
              <SearchIcon />
            </button>
          )}
          {/* Upload New Template Button (always visible if conditions met) */}
          {status === "success" && templates.length > 0 && (
            <Link
              to="/upload"
              className="flex items-center space-x-2 bg-teal-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-teal-600 transition-all duration-300 transform hover:scale-105"
            >
              <PlusIcon />
              {/* Hide text on very small screens if needed, e.g., add sm:inline */}
              <span>Upload New Template</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div>{renderContent()}</div>
    </div>
  );
}

export default DashboardPage;

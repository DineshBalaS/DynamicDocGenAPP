// src/pages/ReviewPage.jsx

import React, { useState, useEffect } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/ui/spinner";
import { useNavigationBlocker } from "../hooks/useNavigationBlocker";
import Modal from "../components/ui/Modal";

import { useReviewPageEditor } from "../hooks/useReviewPageEditor";
import EditableReviewRow from "../components/common/EditableReviewRow";

import S3Image from "../components/common/S3Image";

const DATA_ENTRY_SESSION_KEY = "dataEntrySession";

function ReviewPage() {
  const { templateId } = useParams();
  const navigate = useNavigate();

  // State is passed from DataEntryPage via the navigate function
  const [template, setTemplate] = useState(null);
  const [formData, setFormData] = useState(null);
  // const [imagePreviews, setImagePreviews] = useState(null); // REMOVED
  const [isLoading, setIsLoading] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isNavigatingSafely, setIsNavigatingSafely] = useState(false);
  const [safeNavigationPath, setSafeNavigationPath] = useState(null);

  const { isEditing, editingKey, startEditing, endEditing } =
    useReviewPageEditor();
  

  const { showModal, handleConfirmNavigation, handleCancelNavigation } =
    useNavigationBlocker(!isNavigatingSafely);

  // This hook listens for a "safe navigation" flag to be set
  // by either handleGenerate or handleBackToForm.
  useEffect(() => {
    if (isNavigatingSafely && safeNavigationPath) {
      // Once the flag is set (disarming the blocker), perform the navigation.
      navigate(safeNavigationPath);
    }
  }, [isNavigatingSafely, safeNavigationPath, navigate]);

  const handleUpdateItem = (key, newValue) => {
    try {
      // 1. Update component state
      const newFormData = { ...formData, [key]: newValue };
      setFormData(newFormData);

      // 2. Update sessionStorage
      const storedData = sessionStorage.getItem(DATA_ENTRY_SESSION_KEY);
      if (storedData) {
        // We parse, update, and stringify again
        const sessionData = JSON.parse(storedData);
        sessionData.formData = newFormData;
        sessionStorage.setItem(
          DATA_ENTRY_SESSION_KEY,
          JSON.stringify(sessionData)
        );
      }

      // 3. Close the editor
      endEditing();
    } catch (err) {
      console.error("Failed to update item or session storage:", err);
      // You could show an error toast here
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true); // Disable button immediately

    try {
      // 1. Prepare data
      const dataToPass = {
        templateId: template.id,
        formData: formData,
      };

      // 2. Save data to session storage
      sessionStorage.setItem("pptxDownloadData", JSON.stringify(dataToPass));

      // 3. Open the new download tab
      window.open("/downloading", "_blank");

      // 4. Set state to trigger safe navigation
      setSafeNavigationPath("/");
      setIsNavigatingSafely(true);
    } catch (err) {
      // Handle potential errors (e.g., sessionStorage is full)
      console.error("Failed to start generation process:", err);
      // Re-enable button if something went wrong before redirect
      setIsGenerating(false);
      // Here you could show a local error toast
    }
  };

  useEffect(() => {
    try {
      const storedData = sessionStorage.getItem(DATA_ENTRY_SESSION_KEY);
      if (!storedData) {
        throw new Error("No session data found.");
      }

      const { template: storedTemplate, formData: storedFormData } =
        JSON.parse(storedData);

      // Validate that the stored data is for the template we're trying to review
      if (!storedTemplate || storedTemplate.id.toString() !== templateId) {
        console.error("Session data mismatch. Navigating home."); // DEBUG LOG
        throw new Error("Session data mismatch. Please start over.");
      }

      setTemplate(storedTemplate);
      setFormData(storedFormData);
    } catch (err) {
      console.error("Failed to load review data:", err); // DEBUG LOG
      // If data is missing or invalid, go to dashboard
      navigate("/", { replace: true });
    } finally {
      setIsLoading(false); // Stop loading
    }
  }, [templateId, navigate]);

  const handleBackToForm = () => {
    // 1. This is also a safe exit. Disable the blocker.
    setIsNavigatingSafely(true);
    setSafeNavigationPath(`/generate/${template.id}`);
  };

  // Add loading and data checks
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner />
      </div>
    );
  }

  // Add a safeguard check for after loading
  if (!template || !formData) {
    return null; // Return null to prevent crash
  }

  const placeholders = template.placeholders || [];

  return (
    <div className="max-w-7xl mx-auto">
      {/* --- Navigation Blocker Modal --- */}
      <Modal
        isOpen={showModal}
        onClose={handleCancelNavigation}
        onConfirm={handleConfirmNavigation}
        title="Not Generated Yet?"
        confirmText="Leave"
        cancelText="Stay"
        confirmButtonVariant="danger"
      >
        You haven't generated your presentation. Are you sure you want to leave
        this page?
      </Modal>
      <nav className="text-sm mb-4" aria-label="Breadcrumb">
        <ol className="list-none p-0 inline-flex">
          <li className="flex items-center">
            <Link to="/" className="text-teal-600 hover:underline">
              Dashboard
            </Link>
            <svg
              className="fill-current w-3 h-3 mx-3"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 320 512"
            >
              <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
            </svg>
          </li>
          <li className="flex items-center">
            <span className="text-gray-500">{template.name}</span>
            <svg
              className="fill-current w-3 h-3 mx-3"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 320 512"
            >
              <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
            </svg>
          </li>
          <li>
            <span className="text-gray-500 font-semibold">Review Entries</span>
          </li>
        </ol>
      </nav>

      <h1 className="text-3xl font-bold text-gray-800">Review Your Entries</h1>
      <p className="text-gray-500 mt-1">
        Confirm the details below before generating the final presentation.
      </p>

      <div className="mt-8 bg-white p-8 rounded-lg shadow-md border border-gray-200 divide-y divide-gray-200">
        
        {placeholders.map((placeholder) => {
          return (
            <EditableReviewRow
              key={placeholder.name}
              placeholderKey={placeholder.name} // Pass the key
              label={placeholder.name.replace(/_/g, " ")}
              type={placeholder.type}
              value={formData[placeholder.name]}
              // imagePreviewUrl={...} // This prop is removed
              onUpdate={handleUpdateItem}
              onEditStart={() => startEditing(placeholder.name)}
              onEditEnd={endEditing}
              isDisabled={isEditing && editingKey !== placeholder.name}
            />
          );
        })}
      </div>

      <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 space-y-4 space-y-reverse sm:space-y-0">
        <button
          type="button"
          onClick={handleBackToForm}
          className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 text-center"
        >
          Edit All
        </button>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || isEditing}
          className="w-full sm:w-auto bg-teal-600 text-white font-bold py-3 px-6 rounded-md hover:bg-teal-700 disabled:bg-gray-400 transition-colors flex justify-center items-center"
        >
          {isGenerating ? <Spinner /> : "Generate Presentation"}
        </button>
      </div>
    </div>
  );
}

export default ReviewPage;

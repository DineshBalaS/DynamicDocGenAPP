// src/pages/DataEntryPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getTemplateDetails } from "../api/templateService";

// Reusable Components
import Spinner from "../components/ui/spinner";
import ErrorState from "../components/common/ErrorState";
import ImageUploader from "../components/common/ImageUploader";
import NoPlaceholdersFound from "../components/common/NoPlaceholdersFound";
import {
  PREDEFINED_LIST_CHOICES,
  PREDEFINED_CHOICE_OPTIONS,
} from "../constants/listChoices";
import RadioButtonGroupWithOther from "../components/common/RadioButtonGroupWithOther";
import CheckboxGroupWithOther from "../components/common/CheckboxGroupWithOther";
import MultiTextInput from "../components/common/MultiTextInput";
import { useNavigationBlocker } from "../hooks/useNavigationBlocker";
import Modal from "../components/ui/Modal";

const DATA_ENTRY_SESSION_KEY = "dataEntrySession";

function DataEntryPage() {
  const { templateId } = useParams();

  const navigate = useNavigate();

  // State for fetching template details
  const [template, setTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for form data and generation process
  const [formData, setFormData] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // State for navigation blocker
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch template details on component mount
  const fetchDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Always fetch the canonical template structure
      const data = await getTemplateDetails(templateId);
      setTemplate(data);

      console.log(
        `[DataEntryPage] Fetched template details for ID: ${templateId}`
      ); // DEBUG LOG

      // 2. Try to get restored data
      const storedSession = sessionStorage.getItem(DATA_ENTRY_SESSION_KEY);
      let restoredData = null;

      if (storedSession) {
        try {
          restoredData = JSON.parse(storedSession);
        } catch (e) {
          console.error("[DataEntryPage] Failed to parse session data", e); // DEBUG LOG
          sessionStorage.removeItem(DATA_ENTRY_SESSION_KEY); // Clear corrupt data
        }
      }

      // 3. Check if we have valid, matching restored data
      if (restoredData && restoredData.templateId === templateId) {
        // We have matching data, so restore it
        console.log(
          `[DataEntryPage] Restoring form data from session for template ID: ${templateId}`
        ); // DEBUG LOG
        setFormData(restoredData.formData);
        // We no longer set imagePreviews state
        setIsDirty(true); // Data is loaded, so it's "dirty"
      } else {
        // No matching data, so initialize a fresh form
        console.log(
          `[DataEntryPage] Initializing fresh form for template ID: ${templateId}`
        ); // DEBUG LOG
        const initialData = data.placeholders.reduce((acc, ph) => {
          if (ph.type === "list") {
            acc[ph.name] = [];
          } else {
            // This now correctly initializes "text", "image", and "choice" to ""
            acc[ph.name] = "";
          }

          return acc;
        }, {});
        setFormData(initialData);
        setIsDirty(false); // It's a fresh form

        // If there was mismatched data, clear it
        if (restoredData) {
          console.log(
            `[DataEntryPage] Clearing mismatched session data for template ID: ${restoredData.templateId}`
          ); // DEBUG LOG
          sessionStorage.removeItem(DATA_ENTRY_SESSION_KEY);
        }
      }
    } catch (err) {
      console.error(`[DataEntryPage] Error in fetchDetails:`, err); // DEBUG LOG
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    if (!template || !template.placeholders) return;

    // Check if every placeholder in the form has a valid value
    const allFieldsFilled = template.placeholders.every((ph) => {
      const value = formData[ph.name];
      if (ph.type === "list") {
        // For lists, check if the array is not empty AND
        // if it contains at least one non-empty string after trimming.
        // Handles case like [''] from MultiTextInput initial state.
        return (
          Array.isArray(value) &&
          value.length > 0 &&
          value.some((item) => typeof item === "string" && item.trim() !== "")
        );
      } else {
        // For text/image, check if it's a non-empty string after trimming.
        return typeof value === "string" && value.trim() !== "";
      }
    });
    setIsFormValid(allFieldsFilled);
  }, [formData, template]);

  useEffect(() => {
    // Only save if the form is dirty and not loading
    if (isDirty && !isLoading && template) {
      console.log(
        `[DataEntryPage] Saving state to session storage for template ID: ${template.id}`
      ); // DEBUG LOG
      const sessionData = {
        templateId: template.id,
        formData,
        template, // Save the template object itself for the review page
      };
      sessionStorage.setItem(
        DATA_ENTRY_SESSION_KEY,
        JSON.stringify(sessionData)
      );
    }
  }, [formData, isDirty, isLoading, template]);

  // Setup the navigation blocker
  // It's active only if the form is dirty AND we aren't submitting.
  const { showModal, handleConfirmNavigation, handleCancelNavigation } =
    useNavigationBlocker(isDirty && !isSubmitting);

  // Handler for text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true); // Mark form as dirty
  };

  // This handler works for our new RadioButtonGroupWithOther component
  const handleSimpleChange = (placeholderName, newValue) => {
    console.log(
      `[DataEntryPage] handleSimpleChange: key=${placeholderName}, value=${newValue}`
    ); // DEBUG LOG
    setFormData((prev) => ({ ...prev, [placeholderName]: newValue }));
    setIsDirty(true);
  };

  // This single handler works for both CheckboxGroupWithOther and MultiTextInput
  const handleListChange = (placeholderName, newValueArray) => {
    setFormData((prev) => ({ ...prev, [placeholderName]: newValueArray }));
    setIsDirty(true);
  };

  // handler to accept and store the local preview URL from ImageUploader
  const handleImageUploadSuccess = (placeholderName, s3_key) => {
    console.log(
      `[DataEntryPage] handleImageUploadSuccess: key=${placeholderName}, s3_key=${s3_key}`
    ); // DEBUG LOG
    setFormData((prev) => ({ ...prev, [placeholderName]: s3_key }));
    setIsDirty(true);
  };

  // Handler for the "Generate Presentation" button click
  const handleReview = () => {
    // Set submitting to true, which disables the blocker
    setIsSubmitting(true);
  };

  // This effect runs when 'isSubmitting' becomes true
  useEffect(() => {
    if (isSubmitting) {
      console.log(
        `[DataEntryPage] Navigating to review page for template ID: ${templateId}`
      ); // DEBUG LOG
      navigate(`/review/${templateId}`);
    }
  }, [isSubmitting, navigate, templateId]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner />
      </div>
    );
  }

  // Render error state
  if (error) {
    return <ErrorState message={error} onRetry={fetchDetails} />;
  }

  // Render no placeholders found state
  if (
    !template ||
    !template.placeholders ||
    template.placeholders.length === 0
  ) {
    return <NoPlaceholdersFound />;
  }

  // Render the main form
  return (
    <div className="max-w-7xl mx-auto">
      {/* --- Navigation Blocker Modal --- */}
      <Modal
        isOpen={showModal}
        onClose={handleCancelNavigation}
        onConfirm={handleConfirmNavigation}
        title="Unsaved Changes"
        confirmText="Leave Page"
        cancelText="Stay"
        confirmButtonVariant="danger"
      >
        You have unsaved changes. If you leave now, all your data will be lost.
      </Modal>
      {/* ... (existing Back link, h1, p) ... */}
      <Link
        to="/"
        className="text-sm text-teal-600 hover:text-teal-800 font-medium inline-block mb-4"
      >
        &larr; Back to Dashboard
      </Link>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-teal-700 leading-tight">
        {template.name}
      </h1>
      <p className="mt-2 text-lg text-gray-600 mb-6">
        {" "}
        {/* Increased top margin and added bottom margin */}
        Fill in the data below to generate your presentation.
      </p>

      <div className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md border border-gray-200">
        {template.placeholders.map((ph) => (
          <div key={ph.name}>
            <label className="block text-sm font-medium text-gray-700 capitalize mb-2">
              {ph.name.replace(/_/g, " ")}
              <span className="text-red-500 ml-1">*</span>{" "}
              {/* Assuming all are required */}
            </label>

            {/* --- Conditional Rendering Logic --- */}
            {
              ph.type === "text" ? (
                <input
                  type="text"
                  name={ph.name}
                  value={formData[ph.name] || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                  placeholder={`Enter value for ${ph.name}...`}
                />
              ) : (ph.type === "image" || ph.type === "scrape") ? (
                <ImageUploader
                  placeholderName={ph.name}
                  onUploadSuccess={handleImageUploadSuccess}
                  initialS3Key={formData[ph.name]}
                />
              ) : ph.type === "list" ? (
                // Check if we have predefined choices for this list placeholder
                PREDEFINED_LIST_CHOICES[ph.name] ? (
                  <CheckboxGroupWithOther
                    placeholderName={ph.name}
                    choices={PREDEFINED_LIST_CHOICES[ph.name]}
                    value={formData[ph.name]} // Pass the array state
                    onChange={handleListChange} // Use the new handler
                  />
                ) : (
                  // Render MultiTextInput if no predefined choices found
                  <MultiTextInput
                    placeholderName={ph.name}
                    value={formData[ph.name]} // Pass the array state
                    onChange={handleListChange} // Use the same new handler
                  />
                )
              ) : ph.type === "choice" ? (
                // Check if we have predefined choices for this radio placeholder
                PREDEFINED_CHOICE_OPTIONS[ph.name] ? (
                  <RadioButtonGroupWithOther
                    placeholderName={ph.name}
                    choices={PREDEFINED_CHOICE_OPTIONS[ph.name]}
                    value={formData[ph.name]} // Pass the string state
                    onChange={handleSimpleChange} // Use the new simple handler
                  />
                ) : (
                  // FALLBACK: Render a simple text input if no choices are defined
                  <input
                    type="text"
                    name={ph.name}
                    value={formData[ph.name] || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    placeholder={`Enter value for ${ph.name}...`}
                  />
                )
              ) : null /* Handle potential unknown types in the future */
            }
            {/* --- End Conditional Rendering Logic --- */}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <button
          onClick={handleReview}
          disabled={!isFormValid || isLoading} // Disable if form is invalid or loading
          className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex justify-center items-center"
        >
          Review and Generate
        </button>
        {!isFormValid && !isLoading && (
          <p className="text-center text-xs text-red-500 mt-2 font-medium">
            * Please fill out all required fields to continue.
          </p>
        )}
      </div>
    </div>
  );
}

export default DataEntryPage;

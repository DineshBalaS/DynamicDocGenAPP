// src/pages/DataEntryPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getTemplateDetails } from "../api/templateService";

// Reusable Components
import Spinner from "../components/ui/spinner";
import ErrorState from "../components/common/ErrorState";
import ImageUploader from "../components/common/ImageUploader";
import NoPlaceholdersFound from "../components/common/NoPlaceholdersFound";

function DataEntryPage() {
  const { templateId } = useParams();

  const navigate = useNavigate();

  // State for fetching template details
  const [template, setTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for form data and generation process
  const [formData, setFormData] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Fetch template details on component mount
  const fetchDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // NOTE: This call assumes a GET /api/templates/:id endpoint exists.
      // If not, you might need to adjust this logic or your backend.
      const data = await getTemplateDetails(templateId);
      setTemplate(data);
      // Initialize form data with empty strings for each placeholder
      const initialData = data.placeholders.reduce((acc, ph) => {
        acc[ph.name] = "";
        return acc;
      }, {});
      setFormData(initialData);
    } catch (err) {
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

    // Check if every placeholder in the form has a non-empty value
    const allFieldsFilled = template.placeholders.every(
      (ph) => formData[ph.name] && formData[ph.name].trim() !== ""
    );
    setIsFormValid(allFieldsFilled);
  }, [formData, template]);

  // Handler for text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // handler to accept and store the local preview URL from ImageUploader
  const handleImageUploadSuccess = (placeholderName, s3_key, previewUrl) => {
    setFormData((prev) => ({ ...prev, [placeholderName]: s3_key }));
    setImagePreviews((prev) => ({ ...prev, [placeholderName]: previewUrl }));
  };

  // Handler for the "Generate Presentation" button click
  const handleReview = () => {
    // Navigate to the review page, passing all necessary data in the route's state
    navigate(`/review/${templateId}`, {
      state: {
        template,
        formData,
        imagePreviews,
      },
    });
  };

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
      <Link
        to="/"
        className="text-sm text-teal-600 hover:underline mb-4 inline-block"
      >
        &larr; Back to Dashboard
      </Link>
      <h1 className="text-3xl font-bold text-gray-800">{template.name}</h1>
      <p className="text-gray-500 mt-1">
        Fill in the data below to generate your presentation.
      </p>

      <div className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md border border-gray-200">
        {template.placeholders.map((ph) => (
          <div key={ph.name}>
            <label className="block text-sm font-medium text-gray-700 capitalize mb-2">
              {ph.name.replace(/_/g, " ")}
              <span className="text-red-500 ml-1">*</span>
            </label>
            {ph.type === "text" ? (
              <input
                type="text"
                name={ph.name}
                value={formData[ph.name] || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                placeholder={`Enter value for ${ph.name}...`}
              />
            ) : (
              <ImageUploader
                placeholderName={ph.name}
                onUploadSuccess={handleImageUploadSuccess}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <button
          onClick={handleReview}
          disabled={isLoading}
          className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-md hover:bg-teal-700 disabled:bg-gray-400 transition-colors flex justify-center items-center"
        >
          Review and Generate
        </button>
        {!isFormValid && !isLoading && (
          <p className="text-center text-xs text-gray-500 mt-2">
            Please fill out all required fields to continue.
          </p>
        )}
      </div>
    </div>
  );
}

export default DataEntryPage;

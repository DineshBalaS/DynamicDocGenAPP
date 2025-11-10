// src/components/common/ImageUploader.jsx

import React, { useState, useRef, useEffect } from "react";
import {
  uploadAsset,
  getAssetViewUrl,
  uploadImageFromUrl,
} from "../../api/templateService";
import ImageSearchModal from "./ImageSearchModal";
import UrlScrapeModal from "./UrlScrapeModal";

// Icon components for different states
const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    />
  </svg>
);
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);
const LoadingSpinner = () => (
  <svg
    className="animate-spin h-6 w-6 text-teal-500"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);
const ErrorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-red-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const ScrapeIcon = () => (
  // New Icon for the button
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101m.758 4.899l-5.656 5.656"
    />
  </svg>
);

function ImageUploader({
  onUploadSuccess,
  placeholderName,
  initialS3Key = null,
}) {
  const [status, setStatus] = useState("idle"); // 'idle', 'uploading', 'success', 'error'
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  // state to control the visibility of the search modal
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isScrapeModalOpen, setIsScrapeModalOpen] = useState(false);

  useEffect(() => {
    const loadPreview = async (key) => {
      // Use a temporary 'loading_preview' state
      setStatus("loading_preview");
      try {
        // This assumes getAssetViewUrl returns { url: "..." }
        const data = await getAssetViewUrl(key);
        setPreviewUrl(data.url);
        setStatus("success");
      } catch (err) {
        console.error(
          `[ImageUploader: ${placeholderName}] Failed to fetch preview URL:`,
          err
        ); // DEBUG LOG
        setErrorMessage("Could not load existing image preview.");
        setStatus("error");
      }
    };

    if (initialS3Key) {
      loadPreview(initialS3Key);
    }
  }, [initialS3Key, placeholderName]);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Basic validation
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Invalid file type. Please use JPG, PNG, or GIF.");
      setStatus("error");
      return;
    }

    // Set state for immediate feedback
    setStatus("uploading");
    setErrorMessage("");

    // Create a temporary URL for the preview
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);

    try {
      const result = await uploadAsset(file);
      onUploadSuccess(placeholderName, result.s3_key);
      setStatus("success");
    } catch (error) {
      setErrorMessage(error.message || "Upload failed. Please try again.");
      setStatus("error");
      // Clean up the failed preview
      URL.revokeObjectURL(localPreviewUrl);
      setPreviewUrl(null);
    }
  };

  /**
   * Universal handler for when an image is successfully
   * uploaded/selected from ANY modal (Search, Scrape, etc.)
   * or a direct file upload.
   */
  const handleImageUploadSuccess = (s3_key, preview_url) => {
    // DEBUG LOG: Image upload success, updating parent state
    console.log(
      `[ImageUploader: ${placeholderName}] Upload success. S3 Key: ${s3_key}`
    );
    setStatus("success");
    setPreviewUrl(preview_url); // Use the provided preview URL
    onUploadSuccess(placeholderName, s3_key);
  };

  // handler for when an image is selected from the search modal
  const handleModalImageSelect = (s3_key, webPreviewUrl) => {
    // The image is already uploaded to S3 by the modal's logic.
    // We just need to update the parent component and this component's UI.
    setStatus("success");
    setPreviewUrl(webPreviewUrl); // Use the web URL for preview
    onUploadSuccess(placeholderName, s3_key);
  };

  const handleScrapeModalSuccess = async (s3_key) => {
    // We have an s3_key, but we need a viewable URL for the preview.
    // We must fetch it from our own backend to get a secure pre-signed URL.
    setStatus("loading_preview");
    setPreviewUrl(null);
    try {
      const data = await getAssetViewUrl(s3_key);
      handleImageUploadSuccess(s3_key, data.url);
    } catch (err) {
      console.error(
        `[ImageUploader: ${placeholderName}] Failed to fetch preview for scraped image:`,
        err
      );
      setErrorMessage("Image uploaded, but preview failed to load.");
      setStatus("error");
    }
  };

  const handleDirectUploadClick = () => {
    if (status !== "uploading") {
      fileInputRef.current.click();
    }
  };

  // Allows clicking the whole container to trigger file input
  const handleClick = () => {
    if (status !== "uploading") {
      fileInputRef.current.click();
    }
  };

  const handleReset = () => {
    // Revoke blob URL if it exists
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    // Reset all state
    setStatus("idle");
    setPreviewUrl(null);
    setErrorMessage("");
    // Tell parent to clear the s3_key
    onUploadSuccess(placeholderName, "");
  };

  // Clean up object URL when component unmounts
  useEffect(() => {
    // Clean up object URLs to prevent memory leaks
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, placeholderName]);

  return (
    <>
      <div
        className={`relative w-full h-32 border-2 border-dashed rounded-lg flex justify-center items-center transition-colors
                    ${
                      status === "success" ? "border-green-400 bg-green-50" : ""
                    }
                    ${status === "error" ? "border-red-400 bg-red-50" : ""}
                    ${
                      status === "uploading" ? "border-teal-400 bg-teal-50" : ""
                    }
                    ${status === "idle" ? "border-gray-300 bg-gray-50" : ""}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/png, image/jpeg, image/gif"
          disabled={status === "uploading"}
        />

        {/* --- Different UI states --- */}

        {status === "idle" && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 p-2">
            <button
              type="button"
              onClick={handleDirectUploadClick}
              className="flex-1 flex justify-center items-center px-4 py-2 border border-gray-400 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <UploadIcon /> <span className="ml-2">Upload Image</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="flex-1 flex justify-center items-center px-4 py-2 border border-gray-400 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <SearchIcon /> <span className="ml-2">Search Image</span>
            </button>
            {/* SCRAPE FROM URL BUTTON */}
           <button 
             type="button" 
             onClick={() => setIsScrapeModalOpen(true)} 
             className="flex-1 flex justify-center items-center px-4 py-2 border border-gray-400 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
           >
             <ScrapeIcon /> <span className="ml-2">Scrape from URL</span>
           </button>
          </div>
        )}

        {(status === "uploading" || status === "loading_preview") && (
          <div className="text-center">
            <LoadingSpinner />
            <p className="text-xs text-teal-600 mt-2">
              {status === "uploading" ? "Uploading..." : "Loading preview..."}
            </p>
          </div>
        )}
        {status === "error" && (
          <div className="text-center">
            <ErrorIcon />
            <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
          </div>
        )}

        {status === "success" && previewUrl && (
          <>
            <img
              src={previewUrl}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/50 flex justify-center items-center opacity-0 hover:opacity-100 transition-opacity">
              <button
                onClick={handleReset}
                className="text-white font-bold py-2 px-4 rounded bg-black/60 hover:bg-black/80"
              >
                Change Image
              </button>
            </div>
          </>
        )}
      </div>

      <ImageSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onImageSelect={handleModalImageSelect}
      />

      <UrlScrapeModal
        isOpen={isScrapeModalOpen}
        onClose={() => setIsScrapeModalOpen(false)}
        onUploadSuccess={handleScrapeModalSuccess}
      />
    </>
  );
}

export default ImageUploader;

// src/components/common/ImageSearchModal.jsx

import React, { useState, useEffect } from "react"; // Ensure useEffect is imported
import { searchImages, uploadImageFromUrl } from "../../api/templateService";
import Spinner from "../ui/spinner";

// --- Helper Components ---
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
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

const EmptyState = ({ message }) => (
  <div className="text-center py-10">
    <p className="text-gray-500">{message}</p>
  </div>
);

const ImageGridSkeleton = () => (
  <div className="grid grid-cols-3 gap-4 animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="aspect-square bg-gray-200 rounded-md"></div>
    ))}
  </div>
);

// --- Main Component ---
function ImageSearchModal({ isOpen, onClose, onImageSelect }) {
  const [query, setQuery] = useState("");
  const [images, setImages] = useState([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [searchStatus, setSearchStatus] = useState("idle"); // idle, loading, success, empty, error
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, error
  const [error, setError] = useState("");

  // Reset state when the modal opens or closes - Correctly implemented
  useEffect(() => {
    if (!isOpen) {
      // Reset everything when modal closes to be clean next time
      setQuery("");
      setImages([]);
      setSelectedImageUrl(null);
      setSearchStatus("idle");
      setUploadStatus("idle");
      setError("");
    } else {
      // Ensure it starts clean when opened
      setSearchStatus("idle");
      setError("");
    }
  }, [isOpen]); // Dependency array includes isOpen

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    console.log(`Searching for: "${trimmedQuery}"`); // Good for debugging

    setSearchStatus("loading");
    setError("");
    setImages([]); // Clear previous images
    setSelectedImageUrl(null); // Clear previous selection

    try {
      const results = await searchImages(trimmedQuery); // Use trimmedQuery
      setImages(results);
      setSearchStatus(results.length > 0 ? "success" : "empty");
    } catch (err) {
      console.error("Image search failed:", err); // Good error logging
      setError(err.message || "Failed to fetch images.");
      setSearchStatus("error");
    }
  };

  const handleConfirmAndUpload = async () => {
    if (!selectedImageUrl) return;

    setUploadStatus("uploading");
    setError("");

    try {
      const uploadResult = await uploadImageFromUrl(selectedImageUrl);
      onImageSelect(uploadResult.s3_key, selectedImageUrl);
      // No need to set uploadStatus here, handleClose resets it
      handleClose(); // Close modal on successful selection and upload trigger
    } catch (err) {
      console.error("Upload from URL failed:", err); // Good error logging
      setError(err.message || "Failed to upload the selected image.");
      setUploadStatus("error"); // Keep modal open to show error
    }
  };

  // Cleanly calls the parent onClose handler
  const handleClose = () => {
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="relative z-50"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay background */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose} // Allows closing via overlay click
      ></div>

      {/* Modal Panel */}
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div
            className="relative flex flex-col transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg max-h-[80vh]"
            onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200">
              <h3
                className="text-lg font-semibold leading-6 text-gray-900 text-center"
                id="modal-title"
              >
                Search for an Image
              </h3>
            </div>

            {/* Body */}
            <div className="flex-grow min-h-0 space-y-4 p-6 overflow-y-auto">
              {/* Search Form */}
              <form
                onSubmit={handleSearch}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., Nature, buildings, etc."
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 transition"
                  disabled={searchStatus === "loading"} // Good: Disable input while loading
                />
                <button
                  type="submit"
                  disabled={searchStatus === "loading" || !query.trim()} // Good: Disable if loading or query empty
                  className="p-2.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400 transition"
                  aria-label="Search images" // Good: Accessibility
                >
                  {searchStatus === "loading" ? <Spinner /> : <SearchIcon />}
                </button>
              </form>

              {/* Results Area */}
              <div className="min-h-[200px]">
                {" "}
                {/* Good: Minimum height prevents layout collapse */}
                {searchStatus === "loading" && <ImageGridSkeleton />}
                {searchStatus === "idle" && (
                  <EmptyState message="Search for images to get started." />
                )}
                {searchStatus === "empty" && (
                  <EmptyState message={`No images found for "${query}".`} />
                )}
                {searchStatus === "error" && <EmptyState message={error} />}
                {searchStatus === "success" && (
                  <div className="grid grid-cols-3 gap-4">
                    {images.map((img) => (
                      <div
                        key={img.id} // Assumes IDs from API are unique
                        className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group transition-all duration-200
                                                    ${
                                                      selectedImageUrl ===
                                                      img.url
                                                        ? "ring-4 ring-offset-2 ring-teal-500"
                                                        : ""
                                                    }`}
                        onClick={() => setSelectedImageUrl(img.url)}
                      >
                        <img
                          src={img.url}
                          alt={img.alt}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleConfirmAndUpload}
                disabled={!selectedImageUrl || uploadStatus === "uploading"} // Good: Disable logic
                className="relative inline-flex w-full justify-center items-center rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:bg-gray-400 sm:ml-3 sm:w-auto min-w-[6rem]"
              >
                {uploadStatus === "uploading" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Spinner />
                  </div>
                )}
                <span
                  className={
                    uploadStatus === "uploading" ? "opacity-0" : "opacity-100"
                  }
                >
                  Confirm
                </span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
              {/* Display upload error in the footer */}
              {uploadStatus === "error" && (
                <p className="mt-3 text-sm text-red-600 sm:mt-0 sm:mr-auto sm:self-center">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageSearchModal;

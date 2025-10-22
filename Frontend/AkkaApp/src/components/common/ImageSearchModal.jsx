// src/components/common/ImageSearchModal.jsx

import React, { useState } from "react";
import { searchImages, uploadImageFromUrl } from "../../api/templateService";
import Spinner from "../ui/spinner";

// --- Helper Components for different states ---

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

  const [searchStatus, setSearchStatus] = useState("idle"); // idle, loading, success, error
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, success, error

  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearchStatus("loading");
    setError("");
    setImages([]);
    setSelectedImageUrl(null);

    try {
      const results = await searchImages(query);
      setImages(results);
      setSearchStatus(results.length > 0 ? "success" : "empty");
    } catch (err) {
      setError(err.message || "Failed to fetch images.");
      setSearchStatus("error");
    }
  };

  const handleConfirmAndUpload = async () => {
    if (!selectedImageUrl) return;

    setUploadStatus("uploading");
    setError("");

    try {
      // 1. Upload the image via URL to our backend
      const uploadResult = await uploadImageFromUrl(selectedImageUrl);

      // 2. Pass the s3_key and the original URL (for preview) back to the parent
      onImageSelect(uploadResult.s3_key, selectedImageUrl);

      setUploadStatus("success");
      handleClose(); // Close modal on success
    } catch (err) {
      setError(err.message || "Failed to upload the selected image.");
      setUploadStatus("error");
    }
  };

  // Reset state when the modal is closed to ensure it's clean for the next open
  const handleClose = () => {
    setQuery("");
    setImages([]);
    setSelectedImageUrl(null);
    setSearchStatus("idle");
    setUploadStatus("idle");
    setError("");
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
        onClick={handleClose}
      ></div>

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          {/* Modal Panel Container - Styled like the original simple Modal */}
          <div
            className="relative flex flex-col transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Modal Header (Simple Title) */}
            <div className="flex-shrink-0 bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200">
              <h3
                className="text-lg font-semibold leading-6 text-gray-900 text-center"
                id="modal-title"
              >
                Search for an Image
              </h3>
            </div>

            {/* 2. Modal Body (Search Content) */}
            <div className="flex-grow min-h-0 space-y-4 p-6 overflow-y-auto">
              <form
                onSubmit={handleSearch}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., Nature, buildings, etc."
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 transition" // Simple styling
                />
                <button
                  type="submit"
                  disabled={searchStatus === "loading"}
                  className="p-2.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400 transition"
                >
                  <SearchIcon />
                </button>
              </form>

              <div className="">
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
                        key={img.id}
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

            {/* 3. Modal Footer (Simple Buttons) */}
            <div className="flex-shrink-0 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleConfirmAndUpload}
                disabled={!selectedImageUrl || uploadStatus === "uploading"}
                className="relative inline-flex w-full justify-center items-center rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:bg-gray-400 sm:ml-3 sm:w-auto min-w-[6rem]"
              >
                {/* Spinner floats on top */}
                {uploadStatus === "uploading" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Spinner />
                  </div>
                )}

                {/* Text provides the button's width but becomes invisible */}
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
              {uploadStatus === "error" && (
                <p className="mt-3 text-sm text-red-600 sm:mt-0 sm:mr-auto">
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

// src/components/common/UrlScrapeModal.jsx

import React, { useState, Fragment } from "react";
import {
  scrapeImagesFromUrl,
  uploadImageFromUrl,
} from "../../api/templateService";
import ImageScrapeGrid from "./ImageScrapeGrid"; // Helper component
import { Dialog, Transition } from "@headlessui/react";

const LoadingSpinner = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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

// [NEW] Close Icon
const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

function UrlScrapeModal({ isOpen, onClose, onUploadSuccess }) {
  const [urlInput, setUrlInput] = useState("");
  const [scrapedImages, setScrapedImages] = useState([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [status, setStatus] = useState("idle"); // 'idle', 'loading', 'success', 'error'
  const [uploadStatus, setUploadStatus] = useState("idle"); // 'idle', 'uploading', 'error'
  const [errorMessage, setErrorMessage] = useState("");

  const handleFetchImages = async () => {
    if (!urlInput) {
      setErrorMessage("Please enter a URL.");
      setStatus("error");
      return;
    }

    // DEBUG LOG: Starting image fetch
    console.log(`[UrlScrapeModal] Fetching images from: ${urlInput}`);
    setStatus("loading");
    setErrorMessage("");
    setScrapedImages([]);
    setSelectedImageUrl(null);

    try {
      const images = await scrapeImagesFromUrl(urlInput);
      setScrapedImages(images);
      setStatus(images.length > 0 ? "success" : "empty");
      // DEBUG LOG: Fetch success
      console.log(`[UrlScrapeModal] Fetched ${images.length} images.`);
    } catch (error) {
      // DEBUG LOG: Fetch error
      console.error(`[UrlScrapeModal] Scrape failed:`, error);
      setErrorMessage(error.message || "An unknown error occurred.");
      setStatus("error");
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedImageUrl) return;

    // DEBUG LOG: Starting upload of selected image
    console.log(`[UrlScrapeModal] Uploading selected URL: ${selectedImageUrl}`);
    setUploadStatus("uploading");
    setErrorMessage("");

    try {
      const result = await uploadImageFromUrl(selectedImageUrl);
      // DEBUG LOG: Upload success
      console.log(`[UrlScrapeModal] Upload success, s3_key: ${result.s3_key}`);
      onUploadSuccess(result.s3_key);
      handleClose(); // Close modal on success
    } catch (error) {
      // DEBUG LOG: Upload error
      console.error(`[UrlScrapeModal] Upload failed:`, error);
      setErrorMessage(error.message || "Failed to upload selected image.");
      setUploadStatus("error");
    }
  };

  const handleClose = () => {
    // Reset all state on close
    setUrlInput("");
    setScrapedImages([]);
    setSelectedImageUrl(null);
    setStatus("idle");
    setUploadStatus("idle");
    setErrorMessage("");
    onClose();
  };

  const isConfirmDisabled = !selectedImageUrl || uploadStatus === "uploading";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={handleClose}>
        {/* The overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform rounded-lg bg-white text-left align-middle shadow-xl transition-all flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-gray-200">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Scrape Images from URL
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XIcon />
                  </button>
                </div>

                {/* Scrolling Body */}
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                  {/* Input Section */}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://www.example.com/page"
                      className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      disabled={status === "loading"}
                    />
                    <button
                      onClick={handleFetchImages}
                      disabled={status === "loading"}
                      className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400"
                    >
                      {status === "loading" ? "Fetching..." : "Fetch Images"}
                    </button>
                  </div>

                  {/* [FIX] Conditionally render the grid container to hide it when idle */}
                  {status === "idle" && (
                    <div
                      className="flex-grow flex justify-center items-center h-full"
                      style={{ minHeight: "300px" }}
                    >
                      <p className="text-gray-500">
                        Enter a URL to fetch images.
                      </p>
                    </div>
                  )}

                  {status !== "idle" && (
                    <div
                      className="flex-grow border border-gray-200 rounded-md p-2 bg-gray-50"
                      style={{ minHeight: "300px" }}
                    >
                      <ImageScrapeGrid
                        status={status}
                        images={scrapedImages}
                        errorMessage={errorMessage}
                        selectedImageUrl={selectedImageUrl}
                        onSelect={setSelectedImageUrl}
                      />
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 flex justify-between items-center p-6 border-t border-gray-200">
                  <div>
                    {uploadStatus === "error" && (
                      <p className="text-sm text-red-600">{errorMessage}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmUpload}
                      disabled={isConfirmDisabled}
                      className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400 flex items-center"
                    >
                      {uploadStatus === "uploading" && <LoadingSpinner />}
                      Confirm and Upload
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default UrlScrapeModal;

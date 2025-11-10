// src/components/common/ImageScrapeGrid.jsx

import React from "react";

// Educational Error Icon (from your mockup)
const ErrorWarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-12 w-12 text-yellow-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

/**
 * A single pulsing skeleton box for the loading state.
 */
const SkeletonBox = ({ style }) => (
  <div className="animate-pulse bg-gray-300 rounded-md" style={style} />
);

/**
 * Renders the masonry-style skeleton loader.
 */
const SkeletonLoader = () => {
  // Mockup of a masonry layout to match your image
  return (
    <div
      className="grid grid-cols-3 gap-2"
      style={{ gridTemplateRows: "masonry" }}
    >
      <SkeletonBox style={{ height: "120px" }} />
      <SkeletonBox style={{ height: "80px" }} />
      <SkeletonBox style={{ height: "100px" }} />
      <SkeletonBox style={{ height: "90px" }} />
      <SkeletonBox style={{ height: "130px" }} />
      <SkeletonBox style={{ height: "100px" }} />
      <SkeletonBox style={{ height: "80px" }} />
      <SkeletonBox style={{ height: "110px" }} />
      <SkeletonBox style={{ height: "90px" }} />
    </div>
  );
};

/**
 * Renders the main content for the scrape modal.
 * It handles the loading, error, empty, and success states.
 */
function ImageScrapeGrid({
  status,
  images,
  errorMessage,
  selectedImageUrl,
  onSelect,
}) {
  const renderContent = () => {
    switch (status) {
      case "loading":
        return <SkeletonLoader />;

      case "error":
        // Educational error message (as requested)
        return (
          <div className="flex flex-col justify-center items-center h-full text-center p-4">
            <ErrorWarningIcon />
            <p className="mt-4 font-semibold text-gray-700">
              Could not fetch images
            </p>
            <p className="text-gray-500 text-sm">{errorMessage}</p>
          </div>
        );

      case "empty":
        return (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">No images were found at that URL.</p>
          </div>
        );

      case "success":
        return (
          // Masonry Grid (using CSS columns for simplicity and support)
          <div className="column-count-2 sm:column-count-3 md:column-count-4 gap-2">
            {images.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Scraped ${index + 1}`}
                onClick={() => onSelect(url)}
                className={`block w-full h-auto object-cover rounded-md mb-2 break-inside-avoid cursor-pointer transition-all
                  ${
                    selectedImageUrl === url
                      ? "ring-4 ring-teal-500 ring-offset-2" // Simple border (as requested)
                      : "hover:opacity-80"
                  }`}
                // Basic "best practice" filter: hide images that fail to load
                onError={(e) => (e.target.style.display = "none")}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="h-full">{renderContent()}</div>;
}

export default ImageScrapeGrid;

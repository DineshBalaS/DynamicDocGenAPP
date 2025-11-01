import React, { useState, useEffect } from "react";
import { getAssetViewUrl } from "../../api/templateService";

// --- Local Helper Components ---
// Using local components to keep this file self-contained.
// You can replace these with your global Spinner if you prefer.
const LoadingSpinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-gray-500"
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
    className="h-6 w-6 text-red-400"
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
// --- End Helper Components ---

/**
 * A component that securely renders an image from S3 by fetching a
 * pre-signed URL from the backend using just an s3Key.
 */
function S3Image({ s3Key, alt, className }) {
  // 'idle', 'loading', 'success', 'error'
  const [status, setStatus] = useState("idle");
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchUrl = async () => {
      if (!s3Key) {
        console.log(`[S3Image] No s3Key provided. Setting status to idle.`); // DEBUG LOG
        setStatus("idle");
        return;
      }

      // Check if the key is already a full URL (from image search)
      if (s3Key.startsWith("http")) {
        console.log(`[S3Image] s3Key is a full URL. Using it directly.`); // DEBUG LOG
        setImageUrl(s3Key);
        setStatus("success");
        return;
      }

      console.log(`[S3Image] Fetching view URL for s3Key: ${s3Key}`); // DEBUG LOG
      setStatus("loading");
      try {
        const data = await getAssetViewUrl(s3Key);
        setImageUrl(data.url);
        setStatus("success");
        console.log(`[S3Image] Successfully fetched URL for s3Key: ${s3Key}`); // DEBUG LOG
      } catch (error) {
        console.error(`[S3Image] Failed to fetch URL for s3Key: ${s3Key}`, error); // DEBUG LOG
        setStatus("error");
      }
    };

    fetchUrl();
  }, [s3Key]); // Re-run this effect if the s3Key prop ever changes

  // Render based on the current status
  switch (status) {
    case "success":
      return (
        <img
          src={imageUrl}
          alt={alt}
          className={className}
          // Add a simple fallback for production robustness
          onError={(e) => {
            e.target.onerror = null; // prevent infinite loop
            console.error(`[S3Image] Failed to load image from URL: ${imageUrl}`); // DEBUG LOG
            e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlYWVhZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNjY2MiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPklNQUdFIEZBSUxFRDwvdGV4dD48L3N2Zz4=";
          }}
        />
      );

    case "loading":
      return (
        <div
          className={`${className} flex items-center justify-center bg-gray-100 rounded-md border border-gray-200`}
          style={{ minHeight: "90px" }} // Give it a minimum height
        >
          <LoadingSpinner />
        </div>
      );

    case "error":
      return (
        <div
          className={`${className} flex flex-col items-center justify-center bg-red-50 text-red-700 rounded-md border border-red-200 p-4`}
          style={{ minHeight: "90px" }}
        >
          <ErrorIcon />
          <span className="text-xs mt-1 font-medium">Image failed to load</span>
        </div>
      );

    case "idle":
    default:
      // This is the state for "no image provided"
      return (
        <div
          className={`${className} flex items-center justify-center bg-gray-100 text-gray-400 rounded-md border border-gray-200 p-4`}
          style={{ minHeight: "90px" }}
        >
          <span className="text-xs font-medium">No image</span>
        </div>
      );
  }
}

export default S3Image;
// src/pages/DownloadPage.jsx

import React, { useState, useEffect, useRef } from "react";
import { generatePresentation } from "../api/templateService";
import Spinner from "../components/ui/spinner";
import catImage from "../assets/cat.png";

// Success Icon (Checkmark)
function CheckIcon() {
  return (
    <svg
      className="h-16 w-16 text-teal-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

// Error Icon (X)
function ErrorIcon() {
  return (
    <svg
      className="h-16 w-16 text-red-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function DownloadPage() {
  const [status, setStatus] = useState("loading"); // 'loading', 'success', 'error'
  const [error, setError] = useState(null);
  const [downloadLink, setDownloadLink] = useState(null);
  const [filename, setFilename] = useState("presentation.pptx");
  const hasInitialized = useRef(false);

  useEffect(() => {
    // This effect runs once when the page loads
    if (hasInitialized.current) {
      console.log(
        "DownloadPage: useEffect skipped because it was already initialized (StrictMode re-mount)."
      );
      return;
    }
    hasInitialized.current = true;
    const startGeneration = async () => {
      let dataToGenerate;
      try {
        // 1. Get data from session storage
        const storedData = sessionStorage.getItem("pptxDownloadData");
        if (!storedData) {
          throw new Error("No generation data found. Please try again.");
        }

        // 2. Clear the data immediately so it's not used again
        sessionStorage.removeItem("pptxDownloadData");

        dataToGenerate = JSON.parse(storedData);
      } catch (e) {
        console.error("Failed to read from session storage:", e);
        setError(e.message || "Failed to initialize generation.");
        setStatus("error");
        return;
      }

      // 3. Make the API call
      try {
        const { blob, filename: fname } = await generatePresentation(
          dataToGenerate.templateId,
          dataToGenerate.formData
        );

        const url = window.URL.createObjectURL(blob);
        setDownloadLink(url);
        setFilename(fname);

        // 4. Trigger the download automatically
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fname);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);

        // 5. Update UI to success
        setStatus("success");
      } catch (err) {
        console.error("Generation failed:", err);
        setError(err.message || "An unexpected error occurred.");
        setStatus("error");
      }
    };

    startGeneration();
  }, []); // Empty dependency array ensures this runs only once

  // Helper function to render content based on state
  const renderContent = () => {
    switch (status) {
      case "success":
        return (
          <>
            <CheckIcon />
            <h1 className="text-3xl font-bold text-gray-800 mt-4">
              Download Complete!
            </h1>
            <p className="text-gray-500 mt-2">You may now close this tab.</p>
            <div className="text-center mt-6 text-sm text-gray-600">
              Download didn't start?{" "}
              <a
                href={downloadLink}
                download={filename}
                className="text-teal-600 hover:underline font-semibold"
              >
                Click here
              </a>
              .
            </div>
          </>
        );
      case "error":
        return (
          <>
            <img src={catImage} alt="Error" className="w-40 h-auto" />
            <h1 className="text-3xl font-bold text-gray-800 mt-4">
              We couldn't generate your presentation.
            </h1>
            <p className="text-gray-500 mt-2">{error}</p>
            <p className="text-gray-500 mt-2">
              Please close this tab, return to the main application, and try
              again.
            </p>
          </>
        );
      case "loading":
      default:
        return (
          <>
            <Spinner />
            <h1 className="text-3xl font-bold text-gray-800 mt-4">
              Generating your presentation...
            </h1>
            <p className="text-gray-500 mt-2">Please wait.</p>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-6">
      {renderContent()}
    </div>
  );
}

export default DownloadPage;

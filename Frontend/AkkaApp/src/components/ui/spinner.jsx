// src/components/ui/Spinner.jsx

import React from "react";

/**
 * A flexible spinner component.
 * @param {string} className - Additional classes for the <svg> element (e.g., "h-6 w-6").
 * @param {boolean} inline - If true, removes the outer padding div for inline use.
 */
function Spinner({ className, inline = false }) {
  const svg = (
    <svg
      className={`animate-spin text-teal-500 ${className || "h-8 w-8"}`} // Keep h-8 w-8 as default
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

  if (inline) {
    return svg; // Return only the SVG if inline
  }

  // Default behavior (with padding) if inline is false
  return <div className="flex justify-center items-center py-12">{svg}</div>;
}

export default Spinner;

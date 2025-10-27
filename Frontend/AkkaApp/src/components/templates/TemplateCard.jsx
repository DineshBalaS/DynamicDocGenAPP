// src/components/templates/TemplateCard.jsx

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import fallbackImage from '../../assets/default-ppt-thumbnail.png'; 

const MoreVerticalIcon = () => (
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
    className="h-5 w-5"
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

const RestoreIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="inline-block mr-2" // Added margin-right
    >
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
        <path d="M21 21v-5h-5"/>
    </svg>
);

function TemplateCard({ template, onDelete, isTrashContext = false, onRestore }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // State to track hover
  const menuRef = useRef(null);

  // This effect still handles closing the menu if the user clicks outside of it.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // The card is "active" if it's hovered OR if its menu is open.
  const isActive = isHovered || isMenuOpen;

  // Define action handlers for clarity
  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(template);
    }
    setIsMenuOpen(false);
  };

  const handleRestoreClick = () => {
    if (onRestore) {
      onRestore(template);
    }
    setIsMenuOpen(false); // Also close menu on restore
  };

  return (
    <div
      className="relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail and card content divs */}
      <div className="h-36 bg-gray-100 flex items-center justify-center overflow-hidden">
        {" "}
        {/* Added overflow-hidden */}
        {/* Always render the fallback image */}
        <img
          src={fallbackImage}
          alt={`${template.name} preview`}
          className="w-full h-full object-cover" // Use object-cover for neat filling
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 truncate">{template.name}</h3>
        <p className="text-sm text-gray-500">
          {template.description || "No description"}
        </p>
      </div>

      {/* Hover Actions Overlay: Visibility is now tied to the 'isActive' state */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Conditional Button: Use Template or Restore */}
        {isTrashContext ? (
          <button
            onClick={handleRestoreClick} // Use restore handler
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center"
          >
             <RestoreIcon /> Restore
          </button>
        ) : (
          <Link
            to={`/generate/${template.id}`}
            className="bg-teal-500 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-600 transition-colors"
          >
            Use Template
          </Link>
        )}
      </div>

      {/* More Options Button and Dropdown Menu */}
      <div ref={menuRef} className="absolute top-2 right-2">
        {/* Button: Visibility is also tied to the 'isActive' state */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-1.5 rounded-full bg-gray-100 bg-opacity-50 text-gray-600 hover:bg-gray-200 transition-opacity ${
            isActive ? "opacity-100" : "opacity-0"
          }`}
        >
          <MoreVerticalIcon />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              {/* Conditional Menu Items */}
              {!isTrashContext && (
                <>
                  <a // Keep Edit only if not in trash
                    href="#" // Replace with actual edit link/handler later
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Edit
                  </a>
                  <button // Keep Delete only if not in trash
                    onClick={handleDeleteClick}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </>
              )}
              {isTrashContext && ( // Show Restore only if in trash
                <button
                  onClick={handleRestoreClick}
                  className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center" // Added flex items-center
                >
                  <RestoreIcon /> Restore
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplateCard;

// src/components/common/Header.jsx

import React from "react";
import { Link, NavLink } from "react-router-dom";

function Header() {
  // Style for the active NavLink
  const activeLinkStyle = {
    color: "#14b8a6", // teal-500
    borderBottom: "2px solid #14b8a6",
  };

  const TrashIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18" // Slightly smaller to fit well with text
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="inline-block mr-1 mb-0.5" // Adjust alignment
    >
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* App Logo and Title */}
        <Link to="/" className="flex items-center space-x-2">
          {/* You can replace this with an actual SVG logo later */}
          <div className="w-8 h-8 bg-teal-500 rounded-md flex items-center justify-center font-bold text-white text-lg">
            P
          </div>
          <span className="text-xl font-bold text-gray-800">
            PPTX Templater
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <NavLink
            to="/"
            style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            className="text-gray-600 hover:text-teal-500 transition-colors"
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/upload"
            style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            className="text-gray-600 hover:text-teal-500 transition-colors"
          >
            Upload Template
          </NavLink>
          <NavLink
            to="/trash"
            style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            // Apply the classes directly here, removing the undefined variable
            className="pb-[2px] text-gray-600 hover:text-teal-500 transition-colors"
          >
            <TrashIcon /> {/* Add the icon */}
            Trash
          </NavLink>
        </div>
      </nav>
    </header>
  );
}

export default Header;

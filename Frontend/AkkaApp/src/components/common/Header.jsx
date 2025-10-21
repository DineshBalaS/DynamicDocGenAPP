// src/components/common/Header.jsx

import React from 'react';
import { Link, NavLink } from 'react-router-dom';

function Header() {
  // Style for the active NavLink
  const activeLinkStyle = {
    color: '#14b8a6', // teal-500
    borderBottom: '2px solid #14b8a6',
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* App Logo and Title */}
        <Link to="/" className="flex items-center space-x-2">
          {/* You can replace this with an actual SVG logo later */}
          <div className="w-8 h-8 bg-teal-500 rounded-md flex items-center justify-center font-bold text-white text-lg">
            P
          </div>
          <span className="text-xl font-bold text-gray-800">PPTX Templater</span>
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
        </div>
      </nav>
    </header>
  );
}

export default Header;
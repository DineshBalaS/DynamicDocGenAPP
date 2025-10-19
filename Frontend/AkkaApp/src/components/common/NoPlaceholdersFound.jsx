// src/components/common/NoPlaceholdersFound.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import sadCatImage from '../../assets/cat.png';

function NoPlaceholdersFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <img
        src={sadCatImage}
        alt="A sad cat"
        className="w-48 h-48 object-contain mb-6"
      />
      <h1 className="text-3xl font-bold text-gray-800">
        This slide is a little... empty.
      </h1>
      <p className="mt-2 max-w-md text-gray-500">
        It seems this template has no placeholders for us to fill. It's just a blank canvas! There's nothing to generate here.
      </p>
      <div className="mt-8">
        <Link
          to="/"
          className="bg-teal-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-teal-700 transition-colors"
        >
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NoPlaceholdersFound;
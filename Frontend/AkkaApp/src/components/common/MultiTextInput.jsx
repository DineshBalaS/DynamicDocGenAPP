// src/components/common/MultiTextInput.jsx

import React from 'react'; // <-- Import React

// --- Helper Component for Multi-Text Input ---
const MultiTextInput = ({ placeholderName, value, onChange }) => {
  // Ensure value is always an array, default to [''] if null/undefined/empty
  const items = (Array.isArray(value) && value.length > 0) ? value : [''];

  const handleItemChange = (index, text) => {
    const newItems = [...items];
    newItems[index] = text;
    // Report the array exactly as it is, including empty strings.
    onChange(placeholderName, newItems);
  };

  const addItem = () => {
    // Only add if the last item is not empty, prevents adding tons of empty fields
     if (items[items.length - 1]?.trim() !== '') {
        onChange(placeholderName, [...items, '']);
     }
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    const finalItems = newItems.length > 0 ? newItems : [''];
     onChange(placeholderName, finalItems);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2 group"> {/* Added group */}
          <input
            type="text"
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
            placeholder={`Item ${index + 1}`}
          />
          <button
            type="button"
            onClick={() => removeItem(index)}
            // Disable remove ONLY if it's the very last item AND it's empty
            disabled={items.length === 1 && index === 0 && items[0] === ''}
            className="text-gray-400 hover:text-red-600 disabled:text-gray-300 disabled:cursor-not-allowed p-1 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100" // Added transition and hover effect
            aria-label="Remove item"
          >
            {/* SVG Trash Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        // Disable adding if the last item is empty
        disabled={items.length > 0 && items[items.length - 1].trim() === ''}
        className="mt-2 text-sm text-teal-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline"
      >
        + Add Item
      </button>
    </div>
  );
};

export default MultiTextInput; // <-- Export the component
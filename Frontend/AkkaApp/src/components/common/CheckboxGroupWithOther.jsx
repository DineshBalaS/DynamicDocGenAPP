// src/components/common/CheckboxGroupWithOther.jsx

import React, { useState, useEffect } from 'react';

// --- Helper Component for Checkbox Group ---
const CheckboxGroupWithOther = ({ placeholderName, choices, value, onChange }) => {
  const selectedValues = new Set(value || []); // Use a Set for efficient lookup
  const [otherText, setOtherText] = useState('');
  const [isOtherChecked, setIsOtherChecked] = useState(false);

  // Effect to sync 'otherText' and 'isOtherChecked' if the value comes from state
  useEffect(() => {
    // Find if there's a custom value (not 'Other' and not in predefined choices)
    const otherValue = (value || []).find(v => v !== 'Other' && !choices.includes(v));
    if (otherValue) {
      setOtherText(otherValue);
      setIsOtherChecked(true);
    } else {
      setOtherText('');
      // Only set checked if 'Other' itself is selected AND no custom value was found
      setIsOtherChecked((value || []).includes('Other') && !otherValue);
    }
  }, [value, choices]);

  const handleCheckboxChange = (choice) => {
    const newSelectedValues = new Set(selectedValues);
     // Always remove any custom 'other' text first if a predefined choice is toggled
    const previousOtherValue = (value || []).find(v => !choices.includes(v) && v !== 'Other');
    if (previousOtherValue) {
       newSelectedValues.delete(previousOtherValue);
    }
     // Also remove the placeholder 'Other' if present
    if (newSelectedValues.has('Other')) {
        newSelectedValues.delete('Other');
    }

    if (selectedValues.has(choice)) { // Use original selectedValues for toggle check
      newSelectedValues.delete(choice);
    } else {
      newSelectedValues.add(choice);
    }

     // If "Other" was checked, ensure its text value (if any) is re-added
    if (isOtherChecked && otherText.trim()) {
        newSelectedValues.add(otherText.trim());
    } else if (isOtherChecked) {
        // Optionally add 'Other' back if you need to track the checkbox itself
        // newSelectedValues.add('Other');
    }

    onChange(placeholderName, Array.from(newSelectedValues));
  };

 const handleOtherCheckboxChange = () => {
    const willBeChecked = !isOtherChecked;
    setIsOtherChecked(willBeChecked);
    const newSelectedValues = new Set(selectedValues);

    // Remove any previous custom text value if it exists
    const previousOtherValue = (value || []).find(v => !choices.includes(v) && v !== 'Other');
    if (previousOtherValue) {
       newSelectedValues.delete(previousOtherValue);
    }
     // Also remove the placeholder 'Other' if present
    if (newSelectedValues.has('Other')) {
        newSelectedValues.delete('Other');
    }


    if (willBeChecked) {
      // If checking 'Other', add the current otherText (if any)
      if (otherText.trim()) {
        newSelectedValues.add(otherText.trim());
      } else {
         // Optionally track the 'Other' checkbox itself even if text is empty
         // newSelectedValues.add('Other');
      }
    } else {
      // If unchecking 'Other', remove the current otherText (which should already be gone, but be safe)
      if (otherText.trim()) {
        newSelectedValues.delete(otherText.trim());
      }
      setOtherText(''); // Clear text when unchecked
    }

    onChange(placeholderName, Array.from(newSelectedValues));
  };

  const handleOtherTextChange = (e) => {
    const newText = e.target.value;
    const oldText = otherText; // Capture the old text before updating state
    setOtherText(newText);

    if (isOtherChecked) {
      const newSelectedValues = new Set(selectedValues);
      // Remove the old text value if it existed
      if (oldText.trim()) {
        newSelectedValues.delete(oldText.trim());
      }
      // Add the new text value if it's not empty
      if (newText.trim()) {
        newSelectedValues.add(newText.trim());
      }
      // Remove 'Other' placeholder if text is added
      if (newSelectedValues.has('Other') && newText.trim()){
          newSelectedValues.delete('Other');
      }
       // Add 'Other' back if text becomes empty but checkbox still checked
      // else if (!newText.trim() && !newSelectedValues.has('Other')) {
      //     newSelectedValues.add('Other');
      // }

      onChange(placeholderName, Array.from(newSelectedValues));
    }
  };


  return (
    <div className="space-y-2">
      {choices.map((choice) => (
        <label key={choice} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedValues.has(choice)}
            onChange={() => handleCheckboxChange(choice)}
            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
          />
          <span>{choice}</span>
        </label>
      ))}
      {/* Other Checkbox and Input */}
      <div className="flex items-center space-x-2">
         <label className="flex items-center space-x-2 cursor-pointer">
             <input
                type="checkbox"
                checked={isOtherChecked}
                onChange={handleOtherCheckboxChange}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
              />
            <span>Other:</span>
         </label>
        {isOtherChecked && (
          <input
            type="text"
            value={otherText}
            onChange={handleOtherTextChange}
            placeholder="Please specify"
            className="flex-grow px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-sm"
          />
        )}
      </div>
    </div>
  );
};

export default CheckboxGroupWithOther; // <-- Export the component
// src/components/common/CheckboxGroupWithOther.jsx

import React, { useState, useEffect } from "react";

const CheckboxGroupWithOther = ({
  placeholderName,
  choices,
  value,
  onChange,
}) => {
  const selectedValues = new Set(value || []);
  const [otherText, setOtherText] = useState("");
  const [isOtherChecked, setIsOtherChecked] = useState(false);

  // --- DEBUG LOG: Initial Render State ---
  // --- END DEBUG LOG ---

  useEffect(() => {
    // Find the actual custom other value (not 'Other' itself, but what the user typed)
    const actualCustomValue = (value || []).find(
      (v) => !choices.includes(v) && v !== "Other"
    );
    // Check if the generic 'Other' string is present in the value prop
    const isGenericOtherPresent = (value || []).includes("Other");

    // --- DEBUG LOG: useEffect - Derived values ---
    // --- END DEBUG LOG ---

    if (actualCustomValue) {
      setOtherText(actualCustomValue);
      setIsOtherChecked(true);
    } else if (isGenericOtherPresent) {
      // If 'Other' is marked, but no custom text, then the box should be checked
      // and the text input should be empty.
      // --- DEBUG LOG: useEffect - Found generic 'Other' without custom value ---
      // --- END DEBUG LOG ---
      setOtherText("");
      setIsOtherChecked(true);
    } else {
      // If neither custom value nor generic 'Other' is present, then "Other" is not selected.
      // --- DEBUG LOG: useEffect - 'Other' not selected ---
      // --- END DEBUG LOG ---
      setOtherText("");
      setIsOtherChecked(false);
    }
  }, [value, choices]); // Re-run when parent's value prop changes or choices change

  const handleCheckboxChange = (choice) => {
    const newSelectedValues = new Set(selectedValues);
    if (newSelectedValues.has(choice)) {
      newSelectedValues.delete(choice);
    } else {
      newSelectedValues.add(choice);
    }
    onChange(placeholderName, Array.from(newSelectedValues));
  };

  const handleOtherCheckboxChange = () => {
    const willBeChecked = !isOtherChecked;
    // --- DEBUG LOG: handleOtherCheckboxChange Start ---
    // --- END DEBUG LOG ---

    setIsOtherChecked(willBeChecked); // Optimistic UI update

    const newSelectedValues = new Set(selectedValues);

    // Clean up any existing custom 'other' text or the generic 'Other' placeholder
    // This loop efficiently removes *any* non-predefined, non-'Other' values.
    newSelectedValues.forEach((val) => {
      if (!choices.includes(val) && val !== "Other") {
        newSelectedValues.delete(val);
      }
    });
    newSelectedValues.delete("Other"); // Always remove the generic 'Other' before re-adding it

    // --- DEBUG LOG: handleOtherCheckboxChange - After Cleanup ---
    // --- END DEBUG LOG ---

    if (willBeChecked) {
      if (otherText.trim()) {
        newSelectedValues.add(otherText.trim()); // Add actual text if present
      } else {
        // If checkbox is checked but no custom text, add 'Other' as a placeholder
        newSelectedValues.add("Other");
      }
      // --- DEBUG LOG: handleOtherCheckboxChange - 'Other' Checked Logic ---
      // --- END DEBUG LOG ---
    } else {
      // If checkbox is checked but no custom text, add 'Other' as a placeholder
    }

    // --- DEBUG LOG: handleOtherCheckboxChange - Final onChange call ---
    // --- END DEBUG LOG ---
    onChange(placeholderName, Array.from(newSelectedValues));
  };

  const handleOtherTextChange = (e) => {
    const newText = e.target.value;
    setOtherText(newText);

    setOtherText(newText); // Update local state for the textbox

    if (isOtherChecked) {
      const newSelectedValues = new Set(selectedValues);

      // Clean up previous custom 'other' text (if any) and the generic 'Other' placeholder
      newSelectedValues.forEach((val) => {
        if (!choices.includes(val) && val !== "Other") {
          newSelectedValues.delete(val);
        }
      });
      newSelectedValues.delete("Other"); // Ensure generic 'Other' is handled if it's there

      // Add the new text and the 'Other' identifier
      if (newText) {
        newSelectedValues.add(newText);
      } else {
        // If the text is empty, just add "Other" to show it's checked
        newSelectedValues.add("Other");
      }
      onChange(placeholderName, Array.from(newSelectedValues));
    }
  };

  return (
    <div className="space-y-2">
      {choices.map((choice) => (
        <div key={choice} className="flex items-center">
          <input
            type="checkbox"
            id={`${placeholderName}-${choice}`}
            name={placeholderName}
            // --- DEBUG LOG: Checkbox `checked` prop ---
            // --- END DEBUG LOG ---
            checked={selectedValues.has(choice)}
            onChange={() => handleCheckboxChange(choice)}
            className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300 rounded"
          />
          <label
            htmlFor={`${placeholderName}-${choice}`}
            className="ml-3 text-sm text-gray-700"
          >
            {choice}
          </label>
        </div>
      ))}

      {/* "Other" checkbox and text input */}
      <div className="flex items-center mt-2">
        <input
          type="checkbox"
          id={`${placeholderName}-other`}
          name={placeholderName}
          // --- DEBUG LOG: "Other" checkbox `checked` prop ---
          // --- END DEBUG LOG ---
          checked={isOtherChecked} // This is the key prop for the checkbox itself
          onChange={handleOtherCheckboxChange}
          className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300 rounded"
        />
        <label
          htmlFor={`${placeholderName}-other`}
          className="ml-3 text-sm text-gray-700"
        >
          Other:
        </label>
        {isOtherChecked && ( // Textbox visibility controlled by isOtherChecked
          <input
            type="text"
            className="ml-2 flex-grow border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            value={otherText} // Textbox value controlled by local otherText state
            onChange={handleOtherTextChange}
            placeholder="Enter custom document"
          />
        )}
      </div>
    </div>
  );
};

export default CheckboxGroupWithOther;

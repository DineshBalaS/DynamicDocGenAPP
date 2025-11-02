// src/components/common/CheckboxGroupWithOther.jsx

import React, { useState, useEffect } from 'react';

const CheckboxGroupWithOther = ({ placeholderName, choices, value, onChange }) => {
  const selectedValues = new Set(value || []);
  const [otherText, setOtherText] = useState('');
  const [isOtherChecked, setIsOtherChecked] = useState(false);

  // --- DEBUG LOG: Initial Render State ---
  console.log(`[CheckboxGroup ${placeholderName}] Render - otherText: '${otherText}', isOtherChecked: ${isOtherChecked}, value prop:`, value);
  // --- END DEBUG LOG ---


  useEffect(() => {
    // --- DEBUG LOG: useEffect Start ---
    console.log(`[CheckboxGroup ${placeholderName}] useEffect start. Current value prop:`, value);
    // --- END DEBUG LOG ---

    // Find the actual custom other value (not 'Other' itself, but what the user typed)
    const actualCustomValue = (value || []).find(v => !choices.includes(v) && v !== 'Other');
    // Check if the generic 'Other' string is present in the value prop
    const isGenericOtherPresent = (value || []).includes('Other');

    // --- DEBUG LOG: useEffect - Derived values ---
    console.log(`[CheckboxGroup ${placeholderName}] useEffect - actualCustomValue: '${actualCustomValue}', isGenericOtherPresent: ${isGenericOtherPresent}`);
    // --- END DEBUG LOG ---

    if (actualCustomValue) {
      // If there's actual custom text, set both text and checkbox state
      // --- DEBUG LOG: useEffect - Found actualCustomValue ---
      console.log(`[CheckboxGroup ${placeholderName}] useEffect - Setting otherText to '${actualCustomValue}' and isOtherChecked to TRUE (from custom value).`);
      // --- END DEBUG LOG ---
      setOtherText(actualCustomValue);
      setIsOtherChecked(true);
    } else if (isGenericOtherPresent) {
      // If 'Other' is marked, but no custom text, then the box should be checked
      // and the text input should be empty.
      // --- DEBUG LOG: useEffect - Found generic 'Other' without custom value ---
      console.log(`[CheckboxGroup ${placeholderName}] useEffect - Setting otherText to '' and isOtherChecked to TRUE (from generic 'Other').`);
      // --- END DEBUG LOG ---
      setOtherText('');
      setIsOtherChecked(true);
    } else {
      // If neither custom value nor generic 'Other' is present, then "Other" is not selected.
      // --- DEBUG LOG: useEffect - 'Other' not selected ---
      console.log(`[CheckboxGroup ${placeholderName}] useEffect - Setting otherText to '' and isOtherChecked to FALSE.`);
      // --- END DEBUG LOG ---
      setOtherText('');
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
    // Ensure 'Other' is removed if a standard choice is being added/removed AND no custom text is present
    if (newSelectedValues.has(choice) && !otherText.trim()) { // If adding a standard choice and no custom text, maybe "Other" isn't relevant
         // This logic might need refinement if 'Other' should stay checked regardless of other choices
         // For now, let's keep it simple based on your current intent.
    }
    onChange(placeholderName, Array.from(newSelectedValues));
  };

  const handleOtherCheckboxChange = () => {
    const willBeChecked = !isOtherChecked;
    // --- DEBUG LOG: handleOtherCheckboxChange Start ---
    console.log(`[CheckboxGroup ${placeholderName}] handleOtherCheckboxChange fired. isOtherChecked: ${isOtherChecked}, willBeChecked: ${willBeChecked}, current otherText: '${otherText}'`);
    // --- END DEBUG LOG ---

    setIsOtherChecked(willBeChecked); // Optimistic UI update

    const newSelectedValues = new Set(selectedValues);

    // Clean up any existing custom 'other' text or the generic 'Other' placeholder
    // This loop efficiently removes *any* non-predefined, non-'Other' values.
    newSelectedValues.forEach(val => {
      if (!choices.includes(val) && val !== 'Other') {
        newSelectedValues.delete(val);
      }
    });
    newSelectedValues.delete('Other'); // Always remove the generic 'Other' before re-adding it

    // --- DEBUG LOG: handleOtherCheckboxChange - After Cleanup ---
    console.log(`[CheckboxGroup ${placeholderName}] handleOtherCheckboxChange - newSelectedValues after cleanup:`, Array.from(newSelectedValues));
    // --- END DEBUG LOG ---


    if (willBeChecked) {
      if (otherText.trim()) {
        newSelectedValues.add(otherText.trim()); // Add actual text if present
      } else {
        // If checkbox is checked but no custom text, add 'Other' as a placeholder
        newSelectedValues.add('Other');
      }
      // --- DEBUG LOG: handleOtherCheckboxChange - 'Other' Checked Logic ---
      console.log(`[CheckboxGroup ${placeholderName}] handleOtherCheckboxChange - Adding 'Other'. If text: '${otherText.trim()}' added.`);
      // --- END DEBUG LOG ---
    } else {
      // If checkbox is checked but no custom text, add 'Other' as a placeholder
    }

    // --- DEBUG LOG: handleOtherCheckboxChange - Final onChange call ---
    console.log(`[CheckboxGroup ${placeholderName}] handleOtherCheckboxChange - Calling onChange with:`, Array.from(newSelectedValues));
    // --- END DEBUG LOG ---
    onChange(placeholderName, Array.from(newSelectedValues));
  };


  const handleOtherTextChange = (e) => {
    const newText = e.target.value;
    // --- DEBUG LOG: handleOtherTextChange Start ---
    console.log(`[CheckboxGroup ${placeholderName}] handleOtherTextChange fired. newText: '${newText}', current isOtherChecked: ${isOtherChecked}`);
    // --- END DEBUG LOG ---

    setOtherText(newText); // Update local state for the textbox

    if (isOtherChecked) {
      const newSelectedValues = new Set(selectedValues);

      // Clean up previous custom 'other' text (if any) and the generic 'Other' placeholder
      newSelectedValues.forEach(val => {
        if (!choices.includes(val) && val !== 'Other') {
          newSelectedValues.delete(val);
        }
      });
      newSelectedValues.delete('Other'); // Ensure generic 'Other' is handled if it's there

      // --- DEBUG LOG: handleOtherTextChange - After Cleanup ---
      console.log(`[CheckboxGroup ${placeholderName}] handleOtherTextChange - newSelectedValues after cleanup:`, Array.from(newSelectedValues));
      // --- END DEBUG LOG ---

      // Add the new text and the 'Other' identifier
      if (newText) { // Add the raw newText if it's not empty
        newSelectedValues.add(newText);
       }

      // --- DEBUG LOG: handleOtherTextChange - Final onChange call ---
      console.log(`[CheckboxGroup ${placeholderName}] handleOtherTextChange - Calling onChange with:`, Array.from(newSelectedValues));
      // --- END DEBUG LOG ---
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
            // console.log(`[CheckboxGroup ${placeholderName}] Rendering checkbox for '${choice}'. Checked: ${selectedValues.has(choice)}`);
            // --- END DEBUG LOG ---
            checked={selectedValues.has(choice)}
            onChange={() => handleCheckboxChange(choice)}
            className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300 rounded"
          />
          <label htmlFor={`${placeholderName}-${choice}`} className="ml-3 text-sm text-gray-700">
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
          // console.log(`[CheckboxGroup ${placeholderName}] Rendering "Other" checkbox. Checked: ${isOtherChecked}`);
          // --- END DEBUG LOG ---
          checked={isOtherChecked} // This is the key prop for the checkbox itself
          onChange={handleOtherCheckboxChange}
          className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300 rounded"
        />
        <label htmlFor={`${placeholderName}-other`} className="ml-3 text-sm text-gray-700">
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
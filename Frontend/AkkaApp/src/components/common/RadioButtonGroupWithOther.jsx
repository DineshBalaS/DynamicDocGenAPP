// src/components/common/RadioButtonGroupWithOther.jsx

import React, { useState, useEffect } from "react";

/**
 * A component for rendering a list of radio buttons, including a
 * dynamic "Other" option with a text input.
 *
 * @param {string} placeholderName - The 'name' of the placeholder.
 * @param {string[]} choices - An array of standard string choices.
 * @param {string} value - The currently selected value (a single string).
 * @param {function} onChange - Callback function: (placeholderName, newValue) => {}
 */
const RadioButtonGroupWithOther = ({
  placeholderName,
  choices,
  value,
  onChange,
}) => {
  const [otherText, setOtherText] = useState("");
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  // This effect syncs the component's state (which radio is checked,
  // what's in the 'Other' text box) with the parent's `value` prop.
  useEffect(() => {
    // Check if the current value is one of the standard choices
    const isStandardChoice = choices.includes(value);

    if (value && !isStandardChoice) {
      // --- Case 1: The value is a custom "Other" string ---
      // This happens when typing or restoring session data.
      // We must select "Other" and set the text.
      console.log(`[RadioGroup] useEffect: '${value}' is an 'Other' value.`);
      setIsOtherSelected(true);
      setOtherText(value);
    } else if (value && isStandardChoice) {
      // --- Case 2: The value is a standard choice ---
      // This happens when clicking a standard radio or restoring session data.
      // We must de-select "Other" and clear the text.
      console.log(`[RadioGroup] useEffect: '${value}' is a standard value.`);
      setIsOtherSelected(false);
      setOtherText("");
    } else if (!value) {
      // --- Case 3: The value is empty ("") ---
      // This is the ambiguous case that caused the flicker.
      // The user might have just clicked "Other" (so isOtherSelected should be true)
      // OR they clicked from "Other" to a standard choice (isOtherSelected should be false).
      // We should NOT set isOtherSelected(false) here. We only clear the text
      // if "Other" is not selected.
      console.log(`[RadioGroup] useEffect: value is empty.`);
      if (!isOtherSelected) {
        setOtherText("");
      }
    }
  }, [value, choices, isOtherSelected]);

  // Handles clicking a standard (non-Other) radio button
  const handleStandardChange = (choice) => {
    console.log(`[RadioGroup] Standard choice selected: ${choice}`); // DEBUG LOG
    setIsOtherSelected(false); // Uncheck 'Other'
    setOtherText(""); // Clear 'Other' text
    onChange(placeholderName, choice); // Update parent
  };

  // Handles clicking the "Other" radio button
  const handleOtherRadioChange = () => {
    if (isOtherSelected) return; // Do nothing if it's already selected

    console.log(`[RadioGroup] 'Other' radio selected.`); // DEBUG LOG
    setIsOtherSelected(true);
    // Update parent with the current 'Other' text (which might be empty)
    onChange(placeholderName, otherText.trim());
  };

  // Handles typing in the "Other" text input
  const handleOtherTextChange = (e) => {
    const newText = e.target.value;
    console.log(`[RadioGroup] 'Other' text changing: ${newText}`); // DEBUG LOG

    setOtherText(newText); // Update local text state

    // If 'Other' isn't selected, select it now.
    if (!isOtherSelected) {
      setIsOtherSelected(true);
    }

    // Update parent with the new custom text
    onChange(placeholderName, newText);
  };

  return (
    <div className="space-y-2">
      {choices.map((choice) => (
        <div key={choice} className="flex items-center">
          <input
            type="radio"
            id={`${placeholderName}-${choice}`}
            name={placeholderName}
            checked={!isOtherSelected && value === choice}
            onChange={() => handleStandardChange(choice)}
            className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300"
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
          type="radio"
          id={`${placeholderName}-other`}
          name={placeholderName}
          checked={isOtherSelected}
          onChange={handleOtherRadioChange}
          className="focus:ring-teal-500 h-4 w-4 text-teal-600 border-gray-300"
        />
        <label
          htmlFor={`${placeholderName}-other`}
          className="ml-3 text-sm text-gray-700"
        >
          Other:
        </label>
        {isOtherSelected && (
          <input
            type="text"
            className="ml-2 flex-grow border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            value={otherText}
            onChange={handleOtherTextChange}
            placeholder="Enter custom choice"
          />
        )}
      </div>
    </div>
  );
};

export default RadioButtonGroupWithOther;

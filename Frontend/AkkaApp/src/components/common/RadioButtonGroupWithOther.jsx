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
      // The value is not standard, so it must be an "Other" value.
      console.log(`[RadioGroup] useEffect: '${value}' is an 'Other' value.`); // DEBUG LOG
      setIsOtherSelected(true);
      setOtherText(value);
    } else {
      // The value is a standard choice or empty.
      console.log(`[RadioGroup] useEffect: '${value}' is a standard value.`); // DEBUG LOG
      setIsOtherSelected(false);
      setOtherText("");
    }
  }, [value, choices]);

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

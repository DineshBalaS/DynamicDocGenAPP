import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import ImageUploader from "./ImageUploader";
import CheckboxGroupWithOther from "./CheckboxGroupWithOther";
import MultiTextInput from "./MultiTextInput";

// --- Configuration ---
// These must be imported from your constants files.
// We are assuming you have:
// 1. `src/constants/config.js` exporting `S3_BUCKET_BASE_URL`
// 2. `src/constants/listChoices.js` exporting `PREDEFINED_LIST_CHOICES`
import S3Image from "./S3Image"; // Import our new smart component
import { PREDEFINED_LIST_CHOICES } from "../../constants/listChoices";

// --- Helper Icons ---
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const SaveIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const CancelIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
// --- End Helper Icons ---

/**
 * A row on the ReviewPage that can be toggled between read-only and edit modes.
 * Manages its own edit state and renders the correct component for text, image, or list types.
 */
function EditableReviewRow({
  placeholderKey, // The true key, e.g., "client_name"
  label, // The formatted label, e.g., "Client Name"
  type,
  value, // The S3 key for images, text string for text, array for lists
  onUpdate,
  onEditStart,
  onEditEnd,
  isDisabled, // True if another row is being edited
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debug log for component render
  console.log(
    `%c[EditableReviewRow: ${label}] Render - isEditing: ${isEditing}, isDisabled: ${isDisabled}, type: ${type}`,
    "color: purple"
  );

  // Sync local state if the main prop value changes from outside
  useEffect(() => {
    if (!isEditing) {
      setCurrentValue(value);
    }
  }, [value, isEditing]);

  const handleEditClick = () => {
    console.log(`[EditableReviewRow: ${label}] Edit Clicked. isDisabled: ${isDisabled}`);
    if (isDisabled) return;

    onEditStart(); // Tell parent (ReviewPage) we are starting
    setIsEditing(true);

    // For image and list types, we open a modal immediately
    if (type === "image" || type === "list") {
      setIsModalOpen(true);
    }
  };

  const handleCancelClick = () => {
    console.log(`[EditableReviewRow: ${label}] Cancel Clicked`);
    setIsEditing(false);
    setCurrentValue(value); // Revert local state to original prop value
    onEditEnd(); // Tell parent we are done
  };

  const handleUpdateClick = () => {
    console.log(`[EditableReviewRow: ${label}] Update Clicked. New value:`, currentValue);
    onUpdate(placeholderKey, currentValue); // Send new value to parent
    setIsEditing(false);
    onEditEnd(); // Tell parent we are done
  };

  // --- Modal-specific Handlers ---
  const handleModalSave = () => {
    console.log(`[EditableReviewRow: ${label}] Modal Save. New value:`, currentValue);
    setIsModalOpen(false);
    onUpdate(placeholderKey, currentValue); // Save the value from the modal
    setIsEditing(false);
    onEditEnd();
  };

  const handleModalCancel = () => {
    console.log(`[EditableReviewRow: ${label}] Modal Cancel.`);
    setIsModalOpen(false);
    setCurrentValue(value); // Discard changes made in the modal
    setIsEditing(false);
    onEditEnd();
  };

  // Handler for ImageUploader success (called from within the modal)
  const handleImageUploadSuccess = (pKey, s3_key) => {
    console.log(`[EditableReviewRow: ${label}] Image Upload Success. s3_key:`, s3_key);
    // We only care about the s3_key, which is our new value
    setCurrentValue(s3_key);
    // We don't save/close here, we wait for the user to hit "Save" on the modal
  };

  // Handler for List component changes (called from within the modal)
  const handleListChange = (pKey, newValueArray) => {
    console.log(`[EditableReviewRow: ${label}] List Change. newValue:`, newValueArray);
    setCurrentValue(newValueArray);
  };

  // --- Read-only View (Default) ---
  const renderReadOnlyView = () => {
    let displayValue;

    if (type === "image") {
      displayValue = (
        <S3Image
          s3Key={value} // Pass the s3_key
          alt={`${label} preview`}
          className="w-40 h-auto rounded-md border border-gray-300"
        />
      );
    } else if (type === "list") {
      const listItems = Array.isArray(value)
        ? value.filter((item) => String(item).trim() !== "")
        : [];
      displayValue =
        listItems.length > 0 ? (
          <ul className="list-disc list-inside space-y-1">
            {listItems.map((item, index) => (
              <li key={index} className="break-words">
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <i className="text-gray-400">None</i>
        );
    } else {
      // Text type
      displayValue =
        value && String(value).trim() !== "" ? (
          <span className="break-words">{String(value)}</span>
        ) : (
          <i className="text-gray-400">Not provided</i>
        );
    }

    return (
      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex justify-between items-start">
        <div>{displayValue}</div>
        <button
          onClick={handleEditClick}
          disabled={isDisabled}
          className="p-1 rounded-md text-gray-500 hover:text-teal-600 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
          aria-label={`Edit ${label}`}
        >
          <EditIcon />
        </button>
      </dd>
    );
  };

  // --- Edit View (for Text type only) ---
  const renderTextEditView = () => (
    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleUpdateClick();
            if (e.key === "Escape") handleCancelClick();
          }}
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
        />
        <button
          onClick={handleUpdateClick}
          className="p-2 rounded-md text-white bg-teal-600 hover:bg-teal-700"
          aria-label="Save changes"
        >
          <SaveIcon />
        </button>
        <button
          onClick={handleCancelClick}
          className="p-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
          aria-label="Cancel changes"
        >
          <CancelIcon />
        </button>
      </div>
    </dd>
  );

  // --- Modal View (for Image and List types) ---
  const renderModalEditView = () => (
    <Modal
      isOpen={isModalOpen}
      onClose={handleModalCancel} // Cancel if they click outside
      onConfirm={handleModalSave}
      onCancel={handleModalCancel} // Explicit cancel button
      title={`Edit ${label}`}
      confirmText="Update"
      cancelText="Cancel"
    >
      {/* Render the correct edit component inside the modal */}
      {type === "image" && (
        <ImageUploader
          placeholderName={placeholderKey}
          onUploadSuccess={handleImageUploadSuccess}
          initialS3Key={currentValue} // Pass the s3_key
        />
      )}

      {type === "list" &&
        (PREDEFINED_LIST_CHOICES[placeholderKey] ? (
          <CheckboxGroupWithOther
            placeholderName={placeholderKey}
            choices={PREDEFINED_LIST_CHOICES[placeholderKey]}
            value={currentValue}
            onChange={handleListChange}
          />
        ) : (
          <MultiTextInput
            placeholderName={placeholderKey}
            value={currentValue}
            onChange={handleListChange}
          />
        ))}
    </Modal>
  );

  return (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-gray-600 capitalize">
        {label}
      </dt>

      {isEditing && type === "text"
        ? renderTextEditView()
        : renderReadOnlyView()}

      {(type === "image" || type === "list") && renderModalEditView()}
    </div>
  );
}

export default EditableReviewRow;
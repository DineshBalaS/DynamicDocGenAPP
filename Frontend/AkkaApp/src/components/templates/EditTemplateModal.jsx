import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";

/**
 * A modal component for editing a template's name and description.
 * It manages its own form state and validation.
 *
 * @param {boolean} isOpen - Whether the modal is open.
 * @param {function} onClose - Function to call when the modal should close.
 * @param {function} onSave - Async function to call with formData. Must be a Promise that throws an error on failure.
 * @param {Object|null} template - The template object to edit.
 */
function EditTemplateModal({ isOpen, onClose, onSave, template }) {
  // Internal state for the form
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // This effect syncs the modal's internal form state with the
  // template prop whenever the modal is opened (i.e., when 'template' changes).
  useEffect(() => {
    // Only update form data if a valid template is passed
    if (template) {
      console.log(
        "DEBUG [EditTemplateModal]: Syncing form data for template:",
        template.name
      );
      setFormData({
        name: template.name,
        description: template.description || "", // Ensure description is not null/undefined
      });
      // Clear all transient state when a new template is passed in
      setError(null);
      setIsSaving(false);
    }
  }, [template]); // Dependency array: only runs when the template object changes

  // Handles internal form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Wrapper for the save function
  const handleSave = async () => {
    if (isSaving) return; // Prevent double-clicks

    // Rule 3: Client-side validation for empty name
    if (!formData.name.trim()) {
      console.log(
        "DEBUG [EditTemplateModal]: Validation failed - Name is empty."
      );
      setError("Name cannot be empty.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      console.log(
        `DEBUG [EditTemplateModal]: Calling onSave prop with data:`,
        formData
      );
      // Call the onSave prop (which is handleSaveEdit from DashboardPage)
      // This prop is expected to be an async function that will
      // either resolve on success or throw an error on failure.
      await onSave(formData);

      // On success, the parent (DashboardPage) is responsible for closing the modal
      // by updating its state, which will change the 'isOpen' prop.
    } catch (apiError) {
      // Rule 2: Handle duplicate name error (or other errors)
      console.error(
        "DEBUG [EditTemplateModal]: onSave prop threw an error:",
        apiError
      );
      // Display the error message from the API
      setError(apiError.message || "An unknown error occurred.");
    } finally {
      setIsSaving(false); // Stop loading state
    }
  };

  // Wrapper for the close function
  const handleClose = () => {
    if (isSaving) return; // Don't close while saving
    console.log("DEBUG [EditTemplateModal]: Closing modal.");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleSave}
      title="Edit Template"
      confirmText={isSaving ? "Saving..." : "Save"}
      cancelText="Cancel"
      confirmButtonVariant="primary"
    >
      {/* Form is wrapped in the modal children.
        We use onSubmit here to allow pressing Enter to save.
      */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label
              htmlFor="templateName"
              className="block text-sm font-medium text-gray-700"
            >
              Template Name
            </label>
            <input
              type="text"
              name="name"
              id="templateName"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
              disabled={isSaving}
            />
          </div>

          {/* Description Field */}
          <div>
            <label
              htmlFor="templateDescription"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              name="description"
              id="templateDescription"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
              placeholder="Add a brief description..."
              disabled={isSaving}
            />
          </div>

          {/* Modal Error Display */}
          {error && (
            <div className="text-sm text-red-600" role="alert">
              {error}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}

export default EditTemplateModal;

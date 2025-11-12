import React from "react";
import { useTemplateForm } from "../../hooks/useTemplateForm";
import SidePanel from "../ui/SidePanel";

/**
 * Renders the form content inside a SidePanel for editing a template's
 * name and description.
 *
 * This component is "dumb" and gets all its state and logic from the
 * useTemplateForm hook.
 *
 * @param {boolean} isOpen - Whether the panel is open.
 * @param {function} onClose - Function to call when the panel should close.
 * @param {function} onSave - Async function to call with formData.
 * @param {Object|null} template - The template object to edit.
 */
function EditTemplatePanel({ isOpen, onClose, onSave, template }) {
  console.log("DEBUG: EditTemplatePanel.jsx (v2 - redesign) is rendering.");
  // 1. Get all state and logic from the dedicated hook
  const {
    formData,
    isSaving,
    error,
    handleChange,
    handleSubmit, // This is now our form's onSubmit handler
  } = useTemplateForm({ template, onSave });

  // 3. Render the SidePanel and pass in the form as children
  return (
    <SidePanel isOpen={isOpen} onClose={onClose} title="Edit Template">
      {/* This form is connected to the hook's handleSubmit.
        The form JSX is identical to what was in EditTemplateModal.jsx 
        for visual consistency.
      */}
      <form
        id="edit-template-form"
        onSubmit={handleSubmit}
        className="flex h-full flex-col"
      >
        {/* Form Fields (Top Section) */}
        <div className="flex-1 space-y-6">
          {/* Template Name Field */}
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
              className="mt-2 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm transition-colors hover:border-teal-500 focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
              disabled={isSaving}
              aria-describedby="templateName-error"
            />
            {/* Inline Validation Error */}
            {error.name && (
              <>
                {console.log("DEBUG: Rendering inline error:", error.name)}
                <p
                  className="mt-1 text-sm text-red-600"
                  id="templateName-error"
                >
                  {error.name}
                </p>
              </>
            )}
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
              className="mt-2 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm transition-colors hover:border-teal-500 focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
              placeholder="Add a brief description..."
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Footer with Buttons (Bottom Section) */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          {/* General API Error */}
          {error.general && (
            <>
              {console.log("DEBUG: Rendering general error:", error.general)}
              <div className="text-sm text-red-600" role="alert">
                {error.general}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit" // Stays the same
              form="edit-template-form" // Stays the same
              disabled={isSaving}
              className="inline-flex justify-center rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>
    </SidePanel>
  );
}

export default EditTemplatePanel;

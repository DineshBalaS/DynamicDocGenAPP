import { useState, useEffect } from "react";

/**
 * A custom hook to manage the form state and save logic for editing a template.
 * This abstracts all business logic from the UI component.
 *
 * @param {Object} options
 * @param {Object|null} options.template - The template object being edited.
 * @param {function} options.onSave - An async function that will be called with the
 * formData when the user saves. It is expected
 * to return a promise and throw an error on failure.
 * @returns {Object} An object containing the form state and handlers.
 */
export function useTemplateForm({ template, onSave }) {
  // Internal state for the form
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * This effect syncs the hook's internal form state with the
   * template prop whenever it changes (i.e., when the panel is opened).
   * It also resets any previous errors or saving states.
   */
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || "", // Ensure description is not null
      });
      // Clear all transient state when a new template is passed in
      setError(null);
      setIsSaving(false);
    } else {
      // If template is null (panel closed), reset form
      setFormData({ name: "", description: "" });
      setError(null);
      setIsSaving(false);
    }
  }, [template]);

  /**
   * Handles changes to form inputs and updates the formData state.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  /**
   * Handles the form submission.
   * Performs validation, sets saving state, and calls the onSave prop.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // 1. Client-side validation
    if (!formData.name.trim()) {
      setError("Template Name cannot be empty.");
      return;
    }

    // 2. Set saving state
    setError(null);
    setIsSaving(true);

    try {
      // 3. Call the async onSave function passed from the parent
      await onSave(formData);
      // Success is handled by the parent (i.e., closing the panel)
    } catch (err) {
      // 4. Handle errors from the API
      setError(err.message || "An unknown error occurred.");
    } finally {
      // 5. Reset saving state
      setIsSaving(false);
    }
  };

  return {
    formData,
    isSaving,
    error,
    handleChange,
    handleSubmit,
  };
}

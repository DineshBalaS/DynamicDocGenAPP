import { useState, useCallback } from "react";

/**
 * Custom hook to manage the in-place editing state of the ReviewPage.
 * This ensures only one row can be edited at a time.
 */
export const useReviewPageEditor = () => {

  // 'editingKey' stores the `key` (placeholder name) of the row currently being edited.
  // It's `null` if no row is in edit mode.
  const [editingKey, setEditingKey] = useState(null);

  /**
   * A boolean flag derived from state for easy use in components.
   * True if any row is currently being edited.
   */
  const isEditing = editingKey !== null;

  /**
   * Sets the specified row 'key' as the one being edited.
   * This is passed to EditableReviewRow and called by its 'onEditStart' prop.
   */
  const startEditing = useCallback((key) => {
    console.log(`[useReviewPageEditor] START editing for key: ${key}`); // DEBUG LOG
    setEditingKey(key);
  }, []);

  /**
   * Clears the edit mode by setting the editingKey back to null.
   * This is passed to EditableReviewRow and called by its 'onEditEnd' prop (or onUpdate/onCancel).
   */
  const endEditing = useCallback(() => {
    console.log(`[useReviewPageEditor] END editing. Current key was: ${editingKey}`); // DEBUG LOG
    setEditingKey(null);
  }, [editingKey]); // Dependency added for logging

  return {
    isEditing,
    editingKey,
    startEditing,
    endEditing,
  };
};
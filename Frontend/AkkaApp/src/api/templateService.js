// src/api/templateService.js

import apiClient from './axiosConfig';

/**
 * Fetches the list of all available templates from the backend.
 * @returns {Promise<Array>} A promise that resolves to an array of template objects.
 */
export const getTemplates = async () => {
  try {
    const response = await apiClient.get('/api/templates');
    return response.data;
  } catch (error) {
    // Log the detailed error for debugging and throw a user-friendly message
    console.error('Failed to fetch templates:', error);
    throw new Error('Could not connect to the server to get templates.');
  }
};

/**
 * Uploads a .pptx file for analysis to extract placeholders.
 * @param {File} file - The .pptx file to analyze.
 * @param {Function} onUploadProgress - A callback to track upload progress.
 * @returns {Promise<Array>} A promise that resolves to an array of placeholder objects.
 */
export const uploadForAnalysis = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    return response.data;
  } catch (error) {
    console.error('File analysis failed:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to analyze file.');
  }
};

/**
 * Saves a new template to the backend.
 * @param {File} file - The original .pptx file.
 * @param {string} templateName - The name for the new template.
 * @param {Array} placeholders - The final list of placeholder objects.
 * @param {Function} onUploadProgress - A callback to track upload progress.
 * @returns {Promise<Object>} A promise that resolves to the new template object.
 */
export const saveTemplate = async (file, templateName, placeholders, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('templateName', templateName);
  formData.append('placeholders', JSON.stringify(placeholders));

  try {
    const response = await apiClient.post('/api/save_template', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    return response.data;
  } catch (error) {
    console.error('Save template failed:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to save template.');
  }
};
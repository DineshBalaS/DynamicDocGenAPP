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
 * NEW: Fetches the details for a single template, including its placeholders.
 * Note: This assumes a `GET /api/templates/:id` endpoint exists on the backend.
 * @param {string} templateId - The ID of the template to fetch.
 * @returns {Promise<Object>} A promise that resolves to the template object.
 */
export const getTemplateDetails = async (templateId) => {
    try {
        // This endpoint needs to be created on the backend.
        // It should return the full template object, including the 'placeholders' array.
        const response = await apiClient.get(`/api/templates/${templateId}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch template details for ID ${templateId}:`, error);
        throw new Error('Could not load the template details from the server.');
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

/**
 * @param {File} file - The image file to upload.
 * @returns {Promise<Object>} A promise that resolves to an object containing the s3_key.
 */
export const uploadAsset = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await apiClient.post('/api/assets/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data; // Expected: { s3_key: "..." }
    } catch (error) {
        console.error('Asset upload failed:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error || 'Failed to upload the asset.');
    }
};

/**
 * @param {string} templateId - The ID of the template to use.
 * @param {Object} data - An object with placeholder names as keys and their values.
 * @param {Function} onUploadProgress - A callback to track the generation progress.
 * @returns {Promise<Object>} A promise that resolves to an object with the file blob and filename.
 */
export const generatePresentation = async (templateId, data, onUploadProgress) => {
    try {
        const response = await apiClient.post('/api/generate', { templateId, data }, {
            responseType: 'blob', // Important: tells axios to expect a binary file response
            onUploadProgress, // For tracking the request itself
        });
        
        // Extract filename from the Content-Disposition header
        const contentDisposition = response.headers['content-disposition'];
        let filename = 'presentation.pptx'; // A default fallback filename
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch && filenameMatch.length > 1) {
                filename = filenameMatch[1];
            }
        }
        
        return {
            blob: response.data,
            filename: filename,
        };
    } catch (error) {
        console.error('Presentation generation failed:', error);
        throw new Error('Could not generate the presentation file.');
    }
};

/**
 * Deletes a template from the database.
 * @param {number} templateId - The ID of the template to delete.
 * @returns {Promise<Object>} A promise that resolves to the success message from the backend.
 */
export const deleteTemplate = async (templateId) => {
  try {
    const response = await apiClient.delete(`/api/templates/${templateId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete template ${templateId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to delete template.');
  }
};
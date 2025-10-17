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

// We will add other functions here as we build out the features:
// export const uploadForAnalysis = async (file) => { ... };
// export const saveTemplate = async (templateData) => { ... };
// export const generatePresentation = async (generationData) => { ... };
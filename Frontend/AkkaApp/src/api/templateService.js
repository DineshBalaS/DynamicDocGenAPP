// src/api/templateService.js

import apiClient from "./axiosConfig";

/**
 * Fetches the list of all available templates from the backend.
 * @returns {Promise<Array>} A promise that resolves to an array of template objects.
 */
export const getTemplates = async () => {
  try {
    const response = await apiClient.get("/api/templates");
    return response.data;
  } catch (error) {
    // Log the detailed error for debugging and throw a user-friendly message
    console.error("Failed to fetch templates:", error);
    throw new Error("Could not connect to the server to get templates.");
  }
};

/**
 * Fetches the list of soft-deleted (trashed) templates from the backend.
 * @returns {Promise<Array>} A promise that resolves to an array of trashed template objects.
 */
export const getTrashedTemplates = async () => {
  try {
    const response = await apiClient.get("/api/templates/trash");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch trashed templates:", error);
    throw new Error("Could not load trashed items from the server.");
  }
};

/**
 * Restores a soft-deleted template from the trash.
 * @param {number|string} templateId - The ID of the template to restore.
 * @returns {Promise<Object>} A promise that resolves to the success message from the backend.
 */
export const restoreTemplate = async (templateId) => {
  try {
    const response = await apiClient.post(
      `/api/templates/${templateId}/restore`
    );
    return response.data; // Expected: { message: "Template restored successfully." }
  } catch (error) {
    console.error(
      `Failed to restore template ${templateId}:`,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.error || "Failed to restore template."
    );
  }
};

/**
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
    console.error(
      `Failed to fetch template details for ID ${templateId}:`,
      error
    );
    throw new Error("Could not load the template details from the server.");
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
  formData.append("file", file);

  try {
    const response = await apiClient.post("/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    });
    return response.data;
  } catch (error) {
    console.error(
      "File analysis failed:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.error || "Failed to analyze file.");
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
export const saveTemplate = async (
  file,
  templateName,
  placeholders,
  onUploadProgress
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("templateName", templateName);
  formData.append("placeholders", JSON.stringify(placeholders));

  try {
    const response = await apiClient.post("/api/save_template", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Save template failed:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.error || "Failed to save template.");
  }
};

/**
 * @param {File} file - The image file to upload.
 * @returns {Promise<Object>} A promise that resolves to an object containing the s3_key.
 */
export const uploadAsset = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await apiClient.post("/api/assets/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data; // Expected: { s3_key: "..." }
  } catch (error) {
    console.error(
      "Asset upload failed:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.error || "Failed to upload the asset."
    );
  }
};

/**
 * @param {string} templateId - The ID of the template to use.
 * @param {Object} data - An object with placeholder names as keys and their values.
 * @param {Function} onUploadProgress - A callback to track the generation progress.
 * @returns {Promise<Object>} A promise that resolves to an object with the file blob and filename.
 */
export const generatePresentation = async (
  templateId,
  data,
  onUploadProgress
) => {
  try {
    const response = await apiClient.post(
      "/api/generate",
      { templateId, data },
      {
        responseType: "blob", // Important: tells axios to expect a binary file response
        onUploadProgress, // For tracking the request itself
      }
    );

    // Extract filename from the Content-Disposition header
    const contentDisposition = response.headers["content-disposition"];
    let filename = "presentation.pptx"; // A default fallback filename
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
    console.error("Presentation generation failed:", error);
    throw new Error("Could not generate the presentation file.");
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
    console.error(
      `Failed to delete template ${templateId}:`,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.error || "Failed to delete template."
    );
  }
};

/**
 * Searches for images using the backend service.
 * @param {string} query - The search term.
 * @returns {Promise<Array>} A promise that resolves to an array of image objects.
 */
export const searchImages = async (query) => {
  try {
    const response = await apiClient.get("/api/images/search", {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Image search failed:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.error || "Failed to search for images."
    );
  }
};

/**
 * Uploads an image from a URL via the backend.
 * @param {string} imageUrl - The URL of the image to upload.
 * @returns {Promise<Object>} A promise that resolves to an object containing the s3_key.
 */
export const uploadImageFromUrl = async (imageUrl) => {
  try {
    const response = await apiClient.post("/api/assets/upload_from_url", {
      url: imageUrl,
    });
    console.log(`[templateService] Uploaded from URL, s3_key: ${response.data.s3_key}`);
    return response.data;
  } catch (error) {
    console.error(
      "Image upload from URL failed:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.error || "Failed to upload the selected image."
    );
  }
};

/**
 * Scrapes a given URL for images via the backend.
 * @param {string} pageUrl - The URL of the page to scrape.
 * @returns {Promise<Array>} A promise that resolves to an array of image URL strings.
 */
export const scrapeImagesFromUrl = async (pageUrl) => {
  try {
    // DEBUG LOG: Initiating scrape request
    console.log(`[templateService] Scraping URL: ${pageUrl}`);
    const response = await apiClient.post("/api/scrape/images", {
      url: pageUrl,
    });
    // DEBUG LOG: Successfully scraped images
    console.log(`[templateService] Found ${response.data.length} images from scrape.`);
    return response.data; // Expected: ["url1.jpg", "url2.png", ...]
  } catch (error) {
    console.error(
      "Image scrape failed:",
      error.response?.data || error.message
    );
    // Throw the specific, educational error from the backend if it exists
    throw new Error(
      error.response?.data?.error || "Could not fetch images from this URL."
    );
  }
};

/**
 * Fetches a secure, temporary pre-signed URL for a given S3 key.
 * Used to display previews of images stored in S3.
 * @param {string} key - The S3 key of the asset (e.g., "temp/abc-123.jpg").
 * @returns {Promise<Object>} A promise that resolves to an object like { url: "..." }.
 */
export const getAssetViewUrl = async (key) => {
  // DEBUG LOG: Log the key we are trying to fetch

  try {
    const response = await apiClient.get("/api/assets/view-url", {
      params: { key }, // Sends the key as a URL query parameter
    });
    return response.data; // Expected: { url: "https://s3.url/..." }
  } catch (error) {
    // DEBUG LOG: Log the specific error
    console.error(
      `Failed to get asset view URL for key ${key}:`,
      error.response?.data || error.message
    );

    // Throw a user-friendly error for the UI components to catch
    throw new Error(
      error.response?.data?.error || "Could not load image preview."
    );
  }
};

/**
 * Updates a template's details (e.g., name, description).
 * @param {number|string} templateId - The ID of the template to update.
 * @param {Object} templateData - An object containing the fields to update (e.g., { name, description }).
 * @returns {Promise<Object>} A promise that resolves to the fully updated template object.
 */
export const updateTemplate = async (templateId, templateData) => {
  try {
    const response = await apiClient.put(
      `/api/templates/${templateId}`,
      templateData
    );
    return response.data; // The backend should return the updated template
  } catch (error) {
    // Log the detailed error
    console.error(
      `Failed to update template ${templateId}:`,
      error.response?.data || error.message
    );
    // Throw the specific error message from the backend if it exists
    throw new Error(
      error.response?.data?.error || "Failed to update template."
    );
  }
};

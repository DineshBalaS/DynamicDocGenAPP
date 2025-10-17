// src/api/axiosConfig.js

import axios from 'axios';

// Create an Axios instance with a base URL from environment variables.
// This allows you to switch between local and production APIs without changing code.
const apiClient = axios.create({
  baseURL: import.meta.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000',
});

export default apiClient;
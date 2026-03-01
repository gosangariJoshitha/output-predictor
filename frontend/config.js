// API Configuration
// Automatically detects localhost vs production

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000'
  : window.location.origin; // Use same origin for production (Render)

export { API_BASE_URL };

// Toggle this to FALSE to use the real backend
export const USE_MOCK_DATA = false;

const getBaseUrl = () => {
  try {
    // Check if running in a Vite environment with VITE_API_URL set
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
      // @ts-ignore
      return import.meta.env.VITE_API_URL;
    }
  } catch (e) {
    // Ignore errors
  }
  // Default to empty string to use relative path (leveraging Vite proxy)
  return "";
};

// Remove trailing slash if present and append /api
const baseUrl = getBaseUrl().replace(/\/$/, '');
export const API_URL = `${baseUrl}/api`;

export const MOCK_DELAY = 600; // ms to simulate network latency

export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};
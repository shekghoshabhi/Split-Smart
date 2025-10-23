const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://split-smart-production.up.railway.app';

// Ensure we're using the Railway backend, not Netlify
if (API_BASE_URL.includes('netlify.app')) {
  console.warn('API_BASE_URL is pointing to Netlify instead of Railway backend!');
}

export default API_BASE_URL;
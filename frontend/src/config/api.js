// Force rebuild to pick up environment variables
console.log('Environment check:');
console.log('REACT_APP_API_URL from env:', process.env.REACT_APP_API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://split-smart-production.up.railway.app';

// Ensure we're using the Railway backend, not Netlify
if (API_BASE_URL.includes('netlify.app')) {
  console.warn('API_BASE_URL is pointing to Netlify instead of Railway backend!');
  console.warn('Current API_BASE_URL:', API_BASE_URL);
  console.warn('Expected API_BASE_URL: https://split-smart-production.up.railway.app');
}

console.log('API_BASE_URL configured as:', API_BASE_URL);

export default API_BASE_URL;
// API Configuration for different environments
export const API_CONFIG = {
  // Development environments
  development: {
    localhost: 'http://localhost:3000/api',
    androidEmulator: 'http://10.0.2.2:3000/api',
    iosSimulator: 'http://localhost:3000/api',
    // Your current IP address (from server logs)
    currentIP: 'http://192.168.8.133:3000/api',
    // Add your computer's hostname here (more stable than IP)
    hostname: 'http://Mawusi:3000/api',
  },
  
  // Production
  production: {
    domain: 'https://your-production-domain.com/api',
  },
  
  // ngrok for external access (temporary)
  ngrok: {
    url: 'https://your-ngrok-url.ngrok.io/api',
  }
};

// Get the appropriate API URL based on environment
export const getApiUrl = () => {
  if (__DEV__) {
    // For development, you can choose which URL to use
    // Uncomment the one that works for your setup:
    
    // return API_CONFIG.development.localhost; // For emulator
    // return API_CONFIG.development.androidEmulator; // For Android emulator
    // return API_CONFIG.development.currentIP; // For your current IP address
    // return API_CONFIG.development.hostname; // For your computer's hostname
    // return API_CONFIG.ngrok.url; // For ngrok (external access)
    
    // Use current IP for physical device testing
    return API_CONFIG.development.currentIP;
  } else {
    return API_CONFIG.production.domain;
  }
};

// Export the current API URL
export const API_BASE_URL = getApiUrl(); 
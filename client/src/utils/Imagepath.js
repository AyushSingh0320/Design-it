



const getImageUrl = (imagePath) => {
  if (!imagePath) return '/icon.png';
  
  // Handle object format (like from database)
  if (typeof imagePath === 'object' && imagePath.url) {
    imagePath = imagePath.url;
  }
  
  // Handle different string formats
  if (typeof imagePath === 'string' && imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Environment-based URL handling
  const baseURL = process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_URL || 'https://api.design-it.live'
    : 'http://localhost:5000';
  
  // Normalize path - handle backslashes and ensure leading slash
  const normalizedPath = imagePath?.toString().replace(/\\\\/g, '/');
  const cleanPath = normalizedPath?.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
  
  return `${baseURL}${cleanPath}`;
};

export default getImageUrl; 
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/icon.png';
  
  // Handle object format
  if (typeof imagePath === 'object' && imagePath.url) {
    return imagePath.url;
  }
  
  // Return the URL as-is (should be Cloudinary URL)
  return imagePath;
};

export default getImageUrl;





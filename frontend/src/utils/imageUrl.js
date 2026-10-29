/**
 * Resolves an image URL based on source location:
 * - http / https -> used as is
 * - /images/ -> served locally by frontend public/
 * - /uploads/ -> served by backend VITE_API_URL
 */
export function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (path.startsWith('/images/')) {
    return path;
  }
  if (path.startsWith('/uploads/')) {
    const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');
    return `${apiUrl}${path}`;
  }
  return path;
}

export default getImageUrl;


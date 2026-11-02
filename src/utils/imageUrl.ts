/**
 * Safely format image URLs for Vite / Vercel production hosting.
 * In Vite build output, files in `public/assets` are placed at `/assets`.
 */
export function formatImageUrl(url?: string | null): string {
  if (!url) {
    return '/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg';
  }
  // If it starts with /public/assets, rewrite to /assets
  if (url.startsWith('/public/assets/')) {
    return url.replace('/public/assets/', '/assets/');
  }
  return url;
}

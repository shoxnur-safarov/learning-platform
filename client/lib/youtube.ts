/**
 * Har qanday YouTube URL formatini embed URL ga o'zgartiradi.
 * Qo'llab-quvvatlanadigan formatlar:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID  (o'zgarmaydi)
 */
export function toYouTubeEmbed(url: string): string | null {
  if (!url) return null;

  // Allaqachon embed formatida
  if (url.includes('youtube.com/embed/')) return url;

  // youtu.be/VIDEO_ID (?si=... ni e'tiborsiz qoldiradi)
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

  // youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;

  return null;
}
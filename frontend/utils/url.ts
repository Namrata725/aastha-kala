export const ensureAbsoluteUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
};

export const getYouTubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return "";
  const videoId = getYouTubeId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  // Try fallback logic for already-embed or manual IDs
  if (url.includes("youtube.com/embed/")) return url;
  if (url.length === 11 && !url.includes("/")) return `https://www.youtube.com/embed/${url}`;
  
  return url;
};

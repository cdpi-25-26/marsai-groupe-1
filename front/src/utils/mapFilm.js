const COUNTRY_FLAGS = {
  FR: "\u{1F1EB}\u{1F1F7}", CN: "\u{1F1E8}\u{1F1F3}", JP: "\u{1F1EF}\u{1F1F5}",
  US: "\u{1F1FA}\u{1F1F8}", ES: "\u{1F1EA}\u{1F1F8}", IT: "\u{1F1EE}\u{1F1F9}",
  KR: "\u{1F1F0}\u{1F1F7}", DE: "\u{1F1E9}\u{1F1EA}", BR: "\u{1F1E7}\u{1F1F7}",
  AE: "\u{1F1E6}\u{1F1EA}", RU: "\u{1F1F7}\u{1F1FA}", IE: "\u{1F1EE}\u{1F1EA}",
  NG: "\u{1F1F3}\u{1F1EC}", SE: "\u{1F1F8}\u{1F1EA}", IN: "\u{1F1EE}\u{1F1F3}",
  GB: "\u{1F1EC}\u{1F1E7}", PT: "\u{1F1F5}\u{1F1F9}", NL: "\u{1F1F3}\u{1F1F1}",
  EG: "\u{1F1EA}\u{1F1EC}", AU: "\u{1F1E6}\u{1F1FA}", AT: "\u{1F1E6}\u{1F1F9}",
  CZ: "\u{1F1E8}\u{1F1FF}", DK: "\u{1F1E9}\u{1F1F0}", MX: "\u{1F1F2}\u{1F1FD}",
  CA: "\u{1F1E8}\u{1F1E6}",
};

function formatDuration(seconds) {
  if (!seconds) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function extractAiTools(aiIdentity) {
  if (!aiIdentity) return [];
  return Object.values(aiIdentity).filter(Boolean).flatMap((v) => v.split(", "));
}

/**
 * Mappe un film du backend vers le format attendu par le frontend
 */
export function mapFilm(f, index) {
  const ai = f.aiIdentity || {};
  return {
    id: f.id,
    title: f.title,
    userId: f.userId || f.user_id || f.User?.id || f.user?.id,
    director: f.User?.username || f.user?.username || "Inconnu",
    directorUsername: `@${f.User?.username || f.user?.username || "inconnu"}`,
    description: f.description || "",
    thumbnail: f.posterPath || "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1080&h=1920&fit=crop",
    videoUrl: f.youtubeId ? `https://www.youtube.com/watch?v=${f.youtubeId}` : null,
    youtubeId: f.youtubeId,
    category: f.category || "Art Numérique",
    country: COUNTRY_FLAGS[f.country] || f.country || "",
    duration: formatDuration(f.duration),
    likes: f.likesCount || 0,
    views: f.viewsCount || 0,
    comments: f.commentsCount || 0,
    shares: f.sharesCount || 0,
    aiTools: extractAiTools(ai),
    submittedDate: f.createdAt || f.created_at || new Date().toISOString(),
    rank: index != null ? index + 1 : null,
    status: f.status,
  };
}

export { COUNTRY_FLAGS, formatDuration, extractAiTools };

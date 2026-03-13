import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Heart, MessageCircle, Share2, Bookmark, Volume2, VolumeX, Loader2 } from "lucide-react";
import { getFeedFilms } from "../../api/films";

// ─── Category color map ───────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  "Sci-Fi": "bg-purple-500",
  Fantasy: "bg-[#51A2FF]",
  Animation: "bg-pink-500",
  Expérimental: "bg-purple-500",
  Romance: "bg-pink-500",
  Drame: "bg-[#51A2FF]",
  Comédie: "bg-pink-400",
  Thriller: "bg-purple-600",
  Philosophique: "bg-purple-700",
  Documentaire: "bg-emerald-500",
};

function getCategoryColor(cat) {
  return CATEGORY_COLORS[cat] || "bg-[#51A2FF]";
}

function formatNumber(n) {
  if (!n) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

// ─── Single video slide ───────────────────────────────────────────────────────
function VideoSlide({ film, isActive, isMuted, onToggleMute }) {
  const videoRef = useRef(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(film.likesCount ?? 0);

  // Auto-play / pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isActive]);

  // Sync muted state
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted;
  }, [isMuted]);

  const handleLike = () => {
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
    setLiked((prev) => !prev);
  };

  const videoUrl = film.videoUpload?.s3Url;
  const director = film.User?.username ?? "anonyme";
  const aiTools = film.aiIdentity
    ? Object.values(film.aiIdentity).filter(Boolean)
    : [];

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Video */}
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          playsInline
          muted={isMuted}
          preload="metadata"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
          <p className="text-white/40 text-sm">Aucune vidéo disponible</p>
        </div>
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />

      {/* Top badges */}
      <div className="absolute top-4 left-4 right-16 flex justify-between items-center z-20">
        {film.category && (
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
            <span className={`w-2 h-2 rounded-full animate-pulse ${getCategoryColor(film.category)}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
              {film.category}
            </span>
          </div>
        )}
        {film.country && (
          <div className="bg-black/40 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10 shadow-lg ml-auto">
            <span className="text-xs font-bold text-white/80">{film.country}</span>
          </div>
        )}
      </div>

      {/* Mute toggle — top-right corner */}
      <button
        onClick={onToggleMute}
        className="absolute top-4 right-4 z-30 bg-black/40 backdrop-blur-xl p-2.5 rounded-full border border-white/10"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-white/80" />
        ) : (
          <Volume2 className="w-4 h-4 text-white/80" />
        )}
      </button>

      {/* Right action buttons */}
      <div className="absolute right-3 bottom-32 md:bottom-28 flex flex-col gap-4 z-20">
        <ActionButton
          icon={Heart}
          active={liked}
          activeColor="text-pink-500"
          count={formatNumber(likes)}
          onClick={handleLike}
        />
        <ActionButton
          icon={MessageCircle}
          count={formatNumber(film.commentsCount ?? 0)}
        />
        <ActionButton icon={Share2} />
        <ActionButton
          icon={Bookmark}
          active={saved}
          activeColor="text-[#51A2FF]"
          onClick={() => setSaved((p) => !p)}
        />

        {/* Director avatar */}
        <div className="mt-2 relative group cursor-pointer">
          <div className="absolute -inset-1 bg-gradient-to-br from-[#51A2FF] to-purple-500 rounded-full blur-[8px] opacity-0 group-hover:opacity-60 transition-opacity" />
          <div className="w-10 h-10 md:w-13 md:h-13 rounded-full border-2 border-white/30 overflow-hidden relative ring-2 ring-white/10">
            <div className="w-full h-full bg-gradient-to-br from-[#51A2FF] to-purple-600 flex items-center justify-center text-white font-black text-base">
              {director.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-16 px-4 md:px-8 pb-20 md:pb-10 z-20">
        {/* Director */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[#51A2FF] font-black text-sm">@{director}</span>
          {film.duration && (
            <>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="text-white/60 text-[11px] font-black uppercase tracking-widest">
                {film.duration}s
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h2 className="text-white text-2xl sm:text-4xl md:text-5xl font-black mb-2 tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
          {film.title}
        </h2>

        {/* Description */}
        {film.description && (
          <p className="text-white/75 text-xs sm:text-sm mb-3 line-clamp-2 leading-relaxed font-medium max-w-xs drop-shadow-lg">
            {film.description}
          </p>
        )}

        {/* AI tools */}
        {aiTools.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {aiTools.map((tool) => (
              <span
                key={tool}
                className="bg-white/5 backdrop-blur-2xl px-2.5 py-1 rounded-full text-white/85 text-[10px] font-black border border-white/10 uppercase tracking-wider hover:bg-white/20 transition-all"
              >
                {tool}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Action button ────────────────────────────────────────────────────────────
function ActionButton({ icon: Icon, active, activeColor, count, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 cursor-pointer group"
    >
      <div className="relative">
        <div className="absolute -inset-1 bg-white/10 rounded-[28px] blur-[10px] opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative bg-white/10 backdrop-blur-[40px] rounded-[18px] md:rounded-[22px] p-3 md:p-3.5 border border-white/20 group-hover:bg-white/20 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <Icon
            className={`w-5 h-5 md:w-6 md:h-6 transition-all duration-300 drop-shadow-md ${
              active
                ? `${activeColor} fill-current scale-110`
                : "text-white/80 group-hover:text-white"
            }`}
            strokeWidth={2.5}
          />
        </div>
      </div>
      {count !== undefined && (
        <span className="text-white text-[10px] md:text-[11px] font-black tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,1)] opacity-90">
          {count}
        </span>
      )}
    </motion.button>
  );
}

// ─── Main Feed ────────────────────────────────────────────────────────────────
export default function Feed() {
  const [films, setFilms] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const isScrolling = useRef(false);
  const touchStartY = useRef(0);

  // ── Load films ────────────────────────────────────────────────────────────
  const loadFilms = useCallback(async (pageNum, reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const res = await getFeedFilms(pageNum, 10);
      const { films: newFilms, pagination } = res.data;

      setFilms((prev) => (reset ? newFilms : [...prev, ...newFilms]));
      setHasMore(pageNum < pagination.totalPages);
      setPage(pageNum);
    } catch {
      setError("Impossible de charger les vidéos.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadFilms(1, true);
  }, [loadFilms]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const navigate = useCallback(
    (dir) => {
      if (isScrolling.current) return;
      isScrolling.current = true;

      setCurrentIndex((prev) => {
        const next = dir === "down" ? prev + 1 : prev - 1;
        if (next < 0 || next >= films.length) {
          isScrolling.current = false;
          return prev;
        }
        // Pre-fetch next page when 3 slots from the end
        if (next >= films.length - 3 && hasMore && !loadingMore) {
          loadFilms(page + 1);
        }
        return next;
      });

      setTimeout(() => { isScrolling.current = false; }, 550);
    },
    [films.length, hasMore, loadingMore, page, loadFilms]
  );

  const handleWheel = useCallback(
    (e) => {
      if (Math.abs(e.deltaY) < 10) return;
      navigate(e.deltaY > 0 ? "down" : "up");
    },
    [navigate]
  );

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = useCallback(
    (e) => {
      const delta = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(delta) < 50) return;
      navigate(delta > 0 ? "down" : "up");
    },
    [navigate]
  );

  // ── Render states ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (error || films.length === 0) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-white/50 text-sm">{error ?? "Aucune vidéo disponible pour le moment."}</p>
        <button
          onClick={() => { setError(null); loadFilms(1, true); }}
          className="text-[#51A2FF] text-sm font-bold hover:underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-screen bg-black overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides container — CSS translate for TikTok snap */}
      <div
        className="flex flex-col w-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          height: `${films.length * 100}vh`,
          transform: `translateY(-${currentIndex * 100}vh)`,
        }}
      >
        {films.map((film, idx) => (
          <div key={film.id} className="w-full h-screen flex-shrink-0">
            {/* Only render ±1 slides around current for performance */}
            {Math.abs(idx - currentIndex) <= 1 && (
              <VideoSlide
                film={film}
                isActive={idx === currentIndex}
                isMuted={isMuted}
                onToggleMute={() => setIsMuted((p) => !p)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Loading more spinner */}
      {loadingMore && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50">
          <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
        </div>
      )}

    </div>
  );
}

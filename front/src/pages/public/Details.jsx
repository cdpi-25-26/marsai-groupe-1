import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { X, Play, Heart, Share2, Bookmark, Eye, Sparkles, Send, Loader2 } from "lucide-react";
import { getFilmById } from "../../api/films";

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDuration(seconds) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatNumber(num) {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function extractAiTools(aiIdentity) {
  if (!aiIdentity) return [];
  return Object.entries(aiIdentity)
    .filter(([, val]) => val)
    .map(([key, val]) => ({ key, tool: val }));
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ImpactStat({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div>
        <div className="text-xl sm:text-2xl font-black tracking-tighter leading-none">{value}</div>
        <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/20 mt-1">{label}</div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    getFilmById(id)
      .then((res) => setFilm(res.data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Fermer le lecteur vidéo avec Escape
  useEffect(() => {
    if (!showVideo) return;
    const handler = (e) => { if (e.key === "Escape") setShowVideo(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showVideo]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  // ── Not Found ────────────────────────────────────────────────────────────────
  if (notFound || !film) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 mb-4">Film introuvable.</p>
          <button
            onClick={() => navigate("/discover")}
            className="text-cyan-400 underline underline-offset-2"
          >
            Retour à la découverte
          </button>
        </div>
      </div>
    );
  }

  // ── Données mappées depuis le backend ────────────────────────────────────────
  const aiTools = extractAiTools(film.aiIdentity);
  const directorUsername = film.User?.username || "—";
  const thumbnail = film.posterPath || null;

  const mockComments = [
    { id: 1, user: "Marie D.", avatar: "MD", comment: "Absolument incroyable ! Les visuels sont époustouflants 🔥", time: "2h" },
    { id: 2, user: "Thomas B.", avatar: "TB", comment: "Une réflexion profonde sur l'IA. Bravo pour ce travail !", time: "5h" },
    { id: 3, user: "Sophie L.", avatar: "SL", comment: "Les outils IA utilisés ici sont impressionnants. Quel est votre workflow ?", time: "1j" },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full min-h-screen text-foreground font-['Arimo'] -mt-52"
      >
        {/* ── Cinematic Hero ─────────────────────────────────────────────────── */}
        <div className="relative h-[60vh] sm:h-[75vh] md:h-screen w-full">

          {/* Background — poster S3 */}
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-cover bg-center"
            style={thumbnail ? { backgroundImage: `url(${thumbnail})` } : {}}
          >
            {!thumbnail && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-[#030213] to-cyan-900/30" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
          </motion.div>

          {/* Top Controls */}
          <div className="absolute top-20 md:top-28 right-4 sm:right-6 md:right-8 z-50">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-black/40 backdrop-blur-2xl border border-white/10 rounded-xl sm:rounded-2xl hover:bg-white/10 transition-all"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>

          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            {film.youtubeId ? (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowVideo(true)}
                className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-full flex items-center justify-center shadow-2xl group transition-all hover:bg-white/20"
              >
                <Play className="w-7 h-7 sm:w-10 sm:h-10 md:w-14 md:h-14 text-white fill-white ml-1 group-hover:scale-110 transition-transform" />
              </motion.button>
            ) : (
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 text-white/40 text-xs font-black uppercase tracking-widest">
                Vidéo en traitement…
              </div>
            )}
          </div>

          {/* Hero Title */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 md:p-16 flex flex-col items-center text-center"
          >
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4 sm:mb-8">
              <div className="bg-[#51A2FF]/80 backdrop-blur-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-white/20">
                {film.status}
              </div>
              {film.status === "SELECTION_OFFICIELLE" && (
                <div className="bg-pink-500 backdrop-blur-md px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                  Sélection officielle MARSAI
                </div>
              )}
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-9xl font-black mb-3 sm:mb-6 tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 uppercase max-w-5xl">
              {film.title}
            </h1>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-cyan-400 font-bold text-base sm:text-xl md:text-2xl mb-6 sm:mb-12">
              <button onClick={() => navigate("/profile")} className="hover:text-white transition-colors">
                @{directorUsername}
              </button>
              <div className="w-1 h-1 rounded-full bg-white/20 hidden sm:block" />
              <span className="text-white/60 text-sm sm:text-lg md:text-xl font-medium tracking-widest uppercase">
                {formatDuration(film.duration)}
              </span>
            </div>

            <div className="flex gap-3 sm:gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLiked(!isLiked)}
                className={`flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-5 rounded-2xl sm:rounded-3xl font-black uppercase tracking-widest text-xs transition-all ${
                  isLiked
                    ? "bg-pink-500 shadow-xl shadow-pink-500/20"
                    : "bg-white/10 backdrop-blur-xl border border-white/10 hover:bg-white/20"
                }`}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? "fill-current" : ""}`} />
                {isLiked ? "Aimé" : "J'aime"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSaved(!isSaved)}
                className={`w-12 sm:w-16 flex items-center justify-center rounded-2xl sm:rounded-3xl border transition-all ${
                  isSaved ? "bg-[#51A2FF] border-[#51A2FF] text-white" : "bg-white/5 border-white/10 text-white"
                }`}
              >
                <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? "fill-current" : ""}`} />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* ── Content Body ───────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-16 md:py-20 grid lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-20">
          <div className="lg:col-span-2 space-y-12 sm:space-y-16 md:space-y-20">

            {/* Director Manifesto */}
            {film.description && (
              <section>
                <p className="text-lg sm:text-2xl md:text-3xl font-light leading-relaxed text-white/80 italic">
                  &ldquo;{film.description}&rdquo;
                </p>
              </section>
            )}

            {/* AI Stack */}
            {aiTools.length > 0 && (
              <section>
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-5 sm:mb-8">
                  Stack IA
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {aiTools.map(({ key, tool }, idx) => (
                    <div
                      key={key}
                      className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-white/[0.02] border border-white/5 rounded-2xl sm:rounded-[2rem] hover:bg-white/[0.05] transition-all group"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-cyan-500/10 flex items-center justify-center shrink-0 group-hover:bg-cyan-500 transition-all">
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 group-hover:text-white" />
                      </div>
                      <div>
                        <div className="text-[9px] sm:text-[10px] font-black text-white/30 uppercase tracking-widest mb-0.5 sm:mb-1">
                          Outil {idx + 1}
                        </div>
                        <div className="text-base sm:text-xl font-black tracking-tight">{tool}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Comments */}
            <section>
              <div className="flex items-end justify-between mb-6 sm:mb-10">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
                  Discussion
                </h2>
                <div className="text-base sm:text-xl font-black">
                  {mockComments.length} avis
                </div>
              </div>

              {/* Comment Input */}
              <div className="flex gap-3 sm:gap-6 mb-8 sm:mb-12">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-cyan-600 to-purple-600 flex items-center justify-center font-black text-base sm:text-xl shrink-0 shadow-lg">
                  U
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Écrire un commentaire..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl sm:rounded-3xl px-4 sm:px-8 py-3 sm:py-5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-all"
                  />
                  <button className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white hover:bg-cyan-500 transition-colors">
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>

              {/* Comment List */}
              <div className="space-y-3 sm:space-y-4">
                {mockComments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    whileHover={{ x: 6 }}
                    className="flex gap-3 sm:gap-6 p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#111] flex items-center justify-center font-black text-xs sm:text-sm text-cyan-400 border border-white/5 shrink-0">
                      {comment.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <span className="font-black text-xs sm:text-sm uppercase tracking-widest">
                          {comment.user}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="text-[9px] sm:text-[10px] font-bold text-white/20 uppercase tracking-widest">
                          {comment.time}
                        </span>
                      </div>
                      <p className="text-white/60 text-sm leading-relaxed">{comment.comment}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────────────── */}
          <div className="space-y-4 sm:space-y-6">
            <div className="lg:sticky lg:top-8 space-y-4 sm:space-y-6">

              {/* Impact Metrics */}
              <div className="p-5 sm:p-8 bg-white/[0.02] border border-white/5 rounded-3xl sm:rounded-[3rem] backdrop-blur-xl">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-5 sm:mb-8">
                  Statistiques
                </h3>
                <div className="space-y-5 sm:space-y-8">
                  <ImpactStat icon={Eye} label="Vues" value="—" color="text-cyan-400" />
                  <ImpactStat icon={Heart} label="J'aime" value="—" color="text-pink-500" />
                  <ImpactStat icon={Share2} label="Partages" value="—" color="text-purple-400" />
                </div>
              </div>

              {/* Technical Sheet */}
              <div className="p-5 sm:p-8 bg-gradient-to-br from-cyan-600/10 to-transparent border border-cyan-500/20 rounded-3xl sm:rounded-[3rem]">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-4 sm:mb-6">
                  Fiche technique
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                      Pays
                    </span>
                    <span className="font-bold">{film.country || "—"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                      Durée
                    </span>
                    <span className="font-bold text-xs uppercase tracking-widest">
                      {formatDuration(film.duration)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                      Ratio
                    </span>
                    <span className="font-bold text-xs uppercase tracking-widest">9:16</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                      Première
                    </span>
                    <span className="font-bold text-sm">
                      {film.createdAt
                        ? new Date(film.createdAt).toLocaleDateString("fr-FR")
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Lecteur vidéo plein écran (YouTube) ───────────────────────────────── */}
      <AnimatePresence>
        {showVideo && film.youtubeId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl"
            onClick={(e) => e.target === e.currentTarget && setShowVideo(false)}
          >
            {/* Bouton fermer */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>

            {/* Titre en haut */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-4 sm:top-6 sm:left-6"
            >
              <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">En lecture</p>
              <h2 className="text-white font-black text-sm sm:text-base tracking-tight uppercase line-clamp-1">
                {film.title}
              </h2>
            </motion.div>

            {/* iFrame YouTube */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-5xl mx-4 aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <iframe
                src={`https://www.youtube.com/embed/${film.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={film.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                className="w-full h-full"
              />
            </motion.div>

            {/* Hint Escape */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute bottom-4 text-white/20 text-[10px] font-bold uppercase tracking-widest"
            >
              Appuyez sur Échap pour fermer
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

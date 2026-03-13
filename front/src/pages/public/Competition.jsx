import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { TrendingUp, Eye, Heart, Crown, ChevronRight, Loader2 } from "lucide-react";
import { fetchSelectionOfficielle } from "../../api/films";

export default function Competition() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSelectionOfficielle()
      .then(({ data }) => {
        const mapped = (data.data ?? data).map((f, i) => ({
          id: f.id,
          title: f.title,
          thumbnail: f.posterPath || "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&h=400&fit=crop",
          directorUsername: f.User?.username || "Anonyme",
          country: f.country || "—",
          duration: f.duration ? `${Math.floor(f.duration / 60)}:${String(f.duration % 60).padStart(2, "0")}` : "—",
          likes: f.likesCount ?? 0,
          views: f.viewsCount ?? 0,
          rank: i + 1,
        }));
        setFilms(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const topFilms = films.slice(0, 50);

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (topFilms.length === 0) {
    return (
      <div className="min-h-screen text-foreground pb-32">
        <div className="relative pt-8 md:pt-16 pb-16 px-6" style={{ overflow: "hidden" }}>
          <div className="absolute top-0 left-1/4 w-72 h-72 md:w-[500px] md:h-[500px] bg-purple-500/15 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
          <div className="max-w-6xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-5xl sm:text-7xl md:text-9xl font-black mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 leading-[0.9]"
            >
              {t("pages.competition.title")}
            </motion.h1>
            <p className="text-white/50 text-xl mt-8">
              La selection officielle sera devoilee prochainement.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground pb-32 selection:bg-purple-500/30">
      <div className="relative pt-8 md:pt-16 pb-16 px-6" style={{ overflow: "hidden" }}>
        <div className="absolute top-0 left-1/4 w-72 h-72 md:w-[500px] md:h-[500px] bg-purple-500/15 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-56 h-56 md:w-[400px] md:h-[400px] bg-pink-600/15 rounded-full blur-[60px] md:blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500" />
            </span>
            <span className="text-xs font-black tracking-[0.2em] uppercase text-white/60">
              {t("pages.competition.live")}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl sm:text-7xl md:text-9xl font-black mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 leading-[0.9]"
          >
            {t("pages.competition.title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-sm md:text-xl max-w-2xl mx-auto font-medium leading-relaxed px-4"
          >
            {t("pages.competition.subtitle")}
          </motion.p>
        </div>
      </div>

      {topFilms.length >= 3 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
          <div className="block lg:hidden">
            <div className="mb-4">
              <PodiumCard
                film={topFilms[0]} rank={1} color="gold" delay={0.1} isWinner mobile
                onClick={() => navigate(`/film/${topFilms[0]?.id}`)} formatNumber={formatNumber}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <PodiumCard film={topFilms[1]} rank={2} color="silver" delay={0.2} mobile onClick={() => navigate(`/film/${topFilms[1]?.id}`)} formatNumber={formatNumber} />
              <PodiumCard film={topFilms[2]} rank={3} color="bronze" delay={0.3} mobile onClick={() => navigate(`/film/${topFilms[2]?.id}`)} formatNumber={formatNumber} />
            </div>
          </div>

          <div className="hidden lg:flex items-end justify-center gap-8">
            <PodiumCard film={topFilms[1]} rank={2} color="silver" delay={0.2} onClick={() => navigate(`/film/${topFilms[1]?.id}`)} formatNumber={formatNumber} />
            <PodiumCard film={topFilms[0]} rank={1} color="gold" delay={0.1} isWinner onClick={() => navigate(`/film/${topFilms[0]?.id}`)} formatNumber={formatNumber} />
            <PodiumCard film={topFilms[2]} rank={3} color="bronze" delay={0.3} onClick={() => navigate(`/film/${topFilms[2]?.id}`)} formatNumber={formatNumber} />
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/5 rounded-[14px] border border-white/10">
              <TrendingUp className="text-[#51A2FF] w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-tighter">
              {t("pages.competition.general")}
            </h2>
          </div>
          <span className="hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
            {topFilms.length} films
          </span>
        </div>

        <div className="grid gap-2 sm:gap-3">
          {topFilms.slice(3).map((film, index) => (
            <RankRow
              key={film.id} film={film} rank={index + 4}
              onClick={() => navigate(`/film/${film.id}`)} formatNumber={formatNumber} t={t}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PodiumCard({ film, rank, color, delay, isWinner, mobile, onClick, formatNumber }) {
  const themes = {
    gold: "from-[#51A2FF] via-purple-500 to-pink-500",
    silver: "from-white/40 via-white/20 to-white/10",
    bronze: "from-pink-500/40 via-pink-600/20 to-pink-700/10",
  };

  if (mobile) {
    return (
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.6, ease: "easeOut" }} onClick={onClick} className="relative cursor-pointer group w-full">
        <div className="relative overflow-hidden rounded-[20px] bg-white/[0.03] border border-white/10 group-hover:border-white/25 transition-all duration-300 shadow-xl">
          <div className="aspect-[3/4] relative overflow-hidden">
            <img src={film?.thumbnail} alt={film?.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className={`absolute top-3 left-3 w-9 h-9 rounded-[12px] bg-gradient-to-br ${themes[color]} flex items-center justify-center shadow-xl border border-white/20`}>
              <span className="text-lg font-black text-white">{rank}</span>
            </div>
            {isWinner && (
              <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-xl p-2 rounded-[10px] border border-white/20">
                <Crown className="w-4 h-4 text-purple-400 fill-purple-400" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="font-black uppercase tracking-tighter leading-none text-sm truncate mb-0.5">{film?.title}</h3>
              <p className="text-[#51A2FF] text-[10px] font-black tracking-tight truncate mb-2">@{film?.directorUsername}</p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-pink-500 fill-pink-500/30" /><span className="text-[10px] font-black">{formatNumber(film?.likes)}</span></span>
                <span className="flex items-center gap-1 text-[#51A2FF]"><Eye className="w-3 h-3" /><span className="text-[10px] font-black text-white">{formatNumber(film?.views)}</span></span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.8, ease: "easeOut" }} onClick={onClick} className={`relative cursor-pointer group ${isWinner ? "w-[340px]" : "w-[260px]"}`}>
      {isWinner && <div className="absolute -inset-4 bg-purple-500/10 blur-[60px] rounded-full animate-pulse -z-10" />}
      <div className="relative overflow-hidden rounded-[28px] bg-white/[0.03] backdrop-blur-2xl border border-white/10 transition-all duration-500 group-hover:border-white/30 group-hover:-translate-y-2 group-hover:bg-white/[0.05] shadow-2xl">
        <div className="aspect-[3/4] relative overflow-hidden">
          <img src={film?.thumbnail} alt={film?.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className={`absolute top-5 left-5 w-12 h-12 rounded-[16px] bg-gradient-to-br ${themes[color]} flex items-center justify-center shadow-2xl border border-white/20 transform -rotate-6 group-hover:rotate-0 transition-transform`}>
            <span className="text-2xl font-black text-white">{rank}</span>
          </div>
          {isWinner && (
            <div className="absolute top-5 right-5 bg-white/10 backdrop-blur-xl p-2.5 rounded-[14px] border border-white/20 shadow-2xl">
              <Crown className="w-5 h-5 text-purple-400 fill-purple-400" />
            </div>
          )}
        </div>
        <div className={`p-5 ${isWinner ? "sm:p-7" : "sm:p-5"}`}>
          <h3 className={`font-black uppercase tracking-tighter leading-none mb-1 truncate ${isWinner ? "text-2xl" : "text-lg"}`}>{film?.title}</h3>
          <p className="text-[#51A2FF] text-xs font-black tracking-tight mb-4">@{film?.directorUsername}</p>
          <div className="flex items-center gap-5 border-t border-white/5 pt-4">
            <div className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500/20" /><span className="text-xs font-black">{formatNumber(film?.likes)}</span></div>
            <div className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-[#51A2FF]" /><span className="text-xs font-black">{formatNumber(film?.views)}</span></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RankRow({ film, rank, onClick, formatNumber, t }) {
  const isTop10 = rank <= 10;
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} onClick={onClick} className="group flex items-center gap-3 sm:gap-5 p-3 sm:p-4 rounded-[16px] sm:rounded-[20px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-[#51A2FF]/30 transition-all duration-300 cursor-pointer">
      <div className={`w-7 sm:w-9 text-center font-black text-sm sm:text-base shrink-0 ${isTop10 ? "text-[#51A2FF]" : "text-white/20 group-hover:text-[#51A2FF]"}`}>{rank}</div>
      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-[10px] sm:rounded-[14px] overflow-hidden shrink-0 border border-white/10">
        <img src={film.thumbnail} alt={film.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-black text-xs sm:text-base truncate group-hover:text-[#51A2FF] transition-colors uppercase tracking-tight leading-none mb-0.5">{film.title}</h4>
        <p className="text-[9px] sm:text-[10px] font-black text-white/30 uppercase tracking-[0.1em] truncate">
          {t("pages.competition.by")} {film.directorUsername}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="hidden sm:flex items-center gap-1.5 text-white/40">
          <Heart className="w-3 h-3 text-pink-500" />
          <span className="text-xs font-black text-white">{formatNumber(film.likes)}</span>
        </span>
        <span className="flex items-center gap-1 text-[#51A2FF]">
          <Eye className="w-3 h-3" />
          <span className="text-[10px] sm:text-xs font-black text-white">{formatNumber(film.views)}</span>
        </span>
      </div>
      <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-[#51A2FF] transition-colors shrink-0" />
    </motion.div>
  );
}

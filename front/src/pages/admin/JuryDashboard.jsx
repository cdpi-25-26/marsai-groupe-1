import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { Search, CheckCircle, Clock, Play, BarChart3, Loader2, XCircle } from "lucide-react";
import { getSelectionOfficielle } from "../../api/films.js";

export default function JuryDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("title");

  const { data, isPending, isError } = useQuery({
    queryKey: ["selection-officielle"],
    queryFn: getSelectionOfficielle,
  });

  const films = data?.data ?? [];

  const finalistsFilms = useMemo(() => {
    return films.map((film) => ({
      ...film,
      hasVoted: false,
      myRating: undefined,
    }));
  }, [films]);

  const evaluatedCount = finalistsFilms.filter((f) => f.hasVoted).length;
  const totalCount = finalistsFilms.length;
  const progressPercent = totalCount > 0 ? Math.round((evaluatedCount / totalCount) * 100) : 0;

  const filteredFilms = useMemo(() => {
    let result = [...finalistsFilms];

    if (searchQuery) {
      result = result.filter((f) =>
        f.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus === "evaluated") {
      result = result.filter((f) => f.hasVoted);
    } else if (filterStatus === "pending") {
      result = result.filter((f) => !f.hasVoted);
    }

    if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "date") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [finalistsFilms, searchQuery, filterStatus, sortBy]);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-y-auto pb-32">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#ad46ff]/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#51a2ff]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/3 w-[350px] h-[350px] bg-[#ff2b7f]/[0.02] rounded-full blur-[100px]" />
      </div>

      <div className="sticky top-0 z-40 bg-[#050505]/60 backdrop-blur-3xl border-b border-[#51a2ff]/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-white/[0.04] backdrop-blur-xl border border-[#ad46ff]/20 rounded-[24px] flex items-center justify-center shadow-[0_0_20px_rgba(173,70,255,0.1)]">
                <BarChart3 className="w-6 h-6 text-[#ad46ff]" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white">
                  Espace Jury
                </h1>
                <p className="text-[#51a2ff]/60 text-xs md:text-sm font-medium uppercase tracking-[0.2em]">
                  Évaluation des finalistes
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/[0.03] backdrop-blur-2xl border border-[#51a2ff]/10 rounded-[24px] p-6 mb-6 shadow-[0_0_30px_rgba(81,162,255,0.05)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight mb-1">Votre Progression</h3>
                <p className="text-white/40 text-sm">
                  Vous avez évalué{" "}
                  <span className="text-[#51a2ff] font-black">
                    {evaluatedCount}/{totalCount}
                  </span>{" "}
                  films
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-white">{progressPercent}%</div>
                <p className="text-[10px] text-[#51a2ff]/40 uppercase tracking-widest">Complété</p>
              </div>
            </div>

            <div className="relative h-3 bg-white/[0.05] backdrop-blur-xl rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#51a2ff]/30 to-[#ad46ff]/30 backdrop-blur-md rounded-full shadow-[0_0_20px_rgba(81,162,255,0.4)]"
              />
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative md:col-span-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#ad46ff]/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un film..."
                className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[24px] pl-12 pr-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ad46ff]/30 focus:bg-white/[0.05] transition-all"
              />
            </div>

            <div className="flex gap-2">
              {[
                { id: "all", label: "Tous", count: totalCount, color: "#51a2ff" },
                { id: "pending", label: "À évaluer", count: totalCount - evaluatedCount, color: "#ff9500" },
                { id: "evaluated", label: "Évalués", count: evaluatedCount, color: "#30d158" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterStatus(filter.id)}
                  style={{
                    borderColor: filterStatus === filter.id ? `${filter.color}40` : "rgba(255,255,255,0.08)",
                    boxShadow: filterStatus === filter.id ? `0 0 20px ${filter.color}20` : "none",
                  }}
                  className={`flex-1 px-4 py-3 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all border backdrop-blur-xl ${
                    filterStatus === filter.id
                      ? "bg-white/10 text-white"
                      : "bg-white/[0.02] text-white/40 hover:bg-white/[0.04]"
                  }`}
                >
                  {filter.label}
                  <span className={`ml-2 ${filterStatus === filter.id ? "text-white/60" : "text-white/20"}`}>
                    ({filter.count})
                  </span>
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[24px] px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#51a2ff]/30 appearance-none cursor-pointer transition-all"
            >
              <option value="title" className="bg-[#0a0a0a]">Trier par Titre</option>
              <option value="date" className="bg-[#0a0a0a]">Trier par Date</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {isPending ? (
          <div className="flex items-center justify-center py-32 gap-3">
            <Loader2 className="w-8 h-8 text-[#51a2ff] animate-spin" />
            <span className="text-white/40 text-sm font-black uppercase tracking-widest">Chargement...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <XCircle className="w-12 h-12 text-red-400" />
            <p className="text-red-400 font-black uppercase tracking-widest text-sm">
              Erreur lors du chargement des films
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFilms.map((film, index) => (
                <motion.div
                  key={film.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group cursor-pointer"
                >
                  <div className="relative bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden hover:bg-white/[0.05] hover:border-white/20 transition-all">
                    <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-[#51a2ff]/10 to-[#ad46ff]/10 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-7 h-7 text-white fill-white ml-1" />
                      </div>

                      <div
                        className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl backdrop-blur-md border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                          film.hasVoted
                            ? "bg-green-500/20 border-green-500/30 text-green-400"
                            : "bg-white/10 border-white/20 text-white/60"
                        }`}
                      >
                        {film.hasVoted ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Évalué
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            À évaluer
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-black text-base mb-2 line-clamp-1 tracking-tight uppercase group-hover:text-blue-400 transition-colors">
                        {film.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-white/40 mb-3">
                        <span className="font-medium">{film.country}</span>
                        <span className="font-black">
                          {film.duration ? `${film.duration}s` : "—"}
                        </span>
                      </div>

                      {film.aiIdentity && (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(film.aiIdentity)
                            .filter(([, val]) => val)
                            .slice(0, 2)
                            .map(([key, val]) => (
                              <span
                                key={key}
                                className="bg-white/5 px-2 py-1 rounded-lg text-[9px] font-bold text-white/60 uppercase tracking-wider"
                              >
                                {val}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredFilms.length === 0 && (
              <div className="text-center py-24">
                <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-white/10" />
                </div>
                <h3 className="text-2xl font-black mb-3 tracking-tighter uppercase">
                  {totalCount === 0 ? "Aucun film en sélection officielle" : "Aucun film trouvé"}
                </h3>
                <p className="text-white/40 mb-8 max-w-sm mx-auto">
                  {totalCount === 0
                    ? "Les films finalistes apparaîtront ici une fois sélectionnés par l'administration."
                    : "Aucun film ne correspond à vos critères de recherche."}
                </p>
                {totalCount > 0 && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterStatus("all");
                    }}
                    className="bg-white text-black font-black uppercase tracking-widest py-4 px-8 rounded-2xl hover:bg-blue-400 transition-all"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

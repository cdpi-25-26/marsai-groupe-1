import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Users, Film, CheckCircle, Clock, TrendingUp, Calendar, Shield, Activity, ArrowRight, Loader2, XCircle, Settings, FileText, Trophy } from "lucide-react";
import { getFilms } from "../../api/films.js";
import { getUsers } from "../../api/users.js";

function Dashboard() {
  const navigate = useNavigate();

  const { data: filmsData, isPending: filmsPending, isError: filmsError } = useQuery({
    queryKey: ["films"],
    queryFn: () => getFilms({ limit: 1000 }),
  });

  const { data: usersData, isPending: usersPending, isError: usersError } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const films = filmsData?.data?.films ?? [];
  const users = usersData?.data ?? [];

  const stats = {
    totalSubmissions: films.length,
    validatedFilms: films.filter((f) => f.status === "APPROVED").length,
    pendingFilms: films.filter((f) => f.status === "PENDING").length,
    rejectedFilms: films.filter((f) => f.status === "REJECTED").length,
    selectionOfficielle: films.filter((f) => f.status === "SELECTION_OFFICIELLE").length,
    totalUsers: users.length,
    juryUsers: users.filter((u) => u.role === "JURY").length,
    submissionsToday: films.filter((f) => {
      const today = new Date();
      const filmDate = new Date(f.createdAt);
      return (
        filmDate.getDate() === today.getDate() &&
        filmDate.getMonth() === today.getMonth() &&
        filmDate.getFullYear() === today.getFullYear()
      );
    }).length,
  };

  const juryProgress = stats.selectionOfficielle > 0
    ? Math.round((stats.selectionOfficielle / 50) * 100)
    : 0;

  const quickActions = [
    {
      id: "admin-users",
      icon: Users,
      label: "Gérer Utilisateurs",
      count: stats.totalUsers,
      color: "text-[#51A2FF]",
      route: "/admin/users",
    },
    {
      id: "admin-submissions",
      icon: Film,
      label: "Gérer Soumissions",
      count: stats.pendingFilms,
      color: "text-purple-500",
      route: "/admin/submissions",
    },
    {
      id: "admin-moderation",
      icon: Shield,
      label: "Modération",
      count: stats.pendingFilms,
      color: "text-pink-500",
      route: "/admin/moderation",
    },
    {
      id: "admin-leaderboard",
      icon: Trophy,
      label: "Sélection Officielle",
      count: stats.selectionOfficielle,
      color: "text-emerald-500",
      route: "/admin/leaderboard",
    },
    {
      id: "admin-events",
      icon: Calendar,
      label: "Événements",
      count: 4,
      color: "text-orange-500",
      route: "/admin/events",
    },
    {
      id: "admin-jury",
      icon: BarChart3,
      label: "Distribution Jury",
      count: stats.juryUsers,
      color: "text-cyan-500",
      route: "/admin/jury",
    },
    {
      id: "admin-cms",
      icon: FileText,
      label: "Contenu (CMS)",
      count: 3,
      color: "text-yellow-500",
      route: "/admin/cms",
    },
    {
      id: "admin-settings",
      icon: Settings,
      label: "Configuration",
      count: null,
      color: "text-white/60",
      route: "/admin/settings",
    },
  ];

  const recentActivity = films
    .slice(0, 4)
    .map((film, index) => {
      const user = users.find((u) => u.id === film.userId);
      const createdAt = new Date(film.createdAt);
      const now = new Date();
      const diffMinutes = Math.floor((now - createdAt) / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const timeAgo =
        diffMinutes < 60
          ? `${diffMinutes} min`
          : diffHours < 24
          ? `${diffHours}h`
          : `${Math.floor(diffHours / 24)}j`;

      return {
        id: film.id,
        type: film.status === "PENDING" ? "submission" : film.status === "APPROVED" ? "approval" : "vote",
        user: user?.username || "Utilisateur",
        action:
          film.status === "PENDING"
            ? "a soumis un nouveau film"
            : film.status === "APPROVED"
            ? "a validé un film"
            : "a évalué un film",
        time: timeAgo,
        film: film.title,
      };
    });

  const submissionTrend = (() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

    return last7Days.map((date) => {
      const count = films.filter((film) => {
        const filmDate = new Date(film.createdAt);
        return (
          filmDate.getDate() === date.getDate() &&
          filmDate.getMonth() === date.getMonth() &&
          filmDate.getFullYear() === date.getFullYear()
        );
      }).length;

      return {
        day: dayNames[date.getDay()],
        count,
      };
    });
  })();

  const maxCount = Math.max(...submissionTrend.map((d) => d.count), 1);

  const isLoading = filmsPending || usersPending;
  const isError = filmsError || usersError;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-['Arimo',sans-serif] overflow-y-auto pb-32">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#51A2FF]/5 rounded-full blur-[150px]" />
        <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] bg-pink-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-3xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 leading-none mb-2">
                Dashboard Admin
              </h1>
              <p className="text-white/40 text-sm font-medium uppercase tracking-widest">
                Contrôle du protocole marsAI 2026
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 className="w-6 h-6 text-[#51A2FF] animate-spin" />
              <span className="text-white/40 text-sm font-black uppercase tracking-widest">Chargement...</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <XCircle className="w-8 h-8 text-red-400" />
              <p className="text-red-400 font-black uppercase tracking-widest text-sm">
                Erreur lors du chargement des données
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
              {[
                { label: "Total Films", value: stats.totalSubmissions, icon: Film, color: "text-[#51A2FF]" },
                { label: "Validations", value: stats.validatedFilms, icon: CheckCircle, color: "text-emerald-500" },
                { label: "En Attente", value: stats.pendingFilms, icon: Clock, color: "text-purple-400" },
                { label: "Membres", value: stats.totalUsers, icon: Users, color: "text-pink-500" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/[0.02] border border-white/5 rounded-[24px] p-4 flex items-center gap-4 group hover:bg-white/[0.04] transition-all"
                >
                  <div className={`p-3 rounded-[16px] bg-white/5 border border-white/10 ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-0.5">
                      {stat.label}
                    </div>
                    <div className="text-xl font-black tracking-tight">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-[#51A2FF] animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <XCircle className="w-12 h-12 text-red-400" />
            <p className="text-red-400 font-black uppercase tracking-widest">
              Impossible de charger les données du dashboard
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-6 md:p-8 mb-8 backdrop-blur-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-[#51A2FF]" />
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">Analyse Performance</h3>
                  </div>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                    Flux hebdomadaire des soumissions
                  </p>
                </div>

                <div className="flex bg-white/[0.03] p-1 rounded-[16px] border border-white/10">
                  <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white/10 rounded-[12px]">
                    7 Jours
                  </button>
                  <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">
                    30 Jours
                  </button>
                </div>
              </div>

              <div className="mb-10">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-white mb-3">
                  <span>Progression Jury</span>
                  <span>{juryProgress}%</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${juryProgress}%` }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full bg-gradient-to-r from-[#51A2FF] to-purple-500 rounded-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 md:gap-3 h-40 md:h-48 items-end">
                {submissionTrend.map((item, i) => (
                  <div key={item.day} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="relative w-full">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(item.count / maxCount) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.05, ease: "circOut" }}
                        className="w-full bg-gradient-to-t from-[#51A2FF]/20 to-[#51A2FF] rounded-lg border-t border-white/20 relative"
                      >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all text-[10px] font-black bg-white text-black px-2 py-1 rounded">
                          {item.count}
                        </div>
                      </motion.div>
                    </div>
                    <span className="text-[9px] md:text-[10px] font-black text-white/30 uppercase tracking-widest">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-6">Actions Rapides</h3>

              <div className="grid md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group relative bg-white/[0.02] border border-white/5 rounded-[32px] p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all overflow-hidden backdrop-blur-md cursor-pointer"
                    onClick={() => navigate(action.route)}
                  >
                    <action.icon className="absolute -top-4 -right-4 w-32 h-32 text-white/[0.02] -rotate-12 transition-transform group-hover:rotate-0 duration-700" />

                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className={`p-3 rounded-[16px] bg-white/5 border border-white/10 ${action.color}`}>
                          <action.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-wider mb-1">
                            {action.label}
                          </p>
                          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                            {action.count !== null ? `${action.count} éléments` : "Paramètres"}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">Activité Récente</h3>
                <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  Temps Réel
                </span>
              </div>

              {recentActivity.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-12 text-center">
                  <p className="text-white/30 text-sm font-black uppercase tracking-widest">
                    Aucune activité récente
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="group relative bg-white/[0.02] border border-white/5 rounded-[32px] p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all overflow-hidden backdrop-blur-sm"
                    >
                      <Activity className="absolute -top-4 -right-4 w-32 h-32 text-white/[0.02] -rotate-12 transition-transform group-hover:rotate-0 duration-700" />

                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 border border-white/10 rounded-[16px] flex items-center justify-center shrink-0">
                          <Activity className="w-5 h-5 md:w-6 md:h-6 text-white/80" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-black text-white">{activity.user}</span>
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border bg-white/5 border-white/10 text-white/60">
                              {activity.type}
                            </span>
                          </div>
                          <p className="text-sm text-white/50">
                            {activity.action}
                            {activity.film && (
                              <span className="text-white font-bold italic ml-2">"{activity.film}"</span>
                            )}
                          </p>
                        </div>

                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

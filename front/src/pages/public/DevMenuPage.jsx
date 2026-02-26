import { motion } from "motion/react";
import {
  Home, Compass, Trophy, Upload, User, Award, Shield, Settings, BarChart3,
  FileText, Users as UsersIcon, Sparkles, LogIn, UserPlus, QrCode, Volume2,
  Calendar, Film as FilmIcon, Grid3x3, List, Zap, ScanLine,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

const ROUTE_MAP = {
  "home":               "/",
  "discover":           "/discover",
  "competition":        "/competition",
  "agenda":             "/Agenda",
  "profile":            "/Profile",
  "login":              "/auth/login",
  "signup":             "/auth/register",
  "jury-dashboard":     "/jury-dashboard",
  "ticket":             "/ticket",
  "scanner":            "/scanner",
  "qr-generator":       "/qr-generator",
  "admin-dashboard":    "/admin",
};

const menuSections = [
  {
    title: "Pages Publiques / Créatives",
    subtitle: "Style TikTok - Interface dynamique et immersive",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500",
    pages: [
      { id: "home",        label: "Homepage",               icon: Home },
      { id: "discover",    label: "Page Galerie",           icon: Compass },
      { id: "competition", label: "Compétition / Top 50",   icon: Trophy },
      { id: "agenda",      label: "Page Agenda",            icon: Calendar },
    ],
  },
  {
    title: "Espace Utilisateur / Réalisateur",
    subtitle: "Style créatif - Dashboard personnel",
    icon: FilmIcon,
    color: "from-emerald-500 to-teal-500",
    pages: [
      { id: "login",   label: "Connexion",   icon: LogIn },
      { id: "signup",  label: "Inscription", icon: UserPlus },
      { id: "profile", label: "Profil",      icon: User },
    ],
  },
  {
    title: "Espace Jury",
    subtitle: "Style créatif - Interface de vote",
    icon: Award,
    color: "from-violet-500 to-purple-500",
    pages: [
      { id: "jury-dashboard", label: "Dashboard Jury",  icon: BarChart3 },
      { id: "ticket",         label: "Réservation",     icon: QrCode },
      { id: "scanner",        label: "Scanner QR",      icon: ScanLine },
    ],
  },
  {
    title: "Backoffice Admin",
    subtitle: "Style sobre et professionnel",
    icon: Shield,
    color: "from-blue-500 to-cyan-500",
    pages: [
      { id: "admin-dashboard", label: "Dashboard Admin", icon: BarChart3 },
    ],
  },
  {
    title: "Outils & Dev",
    subtitle: "Utilitaires et démos techniques",
    icon: Zap,
    color: "from-orange-500 to-rose-500",
    pages: [
      { id: "qr-generator", label: "Générateur QR Code", icon: QrCode },
    ],
  },
];

const allPages = menuSections.flatMap((section) =>
  section.pages.map((page) => ({
    ...page,
    sectionTitle: section.title,
    sectionColor: section.color,
  }))
);

export default function DevMenuPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grouped");

  const handleNavigate = (pageId) => {
    const route = ROUTE_MAP[pageId];
    if (route) navigate(route);
    else alert(`Page "${pageId}" pas encore créée.`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-y-auto pb-32">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 w-[550px] h-[550px] bg-pink-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Header sticky */}
      <div className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">

            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center animate-pulse">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 mb-4">
              marsAI 2026
            </h1>
            <p className="text-white/40 text-lg md:text-xl font-medium uppercase tracking-[0.3em]">
              Menu de Développement
            </p>

            <div className="flex items-center justify-center gap-2 mt-8">
              {[
                { key: "grouped", label: "Vue Groupée", icon: Grid3x3 },
                { key: "list",    label: "Vue Liste",   icon: List },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setViewMode(key)}
                  className={`px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2 ${
                    viewMode === key
                      ? "bg-white/10 text-white border border-white/20"
                      : "bg-white/[0.02] text-white/40 border border-white/5 hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">

        {/* Vue groupée */}
        {viewMode === "grouped" && (
          <div className="space-y-12">
            {menuSections.map((section, si) => {
              const SectionIcon = section.icon;
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: si * 0.1 }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 bg-gradient-to-br ${section.color} rounded-2xl flex items-center justify-center`}>
                      <SectionIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{section.title}</h2>
                      <p className="text-white/40 text-sm">{section.subtitle}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {section.pages.map((page, pi) => {
                      const PageIcon = page.icon;
                      return (
                        <motion.button
                          key={page.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: si * 0.1 + pi * 0.05 }}
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleNavigate(page.id)}
                          className="group relative bg-white/[0.02] border border-white/5 hover:border-white/20 rounded-3xl p-6 md:p-8 transition-all text-left overflow-hidden"
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                          <div className="relative">
                            <div className={`w-14 h-14 bg-gradient-to-br ${section.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xl`}>
                              <PageIcon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="font-black text-lg md:text-xl mb-2 tracking-tight uppercase group-hover:text-blue-400 transition-colors">
                              {page.label}
                            </h3>
                            <p className="text-[10px] text-white/30 font-mono uppercase tracking-wider">{page.id}</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Vue liste */}
        {viewMode === "list" && (
          <div className="space-y-3">
            {allPages.map((page, index) => {
              const PageIcon = page.icon;
              return (
                <motion.button
                  key={page.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  whileHover={{ x: 8 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigate(page.id)}
                  className="group w-full relative bg-white/[0.02] border border-white/5 hover:border-white/20 rounded-2xl p-5 transition-all flex items-center gap-4 overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${page.sectionColor} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className={`relative w-12 h-12 bg-gradient-to-br ${page.sectionColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <PageIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="relative flex-1 text-left">
                    <h3 className="font-black text-base md:text-lg mb-1 tracking-tight uppercase group-hover:text-blue-400 transition-colors">
                      {page.label}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-white/30 font-mono uppercase tracking-wider">
                      <span>{page.sectionTitle}</span>
                      <span>•</span>
                      <span>{page.id}</span>
                    </div>
                  </div>
                  <div className="relative w-10 h-10 bg-white/5 group-hover:bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

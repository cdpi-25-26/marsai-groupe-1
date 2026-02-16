import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Home,
  Trophy,
  Calendar,
  User,
  UserPlus,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router";

export function TopBar() {
  const { t, i18n } = useTranslation();

  /* Etat pour gerer l'ouverture et la fermeture du menu mobile */
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  /* Navigation et location pour gerer les redirection et l'etat actif des liens bleu ou pas bleu */
  const navigate = useNavigate();
  const location = useLocation();

  /* matrix de navigation */
  const navItems = [
    { path: "/discover", icon: Search, label: t("nav.discover") },
    { path: "/", icon: Home, label: t("nav.home") },
    { path: "/competition", icon: Trophy, label: t("nav.competition") },
    { path: "/agenda", icon: Calendar, label: t("nav.agenda") },
    { path: "/profile", icon: User, label: t("nav.profile") },
  ];

  /* Fonction pour gerer ls navigation et la fermeture du menu mobile lors de la navigation */
  const handleNav = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  /* Fonction pour determiner si le lien est actif (bleu) ou pas */
  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 py-4 md:px-8 md:py-6 pointer-events-none"
      >
        <div className="bg-white/[0.03] backdrop-blur-[40px] border border-white/10 rounded-full h-[56px] md:h-[72px] flex items-center justify-between px-4 md:px-8 gap-2 md:gap-6 shadow-2xl shadow-black/60 pointer-events-auto w-full max-w-[1400px] relative overflow-hidden">
          {/* Specular Highlight (Top Edge) */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          {/* Inner Refraction Border */}
          <div className="absolute inset-[1px] rounded-full border border-white/[0.05] pointer-events-none" />

          {/* Logo marsAI */}
          <button
            onClick={() => handleNav("/")}
            className="flex items-baseline gap-1 group whitespace-nowrap cursor-pointer"
          >
            <span className="text-base md:text-2xl font-black uppercase tracking-tighter text-white">
              MARS
            </span>
            <span className="text-base md:text-2xl font-black uppercase tracking-tighter text-purple-500 group-hover:scale-110 transition-transform">
              AI
            </span>
          </button>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className="relative flex flex-col items-center justify-center px-4 py-2 rounded-full hover:bg-white/10 transition-all group cursor-pointer"
                title={item.label}
              >
                <item.icon
                  className={`w-5 h-5 transition-all ${
                    isActive(item.path)
                      ? "text-[#51A2FF]"
                      : "text-white/40 group-hover:text-white"
                  }`}
                />
                {isActive(item.path) && (
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute -bottom-1 w-1.5 h-1.5 bg-[#51A2FF] rounded-full shadow-[0_0_12px_#51A2FF]"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Desktop Lang Switch + Auth Buttons - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language switch */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => i18n.changeLanguage("fr")}
                className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                  i18n.language === "fr"
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {t("lang.fr")}
              </button>
              <span className="text-white/20">|</span>
              <button
                onClick={() => i18n.changeLanguage("en")}
                className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                  i18n.language === "en"
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {t("lang.en")}
              </button>
            </div>

            <button
              onClick={() => handleNav("/auth/register")}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-[#51A2FF] text-white text-sm font-bold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden lg:inline">{t("auth.join")}</span>
            </button>
          </div>

          {/* Mobile: Simple burger menu */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2.5 text-white/50 hover:text-white transition-colors cursor-pointer bg-white/5 rounded-full border border-white/5"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.div>

      {/* Mobile Menu - Clean and Simple */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[72px] left-4 right-4 z-[90] md:hidden"
          >
            <div className="bg-white/[0.03] backdrop-blur-[40px] border border-white/10 rounded-[24px] shadow-2xl shadow-black/60 overflow-hidden">
              {/* Navigation Items */}
              <div className="p-4 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-[16px] transition-all ${
                      isActive(item.path)
                        ? "bg-white/10 border border-[#51A2FF]/30 text-white"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 ${
                        isActive(item.path) ? "text-[#51A2FF]" : ""
                      }`}
                    />
                    <span className="font-bold text-sm uppercase tracking-wider">
                      {item.label}
                    </span>
                    {isActive(item.path) && (
                      <div className="ml-auto w-2 h-2 bg-[#51A2FF] rounded-full shadow-[0_0_12px_#51A2FF]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Mobile Language Switch */}
              <div className="border-t border-white/10 p-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => i18n.changeLanguage("fr")}
                  className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                    i18n.language === "fr"
                      ? "text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {t("lang.fr")}
                </button>
                <span className="text-white/20">|</span>
                <button
                  onClick={() => i18n.changeLanguage("en")}
                  className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                    i18n.language === "en"
                      ? "text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {t("lang.en")}
                </button>
              </div>

              {/* Auth Button */}
              <div className="border-t border-white/10 p-4">
                <button
                  onClick={() => handleNav("/auth/register")}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-[16px] bg-gradient-to-r from-purple-600 to-[#51A2FF] text-white font-bold text-sm uppercase tracking-wider shadow-lg transition-all cursor-pointer"
                >
                  <UserPlus className="w-5 h-5" />
                  {t("auth.join")}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
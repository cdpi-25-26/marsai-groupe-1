import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import Cropper from "react-easy-crop";
import {
  Settings, Share2, Heart, Eye, Film as FilmIcon,
  Trophy, Calendar, MapPin, MoreHorizontal,
  Grid3x3, Bookmark, Check, X, Camera, Save, Loader2, ZoomIn,
} from "lucide-react";
import { getMyProfile, updateMyProfile, uploadProfilePicture } from "../../api/users";
import { getFilms } from "../../api/films";

// ── Utilitaire de recadrage canvas ──────────────────────────────────────────
function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = url;
  });
}

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  );
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92));
}

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("films");
  const [showEditModal, setShowEditModal] = useState(false);

  const [editForm, setEditForm] = useState({ username: "", biography: "", country: "" });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarError, setAvatarError] = useState("");
  const [avatarImgError, setAvatarImgError] = useState(false);

  // Crop modal
  const [showCropModal, setShowCropModal] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/auth/login");
      return;
    }
    getMyProfile()
      .then((profileRes) => {
        const u = profileRes.data;
        setUser(u);
        setEditForm({
          username: u.username || "",
          biography: u.biography || "",
          country: u.country || "",
        });
        return getFilms({ userId: u.id });
      })
      .then((filmsRes) => {
        setFilms(filmsRes.data?.films || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const onCropComplete = useCallback((_, pixels) => setCroppedAreaPixels(pixels), []);

  const handleCropConfirm = async () => {
    if (!croppedAreaPixels) return;
    setShowCropModal(false);
    setAvatarError("");
    setUploadingAvatar(true);
    try {
      const blob = await getCroppedImg(rawImageSrc, croppedAreaPixels);
      const localUrl = URL.createObjectURL(blob);
      setAvatarPreview(localUrl);
      setAvatarImgError(false);
      const croppedFile = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      const res = await uploadProfilePicture(croppedFile);
      setUser((prev) => ({ ...prev, profilePicture: res.data.profilePicture }));
    } catch {
      setAvatarError("Échec de l'upload. Vérifie ta connexion.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await updateMyProfile(editForm);
      setUser(res.data.user);
      setShowEditModal(false);
    } catch (err) {
      setSaveError(err.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "films",     label: t("pages.profile.tabs.portfolio"), icon: Grid3x3 },
    { id: "favorites", label: t("pages.profile.tabs.favorites"), icon: Bookmark },
    { id: "about",     label: t("pages.profile.tabs.bio"),       icon: MoreHorizontal },
  ];

  const avatarInitials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "?";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground pb-32 -mt-[88px] md:-mt-[120px]">
      {/* ── Cover Banner ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-48 md:h-72 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#030213] via-purple-900/40 to-background" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#51A2FF]/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* ── Avatar & Actions ── */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20 mb-10 relative z-10">
          {/* Avatar cliquable pour changer la photo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="relative shrink-0"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full blur-xl opacity-40 animate-pulse" />
            <div
              onClick={handleAvatarClick}
              className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-[#111] p-1.5 border-4 border-[#050505] relative overflow-hidden cursor-pointer group"
            >
              {(avatarPreview || (user?.profilePicture && !avatarImgError)) ? (
                <img
                  src={avatarPreview || user.profilePicture}
                  className="w-full h-full rounded-full object-cover"
                  onError={() => setAvatarImgError(true)}
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-600 to-purple-700 flex items-center justify-center text-4xl md:text-5xl font-black shadow-inner">
                  {avatarInitials}
                </div>
              )}
              {/* Overlay caméra */}
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingAvatar ? (
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
              </div>
            </div>
            <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-cyan-500 rounded-full p-1.5 md:p-2 border-4 border-[#050505] shadow-xl">
              <Check className="w-3 h-3 md:w-4 md:h-4 text-white" strokeWidth={3} />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />
            {avatarError && (
              <p className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
                {avatarError}
              </p>
            )}
          </motion.div>

          {/* Nom + boutons */}
          <div className="flex-1 flex flex-col md:flex-row items-center md:items-end justify-between gap-4 w-full pb-2">
            <div className="text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase">
                {user?.username || "—"}
              </h1>
              <p className="text-cyan-400 font-bold text-base sm:text-lg mt-1">
                @{user?.username || "—"}
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 sm:gap-3"
            >
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl font-black uppercase tracking-widest text-xs bg-white text-black hover:bg-cyan-400 shadow-xl transition-all"
              >
                <Settings className="w-4 h-4" />
                Modifier le profil
              </button>

              <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group">
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-cyan-400" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* ── Bio & Infos ── */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 mb-12 lg:mb-16">
          <div className="lg:col-span-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">
              {t("pages.profile.biography")}
            </h2>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed font-light mb-6 italic">
              {user?.biography || (
                <span className="text-white/30 not-italic">
                  Aucune biographie — cliquez sur &ldquo;Modifier le profil&rdquo; pour en ajouter une.
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm font-black uppercase tracking-widest text-white/40">
              {user?.country && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-500" />
                  {user.country}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
                  : "—"}
              </div>
            </div>
          </div>

          {/* Audience card */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6">
              {t("pages.profile.audience")}
            </h2>
            <div className="grid grid-cols-2 gap-6 sm:gap-8">
              <div>
                <div className="text-2xl sm:text-3xl font-black tracking-tighter mb-1">
                  {films.length}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/30">
                  Films soumis
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black tracking-tighter mb-1">
                  {user?.role === "REALISATEUR" ? "🎬" : user?.role === "JURY" ? "⚖️" : "🛡️"}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/30">
                  {user?.role}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 lg:mb-16">
          {[
            {
              icon: FilmIcon,
              value: films.length,
              label: t("pages.profile.stats.films"),
              gradient: "from-cyan-600/20 to-cyan-900/10",
              border: "border-cyan-500/20",
              text: "text-cyan-400",
            },
            {
              icon: Heart,
              value: "—",
              label: t("pages.profile.stats.applause"),
              gradient: "from-pink-600/20 to-pink-900/10",
              border: "border-pink-500/20",
              text: "text-pink-400",
            },
            {
              icon: Eye,
              value: "—",
              label: t("pages.profile.stats.views"),
              gradient: "from-purple-600/20 to-purple-900/10",
              border: "border-purple-500/20",
              text: "text-purple-400",
            },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className={`rounded-[2rem] p-6 sm:p-8 border ${stat.border} bg-gradient-to-br ${stat.gradient} backdrop-blur-xl relative overflow-hidden group`}
            >
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon className="w-20 h-20 sm:w-24 sm:h-24" />
              </div>
              <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 mb-4 ${stat.text}`} />
              <div className="text-3xl sm:text-4xl font-black tracking-tighter mb-1">{stat.value}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="mb-10 sm:mb-12">
          <div className="flex bg-white/5 p-1.5 rounded-3xl border border-white/10 backdrop-blur-md max-w-xs sm:max-w-md mx-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-3.5 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-white text-black shadow-xl"
                    : "text-white/40 hover:text-white"
                }`}
              >
                <tab.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="min-h-[400px] pb-8">
          {/* Portfolio */}
          {activeTab === "films" && films.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {films.map((film, idx) => (
                <motion.div
                  key={film.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -8 }}
                  onClick={() => navigate(`/film/${film.id}`)}
                  className="aspect-[4/5] relative cursor-pointer group rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-white/10 bg-white/5 shadow-2xl"
                >
                  {film.posterPath ? (
                    <img
                      src={film.posterPath}
                      alt={film.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/0 flex items-center justify-center">
                      <FilmIcon className="w-10 h-10 text-white/10" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 sm:p-6">
                    <h3 className="font-black text-sm sm:text-lg uppercase tracking-tight mb-1 sm:mb-2 line-clamp-2">
                      {film.title}
                    </h3>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-fit ${
                      film.status === "APPROVED" ? "bg-green-500/20 text-green-400" :
                      film.status === "PENDING" ? "bg-yellow-500/20 text-yellow-400" :
                      film.status === "REJECTED" ? "bg-red-500/20 text-red-400" :
                      "bg-cyan-500/20 text-cyan-400"
                    }`}>
                      {film.status}
                    </span>
                  </div>

                  {film.status === "SELECTION_OFFICIELLE" && (
                    <div className="absolute top-3 right-3 bg-pink-500 rounded-xl px-2 py-1 text-[8px] sm:text-[9px] font-black text-white flex items-center gap-1 shadow-xl">
                      <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      Sélection
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === "films" && films.length === 0 && (
            <div className="text-center py-20 sm:py-24 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-cyan-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-6 sm:mb-8">
                <FilmIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white/20" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black mb-3 sm:mb-4 tracking-tighter uppercase">
                {t("pages.profile.noSubmissions")}
              </h3>
              <button
                onClick={() => navigate("/soumission")}
                className="bg-white text-black font-black uppercase tracking-widest py-3 sm:py-4 px-8 sm:px-10 rounded-2xl hover:bg-cyan-400 transition-all shadow-xl text-xs"
              >
                Créer un film
              </button>
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="text-center py-24 sm:py-32 opacity-40">
              <Heart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-6 text-pink-500" strokeWidth={1} />
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">Collection vide</h3>
              <p className="text-sm font-medium mt-2">Aimez des films pour les retrouver ici.</p>
            </div>
          )}

          {activeTab === "about" && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 sm:p-10 md:p-16">
                <div className="grid md:grid-cols-2 gap-10 md:gap-16">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 sm:mb-8">
                      Informations
                    </h3>
                    <div className="space-y-5 sm:space-y-6">
                      {[
                        { label: "Localisation", value: user?.country || "—" },
                        { label: "Membre depuis", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "—" },
                        { label: "Rôle", value: user?.role || "—" },
                        { label: "Films soumis", value: films.length },
                      ].map((item) => (
                        <div key={item.label} className="flex flex-col border-b border-white/5 pb-4">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">
                            {item.label}
                          </span>
                          <span className="font-bold text-base sm:text-lg">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 sm:mb-8">
                      Bio Détaillée
                    </h3>
                    <p className="text-white/60 leading-relaxed font-light text-base sm:text-lg">
                      {user?.biography || "Aucune biographie renseignée."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal de recadrage avatar ── */}
      <AnimatePresence>
        {showCropModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
            >
              <div className="px-6 pt-6 pb-4 flex items-center justify-between">
                <h2 className="text-lg font-black uppercase tracking-tighter">Cadrer la photo</h2>
                <button
                  onClick={() => setShowCropModal(false)}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Zone de recadrage */}
              <div className="relative w-full bg-black" style={{ height: 300 }}>
                <Cropper
                  image={rawImageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              {/* Slider zoom */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <ZoomIn className="w-4 h-4 text-white/30 shrink-0" />
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCropModal(false)}
                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCropConfirm}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-600 text-white font-black uppercase tracking-widest text-xs hover:bg-cyan-500 transition-all"
                  >
                    <Check className="w-4 h-4" strokeWidth={3} />
                    Confirmer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal d'édition du profil ── */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowEditModal(false)}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">
                  Modifier le profil
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">
                    Pseudo
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                    placeholder="Votre pseudo"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">
                    Biographie
                  </label>
                  <textarea
                    value={editForm.biography}
                    onChange={(e) => setEditForm((f) => ({ ...f, biography: e.target.value }))}
                    rows={4}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
                    placeholder="Parlez de vous, de votre vision cinématographique..."
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">
                    Pays (code ISO — ex: FR, US, MA)
                  </label>
                  <input
                    type="text"
                    value={editForm.country}
                    onChange={(e) => setEditForm((f) => ({ ...f, country: e.target.value.toUpperCase().slice(0, 3) }))}
                    maxLength={3}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-all uppercase"
                    placeholder="FR"
                  />
                </div>

                {saveError && (
                  <p className="text-red-400 text-xs font-bold">{saveError}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-600 text-white font-black uppercase tracking-widest text-xs hover:bg-cyan-500 transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Sauvegarder
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

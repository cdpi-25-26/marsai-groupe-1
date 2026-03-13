import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload, CheckCircle, XCircle, Film, Loader2, Sparkles,
  ChevronLeft, FileText, X, Plus, ImageIcon, Bot,
} from "lucide-react";
import { uploadSubtitle, uploadThumbnail } from "../../api/films.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const CATEGORIES = [
  "Art Numérique", "Fiction", "Documentaire",
  "Animation", "Séducteur", "Expérimental",
];

const SUBTITLE_LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "ar", label: "العربية" },
  { code: "zh", label: "中文" },
];

const AI_TOOLS = [
  { id: "chatgpt",   label: "ChatGPT",          color: "from-emerald-500/20 to-teal-500/20   border-emerald-500/40  text-emerald-300" },
  { id: "claude",    label: "Claude",            color: "from-orange-500/20 to-amber-500/20   border-orange-500/40   text-orange-300"  },
  { id: "gemini",    label: "Gemini",            color: "from-blue-500/20 to-cyan-500/20      border-blue-500/40     text-blue-300"    },
  { id: "midjourney",label: "Midjourney",        color: "from-purple-500/20 to-violet-500/20  border-purple-500/40   text-purple-300"  },
  { id: "dalle",     label: "DALL·E 3",          color: "from-pink-500/20 to-rose-500/20      border-pink-500/40     text-pink-300"    },
  { id: "stablediff",label: "Stable Diffusion",  color: "from-indigo-500/20 to-blue-500/20   border-indigo-500/40   text-indigo-300"  },
  { id: "flux",      label: "Flux",              color: "from-cyan-500/20 to-sky-500/20       border-cyan-500/40     text-cyan-300"    },
  { id: "sora",      label: "Sora",              color: "from-violet-500/20 to-purple-500/20  border-violet-500/40   text-violet-300"  },
  { id: "runway",    label: "Runway",            color: "from-fuchsia-500/20 to-pink-500/20   border-fuchsia-500/40  text-fuchsia-300" },
  { id: "kling",     label: "Kling",             color: "from-red-500/20 to-orange-500/20     border-red-500/40      text-red-300"     },
  { id: "pika",      label: "Pika",              color: "from-yellow-500/20 to-amber-500/20   border-yellow-500/40   text-yellow-300"  },
  { id: "elevenlabs",label: "ElevenLabs",        color: "from-teal-500/20 to-green-500/20     border-teal-500/40     text-teal-300"    },
  { id: "suno",      label: "Suno",              color: "from-lime-500/20 to-green-500/20     border-lime-500/40     text-lime-300"    },
  { id: "udio",      label: "Udio",              color: "from-sky-500/20 to-blue-500/20       border-sky-500/40      text-sky-300"     },
];

function StepBar({ currentStep }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3].map((step) => (
        <div
          key={step}
          className={`h-1 flex-1 rounded-full transition-all duration-500 ${
            step < currentStep
              ? "bg-gradient-to-r from-purple-500 to-[#51A2FF]"
              : step === currentStep
              ? "bg-gradient-to-r from-[#51A2FF] to-violet-400"
              : "bg-white/10"
          }`}
        />
      ))}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-[0.28em] mb-5"
      style={{
        background: "linear-gradient(90deg, #a78bfa 0%, #60a5fa 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {children}
    </p>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="block text-white/55 text-[10px] font-bold uppercase tracking-[0.18em] mb-3">
      {children}
    </label>
  );
}

const inputCls =
  "w-full px-5 py-4 rounded-2xl bg-white/[0.05] border border-white/[0.10] text-white placeholder-white/25 text-sm font-medium outline-none focus:border-violet-400/50 focus:bg-white/[0.07] transition-all";

export default function UploadPage() {
  const [step, setStep] = useState(1);

  // Step 1
  const [title, setTitle]       = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry]   = useState("");
  const [duration, setDuration] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [aiTools, setAiTools]   = useState([]);

  // Step 2 — vidéo
  const [file, setFile]         = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef                = useRef(null);

  // Step 2 — thumbnail
  const [thumbnail, setThumbnail]           = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const thumbnailInputRef                   = useRef(null);

  // Step 2 — sous-titres
  const [subtitles, setSubtitles]     = useState([]);
  const [selectedLang, setSelectedLang] = useState("fr");
  const subtitleInputRef              = useRef(null);

  // Submission
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError]   = useState("");

  const toggleAiTool = (id) =>
    setAiTools((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );

  const handleFile = (f) => { if (f) setFile(f); };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleThumbnail = (f) => {
    if (!f) return;
    setThumbnail(f);
    setThumbnailPreview(URL.createObjectURL(f));
  };

  const addSubtitle = (f) => {
    if (!f) return;
    setSubtitles((prev) => [
      ...prev.filter((s) => s.language !== selectedLang),
      { file: f, language: selectedLang },
    ]);
  };

  const removeSubtitle = (language) =>
    setSubtitles((prev) => prev.filter((s) => s.language !== language));

  const handleSubmit = async () => {
    setStatus("uploading");
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("video", file);
    formData.append("title", title);
    if (category) formData.append("category", category);
    if (country)  formData.append("country", country);
    if (duration) formData.append("duration", duration);
    if (synopsis) formData.append("synopsis", synopsis);
    if (aiTools.length) formData.append("aiTools", JSON.stringify(aiTools));

    try {
      const token = localStorage.getItem("token");
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

      const uploadRes = await fetch(`${API_URL}/api/videos/upload`, {
        method: "POST",
        headers: authHeader,
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        setError(uploadData.error || "Erreur lors de l'upload");
        setStatus("error");
        return;
      }

      const filmId = uploadData.filmId;
      const videoUploadId = uploadData.id;

      if (token && thumbnail) {
        try { await uploadThumbnail(thumbnail, videoUploadId); } catch { /* silencieux */ }
      }

      if (token && filmId && subtitles.length > 0) {
        await Promise.allSettled(
          subtitles.map(({ file: subFile, language }) =>
            uploadSubtitle(filmId, subFile, language)
          )
        );
      }

      setResult(uploadData);
      setStatus("success");
    } catch {
      setError("Impossible de contacter le serveur");
      setStatus("error");
    }
  };

  const reset = () => {
    setStep(1); setTitle(""); setCategory(""); setCountry("");
    setDuration(""); setSynopsis(""); setAiTools([]);
    setFile(null); setThumbnail(null); setThumbnailPreview(null);
    setSubtitles([]); setSelectedLang("fr");
    setStatus("idle"); setResult(null); setError("");
  };

  return (
    <div className="min-h-screen px-5 pb-36">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-5 pt-1">
        <div>
          <h1
            className="text-[48px] font-black uppercase leading-none tracking-tight"
            style={{
              background: "linear-gradient(135deg, #fff 20%, #a78bfa 60%, #60a5fa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            SOUMISSION
          </h1>
          <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.22em] mt-2">
            Étape {step} sur 3 &nbsp;·&nbsp; Marsai 2026
          </p>
        </div>

        <button className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg,#1a0a3a,#0a1a3a)", border: "1px solid rgba(167,139,250,0.25)" }}
        >
          <Sparkles className="w-6 h-6 text-violet-400" />
        </button>
      </div>

      {/* ── Progress Bar ── */}
      <div className="mb-8">
        <StepBar currentStep={step} />
      </div>

      <AnimatePresence mode="wait">

        {/* ════════════════ STEP 1 ════════════════ */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.22 }}
            className="space-y-8"
          >
            {/* Identité de l'œuvre */}
            <div className="rounded-3xl p-5 space-y-4"
              style={{ background: "linear-gradient(135deg,rgba(167,139,250,0.06),rgba(96,165,250,0.04))", border: "1px solid rgba(167,139,250,0.12)" }}
            >
              <SectionLabel>Identité de l'œuvre</SectionLabel>

              <div>
                <FieldLabel>Titre du film</FieldLabel>
                <input type="text" value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex : NEURAL ODYSSEY"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Catégorie</FieldLabel>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className={inputCls + " appearance-none cursor-pointer"}
                  >
                    <option value="" disabled className="bg-[#0d0d1a]">Sélectionner…</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#0d0d1a]">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>Pays d'origine</FieldLabel>
                  <input type="text" value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="FRANCE 🇫🇷"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Détails techniques */}
            <div className="rounded-3xl p-5 space-y-4"
              style={{ background: "linear-gradient(135deg,rgba(96,165,250,0.06),rgba(52,211,153,0.04))", border: "1px solid rgba(96,165,250,0.12)" }}
            >
              <SectionLabel>Détails techniques</SectionLabel>

              <div>
                <FieldLabel>Durée estimée</FieldLabel>
                <input type="text" value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Ex: 01:45"
                  className={inputCls}
                />
              </div>

              <div>
                <FieldLabel>Synopsis</FieldLabel>
                <textarea value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  placeholder="Racontez votre histoire…"
                  rows={5}
                  className={inputCls + " rounded-2xl resize-none"}
                />
              </div>
            </div>

            {/* IA utilisée */}
            <div className="rounded-3xl p-5 space-y-4"
              style={{ background: "linear-gradient(135deg,rgba(251,191,36,0.05),rgba(244,114,182,0.05))", border: "1px solid rgba(251,191,36,0.12)" }}
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-amber-400" />
                <SectionLabel>IA utilisée pour générer</SectionLabel>
              </div>

              <p className="text-white/35 text-xs -mt-2">
                Sélectionne les outils IA impliqués dans la création de ton film.
              </p>

              <div className="flex flex-wrap gap-2">
                {AI_TOOLS.map((tool) => {
                  const active = aiTools.includes(tool.id);
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => toggleAiTool(tool.id)}
                      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border bg-gradient-to-r transition-all duration-200 ${tool.color} ${
                        active
                          ? "opacity-100 scale-105 shadow-lg"
                          : "opacity-40 hover:opacity-70"
                      }`}
                    >
                      {tool.label}
                    </button>
                  );
                })}
              </div>

              {aiTools.length > 0 && (
                <p className="text-white/40 text-xs">
                  {aiTools.length} outil{aiTools.length > 1 ? "s" : ""} sélectionné{aiTools.length > 1 ? "s" : ""}
                </p>
              )}
            </div>

            <button
              onClick={() => title && setStep(2)}
              disabled={!title}
              className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)", boxShadow: title ? "0 0 30px rgba(124,58,237,0.35)" : "none" }}
            >
              Étape suivante →
            </button>
          </motion.div>
        )}

        {/* ════════════════ STEP 2 ════════════════ */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.22 }}
            className="space-y-6"
          >
            {/* Fichier vidéo */}
            <div className="rounded-3xl p-5 space-y-4"
              style={{ background: "linear-gradient(135deg,rgba(96,165,250,0.06),rgba(167,139,250,0.04))", border: "1px solid rgba(96,165,250,0.12)" }}
            >
              <SectionLabel>Fichier vidéo</SectionLabel>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className="relative flex flex-col items-center justify-center gap-3 py-12 rounded-2xl border-2 border-dashed cursor-pointer transition-all"
                style={{
                  borderColor: dragOver ? "#60a5fa" : file ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.12)",
                  background: dragOver
                    ? "rgba(96,165,250,0.08)"
                    : file
                    ? "rgba(124,58,237,0.06)"
                    : "rgba(255,255,255,0.02)",
                }}
              >
                <input ref={inputRef} type="file"
                  accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                {file ? (
                  <>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.3),rgba(37,99,235,0.3))" }}
                    >
                      <Film className="w-7 h-7 text-violet-300" />
                    </div>
                    <p className="text-white font-bold text-sm truncate max-w-[260px]">{file.name}</p>
                    <p className="text-white/40 text-xs">{(file.size / 1024 / 1024).toFixed(1)} Mo</p>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      <Upload className="w-7 h-7 text-white/25" />
                    </div>
                    <p className="text-white/55 text-sm font-bold uppercase tracking-wider">Glisser une vidéo ici</p>
                    <p className="text-white/25 text-xs">mp4 · mov · avi · webm — max 500 Mo</p>
                  </>
                )}
              </div>
            </div>

            {/* Miniature */}
            <div className="rounded-3xl p-5 space-y-3"
              style={{ background: "linear-gradient(135deg,rgba(244,114,182,0.06),rgba(251,191,36,0.04))", border: "1px solid rgba(244,114,182,0.12)" }}
            >
              <SectionLabel>Miniature <span className="opacity-40 normal-case font-medium tracking-normal">(optionnel)</span></SectionLabel>

              <div
                onClick={() => thumbnailInputRef.current?.click()}
                className="flex items-center gap-4 px-4 py-3 rounded-2xl border border-dashed cursor-pointer transition-all hover:bg-white/[0.04]"
                style={{ borderColor: thumbnailPreview ? "rgba(244,114,182,0.4)" : "rgba(255,255,255,0.10)" }}
              >
                <input ref={thumbnailInputRef} type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleThumbnail(e.target.files[0])}
                />
                {thumbnailPreview ? (
                  <>
                    <img src={thumbnailPreview} alt="thumb"
                      className="w-16 h-10 object-cover rounded-xl shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-bold truncate">{thumbnail.name}</p>
                      <p className="text-white/40 text-xs">{(thumbnail.size / 1024).toFixed(0)} Ko</p>
                    </div>
                    <button type="button"
                      onClick={(e) => { e.stopPropagation(); setThumbnail(null); setThumbnailPreview(null); }}
                      className="text-white/30 hover:text-red-400 transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(244,114,182,0.10)" }}
                    >
                      <ImageIcon className="w-5 h-5 text-pink-400" />
                    </div>
                    <div>
                      <p className="text-white/60 text-sm font-bold">Ajouter une miniature</p>
                      <p className="text-white/25 text-xs">jpg · png · webp</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sous-titres */}
            <div className="rounded-3xl p-5 space-y-3"
              style={{ background: "linear-gradient(135deg,rgba(52,211,153,0.06),rgba(96,165,250,0.04))", border: "1px solid rgba(52,211,153,0.12)" }}
            >
              <SectionLabel>Sous-titres <span className="opacity-40 normal-case font-medium tracking-normal">(optionnel)</span></SectionLabel>

              <div className="flex gap-3">
                <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.10] text-white text-sm font-medium outline-none focus:border-emerald-400/50 transition-all appearance-none cursor-pointer"
                >
                  {SUBTITLE_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-[#0d0d1a]">{l.label}</option>
                  ))}
                </select>

                <button type="button" onClick={() => subtitleInputRef.current?.click()}
                  className="flex-1 py-3 rounded-xl bg-white/[0.04] border border-white/[0.10] text-white/60 text-sm font-bold uppercase tracking-[0.12em] hover:bg-white/[0.08] hover:border-emerald-400/30 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Ajouter .srt / .vtt
                </button>
                <input ref={subtitleInputRef} type="file" accept=".srt,.vtt"
                  className="hidden" onChange={(e) => addSubtitle(e.target.files[0])}
                />
              </div>

              {subtitles.length > 0 && (
                <div className="space-y-2">
                  {subtitles.map(({ file: subFile, language }) => (
                    <div key={language}
                      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-emerald-300 text-xs font-black uppercase tracking-wider shrink-0">
                          {language.toUpperCase()}
                        </span>
                        <span className="text-white/40 text-xs truncate">{subFile.name}</span>
                      </div>
                      <button type="button" onClick={() => removeSubtitle(language)}
                        className="text-white/30 hover:text-red-400 transition-colors shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 py-5 rounded-2xl bg-white/[0.05] border border-white/[0.09] text-white/50 font-black uppercase tracking-[0.15em] text-sm hover:bg-white/[0.09] transition-all flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" /> Retour
              </button>
              <button onClick={() => file && setStep(3)} disabled={!file}
                className="flex-[2] py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", boxShadow: file ? "0 0 24px rgba(37,99,235,0.35)" : "none" }}
              >
                Étape suivante →
              </button>
            </div>
          </motion.div>
        )}

        {/* ════════════════ STEP 3 ════════════════ */}
        {step === 3 && status !== "success" && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.22 }}
            className="space-y-6"
          >
            <div className="rounded-3xl p-5 space-y-3"
              style={{ background: "linear-gradient(135deg,rgba(167,139,250,0.07),rgba(96,165,250,0.05))", border: "1px solid rgba(167,139,250,0.15)" }}
            >
              <SectionLabel>Récapitulatif</SectionLabel>

              {[
                { label: "Titre",       value: title },
                { label: "Catégorie",   value: category },
                { label: "Pays",        value: country },
                { label: "Durée",       value: duration },
                { label: "Fichier",     value: file?.name },
                { label: "Miniature",   value: thumbnail?.name },
                {
                  label: "IA",
                  value: aiTools.length
                    ? aiTools.map((id) => AI_TOOLS.find((t) => t.id === id)?.label).filter(Boolean).join(", ")
                    : null,
                },
                {
                  label: "Sous-titres",
                  value: subtitles.length
                    ? subtitles.map((s) => s.language.toUpperCase()).join(", ")
                    : null,
                },
              ]
                .filter((row) => row.value)
                .map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-4 py-2 border-b border-white/[0.05] last:border-0">
                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.18em] shrink-0 pt-0.5">
                      {row.label}
                    </span>
                    <span className="text-white text-sm font-medium text-right max-w-[220px] break-words">
                      {row.value}
                    </span>
                  </div>
                ))}
            </div>

            {status === "error" && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/25">
                <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} disabled={status === "uploading"}
                className="flex-1 py-5 rounded-2xl bg-white/[0.05] border border-white/[0.09] text-white/50 font-black uppercase tracking-[0.15em] text-sm hover:bg-white/[0.09] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <ChevronLeft className="w-5 h-5" /> Retour
              </button>
              <button onClick={handleSubmit} disabled={status === "uploading"}
                className="flex-[2] py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm text-white disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#7c3aed,#db2777)", boxShadow: "0 0 30px rgba(124,58,237,0.4)" }}
              >
                {status === "uploading" ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Envoi…</>
                ) : (
                  "Soumettre"
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ════════════════ SUCCESS ════════════════ */}
        {status === "success" && result && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center py-10">
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
              >
                <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,rgba(52,211,153,0.2),rgba(16,185,129,0.2))", border: "2px solid rgba(52,211,153,0.4)" }}
                >
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
              </motion.div>
              <p className="font-black text-xl uppercase tracking-[0.15em]"
                style={{
                  background: "linear-gradient(90deg,#34d399,#60a5fa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Soumission réussie
              </p>
              <p className="text-white/40 text-sm mt-3">
                Votre film a été soumis à MARSAI 2026
              </p>
            </div>

            {result.youtubeVideoId && (
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-2 text-xs font-mono">
                <div className="flex gap-3">
                  <span className="text-violet-400/70 shrink-0">YouTube ID</span>
                  <span className="text-white/60 break-all">{result.youtubeVideoId}</span>
                </div>
                {result.key && (
                  <div className="flex gap-3">
                    <span className="text-blue-400/70 shrink-0">S3 Key</span>
                    <span className="text-white/60 break-all">{result.key}</span>
                  </div>
                )}
              </div>
            )}

            <button onClick={reset}
              className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all"
              style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(37,99,235,0.15))", border: "1px solid rgba(124,58,237,0.25)", color: "rgba(255,255,255,0.6)" }}
            >
              Nouvelle soumission
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

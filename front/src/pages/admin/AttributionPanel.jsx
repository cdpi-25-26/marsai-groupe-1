import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, CheckCircle, X, Users, Film } from "lucide-react";
import api from "../../api/config";
import { fetchSelectionOfficielle } from "../../api/films";

const pill = {
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.07)",
};

export default function AttributionPanel() {
  const [tab] = useState("manual");
  const [jurors,       setJurors]       = useState([]);
  const [films,        setFilms]        = useState([]);
  const [attributions, setAttributions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [running,      setRunning]      = useState(false);
  const [result,       setResult]       = useState(null); // { ok, msg }
  const [pickedJuror,  setPickedJuror]  = useState(null);

  useEffect(() => {
    Promise.allSettled([
      api.get("/admin/jury-members"),
      fetchSelectionOfficielle(),
      api.get("/admin/attributions"),
    ]).then(([j, f, a]) => {
      if (j.status === "fulfilled") setJurors(j.value.data);
      if (f.status === "fulfilled") setFilms(f.value.data);
      if (a.status === "fulfilled") setAttributions(a.value.data);
      setLoading(false);
    });
  }, []);

  const countFor  = (uid) => attributions.filter((a) => a.userId === uid).length;
  const attrFor   = (fid) => attributions.find((a) => a.filmId === fid);

  async function runAuto() {
    setRunning(true); setResult(null);
    try {
      const r = await api.post("/admin/attributions/auto");
      setResult({ ok: true, msg: r.data.message });
      const a = await api.get("/admin/attributions");
      setAttributions(a.data);
    } catch (e) {
      setResult({ ok: false, msg: e.response?.data?.message ?? "Erreur serveur" });
    } finally { setRunning(false); }
  }

  async function assign(filmId) {
    if (!pickedJuror) return;
    try {
      const r = await api.post("/admin/attributions/manual", { filmId, userId: pickedJuror.id });
      setAttributions((p) => [...p, r.data]);
    } catch (e) {
      setResult({ ok: false, msg: e.response?.data?.message ?? "Erreur attribution" });
    }
  }

  async function remove(id) {
    try {
      await api.delete(`/admin/attributions/${id}`);
      setAttributions((p) => p.filter((a) => a.id !== id));
    } catch { /* ignore */ }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#ad46ff] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24">
      {/* Ambiance */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#ad46ff]/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#51a2ff]/[0.03] rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#050505]/70 backdrop-blur-3xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(173,70,255,0.12)", border: "1px solid rgba(173,70,255,0.2)" }}>
              <Users className="w-5 h-5 text-[#ad46ff]" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">Attribution Films</h1>
              <p className="text-white/30 text-[10px] uppercase tracking-widest">
                {attributions.length}/{films.length} attribués · {jurors.length} jurés
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Toast résultat */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 px-5 py-3.5 rounded-2xl"
              style={{ background: result.ok ? "rgba(48,209,88,0.1)" : "rgba(255,59,48,0.1)", border: `1px solid ${result.ok ? "rgba(48,209,88,0.25)" : "rgba(255,59,48,0.25)"}` }}>
              {result.ok
                ? <CheckCircle className="w-4 h-4 text-[#30d158] shrink-0" />
                : <X className="w-4 h-4 text-red-400 shrink-0" />}
              <p className={`text-sm font-medium ${result.ok ? "text-[#30d158]" : "text-red-400"}`}>{result.msg}</p>
              <button onClick={() => setResult(null)} className="ml-auto text-white/20 hover:text-white/60"><X className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TAB AUTO ── */}
        {tab === "auto" && (
          <>
            {/* Bloc action */}
            <div className="rounded-3xl p-8 text-center" style={pill}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(173,70,255,0.15)", border: "1px solid rgba(173,70,255,0.25)" }}>
                <Zap className="w-7 h-7 text-[#ad46ff]" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight mb-2">Attribution Automatique</h2>
              <p className="text-white/35 text-sm mb-6">
                Distribue les <strong className="text-white">{films.length} films</strong> en round-robin entre{" "}
                <strong className="text-white">{jurors.length} jurés</strong> — ~{jurors.length > 0 ? Math.ceil(films.length / jurors.length) : "—"} films/juré
              </p>
              <button onClick={runAuto} disabled={running || jurors.length === 0}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black uppercase tracking-widest text-sm disabled:opacity-40 transition-opacity"
                style={{ background: "linear-gradient(135deg, #ad46ff, #51a2ff)" }}>
                {running ? <><Loader2 className="w-4 h-4 animate-spin" />Traitement...</> : <><Zap className="w-4 h-4" />Lancer</>}
              </button>
            </div>

            {/* Grille jurés */}
            {jurors.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {jurors.map((j) => {
                  const n = countFor(j.id);
                  return (
                    <div key={j.id} className="rounded-2xl p-4" style={pill}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black"
                          style={{ background: "rgba(81,162,255,0.15)" }}>
                          {j.username?.slice(0, 2).toUpperCase()}
                        </div>
                        <p className="font-black text-xs uppercase tracking-tight truncate">{j.username}</p>
                      </div>
                      <div className="flex justify-between text-[10px] mb-1.5">
                        <span className="text-white/30 uppercase tracking-widest">Films</span>
                        <span className="font-black text-white">{n}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div animate={{ width: `${Math.min((n / 50) * 100, 100)}%` }} transition={{ duration: 0.6 }}
                          className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#51a2ff,#ad46ff)" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── TAB MANUEL ── */}
        {tab === "manual" && (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* Jurés */}
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-3">Choisir un juré</p>
              {jurors.map((j) => (
                <button key={j.id} onClick={() => setPickedJuror(pickedJuror?.id === j.id ? null : j)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
                  style={{
                    ...pill,
                    borderColor: pickedJuror?.id === j.id ? "rgba(173,70,255,0.5)" : "rgba(255,255,255,0.07)",
                    background: pickedJuror?.id === j.id ? "rgba(173,70,255,0.1)" : "rgba(255,255,255,0.02)",
                  }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                    style={{ background: "rgba(81,162,255,0.15)" }}>
                    {j.username?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase truncate">{j.username}</p>
                    <p className="text-white/30 text-[10px]">{countFor(j.id)} films</p>
                  </div>
                  {pickedJuror?.id === j.id && <CheckCircle className="w-4 h-4 text-[#ad46ff] shrink-0" />}
                </button>
              ))}
            </div>

            {/* Films */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-3">
                Films · {pickedJuror ? <span className="text-[#ad46ff] normal-case tracking-normal font-medium">→ {pickedJuror.username}</span> : "sélectionnez un juré"}
              </p>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {films.map((film) => {
                  const attr = attrFor(film.id);
                  const jurorName = attr ? jurors.find((j) => j.id === attr.userId)?.username : null;
                  return (
                    <div key={film.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ ...pill, borderColor: attr ? "rgba(48,209,88,0.2)" : "rgba(255,255,255,0.07)" }}>
                      <Film className="w-4 h-4 text-white/20 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black uppercase truncate">{film.title}</p>
                        <p className="text-white/25 text-[10px]">{film.User?.username ?? "—"}</p>
                      </div>
                      {attr ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-[#30d158] font-black">{jurorName}</span>
                          <button onClick={() => remove(attr.id)}
                            className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-500/20 transition-colors">
                            <X className="w-3 h-3 text-white/30" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => assign(film.id)} disabled={!pickedJuror}
                          className="shrink-0 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-20"
                          style={{
                            background: pickedJuror ? "rgba(173,70,255,0.2)" : "transparent",
                            border: `1px solid ${pickedJuror ? "rgba(173,70,255,0.4)" : "rgba(255,255,255,0.08)"}`,
                            color: pickedJuror ? "#ad46ff" : "rgba(255,255,255,0.2)",
                          }}>
                          Attribuer
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

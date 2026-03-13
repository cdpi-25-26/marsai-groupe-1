import { motion, AnimatePresence } from "motion/react";
import { Play } from "lucide-react";
import { usePlayer } from "../PlayerContext";
import { pill, fmt } from "../utils";

export function SeekDrawer() {
  const { isScrubbing, scrubInfo, durRef } = usePlayer();
  return (
    <AnimatePresence>
      {isScrubbing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.12 }}
          className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
        >
          <div className="flex flex-col items-center gap-1.5 px-8 py-5 rounded-3xl" style={pill}>
            <span className="text-white text-2xl font-black">
              {scrubInfo.delta >= 0 ? "▶▶" : "◀◀"}
            </span>
            <span className="text-white text-3xl font-bold tabular-nums tracking-tight">
              {scrubInfo.delta >= 0 ? `+${scrubInfo.delta}` : scrubInfo.delta}s
            </span>
            <span className="text-white/55 text-sm tabular-nums">{fmt(scrubInfo.target)}</span>
            <div className="w-36 h-[3px] bg-white/20 rounded-full overflow-hidden mt-1">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#51a2ff] to-[#ad46ff]"
                style={{ width: `${durRef.current > 0 ? (scrubInfo.target / durRef.current) * 100 : 0}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function TapToPlay() {
  const { playing, videoError, videoReady, doPlay } = usePlayer();
  if (playing || videoError) return null;
  return (
    <div
      className="md:hidden absolute inset-0 z-20 flex flex-col items-center justify-center gap-4"
      onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); doPlay(); }}
    >
      {videoReady ? (
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={pill}>
          <Play className="w-9 h-9 fill-white stroke-none ml-1" />
        </div>
      ) : (
        <>
          <div className="w-10 h-10 rounded-full border-4 border-white/20 border-t-white animate-spin" />
          <p className="text-white/50 text-sm">Chargement...</p>
        </>
      )}
    </div>
  );
}

export function ErrorOverlay() {
  const { videoError } = usePlayer();
  if (!videoError) return null;
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/80">
      <span className="text-white/60 text-4xl">⚠️</span>
      <p className="text-white font-bold text-lg">Impossible de charger la vidéo</p>
      <p className="text-white/50 text-sm text-center px-8">Vérifiez votre connexion internet</p>
    </div>
  );
}

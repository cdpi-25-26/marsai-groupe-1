import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { PlayerProvider, usePlayer } from "./player/PlayerContext";
import { useTouchSeek } from "./player/hooks/useTouchSeek";
import { TopBar } from "./player/ui/TopBar";
import { CenterControls } from "./player/ui/CenterControls";
import { BottomBar } from "./player/ui/BottomBar";
import { SeekDrawer, TapToPlay, ErrorOverlay } from "./player/ui/Overlays";
import { pill } from "./player/utils";

const elastic = { type: "spring", stiffness: 400, damping: 8 };

function PlayerInner() {
  const {
    videoSrc, onClose,
    videoRef, rootRef, overlayRef, durRef, revealRef,
    videoRefCallback,
    setPlaying,
    setCurrent, setDur, setProgressVal, setVideoReady, setVideoError,
    muted,
    showCtrl,
    setIsScrubbing, setScrubInfo,
    doPlay, doFs, revealCtrl,
    brightness,
  } = usePlayer();

  const { onTouchStart, onTouchEnd } = useTouchSeek({
    overlayRef, durRef, revealRef, videoRef,
    setIsScrubbing, setScrubInfo, setProgressVal,
  });

  return (
    <motion.div
      ref={rootRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[500] bg-black select-none overflow-hidden"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
      onMouseMove={revealCtrl}
      onTouchStart={revealCtrl}
    >
      {/* Brightness overlay */}
      <div
        className="absolute inset-0 bg-black pointer-events-none z-[5]"
        style={{ opacity: (100 - (brightness ?? 80)) / 130 }}
      />

      {/* Video */}
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        <video
          ref={videoRefCallback}
          src={videoSrc}
          autoPlay
          playsInline
          muted={muted}
          preload="auto"
          className="w-full h-full object-contain"
          onLoadedMetadata={(e) => { setDur(e.target.duration); setVideoReady(true); }}
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoError(true)}
          onTimeUpdate={(e) => {
            const ct = e.target.currentTime;
            const d  = e.target.duration || 1;
            setCurrent(ct);
            setProgressVal((ct / d) * 100);
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
      </div>

      <ErrorOverlay />
      <TapToPlay />

      {/* Gesture overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-10"
        onClick={() => { doPlay(); revealCtrl(); }}
        onDoubleClick={doFs}
        onTouchStart={onTouchStart}
        onTouchEnd={(e) => onTouchEnd(e, { doPlay, doFs, revealCtrl })}
      />

      {/* Close button — suit exactement les contrôles */}
      <AnimatePresence>
        {showCtrl && (
          <motion.button
            key="close-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { e.stopPropagation(); onClose?.(); }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.72 }}
            transition={elastic}
            className="absolute top-5 left-5 z-50 w-10 h-10 rounded-2xl flex items-center justify-center"
            style={pill}
          >
            <X className="w-[16px] h-[16px] text-white" strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

      <SeekDrawer />

      {/* Auto-hidden controls */}
      <AnimatePresence>
        {showCtrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30 pointer-events-none"
          >
            {/* Gradients */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/65 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

            <TopBar />
            <CenterControls />
            <BottomBar />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MarsPlayer({ videoUrl, src, title = "", onClose }) {
  return (
    <PlayerProvider videoUrl={videoUrl} src={src} title={title} onClose={onClose}>
      <PlayerInner />
    </PlayerProvider>
  );
}

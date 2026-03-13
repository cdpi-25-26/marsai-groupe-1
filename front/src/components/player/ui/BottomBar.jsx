import { motion, AnimatePresence } from "motion/react";
import { Sun } from "lucide-react";
import { usePlayer } from "../PlayerContext";
import { useBrightness } from "../hooks/useBrightness";
import { SpeedIcon, SubtitleIcon } from "../icons";
import { pill, SPEEDS, fmt } from "../utils";
import ElasticSlider from "../../ElasticSlider";

const elastic = { type: "spring", stiffness: 400, damping: 8 };

export function BottomBar() {
  const {
    progress, current, remaining,
    speed, doSpeed,
    showSpeeds, setShowSpeeds,
    doSeekByPct, setProgressVal,
    brightness, setBrightness,
  } = usePlayer();

  const { showBrightness, toggleBrightness, sliderProps } = useBrightness({ brightness, setBrightness });

  return (
    <>
      {/* Brightness button (bottom left) */}
      <motion.button
        className="absolute bottom-20 md:bottom-24 left-5 w-10 h-10 rounded-2xl flex items-center justify-center pointer-events-auto"
        style={pill}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.72 }}
        transition={elastic}
        onClick={(e) => { e.stopPropagation(); toggleBrightness(); }}
      >
        <motion.div whileHover={{ rotate: 20, scale: 1.1 }} transition={elastic}>
          <Sun className="w-[16px] h-[16px] text-white" />
        </motion.div>
      </motion.button>

      {/* Vertical brightness slider */}
      <AnimatePresence>
        {showBrightness && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.18 }}
            className="absolute left-5 top-1/2 -translate-y-1/2 z-30 pointer-events-auto flex flex-col items-center rounded-full overflow-hidden"
            style={{ ...pill, width: 40, height: 190 }}
            {...sliderProps}
          >
            <div
              className="absolute bottom-0 left-0 right-0 bg-yellow-300/40 rounded-full transition-none"
              style={{ height: `${brightness}%` }}
            />
            <Sun className="absolute bottom-3 w-[14px] h-[14px] text-white z-10 opacity-80" />
            <span className="absolute top-3 text-white text-[9px] font-bold z-10 opacity-60">
              {brightness}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speed + Subtitle (bottom right) */}
      <div
        className="absolute bottom-20 md:bottom-24 right-5 flex items-center gap-0.5 px-0.5 py-0.5 rounded-lg pointer-events-auto"
        style={pill}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.18 }}
            whileTap={{ scale: 0.72 }}
            transition={elastic}
            onClick={() => setShowSpeeds(!showSpeeds)}
            className="w-7 h-7 flex items-center justify-center"
          >
            <motion.div whileHover={{ rotate: 20 }} transition={elastic}><SpeedIcon /></motion.div>
          </motion.button>
          <AnimatePresence>
            {showSpeeds && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.93 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.93 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full mb-2 right-0 rounded-xl overflow-hidden shadow-2xl min-w-[72px]"
                style={{ background: "rgba(28,28,30,0.97)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {SPEEDS.map((s) => (
                  <motion.button
                    key={s}
                    whileTap={{ scale: 0.88 }}
                    transition={elastic}
                    onClick={() => doSpeed(s)}
                    className="w-full px-3 py-2 text-xs font-semibold text-left hover:bg-white/10 transition-colors"
                    style={{ color: s === speed ? "white" : "rgba(255,255,255,0.4)" }}
                  >
                    {s === speed ? "✓  " : "    "}{s}×
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.18 }}
          whileTap={{ scale: 0.72 }}
          transition={elastic}
          className="w-7 h-7 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div whileHover={{ y: -2 }} transition={elastic}><SubtitleIcon /></motion.div>
        </motion.button>
      </div>

      {/* Progress slider */}
      <div
        className="absolute bottom-0 left-0 right-0 px-5 pb-7 md:pb-9 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <ElasticSlider
          value={progress}
          defaultValue={0}
          startingValue={0}
          maxValue={100}
          onChange={(v) => {
            setProgressVal(v);
            doSeekByPct(v);
          }}
          disableHoverZoom
          leftIcon={
            <span className="text-white text-sm tabular-nums font-medium w-12 text-left shrink-0">
              {fmt(current)}
            </span>
          }
          rightIcon={
            <span className="text-white/55 text-sm tabular-nums font-medium w-14 text-right shrink-0">
              -{fmt(remaining)}
            </span>
          }
        />
      </div>
    </>
  );
}

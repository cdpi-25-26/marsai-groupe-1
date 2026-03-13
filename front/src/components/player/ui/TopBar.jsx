import { motion, AnimatePresence } from "motion/react";
import { Volume2, VolumeX } from "lucide-react";
import { usePlayer } from "../PlayerContext";
import { useVolumeBar } from "../hooks/useVolumeBar";
import ElasticSlider from "../../ElasticSlider";
import { PipIcon, AirPlayIcon } from "../icons";
import { pill } from "../utils";

const elastic = { type: "spring", stiffness: 400, damping: 8 };

export function TopBar() {
  const { muted, vol, doMute, doVol, showCtrl, playing, title } = usePlayer();
  const { showVolMobile, volButtonProps, onVolBarInteract } = useVolumeBar(doMute);

  const volLeftIcon = (
    <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.82 }} transition={elastic} onClick={(e) => { e.stopPropagation(); doMute(); }} className="shrink-0">
      {muted || vol === 0
        ? <VolumeX className="w-[18px] h-[18px] text-white" />
        : <Volume2 className="w-[18px] h-[18px] text-white" />
      }
    </motion.button>
  );
  const volRightIcon = <Volume2 className="w-[18px] h-[18px] text-white opacity-50" />;

  return (
    <>
      {/* Top bar row */}
      <div className="absolute top-5 left-0 right-0 flex items-start justify-between px-5 pointer-events-auto">
        {/* Left: spacer for X + PiP/AirPlay */}
        <div className="flex items-center gap-2">
          <div className="w-11" />
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl" style={pill}>
            <motion.button whileHover={{ scale: 1.18 }} whileTap={{ scale: 0.72 }} transition={elastic}
              onClick={(e) => e.stopPropagation()}
              className="w-7 h-7 flex items-center justify-center">
              <motion.div whileHover={{ rotate: -8 }} transition={elastic}><PipIcon /></motion.div>
            </motion.button>
            <motion.button whileHover={{ scale: 1.18 }} whileTap={{ scale: 0.72 }} transition={elastic}
              onClick={(e) => e.stopPropagation()}
              className="w-7 h-7 flex items-center justify-center">
              <motion.div whileHover={{ rotate: 8 }} transition={elastic}><AirPlayIcon /></motion.div>
            </motion.button>
          </div>
        </div>

        {/* Right: volume (mobile = tap mute / long press slider, desktop = elastic slider) */}
        <motion.button
          className="md:hidden w-10 h-10 rounded-2xl flex items-center justify-center pointer-events-auto"
          style={pill}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.72 }}
          transition={elastic}
          {...volButtonProps}
        >
          <motion.div whileHover={{ scale: 1.15 }} transition={elastic}>
            {muted || vol === 0
              ? <VolumeX className="w-[18px] h-[18px] text-white" />
              : <Volume2 className="w-[18px] h-[18px] text-white" />
            }
          </motion.div>
        </motion.button>

        <div className="hidden md:block w-72" onClick={(e) => e.stopPropagation()}>
          <ElasticSlider
            value={muted ? 0 : vol}
            defaultValue={80}
            startingValue={0}
            maxValue={100}
            onChange={doVol}
            leftIcon={volLeftIcon}
            rightIcon={volRightIcon}
            innerStyle={pill}
            innerClassName="rounded-full px-3 py-2"
            disableHoverZoom
            containerElastic
          />
        </div>
      </div>

      {/* Title (desktop) */}
      {title && (
        <p className="absolute top-[68px] left-1/2 -translate-x-1/2 text-white/65 text-sm font-medium max-w-[55vw] truncate pointer-events-none hidden md:block">
          {title}
        </p>
      )}

      {/* Mobile volume bar (full width, appears on long press) */}
      <AnimatePresence>
        {showVolMobile && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden absolute top-[68px] left-0 right-0 px-5 pointer-events-auto"
            onClick={onVolBarInteract}
          >
            <ElasticSlider
              value={muted ? 0 : vol}
              defaultValue={80}
              startingValue={0}
              maxValue={100}
              onChange={doVol}
              leftIcon={volLeftIcon}
              rightIcon={volRightIcon}
              innerStyle={pill}
              innerClassName="rounded-full px-3 py-2"
              disableHoverZoom
              containerElastic
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

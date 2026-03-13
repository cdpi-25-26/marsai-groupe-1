import { motion } from "motion/react";
import { Play, Pause } from "lucide-react";
import { usePlayer } from "../PlayerContext";
import { SeekTenIcon } from "../icons";
import { pill } from "../utils";

const elastic = { type: "spring", stiffness: 400, damping: 8 };

export function CenterControls() {
  const { playing, doPlay, doSeek, doFs } = usePlayer();

  return (
    <div className="absolute inset-0 flex items-center justify-center gap-10 md:gap-16 pointer-events-none">

      {/* Rewind 10s */}
      <motion.button
        whileHover={{ scale: 1.14 }}
        whileTap={{ scaleX: 1.35, x: -10 }}
        transition={elastic}
        onClick={(e) => { e.stopPropagation(); doSeek(-10); }}
        className="w-[58px] h-[58px] md:w-[68px] md:h-[68px] rounded-2xl flex items-center justify-center pointer-events-auto"
        style={pill}
      >
        <motion.div whileHover={{ rotate: -15 }} transition={elastic}>
          <SeekTenIcon size={32} />
        </motion.div>
      </motion.button>

      {/* Play / Pause */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.78 }}
        transition={elastic}
        onClick={(e) => { e.stopPropagation(); doPlay(); }}
        onDoubleClick={doFs}
        style={pill}
        className="w-[80px] h-[80px] md:w-[88px] md:h-[88px] rounded-2xl flex items-center justify-center pointer-events-auto"
      >
        <motion.div
          key={playing ? "pause" : "play"}
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={elastic}
        >
          {playing
            ? <Pause className="w-9 h-9 md:w-10 md:h-10 fill-white stroke-none" />
            : <Play  className="w-9 h-9 md:w-10 md:h-10 fill-white stroke-none ml-1" />
          }
        </motion.div>
      </motion.button>

      {/* Forward 10s */}
      <motion.button
        whileHover={{ scale: 1.14 }}
        whileTap={{ scaleX: 1.35, x: 10 }}
        transition={elastic}
        onClick={(e) => { e.stopPropagation(); doSeek(10); }}
        className="w-[58px] h-[58px] md:w-[68px] md:h-[68px] rounded-2xl flex items-center justify-center pointer-events-auto"
        style={pill}
      >
        <motion.div whileHover={{ rotate: 15 }} transition={elastic}>
          <SeekTenIcon forward size={32} />
        </motion.div>
      </motion.button>
    </div>
  );
}

import { useState, useRef } from "react";

export function useBrightness({ brightness, setBrightness }) {
  const [showBrightness, setShowBrightness] = useState(false);
  const brightHideTimer = useRef(null);
  const brightDrag      = useRef({ active: false, startY: 0, startVal: 80 });

  function toggleBrightness() {
    clearTimeout(brightHideTimer.current);
    if (showBrightness) {
      setShowBrightness(false);
    } else {
      setShowBrightness(true);
      brightHideTimer.current = setTimeout(() => setShowBrightness(false), 3000);
    }
  }

  const sliderProps = {
    onPointerDown(e) {
      e.stopPropagation();
      brightDrag.current = { active: true, startY: e.clientY, startVal: brightness };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove(e) {
      if (!brightDrag.current.active) return;
      e.stopPropagation();
      const dy = brightDrag.current.startY - e.clientY;
      setBrightness(Math.max(10, Math.min(100, Math.round(brightDrag.current.startVal + (dy / 200) * 100))));
      clearTimeout(brightHideTimer.current);
    },
    onPointerUp(e) {
      e.stopPropagation();
      brightDrag.current.active = false;
      brightHideTimer.current = setTimeout(() => setShowBrightness(false), 2000);
    },
  };

  return { showBrightness, toggleBrightness, sliderProps };
}

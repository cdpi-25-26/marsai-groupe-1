import { useState, useRef } from "react";

export function useVolumeBar(doMute) {
  const [showVolMobile, setShowVolMobile] = useState(false);
  const volHideTimer  = useRef(null);
  const volPressTimer = useRef(null);
  const volLongPress  = useRef(false);

  const volButtonProps = {
    onTouchStart(e) {
      e.stopPropagation();
      volLongPress.current = false;
      volPressTimer.current = setTimeout(() => {
        volLongPress.current = true;
        clearTimeout(volHideTimer.current);
        setShowVolMobile(true);
        volHideTimer.current = setTimeout(() => setShowVolMobile(false), 3000);
      }, 300);
    },
    onTouchEnd(e) {
      e.stopPropagation();
      clearTimeout(volPressTimer.current);
      if (!volLongPress.current) doMute();
    },
    onTouchCancel() {
      clearTimeout(volPressTimer.current);
    },
  };

  function onVolBarInteract(e) {
    e.stopPropagation();
    clearTimeout(volHideTimer.current);
    volHideTimer.current = setTimeout(() => setShowVolMobile(false), 3000);
  }

  return { showVolMobile, volButtonProps, onVolBarInteract };
}

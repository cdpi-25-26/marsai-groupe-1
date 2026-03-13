import { useState, useRef, useCallback, useEffect } from "react";

export function useControlsVisibility(playing) {
  const [showCtrl, setShowCtrl] = useState(true);
  const hideTimer = useRef(null);
  const mounted   = useRef(true);

  const schedHide = useCallback((delay = 4000) => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (mounted.current) setShowCtrl(false);
    }, delay);
  }, []);

  const revealCtrl = useCallback(() => {
    setShowCtrl(true);
    schedHide();
  }, [schedHide]);

  useEffect(() => {
    if (playing) schedHide(1500);
    else { clearTimeout(hideTimer.current); setShowCtrl(true); }
  }, [playing, schedHide]);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; clearTimeout(hideTimer.current); };
  }, []);

  return { showCtrl, setShowCtrl, schedHide, revealCtrl };
}

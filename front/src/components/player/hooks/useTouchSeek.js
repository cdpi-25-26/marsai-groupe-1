import { useEffect, useRef } from "react";

/**
 * Attaches a non-passive touchmove listener to overlayRef for horizontal swipe → seek.
 * Uses durRef and revealRef to avoid stale closures.
 */
export function useTouchSeek({ overlayRef, durRef, revealRef, videoRef, setIsScrubbing, setScrubInfo, setProgressVal }) {
  const touchData = useRef({ x: 0, y: 0, t: 0, active: false, lastTarget: 0 });
  const lastTapTime = useRef(0);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    const onMove = (e) => {
      const touch = e.touches[0];
      const dx = touch.clientX - touchData.current.x;
      const dy = touch.clientY - touchData.current.y;

      if (!touchData.current.active) {
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        if (Math.abs(dy) > Math.abs(dx) * 0.85) return;
        touchData.current.active = true;
        revealRef.current?.();
      }

      e.preventDefault();

      const delta = (dx / window.innerWidth) * 120;
      const d     = durRef.current || 0;
      const target = Math.max(0, Math.min(d, touchData.current.t + delta));
      touchData.current.lastTarget = target;
      setIsScrubbing(true);
      setScrubInfo({ delta: Math.round(delta), target });
    };

    el.addEventListener("touchmove", onMove, { passive: false });
    return () => el.removeEventListener("touchmove", onMove);
  }, []); // refs are stable

  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchData.current = {
      x: t.clientX,
      y: t.clientY,
      t: videoRef.current?.currentTime || 0,
      active: false,
      lastTarget: videoRef.current?.currentTime || 0,
    };
  };

  const onTouchEnd = (e, { doPlay, doFs, revealCtrl }) => {
    e.preventDefault();

    if (touchData.current.active) {
      const target = touchData.current.lastTarget;
      if (videoRef.current) {
        videoRef.current.currentTime = target;
        const d = durRef.current;
        if (d > 0) setProgressVal((target / d) * 100);
      }
      revealCtrl();
    } else {
      const now = Date.now();
      if (now - lastTapTime.current < 300) {
        doFs();
      } else {
        doPlay();
        revealCtrl();
      }
      lastTapTime.current = now;
    }

    setIsScrubbing(false);
    touchData.current.active = false;
  };

  return { onTouchStart, onTouchEnd };
}

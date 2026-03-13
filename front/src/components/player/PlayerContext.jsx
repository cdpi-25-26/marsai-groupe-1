import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useMotionValue } from "motion/react";

const PlayerCtx = createContext(null);

export function usePlayer() {
  return useContext(PlayerCtx);
}

export function PlayerProvider({ videoUrl, src, title = "", onClose, children }) {
  const videoSrc = videoUrl || src;

  /* ── Refs ── */
  const videoRef    = useRef(null);
  const rootRef     = useRef(null);
  const overlayRef  = useRef(null);
  const mounted     = useRef(true);
  const hideTimer   = useRef(null);
  const durRef      = useRef(0);
  const revealRef   = useRef(null);

  const dragX = useMotionValue(0);

  /* Stable video ref callback — runs only on mount/unmount in React 19 */
  const videoRefCallback = useCallback((el) => {
    videoRef.current = el;
    if (el) { el.muted = true; el.playsInline = true; }
  }, []);

  /* ── State ── */
  const [playing,      setPlaying]      = useState(false);
  const [current,      setCurrent]      = useState(0);
  const [dur,          setDur]          = useState(0);
  const [vol,          setVol]          = useState(80);
  const [muted,        setMuted]        = useState(true);
  const [showCtrl,     setShowCtrl]     = useState(true);
  const [speed,        setSpeed]        = useState(1);
  const [showSpeeds,   setShowSpeeds]   = useState(false);
  const [isDragging,   setIsDragging]   = useState(false);
  const [scrubSecs,    setScrubSecs]    = useState(0);
  const [progressVal,  setProgressVal]  = useState(0);
  const [isScrubbing,  setIsScrubbing]  = useState(false);
  const [scrubInfo,    setScrubInfo]    = useState({ delta: 0, target: 0 });
  const [videoError,   setVideoError]   = useState(false);
  const [videoReady,   setVideoReady]   = useState(false);
  const [brightness,   setBrightness]   = useState(80);

  /* ── Mount: fullscreen + overflow ── */
  useEffect(() => {
    mounted.current = true;
    document.body.style.overflow = "hidden";
    const el = rootRef.current;
    if (el?.requestFullscreen) el.requestFullscreen().catch(() => {});
    return () => {
      mounted.current = false;
      document.body.style.overflow = "";
      clearTimeout(hideTimer.current);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  /* ── Sync dur ref ── */
  useEffect(() => { durRef.current = dur; }, [dur]);

  /* ── Controls auto-hide ── */
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

  useEffect(() => { revealRef.current = revealCtrl; }, [revealCtrl]);

  useEffect(() => {
    if (playing) schedHide(1500);
    else { clearTimeout(hideTimer.current); setShowCtrl(true); }
  }, [playing, schedHide]);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const h = (e) => {
      if (e.target.tagName === "INPUT") return;
      if (e.key === " " || e.key === "k") { e.preventDefault(); doPlay(); }
      if (e.key === "ArrowLeft")  { e.preventDefault(); doSeek(-10); }
      if (e.key === "ArrowRight") { e.preventDefault(); doSeek(10); }
      if (e.key === "Escape")     onClose?.();
      if (e.key === "f")          doFs();
      if (e.key === "m")          doMute();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, muted, vol]);

  /* ── Actions ── */
  function doPlay() {
    if (!videoRef.current) return;
    if (playing) videoRef.current.pause();
    else videoRef.current.play().catch(() => {});
    revealCtrl();
  }

  function doSeek(delta) {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + delta)
    );
    revealCtrl();
  }

  function doSeekByPct(p) {
    if (!videoRef.current || !dur) return;
    videoRef.current.currentTime = (p / 100) * dur;
    setProgressVal(p);
  }

  function doVol(v) {
    const n = Math.round(v);
    setVol(n); setMuted(n === 0);
    if (videoRef.current) { videoRef.current.volume = n / 100; videoRef.current.muted = n === 0; }
  }

  function doMute() {
    if (muted) {
      const v = vol || 80; setMuted(false); setVol(v);
      if (videoRef.current) { videoRef.current.muted = false; videoRef.current.volume = v / 100; }
    } else {
      setMuted(true);
      if (videoRef.current) videoRef.current.muted = true;
    }
    revealCtrl();
  }

  function doSpeed(s) {
    setSpeed(s); setShowSpeeds(false);
    if (videoRef.current) videoRef.current.playbackRate = s;
    revealCtrl();
  }

  function doFs() {
    if (!document.fullscreenElement) rootRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  const progress  = dur > 0 ? (current / dur) * 100 : progressVal;
  const remaining = Math.max(0, dur - current);

  const value = {
    /* refs */
    videoRef, rootRef, overlayRef, durRef, revealRef,
    videoRefCallback,
    /* state */
    videoSrc, title, onClose,
    playing, setPlaying,
    current, setCurrent,
    dur, setDur,
    vol, setVol,
    muted, setMuted,
    showCtrl, setShowCtrl,
    speed, setSpeed,
    showSpeeds, setShowSpeeds,
    isDragging, setIsDragging,
    scrubSecs, setScrubSecs,
    progressVal, setProgressVal,
    isScrubbing, setIsScrubbing,
    scrubInfo, setScrubInfo,
    videoError, setVideoError,
    videoReady, setVideoReady,
    brightness, setBrightness,
    /* motion */
    dragX,
    /* derived */
    progress, remaining,
    /* actions */
    doPlay, doSeek, doSeekByPct, doVol, doMute, doSpeed, doFs,
    schedHide, revealCtrl,
  };

  return <PlayerCtx.Provider value={value}>{children}</PlayerCtx.Provider>;
}

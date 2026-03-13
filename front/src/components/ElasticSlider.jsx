import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

const MAX_OVERFLOW = 50;

export default function ElasticSlider({
  defaultValue = 50,
  startingValue = 0,
  maxValue = 100,
  className = '',
  isStepped = false,
  stepSize = 1,
  leftIcon = <>-</>,
  rightIcon = <>+</>,
  // props ajoutées pour le player (controlled mode)
  value: externalValue,
  onChange,
  showValue = false,
  // désactive le zoom au survol (ex: barre de progression)
  disableHoverZoom = false,
  // style/class appliqués au motion.div élastique (pour intégrer le pill dans l'animation)
  innerClassName = '',
  innerStyle,
  // couleurs de la piste et du remplissage
  trackClassName = 'bg-white/20',
  fillClassName = 'bg-gradient-to-r from-[#51a2ff] to-[#ad46ff]',
  // quand true : l'effet élastique s'applique sur le pill entier (icônes comprises)
  containerElastic = false,
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 w-full ${className}`}>
      <Slider
        defaultValue={defaultValue}
        startingValue={startingValue}
        maxValue={maxValue}
        isStepped={isStepped}
        stepSize={stepSize}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        externalValue={externalValue}
        onChange={onChange}
        showValue={showValue}
        disableHoverZoom={disableHoverZoom}
        innerClassName={innerClassName}
        innerStyle={innerStyle}
        trackClassName={trackClassName}
        fillClassName={fillClassName}
        containerElastic={containerElastic}
      />
    </div>
  );
}

function Slider({
  defaultValue,
  startingValue,
  maxValue,
  isStepped,
  stepSize,
  leftIcon,
  rightIcon,
  externalValue,
  onChange,
  showValue,
  disableHoverZoom,
  innerClassName,
  innerStyle,
  trackClassName,
  fillClassName,
  containerElastic,
}) {
  const [value, setValue] = useState(externalValue ?? defaultValue);
  const sliderRef = useRef(null);
  const isDragging = useRef(false);
  const [region, setRegion] = useState('middle');
  const clientX = useMotionValue(0);
  const overflow = useMotionValue(0);
  const scale = useMotionValue(1);

  // ── Tous les useTransform pré-calculés (Rules of Hooks : pas d'appel conditionnel) ──
  const scaleOpacity = useTransform(scale, [1, 1.2], [0.7, 1]);

  const elasticScaleX = useTransform(() => {
    if (sliderRef.current) {
      const { width } = sliderRef.current.getBoundingClientRect();
      return 1 + overflow.get() / width;
    }
    return 1;
  });

  const elasticScaleY = useTransform(overflow, [0, MAX_OVERFLOW], [1, 0.8]);

  const elasticOrigin = useTransform(() => {
    if (sliderRef.current) {
      const { left, width } = sliderRef.current.getBoundingClientRect();
      return clientX.get() < left + width / 2 ? 'right' : 'left';
    }
    return 'center';
  });

  const trackHeight    = useTransform(scale, [1, 1.2], [6, 12]);
  const trackMarginTop = useTransform(scale, [1, 1.2], [0, -3]);
  const trackMarginBot = useTransform(scale, [1, 1.2], [0, -3]);

  const leftX  = useTransform(() => (region === 'left'  ? -overflow.get() / scale.get() : 0));
  const rightX = useTransform(() => (region === 'right' ?  overflow.get() / scale.get() : 0));

  // Sync valeur externe quand l'utilisateur ne drag pas
  useEffect(() => {
    if (!isDragging.current && externalValue !== undefined) {
      setValue(externalValue);
    }
  }, [externalValue]);

  useMotionValueEvent(clientX, 'change', latest => {
    if (sliderRef.current) {
      const { left, right } = sliderRef.current.getBoundingClientRect();
      let newValue;

      if (latest < left) {
        setRegion('left');
        newValue = left - latest;
      } else if (latest > right) {
        setRegion('right');
        newValue = latest - right;
      } else {
        setRegion('middle');
        newValue = 0;
      }

      overflow.jump(decay(newValue, MAX_OVERFLOW));
    }
  });

  const handlePointerMove = e => {
    if (e.buttons > 0 && sliderRef.current) {
      const { left, width } = sliderRef.current.getBoundingClientRect();
      let newValue = startingValue + ((e.clientX - left) / width) * (maxValue - startingValue);

      if (isStepped) {
        newValue = Math.round(newValue / stepSize) * stepSize;
      }

      newValue = Math.min(Math.max(newValue, startingValue), maxValue);
      setValue(newValue);
      onChange?.(newValue);
      clientX.jump(e.clientX);
    }
  };

  const handlePointerDown = e => {
    isDragging.current = true;
    handlePointerMove(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    animate(overflow, 0, { type: 'spring', bounce: 0.5 });
  };

  const getRangePercentage = () => {
    const totalRange = maxValue - startingValue;
    if (totalRange === 0) return 0;
    return ((value - startingValue) / totalRange) * 100;
  };

  // ── Mode containerElastic : le pill entier s'étire, icônes comprises ──
  if (containerElastic) {
    return (
      <>
        {/*
          sliderRef est sur le div EXTÉRIEUR (stable, non affecté par les transforms du pill).
          Cela évite toute instabilité de calcul : getBoundingClientRect() renvoie
          toujours les dimensions originales du rail, indépendamment du scaleX du pill.
        */}
        <div
          ref={sliderRef}
          className="relative flex w-full flex-grow cursor-grab touch-none select-none items-center py-4"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <motion.div
            onHoverStart={disableHoverZoom ? undefined : () => animate(scale, 1.2)}
            onHoverEnd={disableHoverZoom ? undefined : () => animate(scale, 1)}
            onTouchStart={disableHoverZoom ? undefined : () => animate(scale, 1.2)}
            onTouchEnd={disableHoverZoom ? undefined : () => animate(scale, 1)}
            style={{
              scale,
              scaleX: elasticScaleX,
              scaleY: elasticScaleY,
              transformOrigin: elasticOrigin,
              opacity: disableHoverZoom ? 1 : scaleOpacity,
              ...innerStyle,
            }}
            className={`flex w-full touch-none select-none items-center justify-center gap-4 ${innerClassName}`}
          >
            <div className="shrink-0">{leftIcon}</div>

            <div className={`relative h-[6px] flex-grow overflow-hidden rounded-full ${trackClassName}`}>
              <div
                className={`absolute h-full rounded-full ${fillClassName}`}
                style={{ width: `${getRangePercentage()}%` }}
              />
            </div>

            <div className="shrink-0">{rightIcon}</div>
          </motion.div>
        </div>

        {showValue && (
          <p className="absolute text-gray-400 transform -translate-y-4 text-xs font-medium tracking-wide">
            {Math.round(value)}
          </p>
        )}
      </>
    );
  }

  // ── Mode classique : seule la piste interne s'étire ──
  return (
    <>
      <motion.div
        onHoverStart={disableHoverZoom ? undefined : () => animate(scale, 1.2)}
        onHoverEnd={disableHoverZoom ? undefined : () => animate(scale, 1)}
        onTouchStart={disableHoverZoom ? undefined : () => animate(scale, 1.2)}
        onTouchEnd={disableHoverZoom ? undefined : () => animate(scale, 1)}
        style={{
          scale,
          opacity: disableHoverZoom ? 1 : scaleOpacity,
          ...innerStyle,
        }}
        className={`flex w-full touch-none select-none items-center justify-center gap-4 ${innerClassName}`}
      >
        <motion.div
          animate={{
            scale: region === 'left' ? [1, 1.4, 1] : 1,
            transition: { duration: 0.25 }
          }}
          style={{ x: leftX }}
        >
          {leftIcon}
        </motion.div>

        <div
          ref={sliderRef}
          className="relative flex w-full flex-grow cursor-grab touch-none select-none items-center py-4"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <motion.div
            style={{
              scaleX: elasticScaleX,
              scaleY: elasticScaleY,
              transformOrigin: elasticOrigin,
              height: trackHeight,
              marginTop: trackMarginTop,
              marginBottom: trackMarginBot,
            }}
            className="flex flex-grow"
          >
            <div className={`relative h-full flex-grow overflow-hidden rounded-full ${trackClassName}`}>
              <div
                className={`absolute h-full rounded-full ${fillClassName}`}
                style={{ width: `${getRangePercentage()}%` }}
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{
            scale: region === 'right' ? [1, 1.4, 1] : 1,
            transition: { duration: 0.25 }
          }}
          style={{ x: rightX }}
        >
          {rightIcon}
        </motion.div>
      </motion.div>

      {showValue && (
        <p className="absolute text-gray-400 transform -translate-y-4 text-xs font-medium tracking-wide">
          {Math.round(value)}
        </p>
      )}
    </>
  );
}

function decay(value, max) {
  if (max === 0) {
    return 0;
  }

  const entry = value / max;
  const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);

  return sigmoid * max;
}

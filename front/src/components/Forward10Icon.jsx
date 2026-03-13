import React from 'react';

/**
 * Forward 10s icon — same design as Rewind10Icon but arrow points clockwise.
 * The circular arrow (path 1) is mirrored horizontally.
 * The "10" digit paths are translated to stay inside the forward ring.
 */
const Forward10Icon = ({
  size = undefined,
  color = '#000000',
  strokeWidth = 0,
  opacity = 1,
  shadow = 0,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        opacity,
        filter: shadow > 0 ? `drop-shadow(0 ${shadow}px ${shadow * 2}px rgba(0,0,0,0.3))` : undefined,
      }}
    >
      {/* Circular arrow mirrored horizontally (clockwise = forward direction) */}
      <path
        fill="currentColor"
        d="M20 18A12 12 0 1 1 8 6h4V1L18 7l-6 6V8h-4A10 10 0 1 0 18 18Z"
      />
      {/* "10" digit paths shifted -8 on x to stay inside the forward ring center */}
      <g transform="translate(-8, 0)">
        <path
          fill="currentColor"
          d="M19.63 22.13a2.84 2.84 0 0 1-1.28-.27a2.44 2.44 0 0 1-.89-.77a3.6 3.6 0 0 1-.52-1.25a7.7 7.7 0 0 1-.17-1.68a8 8 0 0 1 .17-1.68a3.7 3.7 0 0 1 .52-1.25a2.44 2.44 0 0 1 .89-.77a2.84 2.84 0 0 1 1.28-.27a2.44 2.44 0 0 1 2.16 1a5.23 5.23 0 0 1 .7 2.93a5.23 5.23 0 0 1-.7 2.93a2.44 2.44 0 0 1-2.16 1.08m0-1.22a1.07 1.07 0 0 0 1-.55a3.4 3.4 0 0 0 .37-1.51v-1.38a3.3 3.3 0 0 0-.29-1.5a1.23 1.23 0 0 0-2.06 0a3.3 3.3 0 0 0-.29 1.5v1.38a3.4 3.4 0 0 0 .29 1.51a1.06 1.06 0 0 0 .98.55m-9 1.09v-1.18h2v-5.19l-1.86 1l-.55-1.06l2.32-1.3H14v6.5h1.78V22z"
        />
      </g>
    </svg>
  );
};

export default Forward10Icon;

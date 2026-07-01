"use client";



interface AnimatedEyeProps {
  /** Show the pupil (true => password visible) */
  show: boolean;
  /** Temporary closed state for blinking animation */
  isBlinking: boolean;
  /** Offset for the pupil to follow the mouse */
  mouseOffset: { x: number; y: number };
}

export const AnimatedEye: React.FC<AnimatedEyeProps> = ({ show, isBlinking, mouseOffset }) => {
  const isClosed = !show || isBlinking;

  const upperLidOpen = "M1 12C1 12 5 4 12 4C19 4 23 12 23 12";
  const lowerLidOpen = "M1 12C1 12 5 20 12 20C19 20 23 12 23 12";
  const closedLid = "M4 10C4 10 8 16 12 16C16 16 20 10 20 10";

  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      className="transition-all duration-300 overflow-visible"
    >
      <defs>
        <clipPath id="eye-ball-clip">
          <path d={upperLidOpen + " " + lowerLidOpen} />
        </clipPath>
      </defs>
      {/* Upper lid */}
      <path
        d={isClosed ? closedLid : upperLidOpen}
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300 ease-in-out"
      />
      {/* Lower lid */}
      <path
        d={isClosed ? closedLid : lowerLidOpen}
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-all duration-300 ease-in-out ${isClosed ? "opacity-0" : "opacity-100"}`}
      />
      {/* Pupil */}
      <g
        clipPath="url(#eye-ball-clip)"
        className={`transition-all duration-300 ${isClosed ? "opacity-0" : "opacity-100"}`}
      >
        <circle
          cx={12 + mouseOffset.x}
          cy={12 + mouseOffset.y}
          r={3.5}
          fill="currentColor"
          className="transition-transform duration-150 ease-out"
        />
      </g>
    </svg>
  );
};

/**
 * Inline icon set — 24px grid, 1.5px stroke, currentColor. Server-safe
 * (zero JS). Add icons here rather than pulling an icon library.
 */

type IconProps = React.SVGProps<SVGSVGElement>;

function base(props: IconProps): IconProps {
  return {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...props,
  };
}

/** Water droplet — wash / interior care. */
export function IconDroplet(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5c3.2 3.9 6 7.2 6 10.3a6 6 0 0 1-12 0c0-3.1 2.8-6.4 6-10.3Z" />
      <path d="M9.5 13.8a2.6 2.6 0 0 0 2 2.6" />
    </svg>
  );
}

/** Shield — protection / ceramic coating. */
export function IconShield(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5 5 6.2v5.3c0 4.3 2.9 7.4 7 9 4.1-1.6 7-4.7 7-9V6.2L12 3.5Z" />
      <path d="m9 11.8 2.2 2.2L15.2 9.8" />
    </svg>
  );
}

/** Sparkle — gloss / finish. */
export function IconSparkle(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4v0c.6 3.8 2.9 6.1 6.7 6.7v0-.1 0c-3.8.7-6.1 3-6.7 6.8v0c-.6-3.8-2.9-6.1-6.7-6.7v0c3.8-.7 6.1-3 6.7-6.7Z" />
      <path d="M18.5 15.5c.3 1.6 1.2 2.6 2.9 2.9-1.7.3-2.6 1.3-2.9 2.9-.3-1.6-1.2-2.6-2.9-2.9 1.7-.3 2.6-1.3 2.9-2.9Z" />
    </svg>
  );
}

/** Steering wheel — the vehicle itself. */
export function IconSteeringWheel(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M3.7 10.5c2.6-1.3 14-1.3 16.6 0M12 14.5V20.5M9.8 13.6l-5 4M14.2 13.6l5 4" />
    </svg>
  );
}

/** Clock — turnaround / hands-on time. */
export function IconClock(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

/** Map pin — service area. */
export function IconMapPin(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21s-6.5-5.3-6.5-10a6.5 6.5 0 0 1 13 0c0 4.7-6.5 10-6.5 10Z" />
      <circle cx="12" cy="10.8" r="2.3" />
    </svg>
  );
}

/** Key — drop-off handover. */
export function IconKey(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="8" cy="15.5" r="4.5" />
      <path d="m11.2 12.3 8.3-8.3M16.5 7l2.5 2.5M13.5 10l2 2" />
    </svg>
  );
}

/** Arrow right — link affordance. */
export function IconArrowRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 12h15M13.5 6l6 6-6 6" />
    </svg>
  );
}

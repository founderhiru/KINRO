// A QR code drawn as inline SVG. Always dark-on-white, even in dark mode,
// because phone cameras need the contrast to read it.

import { qrPath } from '@/lib/qr';

export function QrCode({
  value,
  label,
  className,
}: {
  value: string;
  /** Accessible description, e.g. "QR code for KINRO on the App Store". */
  label: string;
  className?: string;
}) {
  const { size, d } = qrPath(value);
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      className={className}
    >
      <rect width={size} height={size} fill="#ffffff" />
      <path d={d} fill="#14211a" />
    </svg>
  );
}

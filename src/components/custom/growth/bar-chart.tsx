// A small, dependency-free bar chart (inline SVG) for per-day counts.
// Colour comes from the KINRO brand token, so it follows the theme.

type Point = { day: string; count: number };

const WIDTH = 600;
const HEIGHT = 120;
const PAD_TOP = 8;

function shortDay(day: string): string {
  const [, month, date] = day.split('-');
  return `${Number(date)}/${Number(month)}`;
}

export function BarChart({ points, label }: { points: Point[]; label: string }) {
  const max = Math.max(1, ...points.map((p) => p.count));
  const total = points.reduce((sum, p) => sum + p.count, 0);
  const slot = WIDTH / Math.max(1, points.length);
  const barWidth = Math.max(1.5, slot * 0.72);
  const usable = HEIGHT - PAD_TOP;
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <figure className="w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`${label}: ${total} in total over ${points.length} days, highest day ${max}`}
        className="h-32 w-full"
        preserveAspectRatio="none"
      >
        <title>{label}</title>
        <line
          x1="0"
          x2={WIDTH}
          y1={HEIGHT - 0.5}
          y2={HEIGHT - 0.5}
          className="stroke-border"
          strokeWidth="1"
        />
        {points.map((p, i) => {
          const h = p.count === 0 ? 0 : Math.max(2, (p.count / max) * usable);
          return (
            <rect
              key={p.day}
              x={i * slot + (slot - barWidth) / 2}
              y={HEIGHT - h}
              width={barWidth}
              height={h}
              rx="1.5"
              className="fill-brand-600"
            >
              <title>{`${p.day}: ${p.count}`}</title>
            </rect>
          );
        })}
      </svg>
      <figcaption className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{first ? shortDay(first.day) : ''}</span>
        <span>highest day: {max}</span>
        <span>{last ? shortDay(last.day) : ''}</span>
      </figcaption>
    </figure>
  );
}

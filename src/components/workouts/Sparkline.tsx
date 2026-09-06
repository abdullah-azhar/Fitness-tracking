const WIDTH = 64;
const HEIGHT = 20;
const PAD = 3;

export function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) {
    return (
      <span className="text-xs text-slate-400 dark:text-slate-500">
        {values.length === 1 ? `${values[0]}` : "—"}
      </span>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const points = values.map((v, i) => {
    const x = PAD + (i / (values.length - 1)) * (WIDTH - PAD * 2);
    const y = HEIGHT - PAD - ((v - min) / span) * (HEIGHT - PAD * 2);
    return { x, y };
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH}
      height={HEIGHT}
      className="inline-block align-middle"
    >
      <path
        d={path}
        fill="none"
        className="stroke-slate-300 dark:stroke-slate-600"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={last.x} cy={last.y} r={2} className="fill-emerald-500" />
    </svg>
  );
}

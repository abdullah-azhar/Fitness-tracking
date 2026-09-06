"use client";

import { useMemo, useRef, useState } from "react";
import { FLAG_META } from "@/lib/bloodMarkers";
import { parseLocalDate } from "@/lib/date";
import type { BloodMarkerFlag } from "@/types/database.types";

export interface TrendPoint {
  test_date: string;
  result: number;
  ref_range_low: number | null;
  ref_range_high: number | null;
  ref_range_text: string | null;
  flag: BloodMarkerFlag;
}

const VB_W = 480;
const VB_H = 220;
const MARGIN = { top: 16, right: 16, bottom: 26, left: 40 };
const PLOT_W = VB_W - MARGIN.left - MARGIN.right;
const PLOT_H = VB_H - MARGIN.top - MARGIN.bottom;

function formatDate(dateString: string) {
  return parseLocalDate(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
}

function niceNumber(n: number) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(1);
}

export function BloodMarkerTrendChart({
  markerName,
  category,
  unit,
  points,
}: {
  markerName: string;
  category: string;
  unit: string;
  points: TrendPoint[];
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const sorted = useMemo(
    () =>
      [...points].sort(
        (a, b) =>
          parseLocalDate(a.test_date).getTime() -
          parseLocalDate(b.test_date).getTime()
      ),
    [points]
  );

  const times = sorted.map((p) => parseLocalDate(p.test_date).getTime());
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const timeSpan = maxTime - minTime || 1;

  const allYValues = sorted.flatMap((p) =>
    [p.result, p.ref_range_low, p.ref_range_high].filter(
      (v): v is number => v != null
    )
  );
  const rawMin = Math.min(...allYValues);
  const rawMax = Math.max(...allYValues);
  const yPad = (rawMax - rawMin) * 0.15 || Math.abs(rawMax) * 0.1 || 1;
  const yMin = rawMin - yPad;
  const yMax = rawMax + yPad;
  const ySpan = yMax - yMin || 1;

  function xFor(dateString: string) {
    const t = parseLocalDate(dateString).getTime();
    const frac = sorted.length === 1 ? 0.5 : (t - minTime) / timeSpan;
    return MARGIN.left + frac * PLOT_W;
  }
  function yFor(value: number) {
    const frac = (value - yMin) / ySpan;
    return MARGIN.top + PLOT_H - frac * PLOT_H;
  }

  // Reference band: contiguous runs of points that both have a numeric range.
  const bandSegments: string[] = [];
  let run: { x: number; low: number; high: number }[] = [];
  const flushRun = () => {
    if (run.length >= 2) {
      const top = run.map((p) => `${p.x},${yFor(p.high)}`).join(" L ");
      const bottom = [...run]
        .reverse()
        .map((p) => `${p.x},${yFor(p.low)}`)
        .join(" L ");
      bandSegments.push(`M ${top} L ${bottom} Z`);
    } else if (run.length === 1) {
      // Single point with a range: draw a thin band slice so it still reads.
      const p = run[0];
      const w = 6;
      bandSegments.push(
        `M ${p.x - w},${yFor(p.high)} L ${p.x + w},${yFor(p.high)} L ${p.x + w},${yFor(p.low)} L ${p.x - w},${yFor(p.low)} Z`
      );
    }
    run = [];
  };
  for (const p of sorted) {
    if (p.ref_range_low != null && p.ref_range_high != null) {
      run.push({ x: xFor(p.test_date), low: p.ref_range_low, high: p.ref_range_high });
    } else {
      flushRun();
    }
  }
  flushRun();

  const linePath = sorted
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(p.test_date)},${yFor(p.result)}`)
    .join(" ");

  const presentFlags = Array.from(new Set(sorted.map((p) => p.flag)));
  const latest = sorted[sorted.length - 1];
  const hovered = hoverIndex != null ? sorted[hoverIndex] : null;

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg || sorted.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * VB_W;
    let nearest = 0;
    let nearestDist = Infinity;
    sorted.forEach((p, i) => {
      const dist = Math.abs(xFor(p.test_date) - relX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  }

  const yTicks = [yMin + ySpan * 0.1, yMin + ySpan * 0.5, yMin + ySpan * 0.9];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          {markerName}
        </h3>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {category}
        </span>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="w-full touch-none"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          {/* gridlines + y ticks */}
          {yTicks.map((t, i) => (
            <g key={i}>
              <line
                x1={MARGIN.left}
                x2={VB_W - MARGIN.right}
                y1={yFor(t)}
                y2={yFor(t)}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth={1}
              />
              <text
                x={MARGIN.left - 6}
                y={yFor(t)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-slate-400 dark:fill-slate-500"
                fontSize={9}
              >
                {niceNumber(t)}
              </text>
            </g>
          ))}

          {/* reference range band */}
          {bandSegments.map((d, i) => (
            <path key={i} d={d} className="fill-emerald-500/10" />
          ))}

          {/* crosshair */}
          {hovered && (
            <line
              x1={xFor(hovered.test_date)}
              x2={xFor(hovered.test_date)}
              y1={MARGIN.top}
              y2={VB_H - MARGIN.bottom}
              className="stroke-slate-300 dark:stroke-slate-600"
              strokeWidth={1}
            />
          )}

          {/* trend line */}
          <path
            d={linePath}
            fill="none"
            className="stroke-slate-300 dark:stroke-slate-600"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* x-axis date labels: first, middle, last */}
          {[sorted[0], sorted[Math.floor((sorted.length - 1) / 2)], sorted[sorted.length - 1]]
            .filter((p, i, arr) => p && arr.indexOf(p) === i)
            .map((p) => (
              <text
                key={p.test_date}
                x={xFor(p.test_date)}
                y={VB_H - 8}
                textAnchor="middle"
                className="fill-slate-400 dark:fill-slate-500"
                fontSize={9}
              >
                {formatDate(p.test_date)}
              </text>
            ))}

          {/* points */}
          {sorted.map((p, i) => {
            const isHovered = i === hoverIndex;
            return (
              <circle
                key={p.test_date + i}
                cx={xFor(p.test_date)}
                cy={yFor(p.result)}
                r={isHovered ? 6 : 5}
                fill={FLAG_META[p.flag].color}
                stroke="currentColor"
                className="text-white dark:text-slate-900"
                strokeWidth={2}
              />
            );
          })}

          {/* endpoint label */}
          {latest && (
            <text
              x={xFor(latest.test_date)}
              y={yFor(latest.result) - 10}
              textAnchor="end"
              className="fill-slate-600 dark:fill-slate-300"
              fontSize={10}
              fontWeight={600}
            >
              {niceNumber(latest.result)} {unit}
            </text>
          )}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-md dark:border-slate-700 dark:bg-slate-800"
            style={{
              left: `${(xFor(hovered.test_date) / VB_W) * 100}%`,
              top: `${(yFor(hovered.result) / VB_H) * 100 - 2}%`,
            }}
          >
            <p className="font-semibold text-slate-900 dark:text-slate-50">
              {niceNumber(hovered.result)} {unit}
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              {formatDate(hovered.test_date)}
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              {hovered.ref_range_text ??
                (hovered.ref_range_low != null && hovered.ref_range_high != null
                  ? `Range ${niceNumber(hovered.ref_range_low)}–${niceNumber(hovered.ref_range_high)}`
                  : "No reference range")}
            </p>
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-3">
        {presentFlags.map((f) => (
          <span
            key={f}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: FLAG_META[f].color }}
            />
            {FLAG_META[f].label}
          </span>
        ))}
      </div>
    </div>
  );
}

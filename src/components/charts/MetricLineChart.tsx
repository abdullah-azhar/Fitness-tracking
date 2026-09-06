"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { parseLocalDate } from "@/lib/date";

function formatDate(dateString: string) {
  return parseLocalDate(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  unit: string;
}) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-md dark:border-slate-700 dark:bg-slate-800">
      <p className="font-semibold text-slate-900 dark:text-slate-50">
        {payload[0].value}
        {unit}
      </p>
      <p className="text-slate-500 dark:text-slate-400">{formatDate(label)}</p>
    </div>
  );
}

export function MetricLineChart({
  label,
  unit,
  color,
  data,
}: {
  label: string;
  unit: string;
  color: string;
  data: { test_date: string; value: number | null }[];
}) {
  const hasData = data.some((d) => d.value != null);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
        {label}
      </h3>
      {hasData ? (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid
              vertical={false}
              className="stroke-slate-100 dark:stroke-slate-800"
            />
            <XAxis
              dataKey="test_date"
              tickFormatter={formatDate}
              tick={{ fontSize: 10 }}
              className="fill-slate-400 dark:fill-slate-500"
              axisLine={false}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              className="fill-slate-400 dark:fill-slate-500"
              axisLine={false}
              tickLine={false}
              width={36}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<ChartTooltip unit={unit} />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              connectNulls={false}
              isAnimationActive={false}
              dot={(props) => {
                const { key, cx, cy } = props;
                return (
                  <circle
                    key={key}
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={color}
                    strokeWidth={2}
                    className="stroke-white dark:stroke-slate-900"
                  />
                );
              }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="flex h-[200px] items-center justify-center text-sm text-slate-400 dark:text-slate-500">
          No data yet
        </p>
      )}
    </div>
  );
}

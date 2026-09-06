"use client";

import { useEffect, useState } from "react";
import {
  useWorkoutStore,
  selectSessionsByDate,
  selectRecentWeights,
} from "@/store/useWorkoutStore";
import { parseLocalDate } from "@/lib/date";
import { isTimeBased } from "@/lib/workouts";
import { Sparkline } from "./Sparkline";

function formatDate(dateString: string) {
  return parseLocalDate(dateString).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function WorkoutHistoryView({ userId }: { userId: string }) {
  const { entries, loading, error, fetchEntries } = useWorkoutStore();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchEntries(userId);
  }, [userId, fetchEntries]);

  const sessions = selectSessionsByDate(entries);

  // Auto-expand the most recent session so history isn't empty-looking on first load.
  useEffect(() => {
    if (sessions.length > 0 && expanded.size === 0) {
      setExpanded(new Set([sessions[0].date]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions.length]);

  function toggle(date: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  }

  if (loading && entries.length === 0) {
    return <p className="text-sm text-slate-400">Loading…</p>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        Couldn&apos;t load workout history: {error}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        No workouts logged yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const isOpen = expanded.has(session.date);
        return (
          <div
            key={session.date}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <button
              type="button"
              onClick={() => toggle(session.date)}
              className="flex w-full items-center justify-between px-5 py-3 text-left"
            >
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                {formatDate(session.date)}
              </span>
              <span className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                {session.entries.length} exercise{session.entries.length === 1 ? "" : "s"}
                <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
                  ▾
                </span>
              </span>
            </button>

            {isOpen && (
              <ul className="divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">
                {session.entries.map((entry) => {
                  const unit = isTimeBased(entry.exercise) ? "sec" : "reps";
                  const recent = selectRecentWeights(
                    entries,
                    entry.exercise,
                    5,
                    session.date
                  );
                  return (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between px-5 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-300">
                          {entry.exercise}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {entry.sets ?? "—"} × {entry.reps ?? "—"} {unit}
                          {entry.weight != null && ` @ ${entry.weight}kg`}
                        </p>
                      </div>
                      <Sparkline values={recent.map((r) => r.weight)} />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

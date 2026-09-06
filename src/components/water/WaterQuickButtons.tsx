"use client";

import { useState } from "react";
import { logWater } from "@/lib/logging";
import { useTodayLogStore } from "@/store/useTodayLogStore";
import { useToastStore } from "@/store/useToastStore";

const AMOUNTS_ML = [250, 500, 1000];

export function WaterQuickButtons({
  userId,
  size = "md",
}: {
  userId: string;
  size?: "md" | "lg";
}) {
  const addWaterLog = useTodayLogStore((state) => state.addWaterLog);
  const showToast = useToastStore((state) => state.showToast);
  const [pending, setPending] = useState<number | null>(null);

  async function handleTap(amountMl: number) {
    setPending(amountMl);
    const { data, error } = await logWater(userId, amountMl);
    setPending(null);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    addWaterLog(data);
    showToast(`+${amountMl >= 1000 ? `${amountMl / 1000}L` : `${amountMl}ml`} logged`);
  }

  const sizeClasses =
    size === "lg" ? "py-8 text-xl" : "py-4 text-base";

  return (
    <div className="grid grid-cols-3 gap-3">
      {AMOUNTS_ML.map((amount) => (
        <button
          key={amount}
          type="button"
          onClick={() => handleTap(amount)}
          disabled={pending !== null}
          className={`rounded-xl bg-sky-500 font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-60 ${sizeClasses}`}
        >
          {pending === amount
            ? "…"
            : amount >= 1000
              ? `${amount / 1000}L`
              : `${amount}ml`}
        </button>
      ))}
    </div>
  );
}

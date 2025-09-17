"use client";
import React from "react";
import { useMemo } from "react";

type ResultsChartProps = {
  option1Label: string;
  option2Label: string;
  option1Count: number;
  option2Count: number;
};

/**
 * Renders a compact donut chart for two-option poll results using SVG only.
 * Inputs are counts; percentages are computed internally.
 */
export default function ResultsChart({ option1Label, option2Label, option1Count, option2Count }: ResultsChartProps) {
  const { total, p1, p2 } = useMemo(() => {
    const totalRaw = Math.max(0, (option1Count || 0) + (option2Count || 0));
    const p1 = totalRaw === 0 ? 0 : (option1Count / totalRaw) * 100;
    const p2 = 100 - p1;
    return { total: totalRaw, p1, p2 };
  }, [option1Count, option2Count]);

  const radius = 36;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const offset1 = circumference * (1 - p1 / 100);

  return (
    <div className="flex items-center gap-4">
      <svg width={96} height={96} viewBox="0 0 96 96" aria-label="Poll results chart">
        <g transform="rotate(-90 48 48)">
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={stroke}
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="#2563eb"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset1}
            strokeLinecap="butt"
          />
        </g>
      </svg>
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-blue-600" />{option1Label}: {Math.round(p1)}% ({option1Count})</div>
        <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-gray-300" />{option2Label}: {Math.round(p2)}% ({option2Count})</div>
        <div className="text-xs text-black/60">Total: {total}</div>
      </div>
    </div>
  );
}



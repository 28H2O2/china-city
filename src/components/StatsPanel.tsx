"use client";

import { LEVELS } from "@/lib/constants";
import type { StatsInfo } from "@/types";

interface Props {
  stats: StatsInfo;
}

export function StatsPanel({ stats }: Props) {
  const { total, visited, totalScore, maxScore, levelCounts } = stats;
  const visitedPct = total > 0 ? Math.round((visited / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* 总览数字 */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-sm p-3 text-center"
          style={{ background: "var(--bg-page)", border: "1px solid var(--border-main)" }}
        >
          <div
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-serif), serif", color: "var(--text-primary)" }}
          >
            {visited}
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>已访城市</div>
        </div>
        <div
          className="rounded-sm p-3 text-center"
          style={{ background: "var(--bg-page)", border: "1px solid var(--border-main)" }}
        >
          <div
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-serif), serif", color: "var(--text-primary)" }}
          >
            {totalScore}
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>总分 / {maxScore}</div>
        </div>
      </div>

      {/* 覆盖率进度条 */}
      <div>
        <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
          <span>覆盖率</span>
          <span style={{ fontFamily: "var(--font-serif), serif" }}>{visitedPct}%</span>
        </div>
        <div
          className="w-full h-2 overflow-hidden"
          style={{ background: "var(--border-main)", borderRadius: "1px" }}
        >
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${visitedPct}%`,
              background: "linear-gradient(to right, #4A6475, #C0472A)",
              borderRadius: "1px",
            }}
          />
        </div>
        <div className="text-xs mt-1 text-right" style={{ color: "var(--text-muted)", fontFamily: "var(--font-serif), serif" }}>
          {visited} / {total}
        </div>
      </div>

      {/* 等级分布 */}
      <div className="space-y-1.5">
        <div className="text-xs font-bold mb-2" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif), serif" }}>
          等级分布
        </div>
        {LEVELS.slice(1).reverse().map(({ level, label, color }) => {
          const count = levelCounts[level] ?? 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={level} className="flex items-center gap-2">
              <span
                className="shrink-0"
                style={{
                  width: 12,
                  height: 12,
                  background: color,
                  borderRadius: "1px",
                  border: "1px solid rgba(44,36,22,0.15)",
                }}
              />
              <span className="text-xs w-12 shrink-0" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif), serif" }}>
                {label}
              </span>
              <div
                className="flex-1 h-1.5 overflow-hidden"
                style={{ background: "var(--border-main)", borderRadius: "1px" }}
              >
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: color, borderRadius: "1px" }}
                />
              </div>
              <span className="text-xs w-6 text-right shrink-0" style={{ color: "var(--text-muted)", fontFamily: "var(--font-serif), serif" }}>
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

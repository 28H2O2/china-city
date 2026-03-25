"use client";

import { LEVELS } from "@/lib/constants";

export function Legend() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
      {LEVELS.map(({ level, label, color }) => (
        <div key={level} className="flex items-center gap-1.5">
          <span
            className="shrink-0"
            style={{
              width: 13,
              height: 13,
              background: color,
              borderRadius: "1px",
              border: "1px solid rgba(44,36,22,0.18)",
              display: "inline-block",
            }}
          />
          <span
            className="text-xs whitespace-nowrap"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif), serif" }}
          >
            L{level} {label}
          </span>
        </div>
      ))}
    </div>
  );
}

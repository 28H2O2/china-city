// 图例组件
// 功能：展示六个访问等级的颜色和标签（2列网格布局）
// 输入：无（从 constants.ts 读取 LEVELS 常量）
// 输出：图例 DOM
// 依赖：constants.ts (LEVELS)
// 在整个项目中起到何种作用：桌面端右侧面板和移动端底部的图例展示
// 最后修改时间：2026-03-25

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

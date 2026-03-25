// 等级选择面板组件
// 功能：点击城市后弹出的浮动面板，显示城市名和6个等级选项供用户选择
// 输入：cityName 城市名、currentLevel 当前等级、position 弹出位置、onSelect/onClose 回调
// 输出：fixed 定位的浮动面板 DOM
// 依赖：constants.ts (LEVELS), types (Level)
// 在整个项目中起到何种作用：用户设置城市访问等级的核心交互组件
// 最后修改时间：2026-03-25

"use client";

import { useEffect, useRef } from "react";
import { LEVELS } from "@/lib/constants";
import type { Level } from "@/types";

interface Props {
  cityName: string;
  currentLevel: Level;
  position: { x: number; y: number };
  onSelect: (level: Level) => void;
  onClose: () => void;
}

export function LevelSelector({ cityName, currentLevel, position, onSelect, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const PANEL_WIDTH = 165;
  const PANEL_HEIGHT = 240;
  const vw = typeof window !== "undefined" ? window.innerWidth : 0;
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;
  const left = Math.min(position.x + 12, vw - PANEL_WIDTH - 10);
  const top = Math.min(position.y - 10, vh - PANEL_HEIGHT - 10);

  return (
    <div
      ref={panelRef}
      className="level-selector"
      style={{ left, top }}
    >
      {/* 城市名标题 */}
      <div
        className="px-2 pb-2 mb-1"
        style={{ borderBottom: "1px solid var(--border-main)" }}
      >
        <div
          className="text-sm font-bold truncate"
          style={{ fontFamily: "var(--font-serif), serif", color: "var(--text-primary)", letterSpacing: "0.05em" }}
        >
          {cityName}
        </div>
      </div>

      {/* 等级选项 */}
      {LEVELS.map(({ level, label, color }) => (
        <div
          key={level}
          className={`level-option ${currentLevel === level ? "selected" : ""}`}
          onClick={() => {
            onSelect(level as Level);
            onClose();
          }}
        >
          <span className="color-dot" style={{ background: color }} />
          <span>{label}</span>
          {currentLevel === level && (
            <span className="ml-auto text-xs" style={{ color: "var(--accent)" }}>✓</span>
          )}
        </div>
      ))}
    </div>
  );
}

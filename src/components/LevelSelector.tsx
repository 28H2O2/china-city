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

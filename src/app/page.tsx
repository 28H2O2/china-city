// 首页
// 功能：组装主页面布局，集成地图、统计面板、图例和工具栏
// 输入：无（数据来自 useCityLevels hook）
// 输出：完整页面 DOM
// 依赖：MapContainer, StatsPanel, Legend, Toolbar, useCityLevels
// 如何运行：npm run dev，访问 http://localhost:3000
// 最后修改时间：2026-03-25

"use client";

import { useCallback } from "react";
import { MapContainer } from "@/components/MapContainer";
import { StatsPanel } from "@/components/StatsPanel";
import { Legend } from "@/components/Legend";
import { Toolbar } from "@/components/Toolbar";
import { useCityLevels } from "@/hooks/useCityLevels";
import { exportMapImage } from "@/lib/exportImage";

export default function HomePage() {
  const { cityLevels, isHydrated, setLevel, getProvinceMaxLevel, getStats, resetAll, getShareUrl } =
    useCityLevels();

  const stats = getStats();

  const handleExport = useCallback(async () => {
    await exportMapImage(cityLevels);
  }, [cityLevels]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "var(--bg-page)", color: "var(--text-muted)" }}>
        加载中...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--bg-page)" }}>
      {/* 顶部标题栏 */}
      <header
        className="flex items-center justify-between shrink-0 overflow-hidden"
        style={{
          background: "var(--bg-panel)",
          borderBottom: "1px solid var(--border-main)",
        }}
      >
        {/* 左侧朱砂竖条 + 标题 */}
        <div
          className="w-3 self-stretch shrink-0"
          style={{ background: "var(--accent)" }}
        />
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div>
            <div
              className="text-xs tracking-[0.3em] uppercase mb-0.5"
              style={{ color: "var(--accent)", fontFamily: "var(--font-sans), sans-serif", fontWeight: 600 }}
            >
              China City Map
            </div>
            <h1
              className="text-xl font-bold leading-tight tracking-wider"
              style={{ fontFamily: "var(--font-serif), serif", color: "var(--text-primary)" }}
            >
              中国制城
            </h1>
          </div>
        </div>

        {/* 右侧：H2O2 署名 + 工具栏 */}
        <div className="flex items-center gap-4 px-4">
          <span
            className="text-xs hidden sm:block"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-display), var(--font-sans), sans-serif",
              fontStyle: "italic",
              letterSpacing: "0.05em",
            }}
          >
            by H₂O₂
          </span>
          <Toolbar
            getShareUrl={getShareUrl}
            onExport={handleExport}
            onReset={resetAll}
          />
        </div>
      </header>

      {/* 主内容区 */}
      <div className="flex flex-1 min-h-0">
        {/* 地图区域 */}
        <main className="flex-1 min-w-0 h-full relative p-3">
          <div
            className="w-full h-full relative"
            style={{
              border: "1px solid var(--border-main)",
              boxShadow: "inset 0 0 0 3px var(--bg-page), inset 0 0 0 4px var(--border-main)",
              background: "var(--bg-map)",
            }}
          >
            <MapContainer
              cityLevels={cityLevels}
              setLevel={setLevel}
              getProvinceMaxLevel={getProvinceMaxLevel}
            />
          </div>
        </main>

        {/* 右侧面板（桌面端） */}
        <aside
          className="hidden lg:flex flex-col w-64 shrink-0"
          style={{
            background: "var(--bg-panel)",
            borderLeft: "1px solid var(--border-main)",
          }}
        >
          {/* 顶部朱砂细条（与 header 左竖条呼应） */}
          <div style={{ height: "3px", background: "var(--accent)", opacity: 0.6 }} />

          <div className="flex flex-col gap-4 p-4 flex-1 min-h-0 overflow-auto">
            {/* 访问统计 */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-px flex-1" style={{ background: "var(--accent)", opacity: 0.4 }} />
                <span
                  className="text-xs tracking-widest uppercase px-1"
                  style={{ color: "var(--accent)", fontFamily: "var(--font-sans), sans-serif", fontWeight: 600 }}
                >
                  访问统计
                </span>
                <div className="h-px flex-1" style={{ background: "var(--accent)", opacity: 0.4 }} />
              </div>
              <StatsPanel stats={stats} />
            </div>

            <div style={{ borderTop: "1px solid var(--border-main)" }} />

            {/* 图例 */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-px flex-1" style={{ background: "var(--border-main)" }} />
                <span
                  className="text-xs tracking-widest uppercase px-1"
                  style={{ color: "var(--text-secondary)", fontFamily: "var(--font-sans), sans-serif", fontWeight: 600 }}
                >
                  图例
                </span>
                <div className="h-px flex-1" style={{ background: "var(--border-main)" }} />
              </div>
              <Legend />
            </div>

            <div style={{ borderTop: "1px solid var(--border-main)" }} />

            {/* 使用提示 */}
            <div
              className="text-xs leading-6"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-serif), serif" }}
            >
              <p>· 点击省份，览城而入</p>
              <p>· 点击城市，记录到访</p>
              <p>· 数据存于本地，长久保存</p>
            </div>

            {/* 哲理名言 */}
            <div
              className="mt-auto pt-3"
              style={{ borderTop: "1px solid var(--border-main)" }}
            >
              <p
                className="text-xs leading-relaxed"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-display), serif",
                  fontStyle: "italic",
                  fontWeight: 300,
                  letterSpacing: "0.02em",
                }}
              >
                "Not all those who wander are lost."
              </p>
              <p
                className="text-xs mt-1"
                style={{
                  color: "var(--border-dark)",
                  fontFamily: "var(--font-serif), serif",
                  letterSpacing: "0.05em",
                }}
              >
                ——人生苦短，脚步不停
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* 底部图例（移动端） */}
      <footer
        className="lg:hidden px-4 py-2 shrink-0"
        style={{
          background: "var(--bg-panel)",
          borderTop: "1px solid var(--border-main)",
        }}
      >
        <Legend />
      </footer>

      {/* 悬浮反馈按钮 */}
      <a
        href="https://github.com/28H2O2/china-city/issues/new"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-5 flex items-center gap-1.5 px-3 py-2 text-xs transition-colors"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-main)",
          borderRadius: "3px",
          color: "var(--text-muted)",
          fontFamily: "var(--font-sans), sans-serif",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          zIndex: 50,
          textDecoration: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--accent)";
          e.currentTarget.style.borderColor = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-muted)";
          e.currentTarget.style.borderColor = "var(--border-main)";
        }}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        反馈 / Issue
      </a>
    </div>
  );
}

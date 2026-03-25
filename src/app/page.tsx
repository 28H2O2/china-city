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
        className="flex items-center justify-between px-5 py-2.5 shrink-0"
        style={{
          background: "var(--bg-panel)",
          borderBottom: "1px solid var(--border-main)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* 装饰菱形 */}
          <div
            className="w-4 h-4 rotate-45 shrink-0"
            style={{ background: "var(--accent)", opacity: 0.85 }}
          />
          <div>
            <h1
              className="text-xl font-bold leading-tight tracking-wider"
              style={{ fontFamily: "var(--font-serif), serif", color: "var(--text-primary)" }}
            >
              中国制城
            </h1>
            <p className="text-xs tracking-[0.15em]" style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans), sans-serif" }}>
              China City Level Map
            </p>
          </div>
        </div>
        <Toolbar
          getShareUrl={getShareUrl}
          onExport={handleExport}
          onReset={resetAll}
        />
      </header>

      {/* 主内容区 */}
      <div className="flex flex-1 min-h-0">
        {/* 地图区域 */}
        <main className="flex-1 min-w-0 h-full relative p-3">
          {/* 装饰框 */}
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
          className="hidden lg:flex flex-col w-64 p-4 gap-4 shrink-0"
          style={{
            background: "var(--bg-panel)",
            borderLeft: "1px solid var(--border-main)",
          }}
        >
          {/* 小标题 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-2.5 h-2.5 rotate-45 shrink-0"
                style={{ background: "var(--accent)" }}
              />
              <span
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif), serif" }}
              >
                访问统计
              </span>
            </div>
            <StatsPanel stats={stats} />
          </div>

          {/* 分隔 */}
          <div style={{ borderTop: "1px solid var(--border-main)" }} />

          {/* 图例 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-2.5 h-2.5 rotate-45 shrink-0"
                style={{ background: "var(--accent)" }}
              />
              <span
                className="text-xs font-bold tracking-widest"
                style={{ color: "var(--text-secondary)", fontFamily: "var(--font-serif), serif" }}
              >
                图例
              </span>
            </div>
            <Legend />
          </div>

          {/* 使用提示 */}
          <div
            className="mt-auto text-xs leading-6"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-serif), serif" }}
          >
            <p>· 点击省份，览城而入</p>
            <p>· 点击城市，记录到访</p>
            <p>· 数据存于本地，长久保存</p>
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
    </div>
  );
}

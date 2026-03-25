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
        <div className="flex items-center gap-0">
          {/* 朱砂竖条（参考 uzbekistan-travel.html 的 left strip 设计） */}
          <div
            className="w-3 self-stretch shrink-0"
            style={{ background: "var(--accent)" }}
          />
          <div className="flex items-center gap-3 px-4 py-2.5">
            <div>
              {/* eyebrow 小标签：参考 HTML 的 .eyebrow 样式 */}
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
          {/* 装饰双框 */}
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
    </div>
  );
}

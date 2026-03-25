// 工具栏组件
// 功能：提供保存图片、分享链接、重置数据三个操作按钮
// 输入：getShareUrl 函数、onExport 导出回调、onReset 重置回调
// 输出：工具栏 DOM（朱砂主按钮 + 次要按钮）
// 依赖：无外部依赖
// 在整个项目中起到何种作用：页面顶部标题栏右侧的操作区
// 最后修改时间：2026-03-25

"use client";

import { useState } from "react";

interface Props {
  getShareUrl: () => string;
  onExport: () => Promise<void>;
  onReset: () => void;
}

export function Toolbar({ getShareUrl, onExport, onReset }: Props) {
  const [copying, setCopying] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleCopyShare = async () => {
    const url = getShareUrl();
    await navigator.clipboard.writeText(url);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExport();
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    if (confirm("确定清除所有城市标记？此操作不可撤销。")) {
      onReset();
    }
  };

  const btnBase = "flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors cursor-pointer";

  return (
    <div className="flex items-center gap-2">
      {/* 保存图片 — 朱砂主按钮 */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className={btnBase}
        style={{
          background: exporting ? "var(--accent-hover)" : "var(--accent)",
          color: "#FAF6EC",
          border: "1px solid transparent",
          borderRadius: "3px",
          opacity: exporting ? 0.8 : 1,
          fontFamily: "var(--font-serif), serif",
        }}
        onMouseEnter={(e) => !exporting && (e.currentTarget.style.background = "var(--accent-hover)")}
        onMouseLeave={(e) => !exporting && (e.currentTarget.style.background = "var(--accent)")}
      >
        {exporting ? (
          <>
            <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            导出中...
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 12l-4-4h2.5V4h3v4H12L8 12zm-5 2h10v1.5H3V14z" />
            </svg>
            保存图片
          </>
        )}
      </button>

      {/* 分享 — 次要按钮 */}
      <button
        onClick={handleCopyShare}
        className={btnBase}
        style={{
          background: "transparent",
          color: "var(--text-primary)",
          border: "1px solid var(--border-main)",
          borderRadius: "3px",
          fontFamily: "var(--font-serif), serif",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        {copying ? (
          <span style={{ color: "var(--accent-blue)" }}>✓ 已复制</span>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
              <path d="M10.5 1h-6A1.5 1.5 0 003 2.5v9A1.5 1.5 0 004.5 13h.5v.5A1.5 1.5 0 006.5 15h6a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0012.5 3H12v-.5A1.5 1.5 0 0010.5 1zm-6 1.5h6a.5.5 0 01.5.5v.5H5v-.5a.5.5 0 01.5-.5zm-.5 2h7v9a.5.5 0 01-.5.5h-6a.5.5 0 01-.5-.5V4.5z" />
            </svg>
            分享
          </>
        )}
      </button>

      {/* 重置 */}
      <button
        onClick={handleReset}
        className={btnBase}
        style={{
          background: "transparent",
          color: "var(--text-muted)",
          border: "1px solid transparent",
          borderRadius: "3px",
          fontFamily: "var(--font-serif), serif",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--bg-hover)";
          e.currentTarget.style.color = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--text-muted)";
        }}
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
          <path d="M11 1.5v1h3.5a.5.5 0 010 1H13l-.8 9.6A2 2 0 0110.2 15H5.8a2 2 0 01-2-1.9L3 3.5H1.5a.5.5 0 010-1H5v-1A1.5 1.5 0 016.5 0h3A1.5 1.5 0 0111 1.5zM6.5 1a.5.5 0 00-.5.5v1h4v-1a.5.5 0 00-.5-.5h-3z" />
        </svg>
        重置
      </button>
    </div>
  );
}

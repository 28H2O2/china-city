// 根布局组件
// 功能：定义全局 HTML 结构、字体加载（Fraunces + 思源宋体 + 思源黑体）、SEO meta 信息
// 输入：children（页面内容）
// 输出：完整 HTML 文档
// 依赖：globals.css, Google Fonts (Fraunces, Noto Serif SC, Noto Sans SC)
// 在整个项目中起到何种作用：Next.js App Router 的根布局，所有页面共享此模板
// 最后修改时间：2026-03-25

import type { Metadata } from "next";
import { Fraunces, Noto_Serif_SC, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  weight: ["300", "700", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "中国制城 - China City Level Map",
  description: "记录你走过的中国每一座城市，用六色标记你与每座城市的缘分",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "中国制城 - China City Level Map",
    description: "记录你走过的中国每一座城市",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${fraunces.variable} ${notoSerifSC.variable} ${notoSansSC.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}

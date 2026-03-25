// 导出图片功能
// 功能：将全国所有地级市的颜色标记渲染成高分辨率 PNG 图片并下载
// 输入：cityLevels（城市等级数据）
// 输出：PNG 文件下载（4800x3200 分辨率，SCALE=2 倍）
// 依赖：d3-geo, constants.ts, GeoJSON: public/geojson/provinces/*.json
// 在整个项目中起到何种作用：用户保存和分享个人制城成果的核心功能
// 最后修改时间：2026-03-25（SCALE=2 升级为 4800×3200）

import { geoMercator, geoPath, type ExtendedFeatureCollection } from "d3-geo";
import { LEVEL_COLORS, LEVELS, PROVINCES } from "@/lib/constants";
import type { CityLevels } from "@/types";

const EXPORT_WIDTH = 2400;
const EXPORT_HEIGHT = 1600;
// const SCALE = 2; // 物理像素倍率，最终输出 4800×3200
const SCALE = 4;

// 全部 34 个省份的 adcode
const ALL_PROVINCE_ADCODES = PROVINCES.map((p) => p.adcode);

interface GeoFeature {
  type: string;
  properties: { adcode: string | number; name: string };
  geometry: object;
}

interface GeoJson {
  type: string;
  features: GeoFeature[];
}

// 并发加载所有省份的地级市 GeoJSON
async function loadAllProvinceGeoJSON(): Promise<GeoJson> {
  const results = await Promise.allSettled(
    ALL_PROVINCE_ADCODES.map((adcode) =>
      fetch(`/geojson/provinces/${adcode}.json`).then((r) => r.json() as Promise<GeoJson>)
    )
  );

  const allFeatures: GeoFeature[] = [];
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      allFeatures.push(...result.value.features);
    }
  });

  return { type: "FeatureCollection", features: allFeatures };
}

// 渲染 SVG 字符串
function renderMapSVG(geojson: GeoJson, cityLevels: CityLevels): string {
  const w = EXPORT_WIDTH;
  const h = EXPORT_HEIGHT - 120; // 预留底部图例区域

  const projection = geoMercator().fitSize([w, h], geojson as unknown as ExtendedFeatureCollection);
  const pathGenerator = geoPath().projection(projection);

  const paths = geojson.features
    .map((feature) => {
      const adcode = String(feature.properties.adcode);
      const level = cityLevels[adcode] ?? 0;
      const fill = LEVEL_COLORS[level];
      const d = pathGenerator(feature as Parameters<typeof pathGenerator>[0]);
      if (!d) return "";
      // 等级0的城市用淡灰色边框，其他用深色
      const stroke = level === 0 ? "#ccc" : "#555";
      const strokeWidth = level === 0 ? 0.3 : 0.4;
      return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>`;
    })
    .join("\n");

  return paths;
}

// 绘制图例和标题到 Canvas
function drawOverlay(
  ctx: CanvasRenderingContext2D,
  stats: { visited: number; total: number; totalScore: number }
) {
  const w = EXPORT_WIDTH;
  const h = EXPORT_HEIGHT;

  // 底部白色背景条
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.fillRect(0, h - 110, w, 110);

  // 项目标题（左上角）
  ctx.fillStyle = "#1a2332";
  ctx.font = "bold 56px -apple-system, sans-serif";
  ctx.fillText("中国制城", 40, 70);

  ctx.fillStyle = "#888";
  ctx.font = "28px -apple-system, sans-serif";
  ctx.fillText("China City Level Map", 40, 108);

  // 统计信息（右上角）
  ctx.textAlign = "right";
  ctx.fillStyle = "#555";
  ctx.font = "28px -apple-system, sans-serif";
  ctx.fillText(
    `已访问 ${stats.visited} / ${stats.total} 个城市 · 总分 ${stats.totalScore}`,
    w - 40,
    70
  );
  ctx.textAlign = "left";

  // 底部图例
  const legendY = h - 65;
  const dotSize = 22;
  const gap = 140;
  const startX = 40;

  LEVELS.forEach(({ level, label, color }, i) => {
    const x = startX + i * gap;
    ctx.fillStyle = color;
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, legendY - dotSize, dotSize, dotSize, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#444";
    ctx.font = "22px -apple-system, sans-serif";
    ctx.fillText(`L${level} ${label}`, x + dotSize + 6, legendY - 4);
  });

  // 分割线
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h - 110);
  ctx.lineTo(w, h - 110);
  ctx.stroke();
}

// 主导出函数
export async function exportMapImage(cityLevels: CityLevels): Promise<void> {
  // 1. 加载所有地级市 GeoJSON
  const geojson = await loadAllProvinceGeoJSON();

  // 2. 渲染 SVG
  const mapSVGContent = renderMapSVG(geojson, cityLevels);
  const mapHeight = EXPORT_HEIGHT - 120;

  // SVG 按 SCALE 倍渲染，保证矢量清晰
  const svgW = EXPORT_WIDTH * SCALE;
  const svgH = mapHeight * SCALE;
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${EXPORT_WIDTH} ${mapHeight}">
  <rect width="${EXPORT_WIDTH}" height="${mapHeight}" fill="#f0f4f8"/>
  ${mapSVGContent}
</svg>`;

  // 3. SVG → Canvas
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = EXPORT_WIDTH * SCALE;
      canvas.height = EXPORT_HEIGHT * SCALE;
      const ctx = canvas.getContext("2d")!;

      // 背景
      ctx.fillStyle = "#f0f4f8";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制地图（SVG 已是 SCALE 倍尺寸，1:1 绘制）
      ctx.drawImage(img, 0, 0, svgW, svgH);

      // 后续 overlay 绘制坐标保持逻辑尺寸，用 scale 放大
      ctx.scale(SCALE, SCALE);

      // 统计
      const visited = Object.values(cityLevels).filter((l) => l > 0).length;
      const total = geojson.features.length;
      const totalScore = Object.values(cityLevels).reduce((s: number, l) => s + l, 0);

      // 叠加标题和图例
      drawOverlay(ctx, { visited, total, totalScore });

      // 下载
      const link = document.createElement("a");
      link.download = `china-city-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = reject;
    img.src = url;
  });
}

// D3 地图投影 Hook
// 功能：根据容器尺寸和 GeoJSON 数据计算 D3 地理投影和 path 生成器
// 输入：GeoJSON FeatureCollection 对象，容器 div 的 ref
// 输出：path 字符串生成函数，容器宽高
// 依赖：d3-geo
// 在整个项目中起到何种作用：ChinaMap 和 ProvinceMap 的投影计算基础
// 最后修改时间：2026-03-24

import { useState, useEffect, useCallback, type RefObject } from "react";
import { geoMercator, geoPath, type GeoPath, type GeoPermissibleObjects, type ExtendedFeatureCollection } from "d3-geo";

interface GeoJson {
  type: string;
  features: object[];
}

interface D3MapResult {
  pathFn: ((feature: GeoPermissibleObjects) => string) | null;
  width: number;
  height: number;
}

export function useD3Map(
  geojson: GeoJson | null,
  containerRef: RefObject<HTMLDivElement | null>
): D3MapResult {
  const [pathFn, setPathFn] = useState<((feature: GeoPermissibleObjects) => string) | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const recalculate = useCallback(() => {
    if (!geojson || !containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    // 使用墨卡托投影，fitSize 自动计算缩放和平移使地图填满容器
    const projection = geoMercator().fitSize(
      [width, height],
      geojson as unknown as ExtendedFeatureCollection
    );
    const generator: GeoPath = geoPath().projection(projection);

    setPathFn(() => (feature: GeoPermissibleObjects) => generator(feature) ?? "");
    setDimensions({ width, height });
  }, [geojson, containerRef]);

  useEffect(() => {
    recalculate();
  }, [recalculate]);

  // 监听容器尺寸变化（窗口 resize 时重新计算）
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(recalculate);
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef, recalculate]);

  return { pathFn, ...dimensions };
}

// 省内地级市/区级地图组件
// 功能：渲染指定省份的地级市（或直辖市区级）地图，支持点击城市切换访问等级
// 输入：provinceAdcode/name、cityLevels、onCityClick 回调、onBack 返回回调
// 输出：SVG 地图元素 + 顶部面包屑导航（含返回全国按钮）
// 依赖：useD3Map, constants.ts, GeoJSON: public/geojson/provinces/{adcode}.json
// 在整个项目中起到何种作用：用户进入省级视图后查看和编辑各地级市/区的访问等级
// 最后修改时间：2026-03-25

"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useD3Map } from "@/hooks/useD3Map";
import { LEVEL_COLORS } from "@/lib/constants";
import type { CityLevels, Level } from "@/types";

interface Feature {
  type: string;
  properties: {
    adcode: string | number;
    name: string;
    centroid?: [number, number];
    center?: [number, number];
  };
  geometry: object;
}

interface GeoJson {
  type: string;
  features: Feature[];
}

interface Props {
  provinceAdcode: string;
  provinceName: string;
  cityLevels: CityLevels;
  onCityClick: (adcode: string, name: string, position: { x: number; y: number }) => void;
  onBack: () => void;
}

export function ProvinceMap({
  provinceAdcode,
  provinceName,
  cityLevels,
  onCityClick,
  onBack,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rawGeoJson, setRawGeoJson] = useState<GeoJson | null>(null);

  // 过滤掉省级自身 feature（末4位为0000），只保留地级市/区级
  // 若过滤后为空（如台湾省只有省级轮廓），则保留省级 feature 本身作为整体可点击区域
  const geojson = useMemo(() => {
    if (!rawGeoJson) return null;
    const validAdcode = (adcode: string) => /^\d{6}$/.test(adcode);
    const cities = rawGeoJson.features.filter((f) => {
      const adcode = String(f.properties.adcode);
      return validAdcode(adcode) && adcode !== provinceAdcode;
    });
    const features = cities.length > 0
      ? cities
      : rawGeoJson.features.filter((f) => validAdcode(String(f.properties.adcode)));
    return { ...rawGeoJson, features };
  }, [rawGeoJson, provinceAdcode]);

  const { pathFn, width, height } = useD3Map(geojson, containerRef);

  useEffect(() => {
    setRawGeoJson(null);
    fetch(`/geojson/provinces/${provinceAdcode}.json`)
      .then((r) => r.json())
      .then(setRawGeoJson)
      .catch(console.error);
  }, [provinceAdcode]);

  const handleCityClick = (e: React.MouseEvent, adcode: string, name: string) => {
    e.stopPropagation();
    onCityClick(adcode, name, { x: e.clientX, y: e.clientY });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 顶部导航栏：左侧返回按钮 + 面包屑 */}
      <div
        className="flex items-center gap-3 px-3 py-2 text-sm shrink-0"
        style={{
          background: "var(--bg-panel)",
          borderBottom: "1px solid var(--border-main)",
          fontFamily: "var(--font-serif), serif",
        }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-2.5 py-1 shrink-0 transition-colors cursor-pointer"
          style={{
            color: "var(--accent-blue)",
            border: "1px solid var(--border-main)",
            borderRadius: "3px",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-hover)";
            e.currentTarget.style.color = "var(--accent)";
            e.currentTarget.style.borderColor = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--accent-blue)";
            e.currentTarget.style.borderColor = "var(--border-main)";
          }}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10.707 13.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L6.414 8l4.293 4.293a1 1 0 010 1.414z" />
          </svg>
          返回全国
        </button>
        <span style={{ color: "var(--border-dark)" }}>›</span>
        <span className="font-bold" style={{ color: "var(--text-primary)" }}>{provinceName}</span>
      </div>

      {/* 地图区域 */}
      <div ref={containerRef} className="flex-1 min-h-0">
        {pathFn && geojson && width > 0 && height > 0 ? (
          <svg
            id="province-map-svg"
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            height="100%"
            className="block"
          >
            <g>
              {geojson.features.map((feature) => {
                const adcode = String(feature.properties.adcode);
                const name = feature.properties.name;
                const level = (cityLevels[adcode] ?? 0) as Level;
                const fill = LEVEL_COLORS[level];
                const d = pathFn(feature as Parameters<typeof pathFn>[0]);
                if (!d) return null;

                return (
                  <path
                    key={adcode}
                    d={d}
                    fill={fill}
                    stroke="#666"
                    strokeWidth={0.5}
                    className="map-path"
                    onClick={(e) => handleCityClick(e, adcode, name)}
                  >
                    <title>{name}</title>
                  </path>
                );
              })}
            </g>
          </svg>
        ) : (
          <div className="flex items-center justify-center h-full" style={{ color: "var(--text-muted)" }}>
            {rawGeoJson ? "渲染中..." : `加载 ${provinceName} 数据中...`}
          </div>
        )}
      </div>
    </div>
  );
}

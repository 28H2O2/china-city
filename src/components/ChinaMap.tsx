// 全国省级地图组件
// 功能：渲染全国省级地图，省份颜色为该省内所有城市的最高访问等级
// 输入：onProvinceClick 回调（点击省份时触发）、getProvinceMaxLevel 函数
// 输出：SVG 地图元素
// 依赖：useD3Map, constants.ts, GeoJSON: public/geojson/china.json
// 在整个项目中起到何种作用：首页默认视图，用户通过点击省份进入地级市视图
// 最后修改时间：2026-03-25

"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { geoMercator, geoPath, type GeoPermissibleObjects, type ExtendedFeatureCollection } from "d3-geo";
import { useD3Map } from "@/hooks/useD3Map";
import { LEVEL_COLORS } from "@/lib/constants";
import type { Level } from "@/types";

// 港澳 adcode
const HK_MACAU = new Set(["810000", "820000"]);

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
  onProvinceClick: (adcode: string, name: string) => void;
  getProvinceMaxLevel: (adcode: string) => Level;
}

// 只保留6位纯数字 adcode 的省份 feature（排除九段线 100000_JD 等）
function filterProvinces(geojson: GeoJson): GeoJson {
  return {
    ...geojson,
    features: geojson.features.filter((f) =>
      /^\d{6}$/.test(String(f.properties.adcode))
    ),
  };
}

export function ChinaMap({ onProvinceClick, getProvinceMaxLevel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rawGeoJson, setRawGeoJson] = useState<GeoJson | null>(null);

  // 过滤后的 geojson——用于 fitSize 投影计算（不含九段线）
  const geojson = useMemo(
    () => (rawGeoJson ? filterProvinces(rawGeoJson) : null),
    [rawGeoJson]
  );

  const { pathFn, width, height } = useD3Map(geojson, containerRef);

  // 港澳放大 inset map 的投影和 path 数据
  const inset = useMemo(() => {
    if (!geojson || width === 0 || height === 0) return null;
    const hkMacauFeatures = geojson.features.filter((f) =>
      HK_MACAU.has(String(f.properties.adcode))
    );
    if (hkMacauFeatures.length === 0) return null;

    const insetW = Math.min(140, width * 0.2);
    const insetH = insetW * 0.9;
    const padding = 8;
    const insetGeo = { type: "FeatureCollection", features: hkMacauFeatures };
    const projection = geoMercator().fitExtent(
      [[padding, padding], [insetW - padding, insetH - padding]],
      insetGeo as unknown as ExtendedFeatureCollection
    );
    const gen = geoPath().projection(projection);

    const paths = hkMacauFeatures.map((f) => ({
      adcode: String(f.properties.adcode),
      name: f.properties.name,
      d: gen(f as unknown as GeoPermissibleObjects) ?? "",
    }));

    return { paths, w: insetW, h: insetH, x: width - insetW - 10, y: height - insetH - 10 };
  }, [geojson, width, height]);

  useEffect(() => {
    fetch("/geojson/china.json")
      .then((r) => r.json())
      .then(setRawGeoJson)
      .catch(console.error);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      {pathFn && geojson && width > 0 && height > 0 ? (
        <svg
          id="china-map-svg"
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          className="block"
        >
          <g>
            {geojson.features.map((feature) => {
              const adcode = String(feature.properties.adcode);
              const name = feature.properties.name;
              const level = getProvinceMaxLevel(adcode);
              const fill = LEVEL_COLORS[level];
              const d = pathFn(feature as Parameters<typeof pathFn>[0]);
              if (!d) return null;

              return (
                <path
                  key={adcode}
                  d={d}
                  fill={fill}
                  stroke="#666"
                  strokeWidth={0.8}
                  className="map-path"
                  onClick={(e) => {
                    e.stopPropagation();
                    onProvinceClick(adcode, name);
                  }}
                >
                  <title>{name}</title>
                </path>
              );
            })}
          </g>

          {/* 港澳放大插图 */}
          {inset && (
            <g transform={`translate(${inset.x}, ${inset.y})`}>
              <rect
                x={0} y={0} width={inset.w} height={inset.h}
                fill="var(--bg-map)" stroke="var(--border-dark)" strokeWidth={1}
                rx={2}
              />
              <text
                x={inset.w / 2} y={12}
                textAnchor="middle"
                fill="var(--text-secondary)"
                fontSize={9}
                fontFamily="var(--font-serif), serif"
              >
                港 · 澳
              </text>
              {inset.paths.map(({ adcode, name, d }) => {
                const level = getProvinceMaxLevel(adcode);
                const fill = LEVEL_COLORS[level];
                return (
                  <path
                    key={`inset-${adcode}`}
                    d={d}
                    fill={fill}
                    stroke="#666"
                    strokeWidth={0.5}
                    className="map-path"
                    onClick={(e) => {
                      e.stopPropagation();
                      onProvinceClick(adcode, name);
                    }}
                  >
                    <title>{name}（放大）</title>
                  </path>
                );
              })}
            </g>
          )}
        </svg>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          {rawGeoJson ? "渲染中..." : "加载地图中..."}
        </div>
      )}
    </div>
  );
}

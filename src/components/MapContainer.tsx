// 地图容器组件
// 功能：管理全国视图与省级视图之间的切换，以及等级选择面板的弹出/关闭
// 输入：useCityLevels hook 返回的状态和方法
// 输出：地图 + 等级选择面板
// 依赖：ChinaMap, ProvinceMap, LevelSelector
// 在整个项目中起到何种作用：地图交互的核心协调组件
// 最后修改时间：2026-03-25

"use client";

import { useState, useCallback } from "react";
import { ChinaMap } from "@/components/ChinaMap";
import { ProvinceMap } from "@/components/ProvinceMap";
import { LevelSelector } from "@/components/LevelSelector";
import type { ViewState, Level, CityLevels } from "@/types";

interface SelectorState {
  adcode: string;
  name: string;
  position: { x: number; y: number };
}

interface Props {
  cityLevels: CityLevels;
  setLevel: (adcode: string, level: Level) => void;
  getProvinceMaxLevel: (adcode: string) => Level;
}

export function MapContainer({ cityLevels, setLevel, getProvinceMaxLevel }: Props) {
  const [view, setView] = useState<ViewState>({ type: "country" });
  const [selector, setSelector] = useState<SelectorState | null>(null);

  const handleProvinceClick = useCallback(
    (adcode: string, name: string) => {
      setSelector(null);
      setView({ type: "province", adcode, name });
    },
    []
  );

  const handleCityClick = useCallback(
    (adcode: string, name: string, position: { x: number; y: number }) => {
      setSelector({ adcode, name, position });
    },
    []
  );

  const handleLevelSelect = useCallback(
    (level: Level) => {
      if (selector) setLevel(selector.adcode, level);
    },
    [selector, setLevel]
  );

  const handleBack = useCallback(() => {
    setSelector(null);
    setView({ type: "country" });
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden" onClick={() => setSelector(null)}>
      {view.type === "country" ? (
        <ChinaMap
          onProvinceClick={handleProvinceClick}
          getProvinceMaxLevel={getProvinceMaxLevel}
        />
      ) : (
        <ProvinceMap
          provinceAdcode={view.adcode}
          provinceName={view.name}
          cityLevels={cityLevels}
          onCityClick={handleCityClick}
          onBack={handleBack}
        />
      )}

      {selector && (
        <LevelSelector
          cityName={selector.name}
          currentLevel={(cityLevels[selector.adcode] ?? 0) as Level}
          position={selector.position}
          onSelect={handleLevelSelect}
          onClose={() => setSelector(null)}
        />
      )}
    </div>
  );
}

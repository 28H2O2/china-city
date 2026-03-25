// 核心状态管理 Hook
// 功能：管理333个城市的访问等级数据，提供增删查改和统计接口
// 输入：无（从 localStorage 或 URL hash 初始化）
// 输出：cityLevels 对象和操作方法
// 依赖：storage.ts, shareCodec.ts, cityData.ts, constants.ts
// 在整个项目中起到何种作用：所有地图组件和 UI 组件的数据核心
// 最后修改时间：2026-03-24

"use client";

import { useState, useEffect, useCallback } from "react";
import type { CityLevels, Level, StatsInfo } from "@/types";
import { saveToStorage, loadFromStorage, clearStorage } from "@/lib/storage";
import { encodeShareCode, decodeShareCode } from "@/lib/shareCodec";
import { CITIES_BY_PROVINCE, SORTED_CITY_ADCODES } from "@/lib/cityData";

export function useCityLevels() {
  const [cityLevels, setCityLevels] = useState<CityLevels>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // 客户端初始化：优先读 URL hash（分享码），其次读 localStorage
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const fromUrl = hash ? decodeShareCode(hash) : null;
    if (fromUrl) {
      setCityLevels(fromUrl);
      // 清除 URL hash，避免用户分享时携带他人数据
      window.history.replaceState(null, "", window.location.pathname);
    } else {
      const saved = loadFromStorage();
      if (saved) setCityLevels(saved);
    }
    setIsHydrated(true);
  }, []);

  // 每次数据变化时同步到 localStorage
  useEffect(() => {
    if (isHydrated) {
      saveToStorage(cityLevels);
    }
  }, [cityLevels, isHydrated]);

  // 设置单个城市的等级
  const setLevel = useCallback((adcode: string, level: Level) => {
    setCityLevels((prev) => {
      if (level === 0) {
        const next = { ...prev };
        delete next[adcode];
        return next;
      }
      return { ...prev, [adcode]: level };
    });
  }, []);

  // 获取某省内所有城市的最高等级（用于全国视图省份着色）
  const getProvinceMaxLevel = useCallback(
    (provinceAdcode: string): Level => {
      const cities = CITIES_BY_PROVINCE.get(provinceAdcode) ?? [];
      let max: Level = 0;
      for (const city of cities) {
        const level = cityLevels[city.adcode] ?? 0;
        if (level > max) max = level as Level;
      }
      return max;
    },
    [cityLevels]
  );

  // 获取统计信息
  const getStats = useCallback((): StatsInfo => {
    const total = SORTED_CITY_ADCODES.length;
    const allLevels = Object.values(cityLevels);
    const visited = allLevels.filter((l) => l > 0).length;
    const totalScore = allLevels.reduce((s: number, l) => s + l, 0);
    const maxScore = total * 5;
    const levelCounts = [0, 1, 2, 3, 4, 5].map(
      (l) => allLevels.filter((v) => v === l).length
    );
    // level 0 的数量需要加上未记录城市
    levelCounts[0] = total - visited;
    return { total, visited, totalScore, maxScore, levelCounts };
  }, [cityLevels]);

  // 重置所有数据
  const resetAll = useCallback(() => {
    setCityLevels({});
    clearStorage();
  }, []);

  // 生成分享链接
  const getShareUrl = useCallback((): string => {
    const code = encodeShareCode(cityLevels);
    const base = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";
    return `${base}#${code}`;
  }, [cityLevels]);

  return {
    cityLevels,
    isHydrated,
    setLevel,
    getProvinceMaxLevel,
    getStats,
    resetAll,
    getShareUrl,
  };
}

// localStorage 持久化封装
// 功能：读写城市等级数据到浏览器本地存储
// 输入：CityLevels 对象（adcode → level 映射）
// 输出：CityLevels 对象，或 null
// 最后修改时间：2026-03-24

import type { CityLevels } from "@/types";
import { STORAGE_KEY } from "@/lib/constants";

// 保存到 localStorage，只存储 level > 0 的城市以节省空间
export function saveToStorage(levels: CityLevels): void {
  if (typeof window === "undefined") return;
  const nonZero = Object.fromEntries(
    Object.entries(levels).filter(([, v]) => v > 0)
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nonZero));
}

// 从 localStorage 读取，缺失的 adcode 默认为 0
export function loadFromStorage(): CityLevels | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CityLevels;
  } catch {
    return null;
  }
}

// 清空 localStorage 中的城市数据
export function clearStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

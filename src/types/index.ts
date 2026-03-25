// 类型定义
// 功能：定义项目中所有共享的 TypeScript 类型
// 最后修改时间：2026-03-24

// 访问等级 0-5
export type Level = 0 | 1 | 2 | 3 | 4 | 5;

// 城市等级数据：key 为 adcode（6位数字字符串），value 为 Level
export type CityLevels = Record<string, Level>;

// 省份信息
export interface ProvinceInfo {
  adcode: string;   // 如 "440000"
  name: string;     // 如 "广东省"
  center: [number, number]; // 省会/中心城市经纬度，用于全国视图标签定位
}

// 城市信息
export interface CityInfo {
  adcode: string;         // 如 "440100"
  name: string;           // 如 "广州市"
  provinceAdcode: string; // 所属省 adcode
}

// 视图状态
export type ViewState =
  | { type: "country" }
  | { type: "province"; adcode: string; name: string };

// 等级定义
export interface LevelDef {
  level: Level;
  label: string;
  color: string;
  colorName: string;
}

// 统计信息
export interface StatsInfo {
  total: number;
  visited: number;
  totalScore: number;
  maxScore: number;
  levelCounts: number[]; // 索引 0-5 对应各等级城市数量
}

// GeoJSON Feature properties（DataV 格式）
export interface GeoFeatureProperties {
  adcode: number | string;
  name: string;
  center?: [number, number];
  centroid?: [number, number];
  childrenNum?: number;
  level?: string;
  parent?: { adcode: number };
  subFeatureIndex?: number;
  acroutes?: number[];
}

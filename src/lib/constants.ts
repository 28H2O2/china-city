// 常量定义
// 功能：定义等级颜色、省份列表等全局常量
// 最后修改时间：2026-03-24

import type { LevelDef, ProvinceInfo } from "@/types";

// 6个访问等级的颜色和标签定义（中华历史色系）
export const LEVELS: LevelDef[] = [
  { level: 0, label: "没去过", color: "#C8D8E0", colorName: "tianshui" },  // 天水蓝
  { level: 1, label: "路过过", color: "#5B7A8C", colorName: "qingdai" },   // 青黛
  { level: 2, label: "停留过", color: "#7DAF8A", colorName: "piao" },      // 缥（浅碧）
  { level: 3, label: "游玩过", color: "#C9943A", colorName: "jin" },       // 金（琥珀黄）
  { level: 4, label: "住宿过", color: "#C0472A", colorName: "zhusha" },    // 朱砂
  { level: 5, label: "居住过", color: "#7D2318", colorName: "zhe" },       // 赭（深赤）
] as const;

// level → 颜色的快速映射
export const LEVEL_COLORS: Record<number, string> = Object.fromEntries(
  LEVELS.map((l) => [l.level, l.color])
);

// level → 标签的快速映射
export const LEVEL_LABELS: Record<number, string> = Object.fromEntries(
  LEVELS.map((l) => [l.level, l.label])
);

// 34个省级行政区（含直辖市、自治区、特别行政区）
// center 为省会或中心城市经纬度 [lng, lat]
export const PROVINCES: ProvinceInfo[] = [
  { adcode: "110000", name: "北京市", center: [116.405285, 39.904989] },
  { adcode: "120000", name: "天津市", center: [117.190182, 39.125596] },
  { adcode: "130000", name: "河北省", center: [114.502461, 38.045474] },
  { adcode: "140000", name: "山西省", center: [112.549248, 37.857014] },
  { adcode: "150000", name: "内蒙古自治区", center: [111.670801, 40.818311] },
  { adcode: "210000", name: "辽宁省", center: [123.429096, 41.796767] },
  { adcode: "220000", name: "吉林省", center: [125.3245, 43.886841] },
  { adcode: "230000", name: "黑龙江省", center: [126.642464, 45.756967] },
  { adcode: "310000", name: "上海市", center: [121.472644, 31.231706] },
  { adcode: "320000", name: "江苏省", center: [118.767413, 32.041544] },
  { adcode: "330000", name: "浙江省", center: [120.153576, 30.287459] },
  { adcode: "340000", name: "安徽省", center: [117.283042, 31.86119] },
  { adcode: "350000", name: "福建省", center: [119.306239, 26.075302] },
  { adcode: "360000", name: "江西省", center: [115.892151, 28.676493] },
  { adcode: "370000", name: "山东省", center: [117.000923, 36.675807] },
  { adcode: "410000", name: "河南省", center: [113.665412, 34.757975] },
  { adcode: "420000", name: "湖北省", center: [114.298572, 30.584355] },
  { adcode: "430000", name: "湖南省", center: [112.982279, 28.19409] },
  { adcode: "440000", name: "广东省", center: [113.280637, 23.125178] },
  { adcode: "450000", name: "广西壮族自治区", center: [108.320004, 22.82402] },
  { adcode: "460000", name: "海南省", center: [110.33119, 20.031971] },
  { adcode: "500000", name: "重庆市", center: [106.504962, 29.533155] },
  { adcode: "510000", name: "四川省", center: [104.065735, 30.659462] },
  { adcode: "520000", name: "贵州省", center: [106.713478, 26.578343] },
  { adcode: "530000", name: "云南省", center: [102.712251, 25.040609] },
  { adcode: "540000", name: "西藏自治区", center: [91.132212, 29.660361] },
  { adcode: "610000", name: "陕西省", center: [108.948024, 34.263161] },
  { adcode: "620000", name: "甘肃省", center: [103.823557, 36.058039] },
  { adcode: "630000", name: "青海省", center: [101.778916, 36.623178] },
  { adcode: "640000", name: "宁夏回族自治区", center: [106.278179, 38.46637] },
  { adcode: "650000", name: "新疆维吾尔自治区", center: [87.617733, 43.792818] },
  { adcode: "710000", name: "台湾省", center: [121.509062, 25.044332] },
  { adcode: "810000", name: "香港特别行政区", center: [114.173355, 22.320048] },
  { adcode: "820000", name: "澳门特别行政区", center: [113.54909, 22.198951] },
];

// localStorage 存储 key
export const STORAGE_KEY = "china_city_levels";

// 地图视口设置（墨卡托投影在此范围内表现最佳）
export const MAP_BOUNDS = {
  minLng: 73.5,
  maxLng: 135.1,
  minLat: 3.8,
  maxLat: 53.6,
};

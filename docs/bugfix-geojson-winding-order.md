# Bug 修复：GeoJSON Winding Order 导致地图不显示

## 问题现象

首页地图区域完全空白，无法看到中国地图。点击任意位置都弹出"澳门特别行政区"的等级选择面板。

## 根因分析

### 1. GeoJSON Polygon 环绕方向（Winding Order）

从阿里 DataV.GeoAtlas 下载的 GeoJSON 文件中，所有 polygon 的顶点环绕方向为**逆时针（CCW, Counter-Clockwise）**。

D3.js 使用**球面几何**（spherical geometry）来处理地理数据。在球面几何中，一个 polygon 的"内部"由环绕方向定义：

- **顺时针（CW）**环绕 → polygon 内部是被围住的小面积区域（如一个省份）
- **逆时针（CCW）**环绕 → polygon 内部是**整个球面减去**被围住的小面积区域

DataV 的数据遵循的是常见的 Shapefile/旧版 GeoJSON 惯例（CCW 外环），但 D3.js 遵循 RFC 7946 规范的球面解释，两者环绕方向的语义恰好相反。

### 2. 问题传导链

```
DataV GeoJSON (CCW polygon)
  → D3 geoArea() 返回 ≈ 12.57（≈ 4π，覆盖地球 99.99%）
  → D3 geoBounds() 返回 [-180, -90] ~ [180, 90]（整个地球）
  → geoMercator().fitSize() 试图将"整个地球"缩放到容器大小
  → 投影比例尺极小，中国被压缩成一个肉眼不可见的点
  → 所有 34 个省份的 SVG path 都重叠在同一个极小区域
  → 最后渲染的澳门特别行政区覆盖在最上层
  → 用户点击任意位置都触发澳门的 onClick
```

### 3. 验证方法

```javascript
const d3 = require('d3-geo');
const beijing = china.features[0]; // 北京市

// 修复前
d3.geoArea(beijing);   // → 12.566 (≈ 4π, 几乎覆盖整个球面)
d3.geoBounds(beijing); // → [[-180, -90], [180, 90]]

// 修复后（反转环绕方向）
d3.geoArea(beijingFixed);   // → 0.000404 (正常的小面积)
d3.geoBounds(beijingFixed); // → [[115.43, 39.44], [117.51, 41.06]]
```

## 修复方案

对所有 GeoJSON 文件（`china.json` + 34 个省份文件）的 polygon rings 执行坐标反转：

```javascript
function reverseWinding(feature) {
  const geom = feature.geometry;
  if (geom.type === 'Polygon') {
    geom.coordinates = geom.coordinates.map(ring => ring.slice().reverse());
  } else if (geom.type === 'MultiPolygon') {
    geom.coordinates = geom.coordinates.map(polygon =>
      polygon.map(ring => ring.slice().reverse())
    );
  }
}
```

### 修复统计

| 文件 | 修复的 feature 数 |
|------|-------------------|
| china.json | 35/35 |
| 34 个省份文件 | 469 个 feature |

## 教训

1. **D3.js 的球面几何特性**：D3 v4+ 使用球面几何处理所有地理数据，polygon 环绕方向直接决定了 polygon 的"内部"是哪一面。这与平面 GIS 工具的处理方式完全不同。
2. **数据源适配**：阿里 DataV.GeoAtlas 的数据是为 ECharts 等平面渲染引擎设计的，直接用于 D3 时必须修正环绕方向。
3. **调试线索**：如果 `geoArea()` 返回值大于 `2π`（≈6.28），说明 polygon 覆盖了超过半个球面，几乎一定是环绕方向问题。用 Shoelace 公式验证外环有向面积：**负值 = CW = D3 正确**，正值 = CCW = 需要反转。

## 补充：不同数据源的 winding order

| 数据源 | 原始方向 | D3 处理 |
|-------|---------|---------|
| 阿里 DataV.GeoAtlas | CCW（逆时针）| 需要反转为 CW |
| g0v/twgeojson（台湾）| CW（顺时针）| 无需反转，直接使用 |

**不要假设所有数据源都需要同样的处理**——新增数据时务必先用 Shoelace 公式验证外环有向面积，负值（CW）才是 D3 所需格式。

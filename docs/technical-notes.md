# 技术说明：地图渲染与踩坑记录

## 核心技术选型

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16 | React 框架，`output: "export"` 静态导出 |
| D3.js (d3-geo) | 7 | 地理投影计算、path 路径生成 |
| GeoJSON | — | 地理边界数据（来自阿里 DataV.GeoAtlas） |
| Tailwind CSS | 4 | 样式 |

---

## 地图渲染原理

### 整体架构："D3 计算，React 渲染"

本项目不使用 D3 操作 DOM（避免与 React 冲突），而是用 D3 纯粹做数学计算，SVG 元素完全由 React JSX 渲染：

```
GeoJSON 坐标数据
  → D3 投影函数（geoMercator + fitSize）  ← 数学计算层
  → SVG path 字符串（"M 100,200 L 150,180 ..."）
  → React <path d={...} onClick={...} />   ← 渲染层
```

### 投影计算

核心是 `geoMercator().fitSize()`，它做两件事：

1. **确定缩放比例**：根据 GeoJSON 的地理边界（中国的经纬度范围）和容器的像素尺寸，计算出合适的缩放系数
2. **确定平移量**：将地图中心移到容器中央

```typescript
const projection = geoMercator().fitSize(
  [containerWidth, containerHeight],  // 容器像素大小
  geojson                              // 要展示的 GeoJSON
);
const pathGenerator = geoPath().projection(projection);

// 对每个 feature 生成 SVG path 字符串
const d = pathGenerator(feature); // → "M 512,186 L 533,207 ..."
```

### 响应式处理

使用 `ResizeObserver` 监听容器尺寸变化，容器大小改变时重新计算投影：

```typescript
const observer = new ResizeObserver(() => {
  const { width, height } = containerRef.current.getBoundingClientRect();
  const projection = geoMercator().fitSize([width, height], geojson);
  setPathFn(() => geoPath().projection(projection));
});
observer.observe(containerRef.current);
```

---

## 踩坑记录

### 坑 1：GeoJSON Winding Order（环绕方向）——最隐蔽的 Bug

**现象**：地图区域完全空白，点击任意位置都触发澳门特别行政区的弹窗。

**根因**：D3.js 使用**球面几何**（spherical geometry）解释 GeoJSON。在球面几何中，一个 polygon 的内部由顶点的环绕方向决定：

- **顺时针（CW）**环绕 → 内部是"被围住的小面积"（正常省份形状）
- **逆时针（CCW）**环绕 → 内部是"整个球面减去被围住的面积"（几乎是整个地球）

阿里 DataV 的数据是为 ECharts 设计的，使用 CCW 方向。D3 收到这份数据后，认为每个省份覆盖了地球的 99.99%：

```javascript
d3.geoArea(beijing_raw); // → 12.566 ≈ 4π（几乎覆盖整个球面）
d3.geoArea(beijing_fixed); // → 0.000404（正确的北京面积）
```

`fitSize()` 试图将"整个地球"缩放到容器，比例尺极小，34个省份全被压缩到同一个不可见的点，最后渲染的澳门覆盖在最上层，所以点哪都是澳门。

**修复**：反转所有 polygon ring 的坐标顺序：

```javascript
geom.coordinates = geom.coordinates.map(polygon =>
  polygon.map(ring => ring.slice().reverse())
);
```

**诊断方法**：如果 `d3.geoArea(feature) > 2π`（≈ 6.28），说明 polygon 方向错误。

---

### 坑 2：九段线（南海）破坏投影计算

**现象**：地图偶尔出现空白，或比例尺明显错误。

**根因**：`china.json`（`100000_full.json`）除了34个省份的 feature，还包含一个 `adcode: "100000_JD"` 的九段线 feature。九段线的地理范围延伸到南海，将整个 FeatureCollection 的边界大幅向南扩展，使 `fitSize()` 计算出错误的缩放比例，中国大陆被挤压到地图上方一小角。

**修复**：在调用 `useD3Map`（即 `fitSize`）之前，先过滤掉非标准 adcode 的 feature：

```typescript
const geojson = useMemo(
  () => rawGeoJson ? {
    ...rawGeoJson,
    features: rawGeoJson.features.filter(f =>
      /^\d{6}$/.test(String(f.properties.adcode))
    )
  } : null,
  [rawGeoJson]
);
// 注意：必须先过滤，再传给 useD3Map，不能先 useD3Map 再在渲染时过滤
const { pathFn, width, height } = useD3Map(geojson, containerRef);
```

---

### 坑 3：容器高度为 0

**现象**：地图不显示（停留在"加载中"），控制台无报错。

**根因**：`useD3Map` 用 `getBoundingClientRect()` 获取容器尺寸，如果容器高度为 0，直接 `return` 不计算投影。高度为 0 的原因是 CSS 高度链断裂：

```
h-screen （100vh）
  └── flex-1 min-h-0   ← 正确拉伸
       └── main（需要 h-full，否则高度不继承）
            └── div w-full h-full
                 └── ChinaMap containerRef
                      └── 0px 高度！
```

**修复**：确保 `<main>` 元素有 `h-full` 类，保证高度链路完整。

---

### 坑 4：直辖市点击进入区级视图

**现象**：点击北京、上海等直辖市后，进入了区级地图（东城区、浦东新区等），而不是直接标记整个城市。

**根因**：直辖市（北京/天津/上海/重庆）在 DataV 的 `_full` GeoJSON 中，下级单位是**区**（district），而其他省份的下级单位是**地级市**（city）。直辖市本身作为一个整体，在地级市层面没有更细的城市划分。

**修复**：在 `cityData.ts` 中，直辖市使用省级 adcode（而非 `110100` 这样的市级 adcode）；在 `MapContainer` 中检测直辖市，点击时直接弹出等级选择面板，不进入省级视图：

```typescript
const MUNICIPALITIES = new Set(["110000", "120000", "310000", "500000"]);

if (MUNICIPALITIES.has(adcode)) {
  setSelector({ adcode, name, position }); // 直接弹面板
} else {
  setView({ type: "province", adcode, name }); // 进入省级视图
}
```

---

### 坑 5：GeoJSON 数据版本错误

**现象**：全国地图只显示一个整体的中国轮廓，无法点击到各省份。

**根因**：DataV 的 API 提供两个版本：
- `100000.json`：单 feature，只有整个中国的边界轮廓
- `100000_full.json`：35 个 features（34省 + 九段线），每个省份独立 feature

误下载了前者，D3 只能渲染一个整体轮廓，无法按省份分区着色和响应点击。

**修复**：下载脚本（`scripts/fetch-geojson.mjs`）需明确使用 `_full` 版本的 URL。

---

## 数据结构设计

### 分享码压缩

333个城市 × 3 bits/城市（支持 0~7 的等级）= 999 bits → 125 字节 → Base64url 编码 ~168 字符。

3 bits 能表示 0~7，实际只用到 0~5（6个等级），压缩比例：原始 `Record<string, number>` JSON 约 3KB → 168 字符，约 18:1 压缩。

### 导出图片原理

```
1. 并发请求全部 34 个省份的 GeoJSON（Promise.allSettled）
2. 合并所有地级市 feature 为一个 FeatureCollection
3. 用 D3 对合并后的数据做投影，生成完整的全国地级市 SVG
4. SVG → Blob → Image → Canvas（绘制标题/图例/统计）
5. Canvas → PNG 文件下载
```

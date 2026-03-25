# Changelog

## 2026-03-25 - 直辖市独立区级追踪 + 样式升级

### 修复
- **直辖市区级独立颜色**：北京/天津/上海/重庆各区现在独立追踪等级（不再共享一个颜色）
- **cityData 扩展**：从333城市扩展到415个（北京16区 + 天津16区 + 上海16区 + 重庆38区县）
- **返回全国按钮**：移到左侧，符合用户操作习惯；并附上面包屑导航

### 新增
- **SVG favicon**：朱砂印章风格，含「城」字
- **Fraunces 字体**：引入 editorial italic serif，用于英文装饰文字
- **H₂O₂ 署名**：header 右上角，Fraunces italic 风格
- **哲理名言**：右侧面板底部，Fraunces italic + 中文副注

### 样式优化（参考 uzbekistan-travel.html）
- Header 左侧加朱砂竖条（left strip 设计语言）
- 右侧面板改用 eyebrow 小标签 + 两侧规则线代替菱形装饰
- 右侧面板顶部加细朱砂线呼应 header 竖条

## 2026-03-25 - 细节优化

### 新增
- `README.md`：项目介绍、灵感来源、使用方法、技术栈说明
- `docs/TODO.md`：待办事项（台湾省区域、海南省细节、南海十段线等）
- 港澳放大插图（inset map）：全国地图右下角显示港澳放大视图，解决太小难以点击的问题
- 直辖市区级视图：北京/天津/上海/重庆点击后可放大查看各区边界（数据层面整个直辖市共享一个等级）

### 优化
- 省级视图返回按钮重新设计：右侧独立按钮样式，面包屑与返回分离，更醒目
- 所有 tsx 文件补充头部中文注释（功能、输入、输出、依赖、作用、修改时间）

## 2026-03-25 - 修复地图空白（Winding Order 问题）

### 修复
- **根因**：阿里 DataV.GeoAtlas 的 GeoJSON polygon 环绕方向为逆时针（CCW），D3.js 球面几何将其解释为覆盖整个球面的互补区域（geoArea ≈ 4π），导致 `fitSize()` 计算出极小比例尺，所有省份压缩成一个不可见的点
- **表现**：地图区域空白，点击任意位置都弹出澳门（最后渲染的省份，覆盖在其他所有省份上方）
- **修复**：反转 `china.json` 全部 35 个 feature + 34 个省份文件共 469 个 feature 的 polygon ring 坐标顺序
- **文档**：详细分析记录在 `docs/bugfix-geojson-winding-order.md`

## 2026-03-25 - 中华历史风格改造

### 新增
- `docs/design-chinese-historical-style.md`：完整设计稿，含色彩体系、字体规范、组件规范
- 引入 Google Fonts Noto Serif SC（思源宋体）+ Noto Sans SC，呈现典籍刻印质感
- 色彩体系替换为传统中华色：竹黄（底）/ 墨色（线条）/ 朱砂（强调）/ 天水蓝（地图底色）
- 六级等级颜色改为古典色系：天水蓝→青黛→缥→金→朱砂→赭
- 标题栏加朱砂菱形装饰符，使用提示改为文言体例
- 按钮改为方正圆角（3px），主按钮朱砂红
- 地图区域加双线装饰框（仿古地图装裱）
- 面包屑分隔符改为 `›`（书名号风格）

### 修复
- 直辖市（北京/天津/上海/重庆）改用省级 adcode，点击时直接弹等级选择面板（不进入区县视图）
- ChinaMap 在 fitSize 之前先过滤九段线，修复投影计算错误

## 2026-03-25 - 修复地图显示问题

### 修复
- **china.json 数据错误**：原来下载的是不带 `_full` 的单 feature 版本（只有整个中国轮廓），改为 `100000_full.json`（含34个省份 feature）
- **地图太小**：`main` 元素缺少 `h-full`，导致 D3 获取容器高度为 0，SVG 没有正确撑满页面；同时将 SVG 的 `width/height` 改为 `100%` 让其响应容器
- **九段线 404**：`china.json` 中含 `adcode: 100000_JD` 的九段线 feature 被当作省份处理，点击时请求不存在的 GeoJSON；现在过滤掉所有非6位纯数字 adcode 的 feature


## 2026-03-25 - 项目初始化，完成 MVP

### 新增
- **项目脚手架**：Next.js 16 + TypeScript + Tailwind CSS + D3.js，支持 `npm run build` 静态导出，可部署到 Vercel
- **GeoJSON 数据**：从阿里 DataV.GeoAtlas 下载全国省级（`china.json`）及34个省份的地级市边界（`public/geojson/provinces/*.json`），台湾省用省级轮廓代替
- **核心数据层**：
  - `src/lib/constants.ts`：6个等级的颜色和标签定义
  - `src/lib/cityData.ts`：333个地级行政区元数据（adcode、名称、省份归属）
  - `src/types/index.ts`：全项目 TypeScript 类型定义
- **状态管理**：`useCityLevels` hook，城市等级数据存 localStorage，支持 URL hash 分享码读取恢复
- **分享码**：`shareCodec.ts`，3-bit 位压缩 + Base64url 编码，333城市压缩至 ~168 字符
- **地图组件**：
  - `ChinaMap`：全国省级地图（省份颜色=该省最高等级）
  - `ProvinceMap`：省内地级市地图，点击城市弹出等级选择面板
  - `MapContainer`：视图切换协调组件
- **UI 组件**：`LevelSelector`（等级选择面板）、`Legend`（图例）、`StatsPanel`（统计）、`Toolbar`（工具栏）
- **导出图片**：`exportImage.ts`，并发加载全部省份 GeoJSON，渲染完整全国地级市 SVG，输出 2400×1600 PNG（含标题、图例、统计信息）
- **响应式布局**：桌面端右侧统计面板，移动端底部图例条

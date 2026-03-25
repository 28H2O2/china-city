/**
 * GeoJSON 数据下载脚本
 * 功能：从阿里 DataV.GeoAtlas 下载中国省级和地级市 GeoJSON 数据
 * 输入：无
 * 输出：
 *   - public/geojson/china.json（全国省级边界）
 *   - public/geojson/provinces/{adcode}.json（各省地级市边界，共34个）
 * 如何运行：node scripts/fetch-geojson.mjs
 * 最后修改时间：2026-03-24
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const GEOJSON_DIR = join(ROOT, "public", "geojson");
const PROVINCES_DIR = join(GEOJSON_DIR, "provinces");

// DataV.GeoAtlas API base URL
const BASE_URL = "https://geo.datav.aliyun.com/areas_v3/bound";

// 34个省级行政区 adcode
const PROVINCE_ADCODES = [
  "110000", // 北京市
  "120000", // 天津市
  "130000", // 河北省
  "140000", // 山西省
  "150000", // 内蒙古自治区
  "210000", // 辽宁省
  "220000", // 吉林省
  "230000", // 黑龙江省
  "310000", // 上海市
  "320000", // 江苏省
  "330000", // 浙江省
  "340000", // 安徽省
  "350000", // 福建省
  "360000", // 江西省
  "370000", // 山东省
  "410000", // 河南省
  "420000", // 湖北省
  "430000", // 湖南省
  "440000", // 广东省
  "450000", // 广西壮族自治区
  "460000", // 海南省
  "500000", // 重庆市
  "510000", // 四川省
  "520000", // 贵州省
  "530000", // 云南省
  "540000", // 西藏自治区
  "610000", // 陕西省
  "620000", // 甘肃省
  "630000", // 青海省
  "640000", // 宁夏回族自治区
  "650000", // 新疆维吾尔自治区
  "710000", // 台湾省
  "810000", // 香港特别行政区
  "820000", // 澳门特别行政区
];

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function downloadWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchJson(url);
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`  重试 ${i + 1}/${retries - 1}...`);
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

async function main() {
  mkdirSync(PROVINCES_DIR, { recursive: true });

  // 1. 下载全国省级边界（不含子级）
  console.log("下载全国省级边界...");
  const chinaUrl = `${BASE_URL}/100000.json`;
  const chinaGeo = await downloadWithRetry(chinaUrl);
  const chinaPath = join(GEOJSON_DIR, "china.json");
  writeFileSync(chinaPath, JSON.stringify(chinaGeo));
  console.log(`  ✓ china.json (${Math.round(JSON.stringify(chinaGeo).length / 1024)}KB)`);

  // 2. 下载各省地级市边界（_full 后缀包含子级别）
  console.log("\n下载各省地级市边界...");
  let success = 0;
  let failed = 0;

  for (const adcode of PROVINCE_ADCODES) {
    const url = `${BASE_URL}/${adcode}_full.json`;
    const outPath = join(PROVINCES_DIR, `${adcode}.json`);
    try {
      const geo = await downloadWithRetry(url);
      writeFileSync(outPath, JSON.stringify(geo));
      const sizeKB = Math.round(JSON.stringify(geo).length / 1024);
      console.log(`  ✓ ${adcode}.json (${sizeKB}KB)`);
      success++;
    } catch (err) {
      console.error(`  ✗ ${adcode}: ${err.message}`);
      failed++;
    }

    // 避免请求过于频繁
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\n完成！成功: ${success}, 失败: ${failed}`);
}

main().catch(console.error);

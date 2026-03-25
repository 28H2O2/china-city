// URL 分享码编解码
// 功能：将462个城市的等级数据压缩为 ~231 字符的 Base64url 字符串，用于 URL hash 分享
// 编码方式：每个城市等级（0-5）占 3 bit，462 城市 = 1386 bit = 174 字节，再做 Base64url 编码
// 输入：CityLevels 对象（adcode → level 映射）
// 输出：~168 字符 Base64url 字符串，或解码后的 CityLevels 对象
// 最后修改时间：2026-03-24

import type { CityLevels, Level } from "@/types";
import { SORTED_CITY_ADCODES } from "@/lib/cityData";

// Base64url 字符表（URL 安全，无 padding）
const BASE64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

// 将城市等级数据编码为 Base64url 字符串
export function encodeShareCode(cityLevels: CityLevels): string {
  const n = SORTED_CITY_ADCODES.length;
  // 每个 level 3 bit，共 n*3 bit，向上取整为字节数
  const byteLen = Math.ceil((n * 3) / 8);
  const bytes = new Uint8Array(byteLen);

  SORTED_CITY_ADCODES.forEach((adcode, i) => {
    const level = (cityLevels[adcode] ?? 0) & 0x7; // 3 bit
    const bitOffset = i * 3;
    const byteIndex = Math.floor(bitOffset / 8);
    const bitShift = bitOffset % 8;

    bytes[byteIndex] |= level << bitShift;
    // 如果跨字节（bitShift > 5），写入下一个字节的低位
    if (bitShift > 5 && byteIndex + 1 < byteLen) {
      bytes[byteIndex + 1] |= level >> (8 - bitShift);
    }
  });

  // 转为 Base64url（每 6 bit 一个字符）
  let result = "";
  let bitBuf = 0;
  let bitsLeft = 0;
  for (const byte of bytes) {
    bitBuf = (bitBuf << 8) | byte;
    bitsLeft += 8;
    while (bitsLeft >= 6) {
      bitsLeft -= 6;
      result += BASE64_CHARS[(bitBuf >> bitsLeft) & 0x3f];
    }
  }
  if (bitsLeft > 0) {
    result += BASE64_CHARS[(bitBuf << (6 - bitsLeft)) & 0x3f];
  }

  return result;
}

// 将 Base64url 字符串解码为城市等级数据
export function decodeShareCode(code: string): CityLevels | null {
  if (!code || code.length < 10) return null;

  try {
    // Base64url → 字节数组
    const n = SORTED_CITY_ADCODES.length;
    const byteLen = Math.ceil((n * 3) / 8);
    const bytes = new Uint8Array(byteLen);

    let bitBuf = 0;
    let bitsLeft = 0;
    let byteIdx = 0;

    for (const ch of code) {
      const val = BASE64_CHARS.indexOf(ch);
      if (val === -1) return null;
      bitBuf = (bitBuf << 6) | val;
      bitsLeft += 6;
      if (bitsLeft >= 8) {
        bitsLeft -= 8;
        if (byteIdx < byteLen) {
          bytes[byteIdx++] = (bitBuf >> bitsLeft) & 0xff;
        }
      }
    }

    // 字节数组 → 各城市 level
    const result: CityLevels = {};
    SORTED_CITY_ADCODES.forEach((adcode, i) => {
      const bitOffset = i * 3;
      const byteIndex = Math.floor(bitOffset / 8);
      const bitShift = bitOffset % 8;

      let level = (bytes[byteIndex] >> bitShift) & 0x7;
      // 跨字节情况
      if (bitShift > 5 && byteIndex + 1 < byteLen) {
        level |= (bytes[byteIndex + 1] << (8 - bitShift)) & 0x7;
      }

      if (level > 0) {
        result[adcode] = Math.min(level, 5) as Level;
      }
    });

    return result;
  } catch {
    return null;
  }
}

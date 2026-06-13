// Shared number/currency/date formatting helpers.
// Centralizes the formatting that was previously inlined across pages.

/** Format a number as Thai Baht with thousands separators and 2 decimals, e.g. ฿1,234.50 */
export const formatTHB = (value: number): string =>
  `฿${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/** Compact baht for tight spaces (no decimals), e.g. ฿1,234 */
export const formatTHBCompact = (value: number): string =>
  `฿${Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

/** Plain number with thousands separators */
export const formatNumber = (value: number): string =>
  Number(value || 0).toLocaleString("en-US");

/** Current month in "YYYY-MM" format (matches invoice.month_year) */
export const currentMonthYear = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

const THAI_MONTHS_FULL = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

/** Short Thai month label from a 0-based month index */
export const thaiMonthShort = (monthIndex: number): string =>
  THAI_MONTHS_SHORT[monthIndex] ?? "";

/** "มิถุนายน 2569" style label for the current month (Buddhist era year) */
export const currentMonthLabel = (): string => {
  const now = new Date();
  return `${THAI_MONTHS_FULL[now.getMonth()]} ${now.getFullYear() + 543}`;
};

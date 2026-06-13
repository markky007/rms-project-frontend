export function bahtText(num: number): string {
  if (num === 0) return "ศูนย์บาทถ้วน";
  
  let prefix = "";
  if (num < 0) {
    prefix = "ลบ";
    num = Math.abs(num);
  }
  
  // Round to 2 decimals
  const rounded = Math.round(num * 100) / 100;
  const parts = rounded.toFixed(2).split(".");
  const bahtStr = parts[0];
  const satangStr = parts[1];
  
  let bahtTextStr = convertGroup(bahtStr);
  let satangText = "";
  
  if (satangStr && satangStr !== "00") {
    satangText = convertGroup(satangStr) + "สตางค์";
  }
  
  if (bahtTextStr === "" && satangText !== "") {
    return prefix + satangText;
  }
  
  if (satangText === "") {
    return prefix + bahtTextStr + "บาทถ้วน";
  }
  
  return prefix + bahtTextStr + "บาท" + satangText;
}

function convertGroup(numStr: string): string {
  const digits = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const positions = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];
  
  let result = "";
  const len = numStr.length;
  
  for (let i = 0; i < len; i++) {
    const digit = parseInt(numStr[i]);
    const pos = len - i - 1;
    
    if (pos > 5) {
      const milGroup = numStr.substring(0, len - 6);
      const restGroup = numStr.substring(len - 6);
      return convertGroup(milGroup) + "ล้าน" + convertGroup(restGroup);
    }
    
    if (digit !== 0) {
      if (pos === 1 && digit === 1) {
        result += "สิบ";
      } else if (pos === 1 && digit === 2) {
        result += "ยี่สิบ";
      } else if (pos === 0 && digit === 1 && len > 1 && numStr[len - 2] !== "0") {
        result += "เอ็ด";
      } else {
        result += digits[digit] + positions[pos];
      }
    }
  }
  return result;
}

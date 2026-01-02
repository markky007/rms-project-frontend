function formatTarget(target: string): string {
  const cleanTarget = target.replace(/[^0-9]/g, "");
  if (cleanTarget.length >= 13) {
    return cleanTarget; // Tax ID / E-Wallet
  }

  return `0066${cleanTarget.substring(1)}`;
}

function formatTag(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

export function generatePromptPayPayload(
  target: string,
  amount?: number
): string {
  const targetId = formatTarget(target);

  let payload = [
    formatTag("00", "01"), // Payload Format Indicator
    formatTag("01", amount ? "12" : "11"), // Point of Initiation Method
    formatTag(
      "29",
      [
        formatTag("00", "A000000677010111"), // AID
        formatTag("01", targetId),
      ].join("")
    ), // Merchant Account Info
    formatTag("53", "764"), // Currency Code (THB)
    formatTag("58", "TH"), // Country Code
  ];

  if (amount) {
    payload.push(formatTag("54", amount.toFixed(2))); // Transaction Amount
  }

  let data = payload.join("") + "6304"; // Append CRC ID and Length

  // Calculate CRC16 (CCITT-FALSE)
  // We need a simple CRC16 implementation as 'crc' package might not be available or heavy
  // Let's implement a simple poly lookup or just iterate.
  // Actually, for this environment, a lightweight implementation is better than importing a library if we can avoid it.
  // But wait, the environment is 'bun'.

  // Impl CRC16-CCITT (0xFFFF poly 0x1021)
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xff;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xffff;
  }

  const crcHex = crc.toString(16).toUpperCase().padStart(4, "0");
  return data + crcHex;
}

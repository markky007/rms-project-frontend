function oklchToRgb(L, C, h) {
  // Handle case where L, C, h are not numbers or h is undefined
  if (isNaN(L)) L = 0;
  if (isNaN(C)) C = 0;
  if (isNaN(h)) h = 0;

  // 1. OKLCH to OKLab
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);

  // 2. OKLab to Linear sRGB
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855481 * b;

  const l = Math.pow(Math.max(0, l_), 3);
  const m = Math.pow(Math.max(0, m_), 3);
  const s = Math.pow(Math.max(0, s_), 3);

  const rLin = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  // 3. Linear sRGB to Gamma-corrected sRGB
  const toSrgb = (c) => {
    const val = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    return Math.max(0, Math.min(1, val)) * 255;
  };

  return [
    Math.round(toSrgb(rLin)),
    Math.round(toSrgb(gLin)),
    Math.round(toSrgb(bLin))
  ];
}

function parseAndConvert(str) {
  // Match oklch(L C H) or oklch(L C H / A)
  // L, C, H can be percentages (e.g. 42%), decimals (e.g. 0.120), or integers (e.g. 255)
  // A can be decimal or percentage
  const regex = /oklch\(\s*([\d\.]+%?)\s+([\d\.]+%?)\s+([\d\.]+%?)(?:\s*\/\s*([\d\.]+%?))?\s*\)/i;
  const match = str.match(regex);
  if (!match) {
    return `/* FAILED: ${str} */`;
  }

  const parseVal = (val, isLightness = false) => {
    if (!val) return 0;
    if (val.endsWith('%')) {
      const num = parseFloat(val) / 100;
      return num;
    }
    const num = parseFloat(val);
    // Lightness in OKLCH standard can be represented as 0-1 or 0-100%. If it's > 1 and doesn't end in %, it might be raw percentage.
    // CSS spec says L is a number between 0 and 1, or percentage 0% to 100%.
    return num;
  };

  let L = parseVal(match[1]);
  let C = parseVal(match[2]);
  let H = parseVal(match[3]);
  let A = match[4] ? parseVal(match[4]) : 1;

  // If L is > 1 and was not parsed as a percentage (e.g. oklch(42% ...)), check if it was entered as 42 instead of 0.42.
  // In tokens.css, it is oklch(42% 0.120 255), so 42% -> 0.42.
  // Wait, what about oklch(18% 0.015 250)? 18% -> 0.18.
  // Let's print input and parsed values to make sure.

  const [r, g, b] = oklchToRgb(L, C, H);
  
  if (A === 1) {
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    return `rgba(${r}, ${g}, ${b}, ${A})`;
  }
}

const colors = [
  "oklch(42% 0.120 255)",        /* Ledger Cobalt */
  "oklch(34% 0.120 255)",
  "oklch(30% 0.110 255)",
  "oklch(42% 0.120 255 / 0.15)",
  "oklch(60% 0.160 75)",          /* Amber Signal */
  "oklch(52% 0.140 75)",
  "oklch(100% 0.000 0)",               /* Pure White */
  "oklch(96% 0.005 250)",        /* Cool Paper */
  "oklch(100% 0.000 0)",   /* Pure White */
  "oklch(90% 0.008 250)",         /* Cool Slate */
  "oklch(94% 0.005 250)",  /* Cool Slate Subtle */
  "oklch(18% 0.015 250)",            /* Graphite Primary Text */
  "oklch(55% 0.010 250)",          /* Pencil Gray */
  "oklch(50% 0.140 155)",        /* Ledger Green */
  "oklch(50% 0.140 155 / 0.15)",
  "oklch(60% 0.160 75)",          /* Amber */
  "oklch(60% 0.160 75 / 0.15)",
  "oklch(50% 0.200 25)",           /* Alert Red */
  "oklch(50% 0.200 25 / 0.15)",
  "oklch(52% 0.140 255)",           /* Info Blue */
  "oklch(52% 0.140 255 / 0.15)",
  "oklch(18% 0.015 250)",
  "oklch(0 0 0 / 0.06)",
  "oklch(0 0 0 / 0.04)",
  "oklch(0 0 0 / 0.08)",
  "oklch(0 0 0 / 0.12)",
  "oklch(42% 0.120 255 / 0.25)",
  "oklch(0 0 0 / 0.40)"
];

for (const c of colors) {
  console.log(`${c} => ${parseAndConvert(c)}`);
}

export function scaleQuantity(
  quantity: number | null | undefined,
  baseServings: number,
  targetServings: number,
): number | null {
  if (quantity === null || quantity === undefined) {
    return null;
  }
  if (!baseServings || baseServings <= 0) {
    return quantity;
  }
  const ratio = targetServings / baseServings;
  return quantity * ratio;
}

export function formatQuantity(val: number | null | undefined): string {
  if (val === null || val === undefined) {
    return "";
  }

  // Handle whole numbers
  if (Math.abs(val - Math.round(val)) < 0.01) {
    return String(Math.round(val));
  }

  const whole = Math.floor(val);
  const frac = val - whole;

  const commonFractions = [
    { dec: 0.125, str: "1/8" },
    { dec: 0.25, str: "1/4" },
    { dec: 0.333, str: "1/3" },
    { dec: 0.375, str: "3/8" },
    { dec: 0.5, str: "1/2" },
    { dec: 0.625, str: "5/8" },
    { dec: 0.667, str: "2/3" },
    { dec: 0.75, str: "3/4" },
    { dec: 0.875, str: "7/8" },
  ];

  for (const item of commonFractions) {
    if (Math.abs(frac - item.dec) < 0.04) {
      return whole > 0 ? `${whole} ${item.str}` : item.str;
    }
  }

  // Fallback to max 2 decimals without trailing zeros
  const rounded = Number(val.toFixed(2));
  return String(rounded);
}

import { describe, it, expect } from "vitest";
import { translations } from "./translations.js";
import { toPersianDigits } from "./I18nContext.js";

describe("i18n and Persian translations", () => {
  function getAllKeys(obj: Record<string, any>, prefix = ""): string[] {
    let keys: string[] = [];
    for (const k of Object.keys(obj)) {
      const val = obj[k];
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        keys = keys.concat(getAllKeys(val, prefix ? `${prefix}.${k}` : k));
      } else {
        keys.push(prefix ? `${prefix}.${k}` : k);
      }
    }
    return keys;
  }

  it("should have complete translation parity between English and Persian", () => {
    const enKeys = new Set(getAllKeys(translations.en));
    const faKeys = new Set(getAllKeys(translations.fa));

    const missingInFa = [...enKeys].filter((k) => !faKeys.has(k));
    const missingInEn = [...faKeys].filter((k) => !enKeys.has(k));

    expect(missingInFa).toEqual([]);
    expect(missingInEn).toEqual([]);
  });

  it("should convert ASCII digits to Persian digits correctly", () => {
    expect(toPersianDigits(0)).toBe("۰");
    expect(toPersianDigits(1234567890)).toBe("۱۲۳۴۵۶۷۸۹۰");
    expect(toPersianDigits("Page 4 of 12")).toBe("Page ۴ of ۱۲");
  });

  it("should have valid units in both languages including kcal", () => {
    expect(translations.en.units.kcal).toBe("kcal");
    expect(translations.fa.units.kcal).toBe("کیلوکالری");
    expect(translations.fa.units.g).toBe("گرم");
    expect(translations.fa.units.cup).toBe("پیمانه");
  });

  it("should have localized page titles in both languages", () => {
    expect(translations.en.titles.home).toContain("sinacooks");
    expect(translations.fa.titles.home).toContain("سیناکوکس");
    expect(translations.fa.titles.recipes).toContain("دستورهای پخت");
  });
});

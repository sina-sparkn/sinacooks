import { describe, expect, it } from "vitest";
import { formatQuantity, scaleQuantity } from "./scaler.js";

describe("scaler utils", () => {
  describe("scaleQuantity", () => {
    it("returns null if quantity is null or undefined", () => {
      expect(scaleQuantity(null, 4, 8)).toBeNull();
      expect(scaleQuantity(undefined, 4, 8)).toBeNull();
    });

    it("scales proportionally", () => {
      expect(scaleQuantity(2, 4, 8)).toBe(4);
      expect(scaleQuantity(1, 4, 2)).toBe(0.5);
      expect(scaleQuantity(3, 3, 6)).toBe(6);
    });

    it("handles zero or negative base servings safely", () => {
      expect(scaleQuantity(2, 0, 4)).toBe(2);
      expect(scaleQuantity(2, -1, 4)).toBe(2);
    });
  });

  describe("formatQuantity", () => {
    it("formats whole numbers cleanly", () => {
      expect(formatQuantity(1)).toBe("1");
      expect(formatQuantity(4)).toBe("4");
      expect(formatQuantity(0)).toBe("0");
    });

    it("formats common cooking fractions", () => {
      expect(formatQuantity(0.5)).toBe("1/2");
      expect(formatQuantity(0.25)).toBe("1/4");
      expect(formatQuantity(0.75)).toBe("3/4");
      expect(formatQuantity(0.333)).toBe("1/3");
      expect(formatQuantity(0.667)).toBe("2/3");
      expect(formatQuantity(1.5)).toBe("1 1/2");
      expect(formatQuantity(2.25)).toBe("2 1/4");
    });

    it("handles null/undefined gracefully", () => {
      expect(formatQuantity(null)).toBe("");
      expect(formatQuantity(undefined)).toBe("");
    });

    it("rounds odd decimals to max 2 decimals", () => {
      expect(formatQuantity(1.456)).toBe("1.46");
    });
  });
});

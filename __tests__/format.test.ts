import { describe, it, expect } from "vitest";
import { truncateAddress, formatAmount } from "@/lib/format";

describe("truncateAddress", () => {
  it("truncates a long Stellar address", () => {
    const addr = "GAZQKLF5R5Y2Y6HJ2Q7Z3K5N8X1V9T0Y2W4B6M8D0F3G7H1J9L5";
    const result = truncateAddress(addr);
    expect(result).toBe("GAZQ...J9L5");
  });

  it("returns the address as-is if it is too short to truncate", () => {
    const short = "GABC";
    expect(truncateAddress(short)).toBe("GABC");
  });

  it("respects custom lead and tail parameters", () => {
    const addr = "GABCDEF1234567890WXYZ";
    const result = truncateAddress(addr, 6, 6);
    expect(result).toBe("GABCDE...90WXYZ");
  });
});

describe("formatAmount", () => {
  it("formats a numeric string to 7 decimal places", () => {
    expect(formatAmount("100")).toBe("100.0000000");
  });

  it("handles decimal values", () => {
    expect(formatAmount("12.5")).toBe("12.5000000");
  });

  it("returns the original string if not a valid number", () => {
    expect(formatAmount("abc")).toBe("abc");
  });
});

import { describe, it, expect } from "vitest";
import { toDateCT } from "./dates.js";

describe("toDateCT", () => {
  it("formats a date as YYYY-MM-DD", () => {
    expect(toDateCT(new Date("2026-07-04T17:00:00Z"))).toBe("2026-07-04");
  });

  it("uses Chicago's calendar day, not UTC's", () => {
    // 3 AM UTC on Jan 1 is still 9 PM on Dec 31 in Chicago (UTC-6).
    expect(toDateCT(new Date("2026-01-01T03:00:00Z"))).toBe("2025-12-31");
  });

  it("follows daylight saving time", () => {
    // 4:30 AM UTC is 11:30 PM the previous day in summer (UTC-5)...
    expect(toDateCT(new Date("2026-07-05T04:30:00Z"))).toBe("2026-07-04");
    // ...but 5:30 AM UTC is already 12:30 AM the next day.
    expect(toDateCT(new Date("2026-07-05T05:30:00Z"))).toBe("2026-07-05");
  });
});
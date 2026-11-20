import { describe, it, expect } from "vitest";
import { escapeHtml } from "./escapeHtml.js";

describe("escapeHtml", () => {
  it("escapes the five characters that matter in HTML", () => {
    expect(escapeHtml(`<b>"Tom" & 'Jerry'</b>`)).toBe(
      "&lt;b&gt;&quot;Tom&quot; &amp; &#39;Jerry&#39;&lt;/b&gt;"
    );
  });

  it("leaves ordinary text alone", () => {
    expect(escapeHtml("Hello, world!")).toBe("Hello, world!");
  });

  it("turns non-strings into strings", () => {
    expect(escapeHtml(42)).toBe("42");
  });
});
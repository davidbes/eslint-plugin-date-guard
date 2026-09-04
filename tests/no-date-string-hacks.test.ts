import { describe, expect, it } from "vitest";
import { lintRule, lintRuleWithoutTypeInfo } from "./helpers.js";

describe("no-date-string-hacks", () => {
  it("reports ISO string splitting and date-prefix extraction", async () => {
    const messages = await lintRule(
      "no-date-string-hacks",
      `
        const date = new Date();
        const day = date.toISOString().split("T")[0];
        const viaSlice = date.toISOString().slice(0, 10);
        const viaSubstring = date.toJSON().substring(0, 10);
      `,
    );

    expect(messages).toHaveLength(3);
    expect(messages.every((message) => message.messageId === "dateStringHack")).toBe(true);
  });

  it("allows plain ISO serialization and non-Date strings", async () => {
    const messages = await lintRule(
      "no-date-string-hacks",
      `
        const date = new Date();
        const serialized = date.toISOString();
        const copied = date.toISOString().slice(0);
        const prefix = "2026-09-04T00:00:00.000Z".split("T")[0];
        const trimmed = date.toISOString().slice(5, 10);
      `,
    );

    expect(messages).toHaveLength(0);
  });

  it("reports ISO string hacks without type information", async () => {
    const messages = await lintRuleWithoutTypeInfo(
      "no-date-string-hacks",
      `
        const day = date.toISOString().split("T")[0];
        const inlineJson = new Date().toJSON().slice(0, 10);
        const copied = date.toISOString().slice(0);
        const plain = "2026-09-04T00:00:00.000Z".split("T")[0];
        class Money {
          toJSON() { return "123.45"; }
        }
        const money = new Money();
        const amount = money.toJSON().slice(0, 10);
      `,
    );

    expect(messages).toHaveLength(2);
    expect(messages.every((message) => message.messageId === "dateStringHack")).toBe(true);
  });
});

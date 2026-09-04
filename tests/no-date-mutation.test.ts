import { describe, expect, it } from "vitest";
import { lintRule, lintRuleWithoutTypeInfo } from "./helpers.js";

describe("no-date-mutation", () => {
  it("reports mutating Date setter calls", async () => {
    const messages = await lintRule(
      "no-date-mutation",
      `
        const date = new Date();
        date.setDate(1);
        date.setUTCFullYear(2026);
        date["setMonth"](0);
      `,
    );

    expect(messages).toHaveLength(3);
    expect(messages.map((message) => message.messageId)).toEqual([
      "dateMutation",
      "dateMutation",
      "dateMutation",
    ]);
  });

  it("does not report non-Date objects or safe Date usage", async () => {
    const messages = await lintRule(
      "no-date-mutation",
      `
        const date = new Date();
        const copy = new Date(date);
        Date.now();
        function acceptDate(value: Date) {
          return value;
        }
        const fake = { setDate(value: number) { return value; } };
        fake.setDate(1);
      `,
    );

    expect(messages).toHaveLength(0);
  });

  it("reports syntactic new Date mutations without type information", async () => {
    const messages = await lintRuleWithoutTypeInfo(
      "no-date-mutation",
      `
        new Date().setMonth(0);
        (new globalThis.Date())["setUTCDate"](1);
        const value = { setMonth(month) { return month; } };
        value.setMonth(0);
      `,
    );

    expect(messages).toHaveLength(2);
    expect(messages.every((message) => message.messageId === "dateMutation")).toBe(true);
  });
});

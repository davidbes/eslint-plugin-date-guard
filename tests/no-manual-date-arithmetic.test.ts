import { describe, expect, it } from "vitest";
import { lintRule, lintRuleWithoutTypeInfo } from "./helpers.js";

describe("no-manual-date-arithmetic", () => {
  it("reports timestamp and duration arithmetic", async () => {
    const messages = await lintRule(
      "no-manual-date-arithmetic",
      `
        const start = new Date();
        const end = new Date();
        const day = 86_400_000;
        const tomorrow = new Date(start.getTime() + day);
        const elapsed = Date.now() - start.getTime();
        const direct = end - start;
        const utcMonth = start.getUTCMonth() + 1;
        const coerced = +start + day;
        const numbered = Number(end) - Number(start);
        let counter = start.getTime();
        counter += end.getTime();
      `,
    );

    expect(messages).toHaveLength(7);
    expect(messages.every((message) => message.messageId === "manualDateArithmetic")).toBe(true);
  });

  it("allows standalone Date values and ordinary numeric arithmetic", async () => {
    const messages = await lintRule(
      "no-manual-date-arithmetic",
      `
        const date = new Date();
        const copy = new Date(date);
        const timestamp = date.getTime();
        const now = Date.now();
        const copyTimestamp = Number(date);
        const total = 1 + 2;
        const label = date + "";
      `,
    );

    expect(messages).toHaveLength(0);
  });

  it("reports syntactic timestamp arithmetic without type information", async () => {
    const messages = await lintRuleWithoutTypeInfo(
      "no-manual-date-arithmetic",
      `
        const offset = 86_400_000;
        const elapsed = Date.now() - startedAt;
        const parsed = Date.parse(value) + offset;
        const direct = new Date() - new Date();
        const future = new Date().getTime() + offset;
        const month = new Date().getUTCMonth() + 1;
        const coerced = Number(new Date()) + offset;
        const label = date.getTime() + "";
        class ShiftSchedule {
          getHours() { return 8; }
        }
        const shift = new ShiftSchedule();
        const hours = shift.getHours() + 1;
        const custom = value.valueOf() + 1;
      `,
    );

    expect(messages).toHaveLength(6);
    expect(messages.every((message) => message.messageId === "manualDateArithmetic")).toBe(true);
  });
});

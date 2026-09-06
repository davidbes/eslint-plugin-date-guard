import { describe, expect, it } from "vitest";
import { lintRule, lintRuleWithoutTypeInfo } from "./helpers.js";

describe("no-native-date-comparison", () => {
  it("reports relational comparisons on Date values and Date-derived numbers", async () => {
    const messages = await lintRule(
      "no-native-date-comparison",
      `
        type Chain = { expires_at?: string | null };
        declare const chain: Chain | null;

        const now = new Date();
        const expired = chain?.expires_at && new Date(chain.expires_at) <= now;
        const overdue = now > new Date("2026-01-01");
        const byTimestamp = now.getTime() >= Date.now();
        const coerced = Number(now) < +new Date();
      `,
    );

    expect(messages).toHaveLength(4);
    expect(messages.every((message) => message.messageId === "nativeDateComparison")).toBe(true);
  });

  it("allows ordinary comparisons, Date identity checks, and standalone timestamp capture", async () => {
    const messages = await lintRule(
      "no-native-date-comparison",
      `
        const start = new Date();
        const end = new Date();
        const sameObject = start === end;
        const differentObject = start !== end;
        const timestamp = start.getTime();
        const orderedNumbers = 1 < 2;
        const orderedStrings = "2026-01-01" <= "2026-01-02";
        const dateInstance = start instanceof Date;
      `,
    );

    expect(messages).toHaveLength(0);
  });

  it("reports low-risk syntactic comparisons without type information", async () => {
    const messages = await lintRuleWithoutTypeInfo(
      "no-native-date-comparison",
      `
        const expired = new Date(input) <= now;
        const direct = new Date() > new Date();
        const timestamp = Date.now() >= deadline;
        const parsed = Date.parse(input) < deadline;
        const getter = new Date().getTime() <= deadline;
        const coerced = Number(new Date()) > deadline;
        const shift = schedule.getHours() <= 8;
        const custom = value.valueOf() <= 1;
      `,
    );

    expect(messages).toHaveLength(6);
    expect(messages.every((message) => message.messageId === "nativeDateComparison")).toBe(true);
  });
});

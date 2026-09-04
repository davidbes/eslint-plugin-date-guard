import { describe, expect, it } from "vitest";
import { lintRule, lintRuleWithoutTypeInfo } from "./helpers.js";

describe("no-date-type-assertion", () => {
  it("reports assertions to Date", async () => {
    const messages = await lintRule(
      "no-date-type-assertion",
      `
        type MaybeDate = Date | null;
        const value: unknown = "2026-09-04";
        const cast = value as Date;
        const doubleCast = value as unknown as Date;
        const angleCast = <Date>value;
        const unionCast = value as MaybeDate;
      `,
    );

    expect(messages).toHaveLength(4);
    expect(messages.every((message) => message.messageId === "dateTypeAssertion")).toBe(true);
  });

  it("allows Date declarations and non-Date assertions", async () => {
    const messages = await lintRule(
      "no-date-type-assertion",
      `
        const date: Date = new Date();
        function acceptsDate(value: Date): Date {
          return value;
        }
        type MaybeDate = Date | null;
        interface Row {
          createdAt: Date;
        }
        const value: unknown = "2026-09-04";
        const safe = value as string;
      `,
    );

    expect(messages).toHaveLength(0);
  });

  it("reports syntactic Date assertions without type information", async () => {
    const messages = await lintRuleWithoutTypeInfo(
      "no-date-type-assertion",
      `
        type MaybeDate = Date | null;
        const value: unknown = "2026-09-04";
        const cast = value as Date;
        const unionCast = value as Date | null;
        const globalCast = value as globalThis.Date;
        const angleCast = <Date>value;
        const aliasCast = value as MaybeDate;
      `,
    );

    expect(messages).toHaveLength(4);
    expect(messages.every((message) => message.messageId === "dateTypeAssertion")).toBe(true);
  });
});

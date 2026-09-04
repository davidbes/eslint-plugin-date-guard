import { describe, expect, it } from "vitest";
import { lintRule, lintRuleWithoutTypeInfo } from "./helpers.js";

describe("no-native-date-formatting", () => {
  it("reports native Date formatting methods", async () => {
    const messages = await lintRule(
      "no-native-date-formatting",
      `
        const date = new Date();
        date.toLocaleDateString("en-US");
        date.toDateString();
        date["toUTCString"]();
        date.toString();
      `,
    );

    expect(messages).toHaveLength(4);
    expect(messages.every((message) => message.messageId === "nativeFormatting")).toBe(true);
  });

  it("allows ISO serialization and non-Date lookalikes", async () => {
    const messages = await lintRule(
      "no-native-date-formatting",
      `
        const date = new Date();
        date.toISOString();
        date.toJSON();
        const formatter = { toLocaleDateString() { return "ok"; } };
        formatter.toLocaleDateString();
      `,
    );

    expect(messages).toHaveLength(0);
  });

  it("reports syntactic new Date formatting without type information", async () => {
    const messages = await lintRuleWithoutTypeInfo(
      "no-native-date-formatting",
      `
        new Date().toLocaleDateString("en-US");
        globalThis.Date().toString();
        const value = { toLocaleDateString() { return "ok"; } };
        value.toLocaleDateString();
      `,
    );

    expect(messages).toHaveLength(1);
    expect(messages[0]?.messageId).toBe("nativeFormatting");
  });
});

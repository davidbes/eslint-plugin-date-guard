import { describe, expect, it } from "vitest";
import plugin from "../src/index.js";

describe("recommended config", () => {
  it("enables all v0.1 rules as errors for flat config", () => {
    expect(plugin.configs.recommended).toMatchObject({
      name: "date-guard/recommended",
      plugins: {
        "date-guard": plugin,
      },
      rules: {
        "date-guard/no-date-mutation": "error",
        "date-guard/no-date-string-hacks": "error",
        "date-guard/no-date-type-assertion": "error",
        "date-guard/no-manual-date-arithmetic": "error",
        "date-guard/no-native-date-formatting": "error",
      },
    });
  });
});

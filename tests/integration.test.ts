import { describe, expect, it } from "vitest";
import { ESLint } from "eslint";
import tsParser from "@typescript-eslint/parser";
import plugin from "../src/index.js";

const rootDir = new URL("..", import.meta.url).pathname;

describe("plugin integration", () => {
  it("runs the recommended flat config in ESLint", async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [
        {
          files: ["**/*.ts"],
          languageOptions: {
            parser: tsParser,
            parserOptions: {
              projectService: {
                allowDefaultProject: ["tests/fixtures/*.ts"],
              },
              tsconfigRootDir: rootDir,
            },
          },
        },
        plugin.configs.recommended,
      ],
    });

    const [result] = await eslint.lintText(
      `
        const date = new Date();
        date.setMonth(0);
        date.toISOString().split("T")[0];
      `,
      {
        filePath: new URL("fixtures/recommended.ts", import.meta.url).pathname,
      },
    );

    expect(result.messages.map((message) => message.ruleId)).toEqual([
      "date-guard/no-date-mutation",
      "date-guard/no-date-string-hacks",
    ]);
  });
});

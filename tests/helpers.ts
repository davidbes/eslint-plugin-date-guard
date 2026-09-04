import { ESLint } from "eslint";
import type { ESLint as ESLintTypes } from "eslint";
import tsParser from "@typescript-eslint/parser";
import plugin from "../src/index.js";

const rootDir = new URL("..", import.meta.url).pathname;

export async function lintRule(ruleName: string, code: string) {
  return lintRuleWithConfig(ruleName, code, {
    projectService: {
      allowDefaultProject: ["tests/fixtures/*.ts"],
    },
    tsconfigRootDir: rootDir,
  });
}

export async function lintRuleWithoutTypeInfo(ruleName: string, code: string) {
  return lintRuleWithConfig(ruleName, code, {
    tsconfigRootDir: rootDir,
  });
}

async function lintRuleWithConfig(
  ruleName: string,
  code: string,
  parserOptions: Record<string, unknown>,
) {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: [
      {
        files: ["**/*.ts"],
        languageOptions: {
          parser: tsParser,
          parserOptions,
        },
        plugins: {
          "date-guard": plugin as unknown as ESLintTypes.Plugin,
        },
        rules: {
          [`date-guard/${ruleName}`]: "error",
        },
      },
    ],
  });

  const [result] = await eslint.lintText(code, {
    filePath: new URL(`fixtures/${ruleName}.ts`, import.meta.url).pathname,
  });

  return result.messages;
}

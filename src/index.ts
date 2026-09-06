import type { Linter } from "eslint";
import { rules } from "./rules/index.js";

type DateGuardPlugin = {
  meta: {
    name: string;
    version: string;
  };
  rules: typeof rules;
  configs: {
    recommended: Linter.Config;
  };
};

const plugin: DateGuardPlugin = {
  meta: {
    name: "eslint-plugin-date-guard",
    version: "0.2.0",
  },
  rules,
  configs: {
    recommended: {},
  },
};

plugin.configs.recommended = {
  name: "date-guard/recommended",
  plugins: {
    "date-guard": plugin as never,
  },
  rules: {
    "date-guard/no-date-mutation": "error",
    "date-guard/no-date-string-hacks": "error",
    "date-guard/no-date-type-assertion": "error",
    "date-guard/no-manual-date-arithmetic": "error",
    "date-guard/no-native-date-comparison": "error",
    "date-guard/no-native-date-formatting": "error",
  },
};

export { rules };
export default plugin;

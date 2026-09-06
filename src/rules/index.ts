import noDateMutation from "./no-date-mutation.js";
import noDateStringHacks from "./no-date-string-hacks.js";
import noDateTypeAssertion from "./no-date-type-assertion.js";
import noManualDateArithmetic from "./no-manual-date-arithmetic.js";
import noNativeDateComparison from "./no-native-date-comparison.js";
import noNativeDateFormatting from "./no-native-date-formatting.js";

export const rules = {
  "no-date-mutation": noDateMutation,
  "no-date-string-hacks": noDateStringHacks,
  "no-date-type-assertion": noDateTypeAssertion,
  "no-manual-date-arithmetic": noManualDateArithmetic,
  "no-native-date-comparison": noNativeDateComparison,
  "no-native-date-formatting": noNativeDateFormatting,
};

export type RuleName = keyof typeof rules;

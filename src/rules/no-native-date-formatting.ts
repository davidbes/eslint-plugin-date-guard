import type { TSESLint } from "@typescript-eslint/utils";
import {
  DATE_FORMATTING_METHODS,
  getDateInstanceMethodCall,
  getNewDateInstanceMethodCall,
} from "../utils/date-expressions.js";
import { getTypeServices } from "../utils/types.js";

type MessageIds = "nativeFormatting";

const rule: TSESLint.RuleModule<MessageIds, []> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow native Date string formatting methods that vary by runtime or locale.",
    },
    messages: {
      nativeFormatting:
        "Do not format dates with Date#{{method}}. Use an approved date formatting utility with an explicit format and locale.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const typeServices = getTypeServices(context);

    return {
      CallExpression(node) {
        const dateCall = typeServices
          ? getDateInstanceMethodCall(typeServices, node)
          : getNewDateInstanceMethodCall(node);

        if (!dateCall || !DATE_FORMATTING_METHODS.has(dateCall.method)) {
          return;
        }

        context.report({
          node: dateCall.member.property,
          messageId: "nativeFormatting",
          data: {
            method: dateCall.method,
          },
        });
      },
    };
  },
};

export default rule;

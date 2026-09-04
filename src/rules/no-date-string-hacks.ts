import type { TSESLint } from "@typescript-eslint/utils";
import {
  getStaticPropertyName,
  isStringLiteral,
  isZeroToTenExtraction,
  unwrapChainExpression,
} from "../utils/ast.js";
import { isIsoStringProducer } from "../utils/date-expressions.js";
import { getTypeServices } from "../utils/types.js";

type MessageIds = "dateStringHack";

const ISO_EXTRACTION_METHODS = new Set(["slice", "substr", "substring"]);

const rule: TSESLint.RuleModule<MessageIds, []> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow extracting formatted date strings from Date ISO strings.",
    },
    messages: {
      dateStringHack:
        "Do not derive display or calendar dates by slicing Date ISO strings. Use an approved date formatting utility with explicit timezone semantics.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const typeServices = getTypeServices(context);

    return {
      CallExpression(node) {
        const callee = unwrapChainExpression(node.callee);

        if (callee.type !== "MemberExpression") {
          return;
        }

        const method = getStaticPropertyName(callee);

        if (!method) {
          return;
        }

        if (
          method === "split" &&
          isIsoStringProducer(typeServices, callee.object) &&
          isStringLiteral(node.arguments[0], "T")
        ) {
          context.report({
            node: callee.property,
            messageId: "dateStringHack",
          });
          return;
        }

        if (
          ISO_EXTRACTION_METHODS.has(method) &&
          isIsoStringProducer(typeServices, callee.object) &&
          isZeroToTenExtraction(node.arguments)
        ) {
          context.report({
            node: callee.property,
            messageId: "dateStringHack",
          });
        }
      },
    };
  },
};

export default rule;

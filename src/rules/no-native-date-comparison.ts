import type { TSESLint } from "@typescript-eslint/utils";
import type { TSESTree } from "@typescript-eslint/utils";
import { isDateDerivedNumberExpression, isDateValued } from "../utils/date-expressions.js";
import { getTypeServices } from "../utils/types.js";

type MessageIds = "nativeDateComparison";

const DATE_COMPARISON_OPERATORS = new Set(["<", "<=", ">", ">="]);

const rule: TSESLint.RuleModule<MessageIds, []> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow native relational comparisons on Date values.",
    },
    messages: {
      nativeDateComparison:
        "Avoid native Date comparison or timestamp comparison here. Use an approved date utility so ordering semantics stay explicit.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const typeServices = getTypeServices(context);

    function isDateComparisonOperand(node: TSESTree.Node): boolean {
      return isDateValued(typeServices, node) || isDateDerivedNumberExpression(typeServices, node);
    }

    return {
      BinaryExpression(node) {
        if (
          !DATE_COMPARISON_OPERATORS.has(node.operator) ||
          (!isDateComparisonOperand(node.left) && !isDateComparisonOperand(node.right))
        ) {
          return;
        }

        context.report({
          node,
          messageId: "nativeDateComparison",
        });
      },
    };
  },
};

export default rule;

import type { TSESLint } from "@typescript-eslint/utils";
import type { TSESTree } from "@typescript-eslint/utils";
import { isDateDerivedNumberExpression, isDateValued } from "../utils/date-expressions.js";
import { getTypeServices, isNumberLikeExpression } from "../utils/types.js";

type MessageIds = "manualDateArithmetic";

const ARITHMETIC_BINARY_OPERATORS = new Set(["-", "*", "/", "%", "**"]);
const ARITHMETIC_ASSIGNMENT_OPERATORS = new Set(["+=", "-=", "*=", "/=", "%=", "**="]);

const rule: TSESLint.RuleModule<MessageIds, []> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow manual arithmetic on Date values and Date-derived numbers.",
    },
    messages: {
      manualDateArithmetic:
        "Avoid manual date arithmetic or timestamp coercion here. Use an approved date utility so calendar and timezone semantics stay explicit.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const typeServices = getTypeServices(context);

    function isDateArithmeticOperand(node: TSESTree.Node): boolean {
      return isDateValued(typeServices, node) || isDateDerivedNumberExpression(typeServices, node);
    }

    function isNumberOperand(node: TSESTree.Node): boolean {
      if (node.type === "Literal" && typeof node.value === "number") {
        return true;
      }

      return !!typeServices && isNumberLikeExpression(typeServices, node);
    }

    function isStringishExpression(node: TSESTree.Node): boolean {
      return (
        (node.type === "Literal" && typeof node.value === "string") ||
        node.type === "TemplateLiteral"
      );
    }

    function shouldReportPlus(left: TSESTree.Node, right: TSESTree.Node): boolean {
      const leftDateLike = isDateArithmeticOperand(left);
      const rightDateLike = isDateArithmeticOperand(right);

      if (leftDateLike && rightDateLike) {
        return true;
      }

      if (!typeServices) {
        return (
          (leftDateLike && !isStringishExpression(right)) ||
          (rightDateLike && !isStringishExpression(left))
        );
      }

      return (leftDateLike && isNumberOperand(right)) || (rightDateLike && isNumberOperand(left));
    }

    return {
      BinaryExpression(node) {
        if (node.operator === "+") {
          if (!shouldReportPlus(node.left, node.right)) {
            return;
          }
        } else if (
          !ARITHMETIC_BINARY_OPERATORS.has(node.operator) ||
          (!isDateArithmeticOperand(node.left) && !isDateArithmeticOperand(node.right))
        ) {
          return;
        }

        context.report({
          node,
          messageId: "manualDateArithmetic",
        });
      },
      AssignmentExpression(node) {
        if (
          !ARITHMETIC_ASSIGNMENT_OPERATORS.has(node.operator) ||
          (!isDateArithmeticOperand(node.left) && !isDateArithmeticOperand(node.right))
        ) {
          return;
        }

        context.report({
          node,
          messageId: "manualDateArithmetic",
        });
      },
      UpdateExpression(node) {
        if (!isDateArithmeticOperand(node.argument)) {
          return;
        }

        context.report({
          node,
          messageId: "manualDateArithmetic",
        });
      },
    };
  },
};

export default rule;

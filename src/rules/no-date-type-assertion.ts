import type { TSESLint } from "@typescript-eslint/utils";
import type { TSESTree } from "@typescript-eslint/utils";
import { getTypeServices, isDateTypeNode, isSyntacticDateTypeNode } from "../utils/types.js";

type MessageIds = "dateTypeAssertion";

const rule: TSESLint.RuleModule<MessageIds, []> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow asserting unknown values to Date instead of validating or converting them.",
    },
    messages: {
      dateTypeAssertion:
        "Do not assert a value is a Date. Validate or convert it explicitly before passing it as a Date.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const typeServices = getTypeServices(context);

    function reportIfDateAssertion(node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion): void {
      if (
        !isSyntacticDateTypeNode(node.typeAnnotation) &&
        !(typeServices && isDateTypeNode(typeServices, node.typeAnnotation))
      ) {
        return;
      }

      context.report({
        node: node.typeAnnotation,
        messageId: "dateTypeAssertion",
      });
    }

    return {
      TSAsExpression: reportIfDateAssertion,
      TSTypeAssertion: reportIfDateAssertion,
    };
  },
};

export default rule;

import type { TSESLint } from "@typescript-eslint/utils";
import {
  DATE_MUTATION_METHODS,
  getDateInstanceMethodCall,
  getNewDateInstanceMethodCall,
} from "../utils/date-expressions.js";
import { getTypeServices } from "../utils/types.js";

type MessageIds = "dateMutation";

const rule: TSESLint.RuleModule<MessageIds, []> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow mutating Date instances with Date#set* methods.",
    },
    messages: {
      dateMutation:
        "Do not mutate Date values with Date#{{method}}. Create a new date value with an approved immutable date utility.",
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

        if (!dateCall || !DATE_MUTATION_METHODS.has(dateCall.method)) {
          return;
        }

        context.report({
          node: dateCall.member.property,
          messageId: "dateMutation",
          data: {
            method: dateCall.method,
          },
        });
      },
    };
  },
};

export default rule;

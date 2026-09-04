import type { TSESTree } from "@typescript-eslint/utils";

export function unwrapChainExpression<T extends TSESTree.Node>(
  node: TSESTree.Node | T,
): TSESTree.Node | T {
  return node.type === "ChainExpression" ? node.expression : node;
}

export function getStaticPropertyName(member: TSESTree.MemberExpression): string | null {
  const property = unwrapChainExpression(member.property);

  if (!member.computed && property.type === "Identifier") {
    return property.name;
  }

  if (member.computed && property.type === "Literal" && typeof property.value === "string") {
    return property.value;
  }

  return null;
}

export function isStringLiteral(node: TSESTree.Node | undefined, expected?: string): boolean {
  if (!node || node.type !== "Literal" || typeof node.value !== "string") {
    return false;
  }

  return expected === undefined || node.value === expected;
}

export function isNumericLiteral(node: TSESTree.Node | undefined, expected?: number): boolean {
  if (!node || node.type !== "Literal" || typeof node.value !== "number") {
    return false;
  }

  return expected === undefined || node.value === expected;
}

export function isZeroToTenExtraction(args: TSESTree.CallExpressionArgument[]): boolean {
  const [start, end] = args;

  return isNumericLiteral(start, 0) && isNumericLiteral(end, 10);
}

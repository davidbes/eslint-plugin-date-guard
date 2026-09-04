import type { TSESTree } from "@typescript-eslint/utils";
import { getStaticPropertyName, unwrapChainExpression } from "./ast.js";
import {
  isDateConstructorExpression,
  isDateValuedExpression,
  isNumberConstructorExpression,
} from "./types.js";
import type { getTypeServices } from "./types.js";

type TypeServices = NonNullable<ReturnType<typeof getTypeServices>>;
type MaybeTypeServices = TypeServices | null;

export const DATE_MUTATION_METHODS = new Set([
  "setDate",
  "setFullYear",
  "setHours",
  "setMilliseconds",
  "setMinutes",
  "setMonth",
  "setSeconds",
  "setTime",
  "setUTCDate",
  "setUTCFullYear",
  "setUTCHours",
  "setUTCMilliseconds",
  "setUTCMinutes",
  "setUTCMonth",
  "setUTCSeconds",
  "setYear",
]);

export const DATE_FORMATTING_METHODS = new Set([
  "toDateString",
  "toGMTString",
  "toLocaleDateString",
  "toLocaleString",
  "toLocaleTimeString",
  "toString",
  "toTimeString",
  "toUTCString",
]);

export const DATE_DERIVED_NUMBER_METHODS = new Set([
  "getDate",
  "getDay",
  "getFullYear",
  "getHours",
  "getMilliseconds",
  "getMinutes",
  "getMonth",
  "getSeconds",
  "getTime",
  "getTimezoneOffset",
  "getUTCDate",
  "getUTCDay",
  "getUTCFullYear",
  "getUTCHours",
  "getUTCMilliseconds",
  "getUTCMinutes",
  "getUTCMonth",
  "getUTCSeconds",
  "getYear",
  "valueOf",
]);

export function getCallMemberExpression(
  node: TSESTree.CallExpression,
): { member: TSESTree.MemberExpression; method: string } | null {
  const callee = unwrapChainExpression(node.callee);

  if (callee.type !== "MemberExpression") {
    return null;
  }

  const method = getStaticPropertyName(callee);

  if (!method) {
    return null;
  }

  return { member: callee, method };
}

export function getDateInstanceMethodCall(
  services: TypeServices,
  node: TSESTree.CallExpression,
): { member: TSESTree.MemberExpression; method: string } | null {
  const call = getCallMemberExpression(node);

  if (!call || !isDateValuedExpression(services, call.member.object)) {
    return null;
  }

  return call;
}

export function getNewDateInstanceMethodCall(
  node: TSESTree.CallExpression,
): { member: TSESTree.MemberExpression; method: string } | null {
  const call = getCallMemberExpression(node);

  if (!call || !isSyntacticNewDateExpression(call.member.object)) {
    return null;
  }

  return call;
}

export function isSyntacticNewDateExpression(node: TSESTree.Node): boolean {
  const expression = unwrapChainExpression(node);

  return (
    expression.type === "NewExpression" && isSyntacticDateConstructorReference(expression.callee)
  );
}

export function isSyntacticDateConstructorReference(node: TSESTree.Node): boolean {
  return isSyntacticGlobalReference(node, "Date");
}

export function isSyntacticNumberConstructorReference(node: TSESTree.Node): boolean {
  return isSyntacticGlobalReference(node, "Number");
}

export function isDateNowCall(services: MaybeTypeServices, node: TSESTree.Node): boolean {
  return isDateStaticCall(services, node, "now");
}

export function isDateParseCall(services: MaybeTypeServices, node: TSESTree.Node): boolean {
  return isDateStaticCall(services, node, "parse");
}

export function isDateNumericCoercionExpression(
  services: MaybeTypeServices,
  node: TSESTree.Node,
): boolean {
  const expression = unwrapChainExpression(node);

  if (
    expression.type === "UnaryExpression" &&
    (expression.operator === "+" || expression.operator === "-")
  ) {
    return isDateValued(services, expression.argument);
  }

  if (expression.type !== "CallExpression") {
    return false;
  }

  const callee = unwrapChainExpression(expression.callee);

  return (
    isNumberConstructorReference(services, callee) &&
    expression.arguments.length > 0 &&
    isDateValued(services, expression.arguments[0])
  );
}

export function isDateDerivedNumberExpression(
  services: MaybeTypeServices,
  node: TSESTree.Node,
): boolean {
  const expression = unwrapChainExpression(node);

  if (
    isDateNowCall(services, expression) ||
    isDateParseCall(services, expression) ||
    isDateNumericCoercionExpression(services, expression)
  ) {
    return true;
  }

  if (expression.type !== "CallExpression") {
    return false;
  }

  const dateCall = services
    ? getDateInstanceMethodCall(services, expression)
    : getSyntacticDateDerivedNumberMethodCall(expression);

  return !!dateCall && DATE_DERIVED_NUMBER_METHODS.has(dateCall.method);
}

export function isIsoStringProducer(services: MaybeTypeServices, node: TSESTree.Node): boolean {
  const expression = unwrapChainExpression(node);

  if (expression.type !== "CallExpression") {
    return false;
  }

  if (services) {
    const dateCall = getDateInstanceMethodCall(services, expression);

    return !!dateCall && (dateCall.method === "toISOString" || dateCall.method === "toJSON");
  }

  const dateCall = getCallMemberExpression(expression);

  return (
    !!dateCall &&
    (dateCall.method === "toISOString" ||
      (dateCall.method === "toJSON" && isSyntacticNewDateExpression(dateCall.member.object)))
  );
}

export function isDateValued(services: MaybeTypeServices, node: TSESTree.Node): boolean {
  return services ? isDateValuedExpression(services, node) : isSyntacticNewDateExpression(node);
}

function getSyntacticDateDerivedNumberMethodCall(
  node: TSESTree.CallExpression,
): { member: TSESTree.MemberExpression; method: string } | null {
  const call = getCallMemberExpression(node);

  if (!call) {
    return null;
  }

  if (
    DATE_DERIVED_NUMBER_METHODS.has(call.method) &&
    isSyntacticNewDateExpression(call.member.object)
  ) {
    return call;
  }

  return null;
}

function isDateStaticCall(
  services: MaybeTypeServices,
  node: TSESTree.Node,
  methodName: string,
): boolean {
  const expression = unwrapChainExpression(node);

  if (expression.type !== "CallExpression") {
    return false;
  }

  const callee = unwrapChainExpression(expression.callee);

  if (callee.type !== "MemberExpression") {
    return false;
  }

  return (
    getStaticPropertyName(callee) === methodName &&
    isDateConstructorReference(services, callee.object)
  );
}

function isDateConstructorReference(services: MaybeTypeServices, node: TSESTree.Node): boolean {
  return services
    ? isDateConstructorExpression(services, node)
    : isSyntacticDateConstructorReference(node);
}

function isNumberConstructorReference(services: MaybeTypeServices, node: TSESTree.Node): boolean {
  return services
    ? isNumberConstructorExpression(services, node)
    : isSyntacticNumberConstructorReference(node);
}

function isSyntacticGlobalReference(node: TSESTree.Node, name: string): boolean {
  const expression = unwrapChainExpression(node);

  if (expression.type === "Identifier") {
    return expression.name === name;
  }

  if (expression.type !== "MemberExpression") {
    return false;
  }

  const object = unwrapChainExpression(expression.object);

  return (
    object.type === "Identifier" &&
    object.name === "globalThis" &&
    getStaticPropertyName(expression) === name
  );
}

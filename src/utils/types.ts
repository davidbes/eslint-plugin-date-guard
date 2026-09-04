import type { TSESTree } from "@typescript-eslint/utils";
import type * as ts from "typescript";

type ParserServices = {
  esTreeNodeToTSNodeMap?: Map<TSESTree.Node, ts.Node>;
  program?: ts.Program;
};

type TypeServices = {
  checker: ts.TypeChecker;
  esTreeNodeToTSNodeMap: Map<TSESTree.Node, ts.Node>;
};

type ContextWithParserServices = {
  parserServices?: ParserServices;
  sourceCode?: {
    parserServices?: ParserServices;
  };
};

export function getTypeServices(context: unknown): TypeServices | null {
  const typedContext = context as ContextWithParserServices;
  const services = typedContext.sourceCode?.parserServices ?? typedContext.parserServices;

  if (!services?.program || !services.esTreeNodeToTSNodeMap) {
    return null;
  }

  return {
    checker: services.program.getTypeChecker(),
    esTreeNodeToTSNodeMap: services.esTreeNodeToTSNodeMap,
  };
}

export function getTypeOfNode(services: TypeServices, node: TSESTree.Node): ts.Type | null {
  const tsNode = services.esTreeNodeToTSNodeMap.get(node);

  if (!tsNode) {
    return null;
  }

  return services.checker.getTypeAtLocation(tsNode);
}

export function isDateValuedExpression(services: TypeServices, node: TSESTree.Node): boolean {
  const type = getTypeOfNode(services, node);

  return !!type && hasNamedType(services.checker, type, "Date");
}

export function isDateConstructorExpression(services: TypeServices, node: TSESTree.Node): boolean {
  const type = getTypeOfNode(services, node);

  return !!type && hasNamedType(services.checker, type, "DateConstructor");
}

export function isNumberConstructorExpression(
  services: TypeServices,
  node: TSESTree.Node,
): boolean {
  const type = getTypeOfNode(services, node);

  return !!type && hasNamedType(services.checker, type, "NumberConstructor");
}

export function isNumberLikeExpression(services: TypeServices, node: TSESTree.Node): boolean {
  if (node.type === "Literal" && typeof node.value === "number") {
    return true;
  }

  const type = getTypeOfNode(services, node);

  if (!type) {
    return false;
  }

  return getTypeParts(type).some((part) => {
    const baseType = services.checker.getBaseTypeOfLiteralType(part);
    const text = services.checker.typeToString(part);
    const baseText = services.checker.typeToString(baseType);

    return text === "number" || text === "Number" || baseText === "number";
  });
}

export function isDateTypeNode(services: TypeServices, node: TSESTree.Node): boolean {
  const type = getTypeOfNode(services, node);

  return !!type && hasNamedType(services.checker, type, "Date");
}

export function isSyntacticDateTypeNode(node: TSESTree.Node): boolean {
  switch (node.type) {
    case "TSTypeReference":
      return isDateTypeName(node.typeName);
    case "TSUnionType":
    case "TSIntersectionType":
      return node.types.some((typeNode) => isSyntacticDateTypeNode(typeNode));
    default:
      return false;
  }
}

function isDateTypeName(typeName: TSESTree.EntityName): boolean {
  const typeNameText = entityNameToText(typeName);

  return typeNameText === "Date" || typeNameText === "globalThis.Date";
}

function entityNameToText(typeName: TSESTree.EntityName): string | null {
  if (typeName.type === "Identifier") {
    return typeName.name;
  }

  if (typeName.type === "ThisExpression") {
    return "this";
  }

  const left = entityNameToText(typeName.left);

  return left ? `${left}.${typeName.right.name}` : null;
}

function hasNamedType(checker: ts.TypeChecker, type: ts.Type, expectedName: string): boolean {
  return getTypeParts(type).some((part) => {
    const apparentType = checker.getApparentType(part);

    return (
      getSymbolName(part) === expectedName ||
      getSymbolName(apparentType) === expectedName ||
      checker.typeToString(part) === expectedName ||
      checker.typeToString(apparentType) === expectedName
    );
  });
}

function getTypeParts(type: ts.Type): ts.Type[] {
  if (typeof type.isUnion === "function" && type.isUnion()) {
    return type.types.flatMap((part) => getTypeParts(part));
  }

  if (typeof type.isIntersection === "function" && type.isIntersection()) {
    return type.types.flatMap((part) => getTypeParts(part));
  }

  return [type];
}

function getSymbolName(type: ts.Type): string | null {
  const symbol = type.getSymbol() ?? type.symbol;

  if (!symbol) {
    return null;
  }

  return String(symbol.escapedName ?? symbol.name);
}

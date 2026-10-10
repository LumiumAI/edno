// Copyright 2018-2026 the Deno authors. MIT license.

import { assert, assertEquals, assertStringIncludes } from "./test_util.ts";
import { assertSnapshot } from "@std/testing/snapshot";

// TODO(@marvinhagemeister) Remove once we land "official" types
// edno-lint-ignore no-explicit-any
type LintVisitor = Record<string, (node: any) => void>;

function testPlugin(
  source: string,
  rule: Edno.lint.Rule,
): Edno.lint.Diagnostic[] {
  const plugin = {
    name: "test-plugin",
    rules: {
      testRule: rule,
    },
  };

  return Edno.lint.runPlugin(
    plugin,
    "source.tsx",
    source,
  );
}

interface VisitResult {
  selector: string;
  kind: "enter" | "exit";
  // edno-lint-ignore no-explicit-any
  node: any;
}

function testVisit(
  source: string,
  ...selectors: string[]
): VisitResult[] {
  const result: VisitResult[] = [];

  testPlugin(source, {
    create() {
      const visitor: LintVisitor = {};

      for (const s of selectors) {
        visitor[s] = (node) => {
          result.push({
            kind: s.endsWith(":exit") ? "exit" : "enter",
            selector: s,
            node,
          });
        };
      }

      return visitor;
    },
  });

  return result;
}

async function testSnapshot(
  t: Edno.TestContext,
  source: string,
  ...selectors: string[]
) {
  const log: unknown[] = [];

  testPlugin(source, {
    create() {
      const visitor: LintVisitor = {};

      for (const s of selectors) {
        visitor[s] = (node) => {
          log.push(node[Symbol.for("Edno.lint.toJsValue")]());
        };
      }

      return visitor;
    },
  });

  assertEquals(log.length > 0, true);
  await assertSnapshot(t, log[0]);
}

Edno.test("Plugin - visitor enter/exit", () => {
  const enter = testVisit(
    "foo",
    "Identifier",
  );
  assertEquals(enter[0].node.type, "Identifier");

  const exit = testVisit(
    "foo",
    "Identifier:exit",
  );
  assertEquals(exit[0].node.type, "Identifier");

  const both = testVisit("foo", "Identifier", "Identifier:exit");
  assertEquals(both.map((t) => t.selector), ["Identifier", "Identifier:exit"]);
});

// https://github.com/denoland/deno/issues/28227
Edno.test("Plugin - visitor enter/exit #2", () => {
  const log: string[] = [];

  testPlugin("{}\nfoo;", {
    create() {
      return {
        "*": (node: Edno.lint.Node) => log.push(`-> ${node.type}`),
        "*:exit": (node: Edno.lint.Node) => log.push(`<- ${node.type}`),
      };
    },
  });

  assertEquals(log, [
    "-> Program",
    "-> BlockStatement",
    "<- BlockStatement",
    "-> ExpressionStatement",
    "-> Identifier",
    "<- Identifier",
    "<- ExpressionStatement",
    "<- Program",
  ]);
});

Edno.test("Plugin - visitor descendant", () => {
  let result = testVisit(
    "if (false) foo; if (false) bar()",
    "IfStatement CallExpression",
  );
  assertEquals(result[0].node.type, "CallExpression");
  assertEquals(result[0].node.callee.name, "bar");

  result = testVisit(
    "if (false) foo; foo()",
    "IfStatement IfStatement",
  );
  assertEquals(result, []);

  result = testVisit(
    "if (false) foo; foo()",
    "* CallExpression",
  );
  assertEquals(result[0].node.type, "CallExpression");
});

Edno.test("Plugin - visitor child combinator", () => {
  let result = testVisit(
    "if (false) foo; if (false) { bar; }",
    "IfStatement > ExpressionStatement > Identifier",
  );
  assertEquals(result[0].node.name, "foo");

  result = testVisit(
    "class Foo { foo = 2 }",
    "ClassBody > PropertyDefinition",
  );
  assertEquals(result[0].node.type, "PropertyDefinition");

  result = testVisit(
    "if (false) foo; foo()",
    "IfStatement IfStatement",
  );
  assertEquals(result, []);
});

Edno.test("Plugin - visitor next sibling", () => {
  const result = testVisit(
    "if (false) foo; if (false) bar;",
    "IfStatement + IfStatement Identifier",
  );
  assertEquals(result[0].node.name, "bar");
});

Edno.test("Plugin - visitor subsequent sibling", () => {
  const result = testVisit(
    "if (false) foo; if (false) bar; if (false) baz;",
    "IfStatement ~ IfStatement Identifier",
  );
  assertEquals(result.map((r) => r.node.name), ["bar", "baz"]);
});

Edno.test("Plugin - visitor field", () => {
  let result = testVisit(
    "if (foo()) {}",
    "IfStatement.test.callee",
  );
  assertEquals(result[0].node.type, "Identifier");
  assertEquals(result[0].node.name, "foo");

  result = testVisit(
    "if (foo()) {}",
    "IfStatement .test .callee",
  );
  assertEquals(result[0].node.type, "Identifier");
  assertEquals(result[0].node.name, "foo");

  result = testVisit(
    "if (foo(bar())) {}",
    "IfStatement.test CallExpression.callee",
  );
  assertEquals(result[0].node.type, "Identifier");
  assertEquals(result[0].node.name, "bar");
});

Edno.test("Plugin - visitor attr", () => {
  let result = testVisit(
    "for (const a of b) {}",
    "[await]",
  );
  assertEquals(result[0].node.await, false);

  result = testVisit(
    "for await (const a of b) {}",
    "[await=true]",
  );
  assertEquals(result[0].node.await, true);

  result = testVisit(
    "for await (const a of b) {}",
    "ForOfStatement[await=true]",
  );
  assertEquals(result[0].node.await, true);

  result = testVisit(
    "for (const a of b) {}",
    "ForOfStatement[await != true]",
  );
  assertEquals(result[0].node.await, false);

  result = testVisit(
    "async function *foo() {}",
    "FunctionDeclaration[async=true][generator=true]",
  );
  assertEquals(result[0].node.type, "FunctionDeclaration");

  result = testVisit(
    "foo",
    "[name='foo']",
  );
  assertEquals(result[0].node.name, "foo");
});

Edno.test("Plugin - visitor attr to check type", () => {
  let result = testVisit(
    "foo",
    "Identifier[type]",
  );
  assertEquals(result[0].node.type, "Identifier");

  result = testVisit(
    "foo",
    "Identifier[type='Identifier']",
  );
  assertEquals(result[0].node.type, "Identifier");
});

Edno.test("Plugin - visitor attr non-existing", () => {
  const result = testVisit(
    "foo",
    "[non-existing]",
  );
  assertEquals(result, []);
});

Edno.test("Plugin - visitor attr length special case", () => {
  let result = testVisit(
    "foo(1); foo(1, 2);",
    "CallExpression[arguments.length=2]",
  );
  assertEquals(result[0].node.arguments.length, 2);

  result = testVisit(
    "foo(1); foo(1, 2);",
    "CallExpression[arguments.length>1]",
  );
  assertEquals(result[0].node.arguments.length, 2);

  result = testVisit(
    "foo(1); foo(1, 2);",
    "CallExpression[arguments.length<2]",
  );
  assertEquals(result[0].node.arguments.length, 1);

  result = testVisit(
    "foo(1); foo(1, 2);",
    "CallExpression[arguments.length<=3]",
  );
  assertEquals(result[0].node.arguments.length, 1);
  assertEquals(result[1].node.arguments.length, 2);

  result = testVisit(
    "foo(1); foo(1, 2);",
    "CallExpression[arguments.length>=1]",
  );
  assertEquals(result[0].node.arguments.length, 1);
  assertEquals(result[1].node.arguments.length, 2);
});

Edno.test("Plugin - visitor attr regex", () => {
  let result = testVisit(
    "class Foo { get foo() { return 1 } bar() {} }",
    "MethodDefinition[kind=/(g|s)et/]",
  );
  assertEquals(result[0].node.type, "MethodDefinition");
  assertEquals(result[0].node.kind, "get");

  result = testVisit(
    "class Foo { get foo() { return 1 } bar() {} }",
    "MethodDefinition[kind!=/(g|s)et/]",
  );
  assertEquals(result[0].node.type, "MethodDefinition");
  assertEquals(result[0].node.kind, "method");
});

Edno.test("Plugin - visitor :first-child", () => {
  const result = testVisit(
    "{ foo; bar }",
    "BlockStatement ExpressionStatement:first-child Identifier",
  );
  assertEquals(result[0].node.name, "foo");
});

Edno.test("Plugin - visitor :last-child", () => {
  const result = testVisit(
    "{ foo; bar }",
    "BlockStatement ExpressionStatement:last-child Identifier",
  );
  assertEquals(result[0].node.name, "bar");
});

Edno.test("Plugin - visitor :nth-child", () => {
  let result = testVisit(
    "{ foo; bar; baz; foobar; }",
    "BlockStatement ExpressionStatement:nth-child(2) Identifier",
  );
  assertEquals(result[0].node.name, "bar");

  result = testVisit(
    "{ foo; bar; baz; foobar; }",
    "BlockStatement ExpressionStatement:nth-child(2n) Identifier",
  );
  assertEquals(result[0].node.name, "foo");
  assertEquals(result[1].node.name, "baz");

  result = testVisit(
    "{ foo; bar; baz; foobar; }",
    "BlockStatement ExpressionStatement:nth-child(2n + 1) Identifier",
  );
  assertEquals(result[0].node.name, "bar");
  assertEquals(result[1].node.name, "foobar");

  result = testVisit(
    "{ foo; bar; baz; foobar; }",
    "BlockStatement *:nth-child(2n + 1 of ExpressionStatement) Identifier",
  );
  assertEquals(result[0].node.name, "bar");
  assertEquals(result[1].node.name, "foobar");
});

Edno.test("Plugin - visitor :has()", () => {
  let result = testVisit(
    "{ foo, bar }",
    "BlockStatement:has(Identifier[name='bar'])",
  );
  assertEquals(result[0].node.type, "BlockStatement");

  // Multiple sub queries
  result = testVisit(
    "{ foo, bar }",
    "BlockStatement:has(CallExpression, Identifier[name='bar'])",
  );
  assertEquals(result[0].node.type, "BlockStatement");

  // This should not match
  result = testVisit(
    "{ foo, bar }",
    "BlockStatement:has(CallExpression, Identifier[name='baz'])",
  );
  assertEquals(result, []);

  // Attr match
  result = testVisit(
    "{ foo, bar }",
    "Identifier:has([name='bar'])",
  );
  assertEquals(result[0].node.type, "Identifier");
  assertEquals(result[0].node.name, "bar");
});

Edno.test("Plugin - visitor :is()/:where()/:matches()", () => {
  let result = testVisit(
    "{ foo, bar }",
    "BlockStatement :is(Identifier[name='bar'])",
  );
  assertEquals(result[0].node.type, "Identifier");
  assertEquals(result[0].node.name, "bar");

  result = testVisit(
    "{ foo, bar }",
    "BlockStatement :where(Identifier[name='bar'])",
  );
  assertEquals(result[0].node.type, "Identifier");
  assertEquals(result[0].node.name, "bar");

  result = testVisit(
    "{ foo, bar }",
    "BlockStatement :matches(Identifier[name='bar'])",
  );
  assertEquals(result[0].node.type, "Identifier");
  assertEquals(result[0].node.name, "bar");
});

Edno.test("Plugin - visitor :not", () => {
  let result = testVisit(
    "{ foo, bar }",
    "BlockStatement:not(Identifier[name='baz'])",
  );
  assertEquals(result[0].node.type, "BlockStatement");

  // Multiple sub queries
  result = testVisit(
    "{ foo, bar }",
    "BlockStatement:not(Identifier[name='baz'], CallExpression)",
  );
  assertEquals(result[0].node.type, "BlockStatement");

  // This should not match
  result = testVisit(
    "{ foo, bar }",
    "BlockStatement:not(CallExpression, Identifier)",
  );
  assertEquals(result, []);

  // Attr match
  result = testVisit(
    "{ foo, bar }",
    "Identifier:not([name='foo'])",
  );
  assertEquals(result[0].node.type, "Identifier");
  assertEquals(result[0].node.name, "bar");
});

Edno.test("Plugin - parent", () => {
  let parent: Edno.lint.Node | undefined;

  testPlugin("const foo = 1;", {
    create() {
      return {
        VariableDeclaration(node) {
          parent = node.parent;
        },
      };
    },
  });

  assertEquals(parent?.type, "Program");
});

Edno.test("Plugin - Program", async (t) => {
  await testSnapshot(t, "", "Program");
});

Edno.test("Plugin - FunctionDeclaration", async (t) => {
  await testSnapshot(t, "function foo() {}", "FunctionDeclaration");
  await testSnapshot(t, "function foo(a, ...b) {}", "FunctionDeclaration");
  await testSnapshot(
    t,
    "function foo(a = 1, { a = 2, b, ...c }, [d,...e], ...f) {}",
    "FunctionDeclaration",
  );

  await testSnapshot(t, "async function foo() {}", "FunctionDeclaration");
  await testSnapshot(t, "async function* foo() {}", "FunctionDeclaration");
  await testSnapshot(t, "function* foo() {}", "FunctionDeclaration");

  // TypeScript
  await testSnapshot(
    t,
    "function foo<T>(a?: 2, ...b: any[]): any {}",
    "FunctionDeclaration",
  );
});

Edno.test("Plugin - ImportDeclaration", async (t) => {
  await testSnapshot(t, 'import "foo";', "ImportDeclaration");
  await testSnapshot(t, 'import foo from "foo";', "ImportDeclaration");
  await testSnapshot(t, 'import * as foo from "foo";', "ImportDeclaration");
  await testSnapshot(
    t,
    'import { foo, bar as baz } from "foo";',
    "ImportDeclaration",
  );
  await testSnapshot(
    t,
    'import foo from "foo" with { type: "json" };',
    "ImportDeclaration",
  );
});

Edno.test("Plugin - ExportNamedDeclaration", async (t) => {
  await testSnapshot(t, 'export { foo } from "foo";', "ExportNamedDeclaration");
  await testSnapshot(
    t,
    'export { bar as baz } from "foo";',
    "ExportNamedDeclaration",
  );
  await testSnapshot(
    t,
    'export { foo } from "foo" with { type: "json" };',
    "ExportNamedDeclaration",
  );
});

Edno.test("Plugin - ExportDefaultDeclaration", async (t) => {
  await testSnapshot(
    t,
    "export default function foo() {}",
    "ExportDefaultDeclaration",
  );
  await testSnapshot(
    t,
    "export default function () {}",
    "ExportDefaultDeclaration",
  );
  await testSnapshot(
    t,
    "export default class Foo {}",
    "ExportDefaultDeclaration",
  );
  await testSnapshot(
    t,
    "export default class {}",
    "ExportDefaultDeclaration",
  );
  await testSnapshot(t, "export default bar;", "ExportDefaultDeclaration");
  await testSnapshot(
    t,
    "export default interface Foo {};",
    "ExportDefaultDeclaration",
  );
});

Edno.test("Plugin - ExportAllDeclaration", async (t) => {
  await testSnapshot(t, 'export * from "foo";', "ExportAllDeclaration");
  await testSnapshot(t, 'export * as foo from "foo";', "ExportAllDeclaration");
  await testSnapshot(
    t,
    'export * from "foo" with { type: "json" };',
    "ExportAllDeclaration",
  );
});

Edno.test("Plugin - TSExportAssignment", async (t) => {
  await testSnapshot(t, "export = foo;", "TSExportAssignment");
});

Edno.test("Plugin - TSNamespaceExportDeclaration", async (t) => {
  await testSnapshot(
    t,
    "export as namespace A;",
    "TSNamespaceExportDeclaration",
  );
});

Edno.test("Plugin - TSImportEqualsDeclaration", async (t) => {
  await testSnapshot(t, "import a = b", "TSImportEqualsDeclaration");
  await testSnapshot(
    t,
    'import a = require("foo")',
    "TSImportEqualsDeclaration",
  );
});

Edno.test("Plugin - BlockStatement", async (t) => {
  await testSnapshot(t, "{ foo; }", "BlockStatement");
});

Edno.test("Plugin - BreakStatement", async (t) => {
  await testSnapshot(t, "while (false) break;", "BreakStatement");
  await testSnapshot(t, "foo: while (false) break foo;", "BreakStatement");
});

Edno.test("Plugin - ContinueStatement", async (t) => {
  await testSnapshot(t, "continue;", "ContinueStatement");
  await testSnapshot(t, "continue foo;", "ContinueStatement");
});

Edno.test("Plugin - DebuggerStatement", async (t) => {
  await testSnapshot(t, "debugger;", "DebuggerStatement");
});

Edno.test("Plugin - DoWhileStatement", async (t) => {
  await testSnapshot(t, "do {} while (foo);", "DoWhileStatement");
});

Edno.test("Plugin - ExpressionStatement", async (t) => {
  await testSnapshot(t, "foo;", "ExpressionStatement");
});

Edno.test("Plugin - ForInStatement", async (t) => {
  await testSnapshot(t, "for (a in b) {}", "ForInStatement");
});

Edno.test("Plugin - ForOfStatement", async (t) => {
  await testSnapshot(t, "for (a of b) {}", "ForOfStatement");
  await testSnapshot(t, "for await (a of b) {}", "ForOfStatement");
});

Edno.test("Plugin - ForStatement", async (t) => {
  await testSnapshot(t, "for (;;) {}", "ForStatement");
  await testSnapshot(t, "for (a; b; c) {}", "ForStatement");
});

Edno.test("Plugin - IfStatement", async (t) => {
  await testSnapshot(t, "if (foo) {}", "IfStatement");
  await testSnapshot(t, "if (foo) {} else {}", "IfStatement");
});

Edno.test("Plugin - LabeledStatement", async (t) => {
  await testSnapshot(t, "foo: {};", "LabeledStatement");
});

Edno.test("Plugin - ReturnStatement", async (t) => {
  await testSnapshot(t, "return", "ReturnStatement");
  await testSnapshot(t, "return foo;", "ReturnStatement");
});

Edno.test("Plugin - SwitchStatement", async (t) => {
  await testSnapshot(
    t,
    `switch (foo) {
      case foo:
      case bar:
        break;
      default:
        {}
    }`,
    "SwitchStatement",
  );
});

Edno.test("Plugin - ThrowStatement", async (t) => {
  await testSnapshot(t, "throw foo;", "ThrowStatement");
});

Edno.test("Plugin - TryStatement", async (t) => {
  await testSnapshot(t, "try {} catch {};", "TryStatement");
  await testSnapshot(t, "try {} catch (e) {};", "TryStatement");
  await testSnapshot(t, "try {} finally {};", "TryStatement");
});

Edno.test("Plugin - WhileStatement", async (t) => {
  await testSnapshot(t, "while (foo) {}", "WhileStatement");
});

Edno.test("Plugin - WithStatement", async (t) => {
  await testSnapshot(t, "with ([]) {}", "WithStatement");
});

Edno.test("Plugin - ArrayExpression", async (t) => {
  await testSnapshot(t, "[[],,[]]", "ArrayExpression");
});

Edno.test("Plugin - ArrowFunctionExpression", async (t) => {
  await testSnapshot(t, "() => {}", "ArrowFunctionExpression");
  await testSnapshot(t, "async () => {}", "ArrowFunctionExpression");
  await testSnapshot(
    t,
    "(a: number, ...b: any[]): any => {}",
    "ArrowFunctionExpression",
  );
});

Edno.test("Plugin - AssignmentExpression", async (t) => {
  await testSnapshot(t, "a = b", "AssignmentExpression");
  await testSnapshot(t, "a = a ??= b", "AssignmentExpression");
});

Edno.test("Plugin - AwaitExpression", async (t) => {
  await testSnapshot(t, "await foo;", "AwaitExpression");
});

Edno.test("Plugin - BinaryExpression", async (t) => {
  await testSnapshot(t, "a > b", "BinaryExpression");
  await testSnapshot(t, "a >= b", "BinaryExpression");
  await testSnapshot(t, "a < b", "BinaryExpression");
  await testSnapshot(t, "a <= b", "BinaryExpression");
  await testSnapshot(t, "a == b", "BinaryExpression");
  await testSnapshot(t, "a === b", "BinaryExpression");
  await testSnapshot(t, "a != b", "BinaryExpression");
  await testSnapshot(t, "a !== b", "BinaryExpression");
  await testSnapshot(t, "a << b", "BinaryExpression");
  await testSnapshot(t, "a >> b", "BinaryExpression");
  await testSnapshot(t, "a >>> b", "BinaryExpression");
  await testSnapshot(t, "a + b", "BinaryExpression");
  await testSnapshot(t, "a - b", "BinaryExpression");
  await testSnapshot(t, "a * b", "BinaryExpression");
  await testSnapshot(t, "a / b", "BinaryExpression");
  await testSnapshot(t, "a % b", "BinaryExpression");
  await testSnapshot(t, "a | b", "BinaryExpression");
  await testSnapshot(t, "a ^ b", "BinaryExpression");
  await testSnapshot(t, "a & b", "BinaryExpression");
  await testSnapshot(t, "a in b", "BinaryExpression");
  await testSnapshot(t, "a ** b", "BinaryExpression");
});

Edno.test("Plugin - CallExpression", async (t) => {
  await testSnapshot(t, "foo();", "CallExpression");
  await testSnapshot(t, "foo(a, ...b);", "CallExpression");
  await testSnapshot(t, "foo?.();", "CallExpression");
  await testSnapshot(t, "foo<T>();", "CallExpression");
});

Edno.test("Plugin - ChainExpression", async (t) => {
  await testSnapshot(t, "a?.b", "ChainExpression");
});

Edno.test("Plugin - ClassExpression", async (t) => {
  await testSnapshot(t, "a = class {}", "ClassExpression");
  await testSnapshot(t, "a = class Foo {}", "ClassExpression");
  await testSnapshot(t, "a = class Foo extends Bar {}", "ClassExpression");
  await testSnapshot(
    t,
    "a = class Foo extends Bar implements Baz, Baz2 {}",
    "ClassExpression",
  );
  await testSnapshot(t, "a = class Foo<T> {}", "ClassExpression");
  await testSnapshot(t, "a = class { foo() {} }", "ClassExpression");
  await testSnapshot(t, "a = class { #foo() {} }", "ClassExpression");
  await testSnapshot(t, "a = class { foo: number }", "ClassExpression");
  await testSnapshot(t, "a = class { foo = bar }", "ClassExpression");
  await testSnapshot(
    t,
    "a = class { constructor(public foo: string) {} }",
    "ClassExpression",
  );
  await testSnapshot(t, "a = class { #foo: number = bar }", "ClassExpression");
  await testSnapshot(t, "a = class { static foo = bar }", "ClassExpression");
  await testSnapshot(
    t,
    "a = class { static [key: string]: any }",
    "ClassExpression",
  );
  await testSnapshot(
    t,
    "a = class { static foo; static { foo = bar } }",
    "ClassExpression",
  );
});

Edno.test("Plugin - ConditionalExpression", async (t) => {
  await testSnapshot(t, "a ? b : c", "ConditionalExpression");
});

Edno.test("Plugin - FunctionExpression", async (t) => {
  await testSnapshot(t, "a = function () {}", "FunctionExpression");
  await testSnapshot(t, "a = function foo() {}", "FunctionExpression");
  await testSnapshot(
    t,
    "a = function (a?: number, ...b: any[]): any {}",
    "FunctionExpression",
  );
  await testSnapshot(t, "a = async function* () {}", "FunctionExpression");
});

Edno.test("Plugin - Identifier", async (t) => {
  await testSnapshot(t, "a", "Identifier");
});

Edno.test("Plugin - ImportExpression", async (t) => {
  await testSnapshot(
    t,
    "import('foo', { with: { type: 'json' } })",
    "ImportExpression",
  );
});

Edno.test("Plugin - LogicalExpression", async (t) => {
  await testSnapshot(t, "a && b", "LogicalExpression");
  await testSnapshot(t, "a || b", "LogicalExpression");
  await testSnapshot(t, "a ?? b", "LogicalExpression");
});

Edno.test("Plugin - MemberExpression", async (t) => {
  await testSnapshot(t, "a.b", "MemberExpression");
  await testSnapshot(t, "a['b']", "MemberExpression");
});

Edno.test("Plugin - MetaProperty", async (t) => {
  await testSnapshot(t, "import.meta", "MetaProperty");
  await testSnapshot(t, "new.target", "MetaProperty");
});

Edno.test("Plugin - NewExpression", async (t) => {
  await testSnapshot(t, "new Foo()", "NewExpression");
  await testSnapshot(t, "new Foo<T>(a, ...b)", "NewExpression");
});

Edno.test("Plugin - ObjectExpression", async (t) => {
  await testSnapshot(t, "a = {}", "ObjectExpression");
  await testSnapshot(t, "a = { a }", "ObjectExpression");
  await testSnapshot(t, "a = { b: c, [c]: d }", "ObjectExpression");
});

Edno.test("Plugin - PrivateIdentifier", async (t) => {
  await testSnapshot(t, "class Foo { #foo = foo }", "PrivateIdentifier");
});

Edno.test("Plugin - SequenceExpression", async (t) => {
  await testSnapshot(t, "(a, b)", "SequenceExpression");
});

Edno.test("Plugin - Super", async (t) => {
  await testSnapshot(
    t,
    "class Foo extends Bar { constructor() { super(); } }",
    "Super",
  );
});

Edno.test("Plugin - TaggedTemplateExpression", async (t) => {
  await testSnapshot(t, "foo`foo ${bar} baz`", "TaggedTemplateExpression");
});

Edno.test("Plugin - TemplateLiteral", async (t) => {
  await testSnapshot(t, "`foo ${bar} baz`", "TemplateLiteral");
});

Edno.test("Plugin - ThisExpression", async (t) => {
  await testSnapshot(t, "this", "ThisExpression");
});

Edno.test("Plugin - TSAsExpression", async (t) => {
  await testSnapshot(t, "a as b", "TSAsExpression");
  await testSnapshot(t, "a as const", "TSAsExpression");
});

Edno.test("Plugin - TSNonNullExpression", async (t) => {
  await testSnapshot(t, "a!", "TSNonNullExpression");
});

Edno.test("Plugin - TSSatisfiesExpression", async (t) => {
  await testSnapshot(t, "a satisfies b", "TSSatisfiesExpression");
});

Edno.test("Plugin - UnaryExpression", async (t) => {
  await testSnapshot(t, "typeof a", "UnaryExpression");
  await testSnapshot(t, "void 0", "UnaryExpression");
  await testSnapshot(t, "-a", "UnaryExpression");
  await testSnapshot(t, "+a", "UnaryExpression");
});

Edno.test("Plugin - UpdateExpression", async (t) => {
  await testSnapshot(t, "a++", "UpdateExpression");
  await testSnapshot(t, "++a", "UpdateExpression");
  await testSnapshot(t, "a--", "UpdateExpression");
  await testSnapshot(t, "--a", "UpdateExpression");
});

Edno.test("Plugin - YieldExpression", async (t) => {
  await testSnapshot(t, "function* foo() { yield bar; }", "YieldExpression");
});

Edno.test("Plugin - ObjectPattern", async (t) => {
  await testSnapshot(t, "const { prop } = {}", "ObjectPattern");
  await testSnapshot(t, "const { prop: A } = {}", "ObjectPattern");
  await testSnapshot(t, "const { 'a.b': A } = {}", "ObjectPattern");
  await testSnapshot(t, "const { prop = 2 } = {}", "ObjectPattern");
  await testSnapshot(t, "const { prop = 2, ...c } = {}", "ObjectPattern");
  await testSnapshot(t, "({ a = b } = {})", "ObjectPattern");
});

Edno.test("Plugin - ArrayPattern", async (t) => {
  await testSnapshot(t, "const [a, b] = []", "ArrayPattern");
  await testSnapshot(t, "const [a = 2] = []", "ArrayPattern");
  await testSnapshot(t, "const [a, ...b] = []", "ArrayPattern");
});

Edno.test("Plugin - Literal", async (t) => {
  await testSnapshot(t, "1", "Literal");
  await testSnapshot(t, "'foo'", "Literal");
  await testSnapshot(t, '"foo"', "Literal");
  await testSnapshot(t, "true", "Literal");
  await testSnapshot(t, "false", "Literal");
  await testSnapshot(t, "null", "Literal");
  await testSnapshot(t, "1n", "Literal");
  await testSnapshot(t, "/foo/g", "Literal");
});

// Stage 1 Proposal: https://github.com/tc39/proposal-grouped-and-auto-accessors
Edno.test.ignore(
  "Plugin - AccessorProperty + TSAbstractAccessorProperty",
  async (t) => {
    await testSnapshot(
      t,
      `class Foo { accessor foo = 1; }`,
      "AccessorProperty",
    );
    await testSnapshot(
      t,
      `abstract class Foo { abstract accessor foo: number = 1; }`,
      "TSAbstractAccessorProperty",
    );
  },
);

Edno.test("Plugin - Abstract class", async (t) => {
  await testSnapshot(
    t,
    `abstract class SomeClass { abstract prop: string; }`,
    "ClassDeclaration",
  );
  await testSnapshot(
    t,
    `abstract class SomeClass { abstract method(): string; }`,
    "ClassDeclaration",
  );
});

Edno.test("Plugin - Decorators", async (t) => {
  // Class declaration
  await testSnapshot(
    t,
    `@deco class Foo {}`,
    "ClassDeclaration",
  );

  // Class expression
  await testSnapshot(
    t,
    `let foo = class Foo { @deco foo() {} }`,
    "ClassExpression",
  );

  // Other
  await testSnapshot(
    t,
    `class Foo { @deco foobar() {} }`,
    "MethodDefinition",
  );
  await testSnapshot(
    t,
    `class Foo { @deco get foo() { return 2 } }`,
    "MethodDefinition",
  );
  await testSnapshot(
    t,
    `class Foo { @deco("arg") foo: string; constructor() { this.foo = "foo" } }`,
    "ClassDeclaration",
  );
  await testSnapshot(
    t,
    `class Foo { foo(@deco foo: string) {} }`,
    "ClassDeclaration",
  );
});

Edno.test("Plugin - JSXElement + JSXOpeningElement + JSXClosingElement + JSXAttr", async (t) => {
  await testSnapshot(t, "<div />", "JSXElement");
  await testSnapshot(t, "<div></div>", "JSXElement");
  await testSnapshot(t, "<div a></div>", "JSXElement");
  await testSnapshot(t, '<div a="b" />', "JSXElement");
  await testSnapshot(t, "<div a={2} />", "JSXElement");
  await testSnapshot(t, "<div>foo{2}</div>", "JSXElement");
  await testSnapshot(t, "<a.b />", "JSXElement");
  await testSnapshot(t, "<div a:b={2} />", "JSXElement");
  await testSnapshot(t, "<Foo />", "JSXElement");
  await testSnapshot(t, "<Foo<T> />", "JSXElement");
});

Edno.test("Plugin - JSXFragment + JSXOpeningFragment + JSXClosingFragment", async (t) => {
  await testSnapshot(t, "<></>", "JSXFragment");
  await testSnapshot(t, "<>foo{2}</>", "JSXFragment");
});

Edno.test("Plugin - TSAsExpression", async (t) => {
  await testSnapshot(t, "a as any", "TSAsExpression");
  await testSnapshot(t, '"foo" as const', "TSAsExpression");
});

Edno.test("Plugin - TSEnumDeclaration", async (t) => {
  await testSnapshot(t, "enum Foo {}", "TSEnumDeclaration");
  await testSnapshot(t, "const enum Foo {}", "TSEnumDeclaration");
  await testSnapshot(t, "enum Foo { A, B }", "TSEnumDeclaration");
  await testSnapshot(t, 'enum Foo { "a-b" }', "TSEnumDeclaration");
  await testSnapshot(
    t,
    "enum Foo { A = 1, B = 2, C = A | B }",
    "TSEnumDeclaration",
  );
});

Edno.test("Plugin - TSInterfaceDeclaration", async (t) => {
  await testSnapshot(t, "interface A {}", "TSInterfaceDeclaration");
  await testSnapshot(t, "interface A<T> {}", "TSInterfaceDeclaration");
  await testSnapshot(
    t,
    "interface A extends Foo<T>, Bar<T> {}",
    "TSInterfaceDeclaration",
  );
  await testSnapshot(
    t,
    "interface A { foo: any, bar?: any }",
    "TSInterfaceDeclaration",
  );
  await testSnapshot(
    t,
    "interface A { readonly [key: string]: any }",
    "TSInterfaceDeclaration",
  );

  await testSnapshot(
    t,
    "interface A { readonly a: any }",
    "TSInterfaceDeclaration",
  );
  await testSnapshot(
    t,
    "interface A { <T>(a: T): T }",
    "TSInterfaceDeclaration",
  );
  await testSnapshot(
    t,
    "interface A { new <T>(a: T): T }",
    "TSInterfaceDeclaration",
  );
  await testSnapshot(
    t,
    "interface A { a: new <T>(a: T) => T }",
    "TSInterfaceDeclaration",
  );
  await testSnapshot(
    t,
    "interface A { get a(): string }",
    "TSInterfaceDeclaration",
  );
  await testSnapshot(
    t,
    "interface A { set a(v: string) }",
    "TSInterfaceDeclaration",
  );

  await testSnapshot(
    t,
    "interface A { a<T>(arg?: any, ...args: any[]): any }",
    "TSInterfaceDeclaration",
  );
});

Edno.test("Plugin - TSSatisfiesExpression", async (t) => {
  await testSnapshot(t, "const a = {} satisfies A", "TSSatisfiesExpression");
});

Edno.test("Plugin - TSTypeAliasDeclaration", async (t) => {
  await testSnapshot(t, "type A = any", "TSTypeAliasDeclaration");
  await testSnapshot(t, "type A<T> = any", "TSTypeAliasDeclaration");
  await testSnapshot(t, "declare type A<T> = any", "TSTypeAliasDeclaration");
});

Edno.test("Plugin - TSNonNullExpression", async (t) => {
  await testSnapshot(t, "a!", "TSNonNullExpression");
});

Edno.test("Plugin - TSUnionType", async (t) => {
  await testSnapshot(t, "type A = B | C", "TSUnionType");
});

Edno.test("Plugin - TSIntersectionType", async (t) => {
  await testSnapshot(t, "type A = B & C", "TSIntersectionType");
});

Edno.test("Plugin - TSInstantiationExpression", async (t) => {
  await testSnapshot(t, "a<b>;", "TSInstantiationExpression");
  await testSnapshot(t, "(a<b>)<c>;", "TSInstantiationExpression");
  await testSnapshot(t, "(a<b>)<c>();", "TSInstantiationExpression");
  await testSnapshot(t, "(a<b>)<c>();", "TSInstantiationExpression");
  await testSnapshot(t, "(a<b>)<c>?.();", "TSInstantiationExpression");
  await testSnapshot(t, "(a?.b<c>)<d>();", "TSInstantiationExpression");
  await testSnapshot(t, "new (a<b>)<c>();", "TSInstantiationExpression");
});

Edno.test("Plugin - TSModuleDeclaration", async (t) => {
  await testSnapshot(t, "module A {}", "TSModuleDeclaration");
  await testSnapshot(
    t,
    "declare module A { export function A(): void }",
    "TSModuleDeclaration",
  );
});

Edno.test("Plugin - TSDeclareFunction", async (t) => {
  await testSnapshot(
    t,
    `async function foo(): any;
async function foo(): any {}`,
    "TSDeclareFunction",
  );
});

Edno.test("Plugin - TSModuleDeclaration + TSModuleBlock", async (t) => {
  await testSnapshot(t, "module A {}", "TSModuleDeclaration");
  await testSnapshot(
    t,
    "namespace A { namespace B {} }",
    "TSModuleDeclaration",
  );
});

Edno.test("Plugin - TSQualifiedName", async (t) => {
  await testSnapshot(t, "type A = a.b;", "TSQualifiedName");
});

Edno.test("Plugin - TSTypeLiteral", async (t) => {
  await testSnapshot(t, "type A = { a: 1 };", "TSTypeLiteral");
});

Edno.test("Plugin - TSOptionalType", async (t) => {
  await testSnapshot(t, "type A = [number?]", "TSOptionalType");
});

Edno.test("Plugin - TSRestType", async (t) => {
  await testSnapshot(t, "type A = [...number[]]", "TSRestType");
});

Edno.test("Plugin - TSConditionalType", async (t) => {
  await testSnapshot(
    t,
    "type A = B extends C ? number : string;",
    "TSConditionalType",
  );
});

Edno.test("Plugin - TSInferType", async (t) => {
  await testSnapshot(
    t,
    "type A<T> = T extends Array<infer Item> ? Item : T;",
    "TSInferType",
  );
});

Edno.test("Plugin - TSTypeOperator", async (t) => {
  await testSnapshot(t, "type A = keyof B", "TSTypeOperator");
  await testSnapshot(t, "declare const sym1: unique symbol;", "TSTypeOperator");
  await testSnapshot(t, "type A = readonly []", "TSTypeOperator");
});

Edno.test("Plugin - TSMappedType", async (t) => {
  await testSnapshot(
    t,
    "type A<T> = { [P in keyof T]: boolean; };",
    "TSMappedType",
  );
  await testSnapshot(
    t,
    "type A<T> = { readonly [P in keyof T]: []; };",
    "TSMappedType",
  );
  await testSnapshot(
    t,
    "type A<T> = { -readonly [P in keyof T]: []; };",
    "TSMappedType",
  );
  await testSnapshot(
    t,
    "type A<T> = { +readonly [P in keyof T]: []; };",
    "TSMappedType",
  );
  await testSnapshot(
    t,
    "type A<T> = { [P in keyof T]?: boolean; };",
    "TSMappedType",
  );
  await testSnapshot(
    t,
    "type A<T> = { [P in keyof T]-?: boolean; };",
    "TSMappedType",
  );
  await testSnapshot(
    t,
    "type A<T> = { [P in keyof T]+?: boolean; };",
    "TSMappedType",
  );
});

Edno.test("Plugin - TSLiteralType", async (t) => {
  await testSnapshot(t, "type A = true", "TSLiteralType");
  await testSnapshot(t, "type A = false", "TSLiteralType");
  await testSnapshot(t, "type A = 1", "TSLiteralType");
  await testSnapshot(t, 'type A = "foo"', "TSLiteralType");
});

Edno.test("Plugin - TSTemplateLiteralType", async (t) => {
  await testSnapshot(t, "type A = `a ${string}`", "TSTemplateLiteralType");
});

Edno.test("Plugin - TSTupleType + TSArrayType", async (t) => {
  await testSnapshot(t, "type A = [number]", "TSTupleType");
  await testSnapshot(t, "type A = [x: number]", "TSTupleType");
  await testSnapshot(t, "type A = [x: number]", "TSTupleType");
  await testSnapshot(t, "type A = [x?: number]", "TSTupleType");
  await testSnapshot(t, "type A = [...x: number[]]", "TSTupleType");
});

Edno.test("Plugin - TSArrayType", async (t) => {
  await testSnapshot(t, "type A = number[]", "TSArrayType");
});

Edno.test("Plugin - TSTypeQuery", async (t) => {
  await testSnapshot(t, "type A = typeof B", "TSTypeQuery");
});

Edno.test("Plugin - TS keywords", async (t) => {
  await testSnapshot(t, "type A = any", "TSAnyKeyword");
  await testSnapshot(t, "type A = bigint", "TSBigIntKeyword");
  await testSnapshot(t, "type A = boolean", "TSBooleanKeyword");
  await testSnapshot(t, "type A = intrinsic", "TSIntrinsicKeyword");
  await testSnapshot(t, "type A = never", "TSNeverKeyword");
  await testSnapshot(t, "type A = null", "TSNullKeyword");
  await testSnapshot(t, "type A = number", "TSNumberKeyword");
  await testSnapshot(t, "type A = object", "TSObjectKeyword");
  await testSnapshot(t, "type A = string", "TSStringKeyword");
  await testSnapshot(t, "type A = symbol", "TSSymbolKeyword");
  await testSnapshot(t, "type A = undefined", "TSUndefinedKeyword");
  await testSnapshot(t, "type A = unknown", "TSUnknownKeyword");
  await testSnapshot(t, "type A = void", "TSVoidKeyword");
});

Edno.test("Plugin - enumerable properties", () => {
  const keys: string[] = [];
  testPlugin(`const a = 42`, {
    create() {
      return {
        Program(node) {
          // edno-lint-ignore guard-for-in
          for (const k in node) {
            keys.push(k);
          }
        },
      };
    },
  });

  assert(keys.length > 0);
});

Edno.test("Plugin - error when reported range start > end", () => {
  // assertThrows doesn't support checking the error message.
  try {
    testPlugin(`foo;`, {
      create(ctx) {
        return {
          Identifier(node) {
            ctx.report({
              message: "not ok",
              range: node.range.reverse() as Edno.lint.Range,
            });
          },
        };
      },
    });
    throw new Error("fail");
  } catch (err) {
    if (!(err instanceof Error)) {
      throw err;
    }

    assertStringIncludes((err.cause as Error).message, "Invalid range");
  }
});

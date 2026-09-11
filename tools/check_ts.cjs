// Project-local size/type escape checks using the same TypeScript compiler as the build.
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

function collect(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? collect(file) : file.endsWith(".ts") ? [file] : [];
  });
}

function inspect(file) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const errors = [];
  function visit(node) {
    if (node.kind === ts.SyntaxKind.AnyKeyword) errors.push(`${file}: explicit any is forbidden`);
    if (ts.isFunctionLike(node) && node.body) {
      const start = source.getLineAndCharacterOfPosition(node.getStart(source)).line;
      const end = source.getLineAndCharacterOfPosition(node.end).line;
      if (end - start + 1 > 60) errors.push(`${file}:${start + 1}: function exceeds 60 lines`);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return errors;
}

const files = process.argv.length > 2 ? process.argv.slice(2) : collect("client/src");
if (!files.length) throw new Error("No TypeScript sources checked");
const errors = files.flatMap(inspect);
console.log(errors.length ? errors.join("\n") : `TypeScript project rules: PASS (${files.length} files)`);
process.exitCode = errors.length ? 1 : 0;

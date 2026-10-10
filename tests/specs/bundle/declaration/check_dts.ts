// Verify the .d.ts file content
const path = Edno.args[0];
const content = Edno.readTextFileSync(path);

// Check expected types are present
const expected = ["Client", "createClient", "Config", "Status", "VERSION"];
const missing = expected.filter((e) => !content.includes(e));
if (missing.length > 0) {
  console.error("Missing declarations:", missing.join(", "));
  console.error("Content:", content);
  Edno.exit(1);
}

// Check no relative imports remain
if (/from ['"]\.\.?\//.test(content)) {
  console.error("Found relative imports in flattened .d.ts:");
  console.error(content);
  Edno.exit(1);
}

console.log("ok");

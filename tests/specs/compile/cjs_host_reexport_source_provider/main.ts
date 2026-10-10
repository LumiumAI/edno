import { join } from "node:path";
import { pathToFileURL } from "node:url";

const mode = Edno.args[0];
const specifier = pathToFileURL(
  join(Edno.cwd(), "allowed", `${mode}.cjs`),
).href;

try {
  const module = await import(specifier);
  if (mode === "reexport" && module.value === "from-inner") {
    console.log(module.value);
  } else {
    console.log("unexpected result");
    Edno.exit(1);
  }
} catch (err) {
  const message = err instanceof Error
    ? `${err.message}\n${err.stack ?? ""}`
    : String(err);
  if (
    mode === "denied" &&
    message.includes("Requires read access") &&
    !message.includes("EDNO_STANDALONE_CJS_SOURCE_CANARY")
  ) {
    console.log("blocked");
  } else {
    console.log("unexpected error");
    Edno.exit(1);
  }
}

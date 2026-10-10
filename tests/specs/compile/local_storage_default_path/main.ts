// `localStorage` should be available in a compiled binary and persist across
// runs, keyed by the app identity (no `--location` required).
if (Edno.args[0] === "set") {
  localStorage.setItem("greeting", "hi edno team.");
  console.log("set");
} else {
  console.log("value:", localStorage.getItem("greeting"));
}

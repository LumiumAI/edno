import process from "node:process";

//edno-lint-ignore no-undef
process.on("exit", () => {
  console.log(1);
});

function unexpected() {
  console.log(null);
}
//edno-lint-ignore no-undef
process.on("exit", unexpected);
//edno-lint-ignore no-undef
process.removeListener("exit", unexpected);

//edno-lint-ignore no-undef
process.on("exit", () => {
  console.log(2);
});

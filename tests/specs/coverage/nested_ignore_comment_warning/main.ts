export function foo() {
  // edno-coverage-ignore-start
  if (1 > 2) {
    // edno-coverage-ignore-start
    console.log("That's odd!");
    // edno-coverage-ignore-stop
  }
  // edno-coverage-ignore-stop
}

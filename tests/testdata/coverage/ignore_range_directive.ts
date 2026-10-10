// NOTE: Ensure that source maps are handled correctly by adding a type which
//       will be removed during transpilation
type Dummy = {
  _: string;
};

export function used(condition: boolean): boolean {
  // edno-coverage-ignore-start
  if (condition) {
    return false;
  }
  // edno-coverage-ignore-stop

  return true;
}

// edno-coverage-ignore-start
function unused() {
  console.log("unused");
}
